import { Router } from 'express';
import { query } from '../db/config.js';
import { createKnowledgeEvent } from '../services/knowledge.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// GET /api/today - Get today's data
router.get('/', requireAuth, async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Get today's tasks (daily objectives) with time tracking
    let tasksResult = { rows: [] };
    try {
      tasksResult = await query(
        `SELECT id, title, status, due_date, time_estimate, time_spent
         FROM tasks
         WHERE user_id = $1 AND due_date = $2
         ORDER BY created_at ASC`,
        [req.user.id, today]
      );
      // Map status from database format ('done'/'todo') to frontend format ('completed'/'pending')
      tasksResult.rows = tasksResult.rows.map(task => ({
        ...task,
        status: task.status === 'done' ? 'completed' : (task.status === 'todo' ? 'pending' : task.status)
      }));
    } catch (tasksError) {
      console.error('Tasks query error:', tasksError.message);
      // If tasks table doesn't exist or has issues, return empty array
      tasksResult = { rows: [] };
    }

    // Get calendar events for the next 7 days (including ongoing events)
    let eventsResult = { rows: [] };
    try {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(now);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      endOfWeek.setHours(23, 59, 59, 999);
      
      // Include ALL events that start today or within the next 7 days
      // This shows the complete schedule, including past events from today
      eventsResult = await query(
        `SELECT id, title, description, type, start_time, end_time, all_day, color
         FROM calendar_events
         WHERE user_id = $1 
         AND start_time >= $2 
         AND start_time <= $3
         ORDER BY start_time ASC`,
        [req.user.id, startOfToday.toISOString(), endOfWeek.toISOString()]
      );
    } catch (eventsError) {
      // If calendar_events table doesn't exist, just return empty array
      // This allows the dashboard to work even if calendar hasn't been set up yet
      console.warn('Calendar events query failed (table may not exist):', eventsError.message);
      eventsResult = { rows: [] };
    }

    // Get today's intentions (multiple entries allowed)
    let intentionResult = { rows: [] };
    try {
      intentionResult = await query(
        `SELECT id, intention, entry_date, created_at, updated_at
         FROM daily_intentions
         WHERE user_id = $1 AND entry_date = $2
         ORDER BY created_at ASC`,
        [req.user.id, today]
      );
    } catch (intentionError) {
      console.error('Intentions query error:', intentionError.message);
      intentionResult = { rows: [] };
    }

    // Get today's reflection
    let reflectionResult = { rows: [] };
    try {
      reflectionResult = await query(
        `SELECT content, mood, entry_date
         FROM journal_entries
         WHERE user_id = $1 AND entry_date = $2`,
        [req.user.id, today]
      );
    } catch (reflectionError) {
      console.error('Reflection query error:', reflectionError.message);
      reflectionResult = { rows: [] };
    }

    // Get today's thinking space entries
    let thinkingSpaceResult = { rows: [] };
    try {
      thinkingSpaceResult = await query(
        `SELECT id, content, mode, created_at, updated_at
         FROM thinking_space_entries
         WHERE user_id = $1 AND entry_date = $2
         ORDER BY created_at DESC`,
        [req.user.id, today]
      );
    } catch (thinkingSpaceError) {
      console.error('Thinking space query error:', thinkingSpaceError.message);
      thinkingSpaceResult = { rows: [] };
    }

    res.json({
      tasks: tasksResult.rows,
      intentions: intentionResult.rows,
      reflection: reflectionResult.rows[0]?.content || '',
      mood: reflectionResult.rows[0]?.mood ?? null,
      thinkingSpace: thinkingSpaceResult.rows,
      calendarEvents: eventsResult.rows || [],
    });
  } catch (error) {
    console.error('Get today error:', error);
    console.error('Error stack:', error.stack);
    // Provide more detailed error information
    const errorMessage = error.message || 'Failed to fetch today data.';
    
    // Check if it's a database table error
    if (error.message && error.message.includes('does not exist')) {
      return res.status(500).json({ 
        error: 'Database table not found. Please run the migration: npm run db:migrate or check database setup.',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch today data.',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /api/today/intention - Save today's intention (multiple entries allowed)
router.post('/intention', requireAuth, async (req, res) => {
  try {
    const { intention } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!intention || !intention.trim()) {
      return res.status(400).json({ error: 'Intention cannot be empty.' });
    }

    const result = await query(
      `INSERT INTO daily_intentions (user_id, intention, entry_date)
       VALUES ($1, $2, $3)
       RETURNING id, intention, entry_date, created_at, updated_at`,
      [req.user.id, intention.trim(), today]
    );

    res.json({ 
      success: true,
      intention: result.rows[0]
    });
  } catch (error) {
    console.error('Save intention error:', error);
    
    // Check for specific database errors
    if (error.message && error.message.includes('does not exist')) {
      return res.status(500).json({ 
        error: 'Database table not found. Please run the migration: npm run db:migrate or check database setup.' 
      });
    }
    
    if (error.message && error.message.includes('ON CONFLICT')) {
      return res.status(500).json({ 
        error: 'Database constraint issue. Please restart the server after running: npm run db:fix-intentions' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to save intention. Please try again.' 
    });
  }
});

// PUT /api/today/intention/:id - Update an intention
router.put('/intention/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { intention } = req.body;

    if (!intention || !intention.trim()) {
      return res.status(400).json({ error: 'Intention cannot be empty.' });
    }

    const result = await query(
      `UPDATE daily_intentions
       SET intention = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, intention, entry_date, created_at, updated_at`,
      [intention.trim(), id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Intention not found.' });
    }

    res.json({ 
      success: true,
      intention: result.rows[0]
    });
  } catch (error) {
    console.error('Update intention error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update intention. Please try again.' 
    });
  }
});

// DELETE /api/today/intention/:id - Delete an intention
router.delete('/intention/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM daily_intentions
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Intention not found.' });
    }

    res.json({ 
      success: true
    });
  } catch (error) {
    console.error('Delete intention error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to delete intention. Please try again.' 
    });
  }
});

