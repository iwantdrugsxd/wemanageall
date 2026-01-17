import { Router } from 'express';
import { query } from '../db/config.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// POST /api/thoughts - Create or update a thinking space entry
router.post('/', requireAuth, async (req, res) => {
  try {
    const { content, mode } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content cannot be empty.' });
    }

    const thoughtMode = mode || 'freewrite';
    
    // Insert or update thinking space entry for today
    const result = await query(
      `INSERT INTO thinking_space_entries (user_id, content, mode, entry_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, content, mode, entry_date, created_at, updated_at`,
      [req.user.id, content.trim(), thoughtMode, today]
    );

    res.json({
      success: true,
      entry: result.rows[0],
    });
  } catch (error) {
    console.error('Create thought error:', error);
    
    // Check if it's a database table error
    if (error.message && error.message.includes('does not exist')) {
      return res.status(500).json({ 
        error: 'Database table not found. Please run the migration: npm run db:migrate or check database setup.' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to save thought. Please try again.' 
    });
  }
});

// PUT /api/thoughts/:id - Update a thinking space entry
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, mode } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content cannot be empty.' });
    }

    const result = await query(
      `UPDATE thinking_space_entries
       SET content = $1, mode = COALESCE($2, mode), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING id, content, mode, entry_date, created_at, updated_at`,
      [content.trim(), mode, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thought entry not found.' });
    }

    res.json({
      success: true,
      entry: result.rows[0],
    });
  } catch (error) {
    console.error('Update thought error:', error);
    res.status(500).json({ error: 'Failed to update thought.' });
  }
});

// DELETE /api/thoughts/:id - Delete a thinking space entry
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM thinking_space_entries
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thought entry not found.' });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete thought error:', error);
    res.status(500).json({ error: 'Failed to delete thought.' });
  }
});

// GET /api/thoughts - Get user's thinking space entries
router.get('/', requireAuth, async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date || new Date().toISOString().split('T')[0];

    const result = await query(
      `SELECT id, content, mode, entry_date, created_at, updated_at
       FROM thinking_space_entries
       WHERE user_id = $1 AND entry_date = $2
       ORDER BY created_at DESC`,
      [req.user.id, queryDate]
    );

    res.json({
      thoughts: result.rows,
    });
  } catch (error) {
    console.error('Get thoughts error:', error);
    res.status(500).json({ error: 'Failed to fetch thoughts.' });
  }
});

// GET /api/thoughts/recent - Get recent thinking space entries
router.get('/recent', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await query(
      `SELECT id, content, mode, entry_date, created_at, updated_at
       FROM thinking_space_entries
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [req.user.id, limit]
    );

    res.json({
      thoughts: result.rows,
    });
  } catch (error) {
    console.error('Get recent thoughts error:', error);
    res.status(500).json({ error: 'Failed to fetch recent thoughts.' });
  }
});

export default router;


