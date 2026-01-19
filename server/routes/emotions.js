import { Router } from 'express';
import { query } from '../db/config.js';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize OpenAI client (lazy initialization)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

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

// GET /api/emotions - Get user's unload entries
router.get('/', requireAuth, async (req, res) => {
  try {
    const { type, locked } = req.query;
    
    // Ensure table exists
    await ensureUnloadTable();
    
    // Ensure transcript column exists (migration on-the-fly)
    try {
      await query(`
        ALTER TABLE unload_entries 
        ADD COLUMN IF NOT EXISTS transcript TEXT;
      `);
    } catch (migrationError) {
      // Column might already exist (code 42701) or other error - continue anyway
      if (migrationError.code !== '42701') {
        console.log('Note: transcript column migration:', migrationError.message);
      }
    }
    
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

// POST /api/emotions/process-transcript - Process and improve transcript
router.post('/process-transcript', requireAuth, async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: 'Transcript is required.' });
    }

    // Import processing function
    const { processTranscript } = await import('../services/transcriptProcessor.js');
    const result = await processTranscript(transcript);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('❌ Transcript processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process transcript.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/emotions/transcribe - Transcribe audio using Whisper
router.post('/transcribe', requireAuth, async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY || !openai) {
      return res.status(500).json({ error: 'OpenAI API key not configured.' });
    }

    const { audio_url } = req.body;
    
    if (!audio_url) {
      return res.status(400).json({ error: 'Audio URL is required.' });
    }

    console.log('Transcription request received for:', audio_url);

    // Download audio from Supabase Storage
    let audioBuffer;
    try {
      // Extract file path from URL if it's a full URL
      let filePath = audio_url;
      if (audio_url.startsWith('http')) {
        // Extract path from Supabase URL
        const urlParts = audio_url.split('/storage/v1/object/public/unload-recordings/');
        if (urlParts.length > 1) {
          filePath = urlParts[1];
        } else {
          // Try direct download
          const response = await fetch(audio_url);
          if (!response.ok) throw new Error('Failed to download audio');
          audioBuffer = Buffer.from(await response.arrayBuffer());
        }
      }

      // If we don't have the buffer yet, download from Supabase
      if (!audioBuffer && supabase) {
        const { data, error } = await supabase.storage
          .from('unload-recordings')
          .download(filePath);

        if (error) throw error;
        audioBuffer = Buffer.from(await data.arrayBuffer());
      } else if (!audioBuffer) {
        throw new Error('Supabase not configured and audio download failed');
      }
    } catch (downloadError) {
      console.error('Error downloading audio:', downloadError);
      return res.status(500).json({ error: 'Failed to download audio file.' });
    }

    // Save to temporary file for Whisper API
    const tempDir = join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = join(tempDir, `transcribe-${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);

    try {
      // Transcribe using OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'en', // Optional: specify language for better accuracy
        response_format: 'text', // Get plain text
      });

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      // Post-process: clean up the transcript
      // When response_format is 'text', transcription is a string
      let cleanedTranscript = (typeof transcription === 'string' ? transcription : transcription.text || '').trim();
      
      // Basic cleanup: remove excessive whitespace, fix capitalization
      cleanedTranscript = cleanedTranscript
        .replace(/\s+/g, ' ')
        .replace(/\.\s*\./g, '.')
        .trim();

      // Capitalize first letter
      if (cleanedTranscript.length > 0) {
        cleanedTranscript = cleanedTranscript.charAt(0).toUpperCase() + cleanedTranscript.slice(1);
      }

      console.log('✅ Transcription successful, length:', cleanedTranscript.length);

      res.json({
        success: true,
        transcript: cleanedTranscript,
      });
    } catch (transcribeError) {
      // Clean up temp file on error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw transcribeError;
    }
  } catch (error) {
    console.error('❌ Transcription error:', error);
    console.error('Error details:', {
      status: error.status || error.statusCode,
      code: error.code || error.error?.code,
      type: error.type || error.error?.type,
      message: error.message || error.error?.message,
      response: error.response?.data
    });
    
    // Handle specific OpenAI errors - check multiple possible error structures
    const errorCode = error.code || error.error?.code || error.response?.data?.code;
    const errorType = error.type || error.error?.type || error.response?.data?.type;
    const errorStatus = error.status || error.statusCode || error.response?.status;
    
    if (errorStatus === 429 || errorCode === 'insufficient_quota' || errorType === 'insufficient_quota') {
      console.warn('⚠️ OpenAI quota exceeded - transcription unavailable');
      return res.status(429).json({ 
        error: 'OpenAI API quota exceeded. Transcription is temporarily unavailable. You can still save your recording.',
        code: 'quota_exceeded',
        details: 'Your OpenAI API quota has been exceeded. Please add credits to your account or wait for quota reset. The app will use browser-based transcription as a fallback.'
      });
    }
    
    if (errorStatus === 401 || errorCode === 'invalid_api_key') {
      return res.status(500).json({ 
        error: 'OpenAI API key is invalid or not configured.',
        code: 'api_key_error'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to transcribe audio.',
      code: 'transcription_error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/emotions/voice - Create a voice unload entry
router.post('/voice', requireAuth, async (req, res) => {
  try {
    console.log('Voice entry request received:', {
      userId: req.user?.id,
      hasAudioUrl: !!req.body.audio_url,
      hasTranscript: !!req.body.transcript,
      duration: req.body.duration
    });
    
    const { audio_url, duration, transcript, locked = false } = req.body;
    
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
       VALUES ($1, 'voice', $2, $3, $4, $5)
       RETURNING id, type, audio_url, duration, transcript, locked, created_at`,
      [req.user.id, audio_url, parseInt(duration) || 0, transcript || null, locked]
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

// PATCH /api/emotions/:id - Update an entry (lock/unlock)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { locked } = req.body;
    
    await ensureUnloadTable();
    
    const result = await query(
      `UPDATE unload_entries
       SET locked = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, locked`,
      [locked, id, req.user.id]
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