// Legacy endpoint for backward compatibility
router.post('/focus', requireAuth, async (req, res) => {
  try {
    const { focus } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!focus || !focus.trim()) {
      return res.status(400).json({ error: 'Focus cannot be empty.' });
    }

    // Just insert - no conflict handling needed (multiple entries allowed)
    const result = await query(
      `INSERT INTO daily_intentions (user_id, intention, entry_date)
       VALUES ($1, $2, $3)
       RETURNING id, intention, entry_date, created_at, updated_at`,
      [req.user.id, focus.trim(), today]
    );

    res.json({ 
      success: true,
      intention: result.rows[0]
    });
  } catch (error) {
    console.error('Save focus error:', error);
    res.status(500).json({ error: 'Failed to save focus.' });
  }
});

// GET /api/today/intentions/recent - Get recent intentions
router.get('/intentions/recent', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 7;
    
    const result = await query(
      `SELECT intention, entry_date, created_at, updated_at
       FROM daily_intentions
       WHERE user_id = $1
       ORDER BY entry_date DESC
       LIMIT $2`,
      [req.user.id, limit]
    );

    res.json({
      intentions: result.rows,
    });
  } catch (error) {
    console.error('Get recent intentions error:', error);
    res.status(500).json({ error: 'Failed to fetch recent intentions.' });
  }
});

// GET /api/today/reflections/recent - Get recent reflections
router.get('/reflections/recent', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 7;
    
    const result = await query(
      `SELECT content, mood, entry_date, created_at, updated_at
       FROM journal_entries
       WHERE user_id = $1 AND content IS NOT NULL AND content != ''
       ORDER BY entry_date DESC
       LIMIT $2`,
      [req.user.id, limit]
    );

    res.json({
      reflections: result.rows,
    });
  } catch (error) {
    console.error('Get recent reflections error:', error);
    res.status(500).json({ error: 'Failed to fetch recent reflections.' });
  }
});

