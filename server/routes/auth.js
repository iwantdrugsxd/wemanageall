import { Router } from 'express';
import passport from 'passport';
import { createUser, getUserProfile } from '../models/user.js';

const router = Router();

/**
 * POST /api/auth/signup
 * Create a new user account
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required.' 
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters.' 
      });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({ 
        error: 'Please enter a valid email address.' 
      });
    }
    
    // Create user in PostgreSQL
    const user = await createUser({ name, email, password });
    
    // Log in the user immediately after signup
    req.login(user, (err) => {
      if (err) {
        console.error('Login after signup error:', err);
        return res.status(500).json({ error: 'Error logging in after signup.' });
      }
      
      // Verify passport data is in session
      console.log('🔍 After req.login (signup) - Session state:', {
        sessionID: req.sessionID,
        hasPassport: !!req.session.passport,
        passportUser: req.session.passport?.user,
        hasReqUser: !!req.user,
        isAuthenticated: req.isAuthenticated()
      });
      
      // Explicitly save the session to ensure it's persisted
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error after signup:', saveErr);
          return res.status(500).json({ error: 'Error saving session.' });
        }
        
        // Verify passport data is still there after save
        console.log('🔍 After session.save (signup) - Session state:', {
          sessionID: req.sessionID,
          hasPassport: !!req.session.passport,
          passportUser: req.session.passport?.user,
          hasReqUser: !!req.user,
          isAuthenticated: req.isAuthenticated()
        });
        
        console.log('✅ Session saved for new user:', user.email, 'Session ID:', req.sessionID);
        
        res.status(201).json({
          success: true,
          message: 'Account created successfully.',
          user,
          redirect: '/onboarding'
        });
      });
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to create account.' 
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user with email/password
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ error: 'Authentication error.' });
    }
    
    if (!user) {
      return res.status(401).json({ 
        error: info?.message || 'Invalid email or password.' 
      });
    }
    
    req.login(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Error logging in.' });
      }
      
      // Check if passport data was set
      console.log('🔍 Immediately after req.login:', {
        sessionID: req.sessionID,
        hasPassport: !!req.session.passport,
        passportUser: req.session.passport?.user,
        fullSession: JSON.stringify(req.session).substring(0, 200)
      });
      
      // Wait a tick to ensure passport data is set
      process.nextTick(() => {
        // Check again after next tick
        console.log('🔍 After nextTick:', {
          sessionID: req.sessionID,
          hasPassport: !!req.session.passport,
          passportUser: req.session.passport?.user
        });
        
        // Explicitly save the session to ensure it's persisted
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.status(500).json({ error: 'Error saving session.' });
          }
          
          // Verify passport data is still there after save
          console.log('🔍 After session.save:', {
            sessionID: req.sessionID,
            hasPassport: !!req.session.passport,
            passportUser: req.session.passport?.user
          });
          
          console.log('✅ Session saved for user:', user.email, 'Session ID:', req.sessionID);
          
          // Determine redirect based on onboarding status
          const redirect = user.onboardingCompleted 
            ? '/welcome' 
            : '/onboarding';
          
          res.json({
            success: true,
            message: 'Login successful.',
            user,
            redirect
          });
        });
      });
    });
  })(req, res, next);
});

/**
 * POST /api/auth/logout
 * Log out the current user
 */
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Error logging out.' });
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.json({ 
        success: true, 
        message: 'Logged out successfully.',
        redirect: '/'
      });
    });
  });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      // Get fresh user data from database
      const user = await getUserProfile(req.user.id);
      res.json({ 
        authenticated: true, 
        user 
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.json({ 
        authenticated: true, 
        user: req.user 
      });
    }
  } else {
    res.json({ 
      authenticated: false, 
      user: null 
    });
  }
});

/**
 * GET /api/auth/check
 * Check if user is authenticated (for protected routes)
 */
router.get('/check', (req, res) => {
  res.json({ 
    authenticated: req.isAuthenticated() 
  });
});

/**
 * GET /api/auth/google
 * Initiate Google OAuth authentication
 */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
  async (req, res) => {
    try {
      // Determine redirect based on onboarding status
      const redirect = req.user.onboardingCompleted 
        ? '/welcome' 
        : '/onboarding';
      
      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}${redirect}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`);
    }
  }
);

export default router;
