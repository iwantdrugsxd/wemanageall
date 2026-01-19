import { Router } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('⚠️ Cloudinary configuration missing!');
  console.error('Required environment variables:');
  console.error('  - CLOUDINARY_CLOUD_NAME:', cloudName ? '✓' : '✗ MISSING');
  console.error('  - CLOUDINARY_API_KEY:', apiKey ? '✓' : '✗ MISSING');
  console.error('  - CLOUDINARY_API_SECRET:', apiSecret ? '✓' : '✗ MISSING');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Configure multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ofa-uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto' }
    ],
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)'));
    }
  },
});

// POST /api/upload/image - Upload image to Cloudinary
router.post('/image', requireAuth, upload.single('image'), async (req, res) => {
  try {
    // Check Cloudinary configuration
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary not configured properly');
      return res.status(500).json({ 
        error: 'Image upload service not configured. Please contact support.',
        details: 'Missing Cloudinary credentials'
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    // Return the Cloudinary URL (multer-storage-cloudinary provides it directly)
    res.json({
      success: true,
      url: req.file.path, // Cloudinary URL
      public_id: req.file.filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cloudinaryConfig: {
        hasCloudName: !!cloudName,
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret
      }
    });
    res.status(500).json({ 
      error: error.message || 'Failed to upload image.',
      details: error.message.includes('api_key') ? 'Cloudinary API key is missing or invalid' : undefined
    });
  }
});

export default router;