// POST /api/today/reflection - Save today's reflection
router.post('/reflection', requireAuth, async (req, res) => {
  try {
    const { reflection, mood } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Store reflection in journal_entries with mood
    const result = await query(
      `INSERT INTO journal_entries (user_id, content, mood, entry_date)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, entry_date)
       DO UPDATE SET content = $2, mood = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING id, content, mood, entry_date, created_at, updated_at`,
      [req.user.id, reflection || '', mood !== undefined ? mood : null, today]
    );

    // Create a knowledge event for the Personal Knowledge Engine (PKE)
    // This is non-blocking; failures are logged but won't affect the response.
    const saved = result.rows[0];
    const humanReadableContent = [
      saved.content ? `Reflection: ${saved.content}` : null,
      saved.mood !== null && saved.mood !== undefined ? `Mood: ${saved.mood}` : null,
      `Date: ${saved.entry_date}`,
    ]
      .filter(Boolean)
      .join(' | ');

    createKnowledgeEvent({
      userId: req.user.id,
      source: 'today:reflection',
      eventType: 'upsert',
      content: humanReadableContent,
      timestamp: saved.updated_at || saved.created_at || new Date(),
      projectId: null,
      mood: saved.mood,
      rawMetadata: {
        journal_entry_id: saved.id,
        entry_date: saved.entry_date,
      },
    });

    res.json({ 
      success: true,
      reflection: result.rows[0]
    });
  } catch (error) {
    console.error('Save reflection error:', error);
    
    // Check if it's a database table error
    if (error.message && error.message.includes('does not exist')) {
      return res.status(500).json({ 
        error: 'Database table not found. Please run the migration: npm run db:migrate or check database setup.' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to save reflection. Please try again.' 
    });
  }
});

// PUT /api/today/reflection - Update today's reflection
router.put('/reflection', requireAuth, async (req, res) => {
  try {
    const { reflection, mood } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      `UPDATE journal_entries
       SET content = $1, mood = $2, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3 AND entry_date = $4
       RETURNING id, content, mood, entry_date, created_at, updated_at`,
      [reflection || '', mood !== undefined ? mood : null, req.user.id, today]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reflection not found.' });
    }

    res.json({ 
      success: true,
      reflection: result.rows[0]
    });
  } catch (error) {
    console.error('Update reflection error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update reflection. Please try again.' 
    });
  }
});

// DELETE /api/today/reflection - Delete today's reflection
router.delete('/reflection', requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      `DELETE FROM journal_entries
       WHERE user_id = $1 AND entry_date = $2
       RETURNING id`,
      [req.user.id, today]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reflection not found.' });
    }

    res.json({ 
      success: true
    });
  } catch (error) {
    console.error('Delete reflection error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to delete reflection. Please try again.' 
    });
  }
});

export default router;



