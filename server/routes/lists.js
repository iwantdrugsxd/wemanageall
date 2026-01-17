import { Router } from 'express';
import { query } from '../db/config.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// Initialize tables
const initTables = async () => {
  try {
    // Create lists table
    await query(`
      CREATE TABLE IF NOT EXISTS lists (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(10),
        description TEXT,
        is_pinned BOOLEAN DEFAULT FALSE,
        is_shared BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create list_items table
    await query(`
      CREATE TABLE IF NOT EXISTS list_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        note TEXT,
        tag VARCHAR(100),
        is_done BOOLEAN DEFAULT FALSE,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_lists_updated_at ON lists(updated_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_list_items_position ON list_items(list_id, position)`);
    
    console.log('Lists tables initialized successfully');
  } catch (error) {
    console.error('Error initializing lists tables:', error);
    throw error;
  }
};

let tablesInitialized = false;
const ensureTables = async () => {
  if (!tablesInitialized) {
    await initTables();
    tablesInitialized = true;
  }
};

// Test endpoint to verify route is working
router.get('/test', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Lists route is working!' });
});

// GET /api/lists - Get all lists for user
router.get('/', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { filter, search } = req.query;

    let queryText = `
      SELECT 
        l.id,
        l.name,
        l.icon,
        l.description,
        l.is_pinned,
        l.is_shared,
        l.created_at,
        l.updated_at,
        COUNT(li.id) as total_items,
        COUNT(CASE WHEN li.is_done = TRUE THEN 1 END) as completed_items
      FROM lists l
      LEFT JOIN list_items li ON l.id = li.list_id
      WHERE l.user_id = $1
    `;

    const params = [req.user.id];

    if (filter === 'pinned') {
      queryText += ` AND l.is_pinned = TRUE`;
    } else if (filter === 'shared') {
      queryText += ` AND l.is_shared = TRUE`;
    } else if (filter === 'recent') {
      queryText += ` AND l.updated_at >= NOW() - INTERVAL '7 days'`;
    }

    if (search) {
      queryText += ` AND (l.name ILIKE $${params.length + 1} OR l.description ILIKE $${params.length + 1})`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    queryText += `
      GROUP BY l.id, l.name, l.icon, l.description, l.is_pinned, l.is_shared, l.created_at, l.updated_at
      ORDER BY l.is_pinned DESC, l.updated_at DESC
    `;

    const result = await query(queryText, params);

    res.json({
      success: true,
      lists: result.rows
    });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch lists.'
    });
  }
});

// GET /api/lists/:id - Get single list with items
router.get('/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const listResult = await query(`
      SELECT id, name, icon, description, is_pinned, is_shared, created_at, updated_at
      FROM lists
      WHERE id = $1 AND user_id = $2
    `, [req.params.id, req.user.id]);

    if (listResult.rows.length === 0) {
      return res.status(404).json({ error: 'List not found.' });
    }

    const itemsResult = await query(`
      SELECT id, title, note, tag, is_done, position, created_at, updated_at
      FROM list_items
      WHERE list_id = $1
      ORDER BY is_done ASC, position ASC, created_at ASC
    `, [req.params.id]);

    res.json({
      success: true,
      list: listResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch list.'
    });
  }
});

// POST /api/lists - Create a new list
router.post('/', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { name, icon, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'List name is required.' });
    }

    const result = await query(`
      INSERT INTO lists (user_id, name, icon, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, icon, description, is_pinned, is_shared, created_at, updated_at
    `, [req.user.id, name.trim(), icon || null, description || null]);

    res.json({
      success: true,
      list: result.rows[0]
    });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create list.'
    });
  }
});

// PATCH /api/lists/:id - Update list
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { name, icon, description, is_pinned } = req.body;
    const listId = req.params.id;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name.trim());
    }

    if (icon !== undefined) {
      updates.push(`icon = $${paramIndex++}`);
      params.push(icon);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }

    if (is_pinned !== undefined) {
      updates.push(`is_pinned = $${paramIndex++}`);
      params.push(is_pinned);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(listId, req.user.id);

    const result = await query(`
      UPDATE lists
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING id, name, icon, description, is_pinned, is_shared, created_at, updated_at
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found.' });
    }

    res.json({
      success: true,
      list: result.rows[0]
    });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update list.'
    });
  }
});

// DELETE /api/lists/:id - Delete a list
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const result = await query(
      `DELETE FROM lists WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found.' });
    }

    res.json({
      success: true,
      message: 'List deleted successfully.'
    });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({
      error: error.message || 'Failed to delete list.'
    });
  }
});

// GET /api/lists/:id/items - Get items for a list
router.get('/:id/items', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    // Verify list belongs to user
    const listCheck = await query(
      `SELECT id FROM lists WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (listCheck.rows.length === 0) {
      return res.status(404).json({ error: 'List not found.' });
    }

    const result = await query(`
      SELECT id, title, note, tag, is_done, position, created_at, updated_at
      FROM list_items
      WHERE list_id = $1
      ORDER BY is_done ASC, position ASC, created_at ASC
    `, [req.params.id]);

    res.json({
      success: true,
      items: result.rows
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch items.'
    });
  }
});

