import { Router } from 'express';
import { query } from '../db/config.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// Helper function to map database status to frontend status
const mapStatusToFrontend = (status) => {
  const statusMap = {
    'done': 'completed',
    'todo': 'pending',
    'in_progress': 'in-progress',
    'cancelled': 'cancelled'
  };
  return statusMap[status] || status;
};

// Helper function to map frontend status to database status
const mapStatusToDatabase = (status) => {
  const statusMap = {
    'completed': 'done',
    'pending': 'todo',
    'in-progress': 'in_progress',
    'cancelled': 'cancelled'
  };
  return statusMap[status?.toLowerCase()] || status?.toLowerCase();
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
    // Map status from database format to frontend format
    const tasks = result.rows.map(task => ({
      ...task,
      status: mapStatusToFrontend(task.status)
    }));
    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// POST /api/tasks - Create a task
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, goalId, time_estimate, time_spent } = req.body;

    // Map priority: convert number to string or use default
    let priorityValue = 'medium'; // default
    if (priority !== undefined && priority !== null) {
      if (typeof priority === 'number') {
        // Map 0=low, 1=medium, 2=high
        const priorityMap = { 0: 'low', 1: 'medium', 2: 'high' };
        priorityValue = priorityMap[priority] || 'medium';
      } else if (typeof priority === 'string' && ['low', 'medium', 'high'].includes(priority.toLowerCase())) {
        priorityValue = priority.toLowerCase();
      }
    }

    const result = await query(
      `INSERT INTO tasks (user_id, goal_id, title, description, due_date, priority, status, time_estimate, time_spent)
       VALUES ($1, $2, $3, $4, $5, $6, 'todo', $7, $8)
       RETURNING id, title, description, status, due_date, priority, time_estimate, time_spent, created_at`,
      [req.user.id, goalId || null, title, description || null, dueDate || null, priorityValue, time_estimate || null, time_spent || 0]
    );

    // Map status from database format to frontend format
    const task = {
      ...result.rows[0],
      status: mapStatusToFrontend(result.rows[0].status)
    };

    res.json({
      success: true,
      task,
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
        let processedValue = value;
        
        // Map status values: 'completed' -> 'done', 'pending' -> 'todo'
        if (key === 'status' && typeof value === 'string') {
          processedValue = mapStatusToDatabase(value);
        }
        
        // Map priority: convert number to string or validate string
        if (key === 'priority') {
          if (typeof value === 'number') {
            const priorityMap = { 0: 'low', 1: 'medium', 2: 'high' };
            processedValue = priorityMap[value] || 'medium';
          } else if (typeof value === 'string' && ['low', 'medium', 'high'].includes(value.toLowerCase())) {
            processedValue = value.toLowerCase();
          } else {
            processedValue = 'medium'; // default
          }
        }
        
        setClause.push(`${key} = $${paramIndex}`);
        values.push(processedValue);
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

    // Map status from database format to frontend format
    const task = {
      ...result.rows[0],
      status: mapStatusToFrontend(result.rows[0].status)
    };

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM tasks
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

export default router;