import { createKnowledgeEvent } from '../services/knowledge.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// GET /api/today - Get today's data
router.get('/', requireAuth, async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Get today's tasks (daily objectives) with time tracking
    let tasksResult = { rows: [] };
    try {
      tasksResult = await query(
        `SELECT id, title, status, due_date, time_estimate, time_spent
         FROM tasks
         WHERE user_id = $1 AND due_date = $2
         ORDER BY created_at ASC`,
        [req.user.id, today]
      );
      // Map status from database format ('done'/'todo') to frontend format ('completed'/'pending')
      tasksResult.rows = tasksResult.rows.map(task => ({
        ...task,
        status: task.status === 'done' ? 'completed' : (task.status === 'todo' ? 'pending' : task.status)
      }));
    } catch (tasksError) {
      console.error('Tasks query error:', tasksError.message);
      // If tasks table doesn't exist or has issues, return empty array
      tasksResult = { rows: [] };
    }

    // Get calendar events for the next 7 days (including ongoing events)
    let eventsResult = { rows: [] };
    try {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(now);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      endOfWeek.setHours(23, 59, 59, 999);
      
      // Include ALL events that start today or within the next 7 days
      // This shows the complete schedule, including past events from today
      eventsResult = await query(
        `SELECT id, title, description, type, start_time, end_time, all_day, color
         FROM calendar_events
         WHERE user_id = $1 
         AND start_time >= $2 
         AND start_time <= $3
         ORDER BY start_time ASC`,
        [req.user.id, startOfToday.toISOString(), endOfWeek.toISOString()]
      );
    } catch (eventsError) {
      // If calendar_events table doesn't exist, just return empty array
      // This allows the dashboard to work even if calendar hasn't been set up yet
      console.warn('Calendar events query failed (table may not exist):', eventsError.message);
      eventsResult = { rows: [] };
    }

    // Get today's intentions (multiple entries allowed)
    let intentionResult = { rows: [] };
    try {
      intentionResult = await query(
        `SELECT id, intention, entry_date, created_at, updated_at
         FROM daily_intentions
         WHERE user_id = $1 AND entry_date = $2
         ORDER BY created_at ASC`,
        [req.user.id, today]
      );
    } catch (intentionError) {
      console.error('Intentions query error:', intentionError.message);
      intentionResult = { rows: [] };
    }

    // Get today's reflection
    let reflectionResult = { rows: [] };
    try {
      reflectionResult = await query(
        `SELECT content, mood, entry_date
         FROM journal_entries
         WHERE user_id = $1 AND entry_date = $2`,
        [req.user.id, today]
      );
    } catch (reflectionError) {
      console.error('Reflection query error:', reflectionError.message);
      reflectionResult = { rows: [] };
    }

    // Get today's thinking space entries
    let thinkingSpaceResult = { rows: [] };
    try {
      thinkingSpaceResult = await query(
        `SELECT id, content, mode, created_at, updated_at
         FROM thinking_space_entries
         WHERE user_id = $1 AND entry_date = $2
         ORDER BY created_at DESC`,
        [req.user.id, today]
      );
    } catch (thinkingSpaceError) {
      console.error('Thinking space query error:', thinkingSpaceError.message);
      thinkingSpaceResult = { rows: [] };
    }

    res.json({
      tasks: tasksResult.rows,
      intentions: intentionResult.rows,
      reflection: reflectionResult.rows[0]?.content || '',
      mood: reflectionResult.rows[0]?.mood ?? null,
      thinkingSpace: thinkingSpaceResult.rows,
      calendarEvents: eventsResult.rows || [],
    });
  } catch (error) {
    console.error('Get today error:', error);
    console.error('Error stack:', error.stack);
    // Provide more detailed error information
    const errorMessage = error.message || 'Failed to fetch today data.';
    
    // Check if it's a database table error
    if (error.message && error.message.includes('does not exist')) {
      return res.status(500).json({ 
        error: 'Database table not found. Please run the migration: npm run db:migrate or check database setup.',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch today data.',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /api/today/intention - Save today's intention (multiple entries allowed)
router.post('/intention', requireAuth, async (req, res) => {
  try {
    const { intention } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!intention || !intention.trim()) {
      return res.status(400).json({ error: 'Intention cannot be empty.' });
    }

    const result = await query(
      `INSERT INTO daily_intentions (user_id, intention, entry_date)
       VALUES ($1, $2, $3)
       RETURNING id, intention, entry_date, created_at, updated_at`,
      [req.user.id, intention.trim(), today]
    );

    res.json({ 
      success: true,
      intention: result.rows[0]
    });
  } catch (error) {
    console.error('Save intention error:', error);
    
    // Check for specific database errors
    if (error.message && error.message.includes('does not exist')) {
      return res.status(500).json({ 
        error: 'Database table not found. Please run the migration: npm run db:migrate or check database setup.' 
      });
    }
    
    if (error.message && error.message.includes('ON CONFLICT')) {
      return res.status(500).json({ 
        error: 'Database constraint issue. Please restart the server after running: npm run db:fix-intentions' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to save intention. Please try again.' 
    });
  }
});

// PUT /api/today/intention/:id - Update an intention
router.put('/intention/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { intention } = req.body;

    if (!intention || !intention.trim()) {
      return res.status(400).json({ error: 'Intention cannot be empty.' });
    }

    const result = await query(
      `UPDATE daily_intentions
       SET intention = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, intention, entry_date, created_at, updated_at`,
      [intention.trim(), id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Intention not found.' });
    }

    res.json({ 
      success: true,
      intention: result.rows[0]
    });
  } catch (error) {
    console.error('Update intention error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update intention. Please try again.' 
    });
  }
});

// DELETE /api/today/intention/:id - Delete an intention
router.delete('/intention/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM daily_intentions
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Intention not found.' });
    }

    res.json({ 
      success: true
    });
  } catch (error) {
    console.error('Delete intention error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to delete intention. Please try again.' 
    });
  }
});

