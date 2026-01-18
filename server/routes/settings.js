import { Router } from 'express';
import { query } from '../db/config.js';
import { deleteUser } from '../models/user.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// GET /api/settings/export - Export user data
router.get('/export', requireAuth, async (req, res) => {
  try {
    // Get all user data
    const [user, values, roles, focusAreas, goals, tasks, journal, expenses] = await Promise.all([
      query(`SELECT * FROM users WHERE id = $1`, [req.user.id]),
      query(`SELECT value FROM user_values WHERE user_id = $1`, [req.user.id]),
      query(`SELECT role FROM user_roles WHERE user_id = $1`, [req.user.id]),
      query(`SELECT focus_area FROM user_focus_areas WHERE user_id = $1`, [req.user.id]),
      query(`SELECT * FROM goals WHERE user_id = $1`, [req.user.id]),
      query(`SELECT * FROM tasks WHERE user_id = $1`, [req.user.id]),
      query(`SELECT * FROM journal_entries WHERE user_id = $1`, [req.user.id]),
      query(`SELECT * FROM expenses WHERE user_id = $1`, [req.user.id]).catch(() => ({ rows: [] })),
    ]);

    const exportData = {
      user: {
        ...user.rows[0],
        password: undefined, // Don't export password
      },
      values: values.rows.map(r => r.value),
      roles: roles.rows.map(r => r.role),
      focusAreas: focusAreas.rows.map(r => r.focus_area),
      goals: goals.rows,
      tasks: tasks.rows,
      journalEntries: journal.rows,
      expenses: expenses.rows,
      exportedAt: new Date().toISOString(),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="ofa-export-${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data.' });
  }
});

// DELETE /api/settings/delete - Delete user account
router.delete('/delete', requireAuth, async (req, res) => {
  try {
    await deleteUser(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

export default router;











