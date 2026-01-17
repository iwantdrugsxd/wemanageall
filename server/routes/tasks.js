import { Router } from 'express';
import { query } from '../db/config.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// GET /api/tasks - Get user's tasks
router.get('/', requireAuth, async (req, res) => {
  try {
    const { goalId } = req.query;
    let sqlQuery = `SELECT * FROM tasks WHERE user_id = $1`;
    const params = [req.user.id];

    if (goalId) {
      sqlQuery += ` AND goal_id = $2`;
      params.push(goalId);
    }

    sqlQuery += ` ORDER BY created_at DESC`;

    const result = await query(sqlQuery, params);
    res.json({ tasks: result.rows });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// POST /api/tasks - Create a task
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, goalId, time_estimate, time_spent } = req.body;

    const result = await query(
      `INSERT INTO tasks (user_id, goal_id, title, description, due_date, priority, status, time_estimate, time_spent)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
       RETURNING id, title, description, status, due_date, priority, time_estimate, time_spent, created_at`,
      [req.user.id, goalId || null, title, description || null, dueDate || null, priority || 0, time_estimate || null, time_spent || 0]
    );

    res.json({
      success: true,
      task: result.rows[0],
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// PATCH /api/tasks/:id - Update a task
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = ['title', 'description', 'status', 'priority', 'due_date', 'time_estimate', 'time_spent'];
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }

    values.push(id, req.user.id);

    const result = await query(
      `UPDATE tasks SET ${setClause.join(', ')} 
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json({
      success: true,
      task: result.rows[0],
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

export default router;