// Legacy endpoint for backward compatibility
router.post('/focus', requireAuth, async (req, res) => {
  try {
    const { focus } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!focus || !focus.trim()) {
      return res.status(400).json({ error: 'Focus cannot be empty.' });
    }

    // Just insert - no conflict handling needed (multiple entries allowed)
    const result = await query(
      `INSERT INTO daily_intentions (user_id, intention, entry_date)
       VALUES ($1, $2, $3)
       RETURNING id, intention, entry_date, created_at, updated_at`,
      [req.user.id, focus.trim(), today]
    );

    res.json({ 
      success: true,
      intention: result.rows[0]
    });
  } catch (error) {
    console.error('Save focus error:', error);
    res.status(500).json({ error: 'Failed to save focus.' });
  }
});

// GET /api/today/intentions/recent - Get recent intentions
router.get('/intentions/recent', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 7;
    
    const result = await query(
      `SELECT intention, entry_date, created_at, updated_at
       FROM daily_intentions
       WHERE user_id = $1
       ORDER BY entry_date DESC
       LIMIT $2`,
      [req.user.id, limit]
    );

    res.json({
      intentions: result.rows,
    });
  } catch (error) {
    console.error('Get recent intentions error:', error);
    res.status(500).json({ error: 'Failed to fetch recent intentions.' });
  }
});

// GET /api/today/reflections/recent - Get recent reflections
router.get('/reflections/recent', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 7;
    
    const result = await query(
      `SELECT content, mood, entry_date, created_at, updated_at
       FROM journal_entries
       WHERE user_id = $1 AND content IS NOT NULL AND content != ''
       ORDER BY entry_date DESC
       LIMIT $2`,
      [req.user.id, limit]
    );

    res.json({
      reflections: result.rows,
    });
  } catch (error) {
    console.error('Get recent reflections error:', error);
    res.status(500).json({ error: 'Failed to fetch recent reflections.' });
  }
});

// POST /api/today/reflection - Save today's reflection
router.post('/reflection', requireAuth, async (req, res) => {
  try {
    const { reflection, mood } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Store reflection in journal_entries with mood
    const result = await query(
      `INSERT INTO journal_entries (user_id, content, mood, entry_date)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, entry_date)
       DO UPDATE SET content = $2, mood = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING id, content, mood, entry_date, created_at, updated_at`,
      [req.user.id, reflection || '', mood !== undefined ? mood : null, today]
    );

    // Create a knowledge event for the Personal Knowledge Engine (PKE)
    // This is non-blocking; failures are logged but won't affect the response.
    const saved = result.rows[0];
    const humanReadableContent = [
      saved.content ? `Reflection: ${saved.content}` : null,
      saved.mood !== null && saved.mood !== undefined ? `Mood: ${saved.mood}` : null,
      `Date: ${saved.entry_date}`,
    ]
      .filter(Boolean)
      .join(' | ');

    createKnowledgeEvent({
      userId: req.user.id,
      source: 'today:reflection',
      eventType: 'upsert',
      content: humanReadableContent,
      timestamp: saved.updated_at || saved.created_at || new Date(),
      projectId: null,
      mood: saved.mood,
      rawMetadata: {
        journal_entry_id: saved.id,
        entry_date: saved.entry_date,
      },
    });

    res.json({ 
      success: true,
      reflection: result.rows[0]
    });
  } catch (error) {
    console.error('Save reflection error:', error);
    
    // Check if it's a database table error
    if (error.message && error.message.includes('does not exist')) {
      return res.status(500).json({ 
        error: 'Database table not found. Please run the migration: npm run db:migrate or check database setup.' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to save reflection. Please try again.' 
    });
  }
});

// PUT /api/today/reflection - Update today's reflection
router.put('/reflection', requireAuth, async (req, res) => {
  try {
    const { reflection, mood } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      `UPDATE journal_entries
       SET content = $1, mood = $2, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3 AND entry_date = $4
       RETURNING id, content, mood, entry_date, created_at, updated_at`,
      [reflection || '', mood !== undefined ? mood : null, req.user.id, today]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reflection not found.' });
    }

    res.json({ 
      success: true,
      reflection: result.rows[0]
    });
  } catch (error) {
    console.error('Update reflection error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update reflection. Please try again.' 
    });
  }
});

