import { Router } from 'express';
import { query } from '../db/config.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// Initialize events tables
const initTables = async () => {
  try {
    // Events table
    await query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        start_at TIMESTAMP WITH TIME ZONE NOT NULL,
        end_at TIMESTAMP WITH TIME ZONE NOT NULL,
        all_day BOOLEAN DEFAULT false,
        location TEXT,
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
        type VARCHAR(30) DEFAULT 'event' CHECK (type IN ('event', 'meeting', 'task', 'milestone')),
        project_id UUID,
        created_by UUID,
        updated_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Event attendees table
    await query(`
      CREATE TABLE IF NOT EXISTS event_attendees (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'attendee' CHECK (role IN ('organizer', 'attendee', 'optional')),
        response VARCHAR(20) DEFAULT 'pending' CHECK (response IN ('pending', 'accepted', 'declined', 'tentative')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      )
    `);

    // Event reminders table
    await query(`
      CREATE TABLE IF NOT EXISTS event_reminders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        minutes_before INTEGER NOT NULL,
        method VARCHAR(20) DEFAULT 'in_app' CHECK (method IN ('in_app', 'email', 'push')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_events_user_start ON events(user_id, start_at)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_events_project ON events(project_id) WHERE project_id IS NOT NULL
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id)
    `);

    console.log('✅ Events tables initialized');
  } catch (error) {
    console.error('❌ Error initializing events tables:', error);
    throw error;
  }
};

// Ensure tables exist
let tablesInitialized = false;
const ensureTables = async () => {
  if (!tablesInitialized) {
    await initTables();
    tablesInitialized = true;
  }
};

// Helper function to calculate date range
const getDateRange = (range) => {
  const now = new Date();
  let start, end;

  if (range === 'today') {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
    end = new Date(now);
    end.setHours(23, 59, 59, 999);
  } else if (range === 'week') {
    start = new Date(now);
    start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 999);
  } else if (range === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  } else {
    // Default to today
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
    end = new Date(now);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};

// GET /api/events - Get events
router.get('/', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    const userId = req.user.id;
    const { start, end, type, status, project_id, range } = req.query;

    let startDate, endDate;

    // Handle range parameter
    if (range) {
      const rangeDates = getDateRange(range);
      startDate = rangeDates.start;
      endDate = rangeDates.end;
    } else if (start && end) {
      startDate = new Date(start);
      endDate = new Date(end);
    } else {
      // Default to today if no range specified
      const rangeDates = getDateRange('today');
      startDate = rangeDates.start;
      endDate = rangeDates.end;
    }

    let sql = `
      SELECT id, title, description, start_at, end_at, all_day, location, status, type, project_id,
             created_by, updated_by, created_at, updated_at
      FROM events
      WHERE user_id = $1
      AND (
        (start_at >= $2 AND start_at <= $3)
        OR (end_at >= $2 AND end_at <= $3)
        OR (start_at <= $2 AND end_at >= $3)
      )
    `;
    const params = [userId, startDate.toISOString(), endDate.toISOString()];

    // Add filters
    if (type) {
      sql += ` AND type = $${params.length + 1}`;
      params.push(type);
    }

    if (status) {
      sql += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (project_id) {
      sql += ` AND project_id = $${params.length + 1}`;
      params.push(project_id);
    }

    sql += ` ORDER BY start_at ASC`;

    const result = await query(sql, params);

    res.json({
      events: result.rows,
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `SELECT id, title, description, start_at, end_at, all_day, location, status, type, project_id,
              created_by, updated_by, created_at, updated_at
       FROM events
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.json({
      event: result.rows[0],
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
});

// POST /api/events - Create event
router.post('/', requireAuth, async (req, res) => {
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
    await ensureTables();
    const {
      title,
      description,
      start_at,
      end_at,
      all_day = false,
      location,
      status = 'scheduled',
      type = 'event',
      project_id,
    } = req.body;

    // Validation
    if (!title || !start_at || !end_at) {
      return res.status(400).json({ error: 'Title, start_at, and end_at are required.' });
    }

    // Validate time range
    const startDate = new Date(start_at);
    const endDate = new Date(end_at);
    if (endDate <= startDate) {
      return res.status(400).json({ error: 'End time must be after start time.' });
    }

    const result = await query(
      `INSERT INTO events (user_id, title, description, start_at, end_at, all_day, location, status, type, project_id, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
       RETURNING id, title, description, start_at, end_at, all_day, location, status, type, project_id,
                 created_by, updated_by, created_at, updated_at`,
      [
        req.user.id,
        title,
        description || null,
        start_at,
        end_at,
        all_day,
        location || null,
        status,
        type,
        project_id || null,
        req.user.id,
      ]
    );

    res.json({
      success: true,
      event: result.rows[0],
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    const { id } = req.params;
    const userId = req.user.id;
    const {
      title,
      description,
      start_at,
      end_at,
      all_day,
      location,
      status,
      type,
      project_id,
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
      params.push(description || null);
    }
    if (start_at !== undefined) {
      updates.push(`start_at = $${paramIndex++}`);
      params.push(start_at);
    }
    if (end_at !== undefined) {
      updates.push(`end_at = $${paramIndex++}`);
      params.push(end_at);
    }
    if (all_day !== undefined) {
      updates.push(`all_day = $${paramIndex++}`);
      params.push(all_day);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      params.push(location || null);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (type !== undefined) {
      updates.push(`type = $${paramIndex++}`);
      params.push(type);
    }
    if (project_id !== undefined) {
      updates.push(`project_id = $${paramIndex++}`);
      params.push(project_id || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    // Validate time range if both times are being updated
    if (start_at !== undefined && end_at !== undefined) {
      const startDate = new Date(start_at);
      const endDate = new Date(end_at);
      if (endDate <= startDate) {
        return res.status(400).json({ error: 'End time must be after start time.' });
      }
    }

    updates.push(`updated_by = $${paramIndex++}`);
    params.push(userId);
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id, userId);

    const result = await query(
      `UPDATE events
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
       RETURNING id, title, description, start_at, end_at, all_day, location, status, type, project_id,
                 created_by, updated_by, created_at, updated_at`,
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
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

export default router;