// POST /api/lists/:id/items - Add item to list
router.post('/:id/items', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { title, note, tag } = req.body;
    const listId = req.params.id;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Item title is required.' });
    }

    // Verify list belongs to user
    const listCheck = await query(
      `SELECT id FROM lists WHERE id = $1 AND user_id = $2`,
      [listId, req.user.id]
    );

    if (listCheck.rows.length === 0) {
      return res.status(404).json({ error: 'List not found.' });
    }

    // Get max position for ordering
    const positionResult = await query(
      `SELECT COALESCE(MAX(position), 0) + 1 as next_position
       FROM list_items WHERE list_id = $1 AND is_done = FALSE`,
      [listId]
    );
    const position = positionResult.rows[0].next_position;

    const result = await query(`
      INSERT INTO list_items (list_id, title, note, tag, position)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, note, tag, is_done, position, created_at, updated_at
    `, [listId, title.trim(), note || null, tag || null, position]);

    // Update list's updated_at
    await query(
      `UPDATE lists SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [listId]
    );

    res.json({
      success: true,
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({
      error: error.message || 'Failed to add item.'
    });
  }
});

// PATCH /api/list-items/:id - Update item (toggle done, edit, etc.)
router.patch('/items/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { title, note, tag, is_done, position } = req.body;
    const itemId = req.params.id;

    // Verify item belongs to user's list
    const itemCheck = await query(`
      SELECT li.id, li.list_id
      FROM list_items li
      JOIN lists l ON li.list_id = l.id
      WHERE li.id = $1 AND l.user_id = $2
    `, [itemId, req.user.id]);

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    const listId = itemCheck.rows[0].list_id;
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(title.trim());
    }

    if (note !== undefined) {
      updates.push(`note = $${paramIndex++}`);
      params.push(note);
    }

    if (tag !== undefined) {
      updates.push(`tag = $${paramIndex++}`);
      params.push(tag);
    }

    if (is_done !== undefined) {
      updates.push(`is_done = $${paramIndex++}`);
      params.push(is_done);
      
      // If marking as done, move to end of done items. If undoing, move to end of active items.
      if (is_done) {
        const maxDonePos = await query(
          `SELECT COALESCE(MAX(position), 0) + 1 as next_pos
           FROM list_items WHERE list_id = $1 AND is_done = TRUE`,
          [listId]
        );
        updates.push(`position = $${paramIndex++}`);
        params.push(maxDonePos.rows[0].next_pos);
      } else {
        const maxActivePos = await query(
          `SELECT COALESCE(MAX(position), 0) + 1 as next_pos
           FROM list_items WHERE list_id = $1 AND is_done = FALSE`,
          [listId]
        );
        updates.push(`position = $${paramIndex++}`);
        params.push(maxActivePos.rows[0].next_pos);
      }
    }

    if (position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      params.push(position);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(itemId);

    const result = await query(`
      UPDATE list_items
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, note, tag, is_done, position, created_at, updated_at
    `, params);

    // Update list's updated_at
    await query(
      `UPDATE lists SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [listId]
    );

    res.json({
      success: true,
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update item.'
    });
  }
});

// DELETE /api/list-items/:id - Delete an item
router.delete('/items/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    // Verify item belongs to user's list
    const itemCheck = await query(`
      SELECT li.list_id
      FROM list_items li
      JOIN lists l ON li.list_id = l.id
      WHERE li.id = $1 AND l.user_id = $2
    `, [req.params.id, req.user.id]);

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    await query(`DELETE FROM list_items WHERE id = $1`, [req.params.id]);

    // Update list's updated_at
    await query(
      `UPDATE lists SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [itemCheck.rows[0].list_id]
    );

    res.json({
      success: true,
      message: 'Item deleted successfully.'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      error: error.message || 'Failed to delete item.'
    });
  }
});

// PATCH /api/lists/:id/reorder - Reorder items in a list
router.patch('/:id/reorder', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { orderedItemIds } = req.body;
    const listId = req.params.id;

    if (!Array.isArray(orderedItemIds)) {
      return res.status(400).json({ error: 'orderedItemIds must be an array.' });
    }

    // Verify list belongs to user
    const listCheck = await query(
      `SELECT id FROM lists WHERE id = $1 AND user_id = $2`,
      [listId, req.user.id]
    );

    if (listCheck.rows.length === 0) {
      return res.status(404).json({ error: 'List not found.' });
    }

    // Update positions
    for (let i = 0; i < orderedItemIds.length; i++) {
      await query(
        `UPDATE list_items SET position = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND list_id = $3`,
        [i + 1, orderedItemIds[i], listId]
      );
    }

    // Update list's updated_at
    await query(
      `UPDATE lists SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [listId]
    );

    res.json({
      success: true,
      message: 'Items reordered successfully.'
    });
  } catch (error) {
    console.error('Reorder items error:', error);
    res.status(500).json({
      error: error.message || 'Failed to reorder items.'
    });
  }
});

export default router;

