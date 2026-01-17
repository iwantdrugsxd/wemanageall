import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import database
import pool, { testConnection, query } from './db/config.js';
import { ensureUsersTable } from './db/ensure-users-table.js';

// Import Passport configuration
import passport from './config/passport.js';

// Import routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import thoughtsRoutes from './routes/thoughts.js';
import projectsRoutes from './routes/projects.js';
import todayRoutes from './routes/today.js';
import tasksRoutes from './routes/tasks.js';
import emotionsRoutes from './routes/emotions.js';
import moneyRoutes from './routes/money.js';
import settingsRoutes from './routes/settings.js';
import calendarRoutes from './routes/calendar.js';
import insightsRoutes from './routes/insights.js';
import resourcesRoutes from './routes/resources.js';
import listsRoutes from './routes/lists.js';
import subscriptionsRoutes from './routes/subscriptions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
  'https://wemanageall.in',
  'https://www.wemanageall.in',
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with PostgreSQL store
const PgSession = connectPgSimple(session);

app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'ofa-life-os-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'ofa.sid', // Custom session name
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax', // Same-site requests (works for same domain)
    // Don't set domain - let browser use default (works for exact domain match)
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// ============================================
// API Routes
// ============================================

// Health check with database status
app.get('/api/health', async (req, res) => {
  try {
    const dbResult = await query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      message: 'OFA API is running',
      database: 'connected',
      serverTime: dbResult.rows[0].now,
      authenticated: req.isAuthenticated()
    });
  } catch (error) {
    res.json({
      status: 'ok',
      message: 'OFA API is running',
      database: 'disconnected',
      error: error.message,
      authenticated: req.isAuthenticated()
    });
  }
});

// Auth routes
app.use('/api/auth', authRoutes);

// Organization routes
import organizationsRoutes from './routes/organizations.js';
app.use('/api/organizations', organizationsRoutes);

// Profile routes
app.use('/api/profile', profileRoutes);

// Feature routes
app.use('/api/thoughts', thoughtsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/today', todayRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/emotions', emotionsRoutes);
app.use('/api/money', moneyRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);

// Waitlist endpoint
app.post('/api/waitlist', async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  
  try {
    // Store in database
    await query(
      `INSERT INTO waitlist (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
      [email.toLowerCase()]
    );
    
    console.log(`📧 New waitlist signup: ${email}`);
    
    res.json({ 
      success: true, 
      message: 'You\'re on the list. We\'ll be in touch.' 
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    res.json({ 
      success: true, 
      message: 'You\'re on the list. We\'ll be in touch.' 
    });
  }
});

// ============================================
// Serve React App (Production)
// ============================================

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

// ============================================
// Error Handling
// ============================================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// Start Server
// ============================================

async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('\n⚠️  Database connection failed!');
    console.error('   Make sure PostgreSQL is running and configured correctly.');
    console.error('   Run "npm run db:init" to initialize the database.\n');
  } else {
    // Ensure users table exists (auto-initialize if missing)
    await ensureUsersTable();
  }
  
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🧠 OFA - Personal Life OS                            ║
║                                                        ║
║   Server:   http://localhost:${PORT}                      ║
║   Database: PostgreSQL ${dbConnected ? '✅' : '❌'}                         ║
║                                                        ║
║   API Endpoints:                                       ║
║   • POST /api/auth/signup    - Create account          ║
║   • POST /api/auth/login     - Login                   ║
║   • POST /api/auth/logout    - Logout                  ║
║   • GET  /api/auth/me        - Current user            ║
║   • GET  /api/profile        - Get profile             ║
║   • PUT  /api/profile        - Update profile          ║
║   • POST /api/profile/onboarding - Update onboarding   ║
║   • POST /api/profile/identity   - Update identity     ║
║   • POST /api/profile/context    - Update context      ║
║   • POST /api/profile/preferences - Update prefs       ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `);
  });
}

startServer();
