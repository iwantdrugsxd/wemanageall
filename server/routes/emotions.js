import { Router } from 'express';
import { query } from '../db/config.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Initialize Supabase client (lazy initialization)
let supabase = null;
if (process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// Ensure unload_entries table exists
const ensureUnloadTable = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS unload_entries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'voice')),
        content TEXT,
        audio_url TEXT,
        duration INTEGER,
        transcript TEXT,
        locked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_unload_entries_user_id ON unload_entries(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_unload_entries_created_at ON unload_entries(created_at DESC)`);
  } catch (error) {
    // Table might already exist, continue
    if (error.code !== '42P07') {
      console.error('Error ensuring unload_entries table:', error);
    }
  }
};

// GET /api/emotions - Get user's unload entries (text + voice)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { type, locked } = req.query;
    
    // Ensure table exists
    await ensureUnloadTable();
    
    let sql = `
      SELECT id, type, content, audio_url, duration, transcript, locked, created_at
      FROM unload_entries
      WHERE user_id = $1
    `;
    const params = [req.user.id];
    
    if (type) {
      sql += ` AND type = $${params.length + 1}`;
      params.push(type);
    }
    
    if (locked !== undefined) {
      sql += ` AND locked = $${params.length + 1}`;
      params.push(locked === 'true');
    }
    
    sql += ` ORDER BY created_at DESC`;
    
    const result = await query(sql, params);
    
    // Generate public URLs for voice entries if audio_url exists
    // Bucket is now public, so we can use public URLs directly
    const entriesWithUrls = result.rows.map((entry) => {
      if (entry.type === 'voice' && entry.audio_url) {
        try {
          // audio_url can be either:
          // 1. A file path (user_id/timestamp.webm) - stored when saving
          // 2. A full URL (from old entries) - use as-is
          let fileName = entry.audio_url;
          
          // If it's already a full URL, use it
          if (fileName.startsWith('http')) {
            console.log('Entry already has full URL:', fileName);
            return entry;
          }
          
          // If it's a file path, generate public URL
          console.log('Generating public URL for file path:', fileName);
          
          // Try Supabase getPublicUrl first
          let publicUrlData = null;
          let urlError = null;
          if (supabase) {
            const result = supabase.storage
              .from('unload-recordings')
              .getPublicUrl(fileName);
            publicUrlData = result;
            // getPublicUrl doesn't return an error, it always returns a URL
          }
          
          if (urlError) {
            console.error('Error getting public URL:', urlError);
            console.error('File path:', fileName);
          }
          
          let finalUrl = null;
          
          if (publicUrlData?.publicUrl) {
            finalUrl = publicUrlData.publicUrl;
            console.log('Generated public URL:', finalUrl);
          } else {
            // Fallback: construct URL manually
            const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
            if (supabaseUrl) {
              finalUrl = `${supabaseUrl}/storage/v1/object/public/unload-recordings/${fileName}`;
              console.log('Constructed public URL manually:', finalUrl);
            }
          }
          
          if (finalUrl) {
            return {
              ...entry,
              audio_url: finalUrl,
            };
          } else {
            console.error('No public URL generated for:', fileName);
            console.error('publicUrlData:', publicUrlData);
          }
        } catch (urlError) {
          console.error('Error generating public URL:', urlError);
          console.error('Original audio_url:', entry.audio_url);
        }
      }
      return entry;
    });
    
    res.json({
      entries: entriesWithUrls,
    });
  } catch (error) {
    console.error('Get emotions error:', error);
    res.status(500).json({ error: 'Failed to fetch entries.' });
  }
});

// POST /api/emotions - Create a text unload entry
router.post('/', requireAuth, async (req, res) => {
  try {
    const { content, type = 'text', locked = false } = req.body;
    
    if (type !== 'text') {
      return res.status(400).json({ error: 'Use /api/emotions/voice for voice entries' });
    }
    
    await ensureUnloadTable();
    
    const result = await query(
      `INSERT INTO unload_entries (user_id, type, content, locked)
       VALUES ($1, $2, $3, $4)
       RETURNING id, type, content, locked, created_at`,
      [req.user.id, type, content, locked]
    );

    res.json({
      success: true,
      entry: result.rows[0],
    });
  } catch (error) {
    console.error('Create emotion error:', error);
    res.status(500).json({ error: 'Failed to save entry.' });
  }
});

// POST /api/emotions/voice - Create a voice unload entry (audio only, no transcription)
router.post('/voice', requireAuth, async (req, res) => {
  try {
    console.log('Voice entry request received (audio only):', {
      userId: req.user?.id,
      hasAudioUrl: !!req.body.audio_url,
      duration: req.body.duration,
    });
    
    const { audio_url, duration, locked = false } = req.body;
    
    if (!audio_url) {
      return res.status(400).json({ error: 'Audio URL is required.' });
    }
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }
    
    // Ensure table exists
    await ensureUnloadTable();
    
    const result = await query(
      `INSERT INTO unload_entries (user_id, type, audio_url, duration, transcript, locked)
       VALUES ($1, 'voice', $2, $3, NULL, $4)
       RETURNING id, type, audio_url, duration, transcript, locked, created_at`,
      [req.user.id, audio_url, parseInt(duration) || 0, locked]
    );

    console.log('✅ Voice entry saved successfully:', result.rows[0].id);
    
    res.json({
      success: true,
      entry: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Create voice entry error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      user: req.user?.id,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to save recording.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/emotions/:id - Update text entry content
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (content === undefined) {
      return res.status(400).json({ error: 'Content is required.' });
    }
    
    await ensureUnloadTable();
    
    // Check if entry exists and is a text entry
    const checkResult = await query(
      `SELECT type FROM unload_entries WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found.' });
    }

    if (checkResult.rows[0].type !== 'text') {
      return res.status(400).json({ error: 'Only text entries can be updated with PUT. Use PATCH for other fields.' });
    }
    
    const result = await query(
      `UPDATE unload_entries
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, type, content, locked, created_at, updated_at`,
      [content, id, req.user.id]
    );

    res.json({
      success: true,
      entry: result.rows[0],
    });
  } catch (error) {
    console.error('Update emotion error:', error);
    res.status(500).json({ error: 'Failed to update entry.' });
  }
});