// DELETE /api/today/reflection - Delete today's reflection
router.delete('/reflection', requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      `DELETE FROM journal_entries
       WHERE user_id = $1 AND entry_date = $2
       RETURNING id`,
      [req.user.id, today]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reflection not found.' });
    }

    res.json({ 
      success: true
    });
  } catch (error) {
    console.error('Delete reflection error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to delete reflection. Please try again.' 
    });
  }
});

export default router;



import { createKnowledgeEvent } from '../services/knowledge.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// GET /api/today - Get today's data
router.get('/', requireAuth, async (req, res) => {
  try {
    // Verify user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Get today's tasks (daily objectives) with time tracking
    let tasksResult = { rows: [] };
    try {
      tasksResult = await query(
        `SELECT id, title, status, due_date, time_estimate, time_spent
         FROM tasks
         WHERE user_id = $1 AND due_date = $2
         ORDER BY created_at ASC`,
        [req.user.id, today]
      );
      // Map status from database format ('done'/'todo') to frontend format ('completed'/'pending')
      tasksResult.rows = tasksResult.rows.map(task => ({
        ...task,
        status: task.status === 'done' ? 'completed' : (task.status === 'todo' ? 'pending' : task.status)
      }));
    } catch (tasksError) {
      console.error('Tasks query error:', tasksError.message);
      // If tasks table doesn't exist or has issues, return empty array
      tasksResult = { rows: [] };
    }

    // Get calendar events for the next 7 days (including ongoing events)
    let eventsResult = { rows: [] };
    try {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(now);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      endOfWeek.setHours(23, 59, 59, 999);
      
      // Include ALL events that start today or within the next 7 days
      // This shows the complete schedule, including past events from today
      eventsResult = await query(
        `SELECT id, title, description, type, start_time, end_time, all_day, color
         FROM calendar_events
         WHERE user_id = $1 
         AND start_time >= $2 
         AND start_time <= $3
         ORDER BY start_time ASC`,
        [req.user.id, startOfToday.toISOString(), endOfWeek.toISOString()]
      );
    } catch (eventsError) {
      // If calendar_events table doesn't exist, just return empty array
      // This allows the dashboard to work even if calendar hasn't been set up yet
      console.warn('Calendar events query failed (table may not exist):', eventsError.message);
      eventsResult = { rows: [] };
    }

    // Get today's intentions (multiple entries allowed)
    let intentionResult = { rows: [] };
    try {
      intentionResult = await query(
        `SELECT id, intention, entry_date, created_at, updated_at
         FROM daily_intentions
         WHERE user_id = $1 AND entry_date = $2
         ORDER BY created_at ASC`,
        [req.user.id, today]
      );
    } catch (intentionError) {
      console.error('Intentions query error:', intentionError.message);
      intentionResult = { rows: [] };
    }

    // Get today's reflection
    let reflectionResult = { rows: [] };
    try {
      reflectionResult = await query(
        `SELECT content, mood, entry_date
         FROM journal_entries
         WHERE user_id = $1 AND entry_date = $2`,
        [req.user.id, today]
      );
    } catch (reflectionError) {
      console.error('Reflection query error:', reflectionError.message);
      reflectionResult = { rows: [] };
    }

    // Get today's thinking space entries
    let thinkingSpaceResult = { rows: [] };
    try {
      thinkingSpaceResult = await query(
        `SELECT id, content, mode, created_at, updated_at
         FROM thinking_space_entries
         WHERE user_id = $1 AND entry_date = $2
         ORDER BY created_at DESC`,
        [req.user.id, today]
      );
    } catch (thinkingSpaceError) {
      console.error('Thinking space query error:', thinkingSpaceError.message);
      thinkingSpaceResult = { rows: [] };
    }

    res.json({
      tasks: tasksResult.rows,
      intentions: intentionResult.rows,
      reflection: reflectionResult.rows[0]?.content || '',
      mood: reflectionResult.rows[0]?.mood ?? null,
      thinkingSpace: thinkingSpaceResult.rows,
      calendarEvents: eventsResult.rows || [],
    });
  } catch (error) {
    console.error('Get today error:', error);
    console.error('Error stack:', error.stack);
    // Provide more detailed error information
    const errorMessage = error.message || 'Failed to fetch today data.';
    
    // Check if it's a database table error
    if (error.message && error.message.includes('does not exist')) {
      return res.status(500).json({ 
        error: 'Database table not found. Please run the migration: npm run db:migrate or check database setup.',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch today data.',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /api/today/intention - Save today's intention (multiple entries allowed)
router.post('/intention', requireAuth, async (req, res) => {
  try {
    const { intention } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!intention || !intention.trim()) {
      return res.status(400).json({ error: 'Intention cannot be empty.' });
    }

    const result = await query(
      `INSERT INTO daily_intentions (user_id, intention, entry_date)
       VALUES ($1, $2, $3)
       RETURNING id, intention, entry_date, created_at, updated_at`,
      [req.user.id, intention.trim(), today]
    );

    res.json({ 
      success: true,
      intention: result.rows[0]
    });
  } catch (error) {
    console.error('Save intention error:', error);
    
    // Check for specific database errors
    if (error.message && error.message.includes('does not exist')) {
      return res.status(500).json({ 
        error: 'Database table not found. Please run the migration: npm run db:migrate or check database setup.' 
      });
    }
    
    if (error.message && error.message.includes('ON CONFLICT')) {
      return res.status(500).json({ 
        error: 'Database constraint issue. Please restart the server after running: npm run db:fix-intentions' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to save intention. Please try again.' 
    });
  }
});

// PUT /api/today/intention/:id - Update an intention
router.put('/intention/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { intention } = req.body;

    if (!intention || !intention.trim()) {
      return res.status(400).json({ error: 'Intention cannot be empty.' });
    }

    const result = await query(
      `UPDATE daily_intentions
       SET intention = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, intention, entry_date, created_at, updated_at`,
      [intention.trim(), id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Intention not found.' });
    }

    res.json({ 
      success: true,
      intention: result.rows[0]
    });
  } catch (error) {
    console.error('Update intention error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update intention. Please try again.' 
    });
  }
});

// DELETE /api/today/intention/:id - Delete an intention
router.delete('/intention/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM daily_intentions
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Intention not found.' });
    }

    res.json({ 
      success: true
    });
  } catch (error) {
    console.error('Delete intention error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to delete intention. Please try again.' 
    });
  }
});

