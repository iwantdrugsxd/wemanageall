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
import { addMissingColumns } from './db/add-missing-columns.js';

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
import uploadRoutes from './routes/upload.js';
import eventsRoutes from './routes/events.js';
import paymentsRoutes from './routes/payments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - CRITICAL for Render/Heroku/Vercel (TLS-terminating proxies)
// This ensures Express knows the original request was HTTPS so it sets secure cookies
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  console.log('✅ Trust proxy enabled for production (HTTPS cookie support)');
}

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
// IMPORTANT: Webhook route must capture raw body BEFORE express.json()
// This is set up in the webhook route handler below
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with PostgreSQL store
const PgSession = connectPgSimple(session);

// Ensure session table exists (let connect-pg-simple handle it, just verify)
const ensureSessionTable = async () => {
  try {
    // Check if table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'session'
      );
    `);

    if (tableExists.rows[0].exists) {
      // Table exists - verify it has the required structure
      const hasPrimaryKey = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.table_constraints 
          WHERE table_schema = 'public' 
          AND table_name = 'session' 
          AND constraint_type = 'PRIMARY KEY'
        );
      `);

      if (hasPrimaryKey.rows[0].exists) {
        console.log('✅ Session table exists and is properly configured');
      } else {
        console.warn('⚠️  Session table exists but missing primary key - connect-pg-simple will handle it');
      }

      // Ensure index exists
      await query(`
        CREATE INDEX IF NOT EXISTS IDX_session_expire ON session(expire);
      `);
    } else {
      console.log('ℹ️  Session table does not exist - connect-pg-simple will create it');
    }
  } catch (error) {
    console.warn('⚠️  Session table check warning:', error.message);
    // Continue anyway - connect-pg-simple will handle table creation
  }
};

// Initialize session table before using it
ensureSessionTable();

// Cookie configuration for development vs production
const isProduction = process.env.NODE_ENV === 'production';
const cookieConfig = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/', // Cookie available for all paths
};

// In production, use domain and secure settings
if (isProduction) {
  cookieConfig.domain = process.env.COOKIE_DOMAIN || '.wemanageall.in';
  cookieConfig.secure = true;
  cookieConfig.sameSite = process.env.SESSION_SAMESITE || 'none';
} else {
  // In development, don't set domain (works with localhost)
  // Use 'lax' for SameSite (works without Secure)
  cookieConfig.secure = false;
  cookieConfig.sameSite = 'lax';
}

const sessionConfig = {
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: false, // Disable automatic pruning, let PostgreSQL handle it
  }),
  secret: process.env.SESSION_SECRET || 'ofa-life-os-secret-key-change-in-production',
  resave: true, // Force save session back to store even if not modified
  saveUninitialized: false, // Don't save uninitialized sessions
  name: 'ofa.sid', // Custom session name
  cookie: cookieConfig,
  // Keep session alive on activity
  rolling: true, // Reset expiration on every request (keeps active users logged in)
};

// Log session config (without secret)
console.log('🔐 Session config:', {
  secure: sessionConfig.cookie.secure,
  sameSite: sessionConfig.cookie.sameSite,
  domain: sessionConfig.cookie.domain,
  hasSecret: !!process.env.SESSION_SECRET,
  tableName: 'session',
  rolling: sessionConfig.rolling,
  trustProxy: app.get('trust proxy')
});

app.use(session(sessionConfig));

// Initialize Passport - MUST be after session middleware
app.use(passport.initialize());
app.use(passport.session());

// Ensure passport session is properly restored
app.use((req, res, next) => {
  // Log cookie info for debugging
  const cookieHeader = req.headers.cookie || '';
  const hasOfaSid = cookieHeader.includes('ofa.sid');
  
  // If session exists but passport data is missing, try to restore it
  if (req.session && !req.session.passport && req.sessionID) {
    console.warn('⚠️  Session exists but passport data is missing. Session ID:', req.sessionID, {
      hasCookie: hasOfaSid,
      cookieHeader: cookieHeader.substring(0, 100)
    });
  }
  
  // If no cookie but session exists, log it
  if (req.session && !hasOfaSid && req.path.startsWith('/api/')) {
    console.warn('⚠️  Session exists but ofa.sid cookie is missing:', {
      path: req.path,
      sessionID: req.sessionID,
      allCookies: cookieHeader.split(';').map(c => c.trim())
    });
  }
  
  next();
});

// Debug middleware to log session state
app.use((req, res, next) => {
  // Only log for API routes to avoid spam
  if (req.path.startsWith('/api/') && req.method === 'POST') {
    console.log('📊 Request session state:', {
      path: req.path,
      hasSession: !!req.session,
      sessionID: req.sessionID,
      hasPassport: !!req.session?.passport,
      passportUser: req.session?.passport?.user,
      hasReqUser: !!req.user,
      isAuthenticated: req.isAuthenticated()
    });
  }
  next();
});

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
app.use('/api/events', eventsRoutes);