// PATCH /api/emotions/:id - Update an entry (lock/unlock, transcript)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { locked, transcript } = req.body;
    
    await ensureUnloadTable();
    
    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (locked !== undefined) {
      updates.push(`locked = $${paramIndex++}`);
      params.push(locked);
    }
    
    if (transcript !== undefined) {
      updates.push(`transcript = $${paramIndex++}`);
      params.push(transcript);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id, req.user.id);
    
    const result = await query(
      `UPDATE unload_entries
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING id, type, content, audio_url, duration, transcript, locked, created_at, updated_at`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found.' });
    }

    res.json({
      success: true,
      entry: result.rows[0],
    });
  } catch (error) {
    console.error('Update emotion error:', error);
    res.status(500).json({ error: 'Failed to update entry.' });
  }
});

// GET /api/emotions/export - Export all entries as JSON
router.get('/export', requireAuth, async (req, res) => {
  try {
    await ensureUnloadTable();
    
    const result = await query(
      `SELECT id, type, content, audio_url, duration, transcript, locked, created_at, updated_at
       FROM unload_entries
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    
    // Generate public URLs for voice entries
    const entriesWithUrls = result.rows.map((entry) => {
      if (entry.type === 'voice' && entry.audio_url) {
        try {
          let fileName = entry.audio_url;
          
          if (fileName.startsWith('http')) {
            return entry;
          }
          
          let finalUrl = null;
          if (supabase) {
            const result = supabase.storage
              .from('unload-recordings')
              .getPublicUrl(fileName);
            if (result?.publicUrl) {
              finalUrl = result.publicUrl;
            }
          }
          
          if (!finalUrl) {
            const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
            if (supabaseUrl) {
              finalUrl = `${supabaseUrl}/storage/v1/object/public/unload-recordings/${fileName}`;
            }
          }
          
          if (finalUrl) {
            return {
              ...entry,
              audio_url: finalUrl,
            };
          }
        } catch (urlError) {
          console.error('Error generating public URL:', urlError);
        }
      }
      return entry;
    });
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="unload-entries-${Date.now()}.json"`);
    res.json({
      exported_at: new Date().toISOString(),
      total_entries: entriesWithUrls.length,
      entries: entriesWithUrls,
    });
  } catch (error) {
    console.error('Export emotions error:', error);
    res.status(500).json({ error: 'Failed to export entries.' });
  }
});

// DELETE /api/emotions - Delete all entries for user
router.delete('/', requireAuth, async (req, res) => {
  try {
    await ensureUnloadTable();
    
    // Get all voice entries to delete from storage
    const voiceEntries = await query(
      `SELECT audio_url FROM unload_entries WHERE user_id = $1 AND type = 'voice' AND audio_url IS NOT NULL`,
      [req.user.id]
    );
    
    // Delete audio files from Supabase Storage
    if (supabase && voiceEntries.rows.length > 0) {
      for (const entry of voiceEntries.rows) {
        try {
          const urlParts = entry.audio_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const folderPath = `${req.user.id}/${fileName}`;
          
          await supabase.storage
            .from('unload-recordings')
            .remove([folderPath]);
        } catch (storageError) {
          console.error('Failed to delete from storage:', storageError);
          // Continue with database deletion
        }
      }
    }
    
    // Delete all entries from database
    await query(
      `DELETE FROM unload_entries WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'All entries deleted successfully.',
    });
  } catch (error) {
    console.error('Delete all emotions error:', error);
    res.status(500).json({ error: 'Failed to delete entries.' });
  }
});

// DELETE /api/emotions/:id - Delete an entry
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    await ensureUnloadTable();
    
    // Get entry to check if it has audio_url for cleanup
    const entryResult = await query(
      `SELECT audio_url, type FROM unload_entries WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (entryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Entry not found.' });
    }

    const entry = entryResult.rows[0];

    // Delete from Supabase Storage if it's a voice entry
    if (entry.type === 'voice' && entry.audio_url) {
      try {
        // Extract file path from URL
        const urlParts = entry.audio_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const folderPath = `${req.user.id}/${fileName}`;
        
        if (supabase) {
          const { error: deleteError } = await supabase.storage
            .from('unload-recordings')
            .remove([folderPath]);
          
          if (deleteError) {
            console.error('Failed to delete from storage:', deleteError);
            // Continue with database deletion even if storage deletion fails
          }
        }
      } catch (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion
      }
    }

    // Delete entry from database
    await query(
      `DELETE FROM unload_entries WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete emotion error:', error);
    res.status(500).json({ error: 'Failed to delete entry.' });
  }
});

export default router;