// Legacy endpoint for backward compatibility
router.post('/focus', requireAuth, async (req, res) => {
  try {
    const { focus } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!focus || !focus.trim()) {
      return res.status(400).json({ error: 'Focus cannot be empty.' });
    }

    // Just insert - no conflict handling needed (multiple entries allowed)
    const result = await query(
      `INSERT INTO daily_intentions (user_id, intention, entry_date)
       VALUES ($1, $2, $3)
       RETURNING id, intention, entry_date, created_at, updated_at`,
      [req.user.id, focus.trim(), today]
    );

    res.json({ 
      success: true,
      intention: result.rows[0]
    });
  } catch (error) {
    console.error('Save focus error:', error);
    res.status(500).json({ error: 'Failed to save focus.' });
  }
});

// GET /api/today/intentions/recent - Get recent intentions
router.get('/intentions/recent', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 7;
    
    const result = await query(
      `SELECT intention, entry_date, created_at, updated_at
       FROM daily_intentions
       WHERE user_id = $1
       ORDER BY entry_date DESC
       LIMIT $2`,
      [req.user.id, limit]
    );

    res.json({
      intentions: result.rows,
    });
  } catch (error) {
    console.error('Get recent intentions error:', error);
    res.status(500).json({ error: 'Failed to fetch recent intentions.' });
  }
});

