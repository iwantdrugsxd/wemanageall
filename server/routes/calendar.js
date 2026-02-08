import { Router } from 'express';
import { query } from '../db/config.js';
import { migrateCalendarEnhancements } from '../db/migrate_calendar_enhancements.js';

const router = Router();

// Ensure migration runs on first request
let migrationRun = false;
const ensureMigration = async () => {
  if (!migrationRun) {
    try {
      await migrateCalendarEnhancements();
      migrationRun = true;
    } catch (error) {
      console.error('Migration error (non-fatal):', error);
    }
  }
};

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// GET /api/calendar/events - Get events in date range
router.get('/events', requireAuth, async (req, res) => {
  try {
    await ensureMigration();
    const { start_date, end_date, type } = req.query;
    const userId = req.user.id;
    
    let sql = `
      SELECT id, title, description, type, start_time, end_time, all_day, timezone, color, 
             recurrence_rule, recurrence_end_date, recurrence_count, reminder_minutes,
             created_at, updated_at
      FROM calendar_events
      WHERE user_id = $1
    `;
    const params = [userId];
    
    // Add date range filter
    if (start_date && end_date) {
      sql += ` AND (
        (start_time >= $${params.length + 1} AND start_time <= $${params.length + 2})
        OR (end_time >= $${params.length + 1} AND end_time <= $${params.length + 2})
        OR (start_time <= $${params.length + 1} AND end_time >= $${params.length + 2})
      )`;
      params.push(start_date, end_date);
    }
    
    // Add type filter
    if (type) {
      sql += ` AND type = $${params.length + 1}`;
      params.push(type);
    }
    
    sql += ` ORDER BY start_time ASC`;
    
    const result = await query(sql, params);
    
    res.json({
      events: result.rows,
    });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// POST /api/calendar/events - Create new event
router.post('/events', requireAuth, async (req, res) => {
  // Check calendar event limit
  try {
    const { canCreateCalendarEvent } = await import('../services/subscription.js');
    const canCreate = await canCreateCalendarEvent(req.user.id, null);
    
    if (!canCreate) {
      return res.status(403).json({
        error: 'You have reached the calendar event limit for your plan. Upgrade to create more events.',
        upgradeRequired: true,
      });
    }
  } catch (error) {
    console.error('Calendar event limit check error:', error);
    // Continue if check fails (graceful degradation)
  }

  try {
    await ensureMigration();
    const {
      title,
      description,
      start_time,
      end_time,
      type = 'event',
      color = '#3B6E5C',
      all_day = false,
      timezone = 'UTC',
      recurrence_rule,
      recurrence_end_date,
      recurrence_count,
      reminder_minutes,
    } = req.body;
    
    if (!title || !start_time || !end_time) {
      return res.status(400).json({ error: 'Title, start_time, and end_time are required.' });
    }
    
    // Validate time range
    if (new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({ error: 'End time must be after start time.' });
    }
    
    const result = await query(
      `INSERT INTO calendar_events (user_id, title, description, type, start_time, end_time, all_day, timezone, color, 
                                    recurrence_rule, recurrence_end_date, recurrence_count, reminder_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, title, description, type, start_time, end_time, all_day, timezone, color, 
                 recurrence_rule, recurrence_end_date, recurrence_count, reminder_minutes,
                 created_at, updated_at`,
      [req.user.id, title, description || null, type, start_time, end_time, all_day, timezone, color,
       recurrence_rule ? JSON.stringify(recurrence_rule) : null, recurrence_end_date || null, 
       recurrence_count || null, reminder_minutes || null]
    );
    
    res.json({
      success: true,
      event: result.rows[0],
    });
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

// GET /api/calendar/events/:id - Get single event
router.get('/events/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT id, title, description, type, start_time, end_time, all_day, timezone, color,
              recurrence_rule, recurrence_end_date, recurrence_count, reminder_minutes,
              created_at, updated_at
       FROM calendar_events
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    
    res.json({
      event: result.rows[0],
    });
  } catch (error) {
    console.error('Get calendar event error:', error);
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
});

// PATCH /api/calendar/events/:id - Update event
router.patch('/events/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      start_time,
      end_time,
      type,
      color,
      all_day,
      timezone,
      recurrence_rule,
      recurrence_end_date,
      recurrence_count,
      reminder_minutes,
    } = req.body;
    
    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (start_time !== undefined) {
      updates.push(`start_time = $${paramIndex++}`);
      params.push(start_time);
    }
    if (end_time !== undefined) {
      updates.push(`end_time = $${paramIndex++}`);
      params.push(end_time);
    }
    if (type !== undefined) {
      updates.push(`type = $${paramIndex++}`);
      params.push(type);
    }
    if (color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      params.push(color);
    }
    if (all_day !== undefined) {
      updates.push(`all_day = $${paramIndex++}`);
      params.push(all_day);
    }
    if (timezone !== undefined) {
      updates.push(`timezone = $${paramIndex++}`);
      params.push(timezone);
    }
    if (recurrence_rule !== undefined) {
      updates.push(`recurrence_rule = $${paramIndex++}`);
      params.push(recurrence_rule ? JSON.stringify(recurrence_rule) : null);
    }
    if (recurrence_end_date !== undefined) {
      updates.push(`recurrence_end_date = $${paramIndex++}`);
      params.push(recurrence_end_date || null);
    }
    if (recurrence_count !== undefined) {
      updates.push(`recurrence_count = $${paramIndex++}`);
      params.push(recurrence_count || null);
    }
    if (reminder_minutes !== undefined) {
      updates.push(`reminder_minutes = $${paramIndex++}`);
      params.push(reminder_minutes || null);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }
    
    // Validate time range if both times are being updated
    if (start_time !== undefined && end_time !== undefined) {
      if (new Date(end_time) <= new Date(start_time)) {
        return res.status(400).json({ error: 'End time must be after start time.' });
      }
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id, req.user.id);
    
    const result = await query(
      `UPDATE calendar_events
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
       RETURNING id, title, description, type, start_time, end_time, all_day, timezone, color,
                 recurrence_rule, recurrence_end_date, recurrence_count, reminder_minutes,
                 created_at, updated_at`,
      params
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    
    res.json({
      success: true,
      event: result.rows[0],
    });
  } catch (error) {
    console.error('Update calendar event error:', error);
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

// PATCH /api/calendar/events/:id/move - Quick move (for drag operations)
router.patch('/events/:id/move', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { start_time, end_time } = req.body;
    
    if (!start_time || !end_time) {
      return res.status(400).json({ error: 'start_time and end_time are required.' });
    }
    
    if (new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({ error: 'End time must be after start time.' });
    }
    
    const result = await query(
      `UPDATE calendar_events
       SET start_time = $1, end_time = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING id, title, description, type, start_time, end_time, all_day, timezone, color,
                 recurrence_rule, recurrence_end_date, recurrence_count, reminder_minutes,
                 created_at, updated_at`,
      [start_time, end_time, id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    
    res.json({
      success: true,
      event: result.rows[0],
    });
  } catch (error) {
    console.error('Move calendar event error:', error);
    res.status(500).json({ error: 'Failed to move event.' });
  }
});

// DELETE /api/calendar/events/:id - Delete event
router.delete('/events/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `DELETE FROM calendar_events WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    
    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

export default router;













