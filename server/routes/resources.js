import { Router } from 'express';
import { query } from '../db/config.js';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// Ensure uploads directory exists
const uploadsDir = join(__dirname, '../../uploads/resources');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${req.user.id}-${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Initialize tables
const initTables = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS resources (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        file_url TEXT NOT NULL,
        file_name VARCHAR(500) NOT NULL,
        file_size BIGINT,
        category VARCHAR(100) DEFAULT 'Uncategorized',
        folder VARCHAR(100),
        notes TEXT,
        author VARCHAR(255),
        priority VARCHAR(20) DEFAULT 'normal',
        current_page INTEGER DEFAULT 1,
        total_pages INTEGER,
        progress REAL DEFAULT 0.0 CHECK (progress >= 0 AND progress <= 100),
        last_opened_at TIMESTAMP WITH TIME ZONE,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_resources_last_opened ON resources(last_opened_at DESC)`);
    
    console.log('Resources tables initialized successfully');
  } catch (error) {
    console.error('Error initializing resources tables:', error);
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

// GET /api/resources - Get all resources for user
router.get('/', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { category, folder, search } = req.query;

    let queryText = `
      SELECT 
        id,
        title,
        file_url,
        file_name,
        file_size,
        category,
        folder,
        notes,
        author,
        priority,
        current_page,
        total_pages,
        progress,
        last_opened_at,
        uploaded_at,
        updated_at
      FROM resources
      WHERE user_id = $1
    `;

    const params = [req.user.id];

    if (category && category !== 'all') {
      queryText += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    if (folder) {
      queryText += ` AND folder = $${params.length + 1}`;
      params.push(folder);
    }

    if (search) {
      queryText += ` AND (title ILIKE $${params.length + 1} OR notes ILIKE $${params.length + 1} OR author ILIKE $${params.length + 1})`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    queryText += ` ORDER BY last_opened_at DESC NULLS LAST, uploaded_at DESC`;

    const result = await query(queryText, params);

    res.json({
      success: true,
      resources: result.rows
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch resources.'
    });
  }
});

// GET /api/resources/categories - Get all categories
router.get('/categories', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const result = await query(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM resources
      WHERE user_id = $1
      GROUP BY category
      ORDER BY category
    `, [req.user.id]);

    res.json({
      success: true,
      categories: result.rows
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch categories.'
    });
  }
});

// GET /api/resources/:id - Get single resource
router.get('/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const result = await query(`
      SELECT 
        id,
        title,
        file_url,
        file_name,
        file_size,
        category,
        folder,
        notes,
        author,
        priority,
        current_page,
        total_pages,
        progress,
        last_opened_at,
        uploaded_at,
        updated_at
      FROM resources
      WHERE id = $1 AND user_id = $2
    `, [req.params.id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    res.json({
      success: true,
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch resource.'
    });
  }
});

// POST /api/resources/upload - Upload a new resource
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    await ensureTables();

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { title, category, folder, notes, author, priority } = req.body;

    const fileUrl = `/uploads/resources/${req.file.filename}`;
    
    console.log('Uploading resource:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
      fileUrl
    });

    const result = await query(`
      INSERT INTO resources (
        user_id,
        title,
        file_url,
        file_name,
        file_size,
        category,
        folder,
        notes,
        author,
        priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, title, file_url, category, folder, uploaded_at, progress, current_page, total_pages, author, priority
    `, [
      req.user.id,
      title || req.file.originalname,
      fileUrl,
      req.file.originalname,
      req.file.size,
      category || 'Uncategorized',
      folder || null,
      notes || null,
      author || null,
      priority || 'normal'
    ]);

    res.json({
      success: true,
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('Upload resource error:', error);
    
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      error: error.message || 'Failed to upload resource.'
    });
  }
});

// PATCH /api/resources/:id/progress - Update reading progress
router.patch('/:id/progress', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { currentPage, totalPages } = req.body;
    const resourceId = req.params.id;

    const checkResult = await query(
      `SELECT id, total_pages FROM resources WHERE id = $1 AND user_id = $2`,
      [resourceId, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    const totalPagesValue = totalPages || checkResult.rows[0].total_pages || 1;
    const currentPageValue = currentPage || 1;
    const progress = totalPagesValue > 0 
      ? Math.min(100, Math.max(0, (currentPageValue / totalPagesValue) * 100))
      : 0;

    const result = await query(`
      UPDATE resources
      SET 
        current_page = $1,
        total_pages = COALESCE($2, total_pages),
        progress = $3,
        last_opened_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND user_id = $5
      RETURNING id, current_page, total_pages, progress, last_opened_at
    `, [currentPageValue, totalPages, progress, resourceId, req.user.id]);

    res.json({
      success: true,
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update progress.'
    });
  }
});

// PATCH /api/resources/:id - Update resource metadata
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const { title, category, folder, notes, author, priority } = req.body;
    const resourceId = req.params.id;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(title);
    }

    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      params.push(category);
    }

    if (folder !== undefined) {
      updates.push(`folder = $${paramIndex++}`);
      params.push(folder);
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      params.push(notes);
    }

    if (author !== undefined) {
      updates.push(`author = $${paramIndex++}`);
      params.push(author);
    }

    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      params.push(priority);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(resourceId, req.user.id);

    const result = await query(`
      UPDATE resources
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING id, title, category, folder, notes, author, priority, updated_at
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    res.json({
      success: true,
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update resource.'
    });
  }
});

// DELETE /api/resources/:id - Delete a resource
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const resourceId = req.params.id;

    const result = await query(
      `SELECT file_url FROM resources WHERE id = $1 AND user_id = $2`,
      [resourceId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    const fileUrl = result.rows[0].file_url;
    const filePath = join(__dirname, '../..', fileUrl);

    await query(
      `DELETE FROM resources WHERE id = $1 AND user_id = $2`,
      [resourceId, req.user.id]
    );

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('Failed to delete file:', fileError);
    }

    res.json({
      success: true,
      message: 'Resource deleted successfully.'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      error: error.message || 'Failed to delete resource.'
    });
  }
});

// GET /api/resources/:id/file - Serve PDF file
router.get('/:id/file', requireAuth, async (req, res) => {
  try {
    await ensureTables();

    const result = await query(
      `SELECT file_url, file_name FROM resources WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    const fileUrl = result.rows[0].file_url;
    const fileName = result.rows[0].file_name;
    
    // Handle both absolute and relative paths
    let filePath;
    if (fileUrl.startsWith('/') || fileUrl.startsWith('http')) {
      // If it's already an absolute path or URL, use it directly
      if (fileUrl.startsWith('http')) {
        // If it's a URL, redirect to it
        return res.redirect(fileUrl);
      }
      filePath = join(__dirname, '../..', fileUrl);
    } else {
      // Relative path - construct from uploads directory
      filePath = join(uploadsDir, fileUrl);
    }

    console.log('Serving file:', { fileUrl, filePath, exists: fs.existsSync(filePath) });

    if (!fs.existsSync(filePath)) {
      console.error('File not found at path:', filePath);
      // Try alternative path construction
      const altPath = join(__dirname, '../../uploads/resources', fileUrl.split('/').pop());
      if (fs.existsSync(altPath)) {
        filePath = altPath;
      } else {
        return res.status(404).json({ error: 'File not found.' });
      }
    }

    await query(
      `UPDATE resources SET last_opened_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [req.params.id]
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName || fileUrl.split('/').pop()}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({
      error: error.message || 'Failed to serve file.'
    });
  }
});

export default router;