// Webhook route must capture raw body for signature verification
// CRITICAL: This route must be BEFORE the general subscriptions router
// to capture raw body buffer before JSON parsing
app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Razorpay webhook secret not configured');
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    // CRITICAL: Use raw body buffer for signature verification
    const rawBody = req.body; // This is a Buffer from express.raw()
    
    // Parse JSON for processing
    let body;
    try {
      body = JSON.parse(rawBody.toString());
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }

    const event = body.event;
    const payload = body.payload;

    // Verify webhook signature using raw body buffer
    const { verifyWebhookSignature } = await import('./services/subscription.js');
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Import webhook handler functions
    const { query } = await import('./db/config.js');

    // Handle different webhook events
    switch (event) {
      case 'subscription.activated':
      case 'subscription.charged':
        await handleSubscriptionActivated(payload.subscription.entity, query);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload.subscription.entity, query);
        break;

      case 'subscription.paused':
        await handleSubscriptionPaused(payload.subscription.entity, query);
        break;

      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity, query);
        break;

      case 'payment.failed':
        console.log('Payment failed:', payload.payment.entity);
        await handlePaymentFailed(payload.payment.entity, query);
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Webhook handler functions
async function handleSubscriptionActivated(subscription, query) {
  const subscriptionId = subscription.id;
  const notes = subscription.notes || {};

  if (notes.organization_id) {
    await query(
      `UPDATE organization_subscriptions 
       SET status = 'active', current_period_end = $1, updated_at = CURRENT_TIMESTAMP
       WHERE razorpay_subscription_id = $2`,
      [new Date(subscription.end_at * 1000), subscriptionId]
    );

    await query(
      `UPDATE organizations SET subscription_status = 'active' 
       WHERE id = (SELECT organization_id FROM organization_subscriptions WHERE razorpay_subscription_id = $1)`,
      [subscriptionId]
    );
  } else {
    await query(
      `UPDATE user_subscriptions 
       SET status = 'active', current_period_end = $1, updated_at = CURRENT_TIMESTAMP
       WHERE razorpay_subscription_id = $2`,
      [new Date(subscription.end_at * 1000), subscriptionId]
    );

    await query(
      `UPDATE users SET subscription_status = 'active' 
       WHERE id = (SELECT user_id FROM user_subscriptions WHERE razorpay_subscription_id = $1)`,
      [subscriptionId]
    );
  }

  // Log to history
  await query(
    `INSERT INTO subscription_history (user_id, action, new_plan, amount, razorpay_payment_id)
     VALUES ($1, 'renewed', $2, $3, $4)`,
    [notes.user_id, notes.plan_type, subscription.amount / 100, subscription.id]
  );
}

async function handleSubscriptionCancelled(subscription, query) {
  const subscriptionId = subscription.id;

  await query(
    `UPDATE user_subscriptions SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE razorpay_subscription_id = $1`,
    [subscriptionId]
  );

  await query(
    `UPDATE organization_subscriptions SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE razorpay_subscription_id = $1`,
    [subscriptionId]
  );
}

async function handleSubscriptionPaused(subscription, query) {
  const subscriptionId = subscription.id;

  await query(
    `UPDATE user_subscriptions SET status = 'expired', updated_at = CURRENT_TIMESTAMP
     WHERE razorpay_subscription_id = $1`,
    [subscriptionId]
  );
}

async function handlePaymentCaptured(payment, query) {
  try {
    const paymentId = payment.id;
    const orderId = payment.order_id;
    const amountInPaise = payment.amount;
    const amountInr = amountInPaise / 100;
    const notes = payment.notes || {};

    // Check if payment already exists
    const existingPayment = await query(
      `SELECT id FROM payments WHERE razorpay_payment_id = $1`,
      [paymentId]
    );

    if (existingPayment.rows.length === 0) {
      // Insert payment record
      await query(
        `INSERT INTO payments 
         (user_id, razorpay_payment_id, razorpay_order_id, amount_inr, currency, status, payment_type, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          notes.user_id || null,
          paymentId,
          orderId,
          amountInr,
          payment.currency || 'INR',
          'captured',
          notes.plan_id ? 'one_time' : 'subscription',
          JSON.stringify(payment),
        ]
      );

      // If it's a one-time payment and user_id is provided, upgrade user
      if (notes.user_id && notes.plan_id) {
        const planResult = await query(
          `SELECT * FROM plans WHERE id = $1`,
          [notes.plan_id]
        );

        if (planResult.rows.length > 0) {
          const plan = planResult.rows[0];
          if (plan.interval === 'one_time') {
            await query(
              `UPDATE users 
               SET is_pro = true, plan_status = 'pro', plan_id = $1
               WHERE id = $2`,
              [notes.plan_id, notes.user_id]
            );
          }
        }
      }
    } else {
      // Update existing payment
      await query(
        `UPDATE payments 
         SET status = 'captured', updated_at = CURRENT_TIMESTAMP
         WHERE razorpay_payment_id = $1`,
        [paymentId]
      );
    }
  } catch (error) {
    console.error('Handle payment captured error:', error);
  }
}

async function handlePaymentFailed(payment, query) {
  try {
    const paymentId = payment.id;
    const notes = payment.notes || {};

    // Update payment status
    await query(
      `INSERT INTO payments 
       (user_id, razorpay_payment_id, razorpay_order_id, amount_inr, currency, status, payment_type, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (razorpay_payment_id) 
       DO UPDATE SET status = 'failed', updated_at = CURRENT_TIMESTAMP`,
      [
        notes.user_id || null,
        paymentId,
        payment.order_id || null,
        (payment.amount || 0) / 100,
        payment.currency || 'INR',
        'failed',
        notes.plan_id ? 'one_time' : 'subscription',
        JSON.stringify(payment),
      ]
    );
  } catch (error) {
    console.error('Handle payment failed error:', error);
  }
}

app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/upload', uploadRoutes);

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
    // Add any missing columns to existing tables
    await addMissingColumns();
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