// GET /api/today/reflections/recent - Get recent reflections
router.get('/reflections/recent', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 7;
    
    const result = await query(
      `SELECT content, mood, entry_date, created_at, updated_at
       FROM journal_entries
       WHERE user_id = $1 AND content IS NOT NULL AND content != ''
       ORDER BY entry_date DESC
       LIMIT $2`,
      [req.user.id, limit]
    );

    res.json({
      reflections: result.rows,
    });
  } catch (error) {
    console.error('Get recent reflections error:', error);
    res.status(500).json({ error: 'Failed to fetch recent reflections.' });
  }
});

// POST /api/today/reflection - Save today's reflection
router.post('/reflection', requireAuth, async (req, res) => {
  try {
    const { reflection, mood } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Store reflection in journal_entries with mood
    const result = await query(
      `INSERT INTO journal_entries (user_id, content, mood, entry_date)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, entry_date)
       DO UPDATE SET content = $2, mood = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING id, content, mood, entry_date, created_at, updated_at`,
      [req.user.id, reflection || '', mood !== undefined ? mood : null, today]
    );

    // Create a knowledge event for the Personal Knowledge Engine (PKE)
    // This is non-blocking; failures are logged but won't affect the response.
    const saved = result.rows[0];
    const humanReadableContent = [
      saved.content ? `Reflection: ${saved.content}` : null,
      saved.mood !== null && saved.mood !== undefined ? `Mood: ${saved.mood}` : null,
      `Date: ${saved.entry_date}`,
    ]
      .filter(Boolean)
      .join(' | ');

    createKnowledgeEvent({
      userId: req.user.id,
      source: 'today:reflection',
      eventType: 'upsert',
      content: humanReadableContent,
      timestamp: saved.updated_at || saved.created_at || new Date(),
      projectId: null,
      mood: saved.mood,
      rawMetadata: {
        journal_entry_id: saved.id,
        entry_date: saved.entry_date,
      },
    });

    res.json({ 
      success: true,
      reflection: result.rows[0]
    });
  } catch (error) {
    console.error('Save reflection error:', error);
    
    // Check if it's a database table error
    if (error.message && error.message.includes('does not exist')) {
      return res.status(500).json({ 
        error: 'Database table not found. Please run the migration: npm run db:migrate or check database setup.' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to save reflection. Please try again.' 
    });
  }
});

// PUT /api/today/reflection - Update today's reflection
router.put('/reflection', requireAuth, async (req, res) => {
  try {
    const { reflection, mood } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      `UPDATE journal_entries
       SET content = $1, mood = $2, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3 AND entry_date = $4
       RETURNING id, content, mood, entry_date, created_at, updated_at`,
      [reflection || '', mood !== undefined ? mood : null, req.user.id, today]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reflection not found.' });
    }

    res.json({ 
      success: true,
      reflection: result.rows[0]
    });
  } catch (error) {
    console.error('Update reflection error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update reflection. Please try again.' 
    });
  }
});

// DELETE /api/today/reflection - Delete today's reflection
router.delete('/reflection', requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      `DELETE FROM journal_entries
       WHERE user_id = $1 AND entry_date = $2
       RETURNING id`,
      [req.user.id, today]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reflection not found.' });
    }

    res.json({ 
      success: true
    });
  } catch (error) {
    console.error('Delete reflection error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to delete reflection. Please try again.' 
    });
  }
});

export default router;


