import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createUser, getUserProfile, findUserByEmail, updateUser } from '../models/user.js';
import { query } from '../db/config.js';
import { sendPasswordResetEmail } from '../services/email.js';

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
        
        // Verify cookie is being set with full details
        const setCookieHeader = res.getHeader('Set-Cookie');
        if (setCookieHeader) {
          const cookieStr = Array.isArray(setCookieHeader) ? setCookieHeader.join('; ') : setCookieHeader;
          console.log('🍪 Set-Cookie header after signup:', {
            present: true,
            cookie: cookieStr.substring(0, 200),
            hasOfaSid: cookieStr.includes('ofa.sid'),
            hasSecure: cookieStr.includes('Secure'),
            hasSameSite: cookieStr.includes('SameSite'),
            hasDomain: cookieStr.includes('Domain')
          });
        } else {
          console.error('❌ Set-Cookie header MISSING after signup - cookie not set!');
        }
        
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
          
          // Verify cookie is being set with full details
          const setCookieHeader = res.getHeader('Set-Cookie');
          if (setCookieHeader) {
            const cookieStr = Array.isArray(setCookieHeader) ? setCookieHeader.join('; ') : setCookieHeader;
            console.log('🍪 Set-Cookie header after login:', {
              present: true,
              cookie: cookieStr.substring(0, 200),
              hasOfaSid: cookieStr.includes('ofa.sid'),
              hasSecure: cookieStr.includes('Secure'),
              hasSameSite: cookieStr.includes('SameSite'),
              hasDomain: cookieStr.includes('Domain')
            });
          } else {
            console.error('❌ Set-Cookie header MISSING after login - cookie not set!');
          }
          
          // Determine redirect based on onboarding status
          const redirect = user.onboardingCompleted 
            ? '/dashboard' 
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
        ? '/dashboard' 
        : '/onboarding';
      
      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}${redirect}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`);
    }
  }
);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        error: 'Valid email is required.' 
      });
    }

    // Find user by email
    const user = await findUserByEmail(email);

    // Always return success (don't leak if email exists)
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists, a reset link was sent.'
      });
    }

    // Generate secure reset token (32 bytes = 64 hex chars)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

    // Save token and expiry to user
    await query(
      `UPDATE users 
       SET password_reset_token = $1, password_reset_expires = $2 
       WHERE id = $3`,
      [resetToken, resetExpires, user.id]
    );

    // Generate reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send email
    await sendPasswordResetEmail(user.email, resetLink);

    res.json({
      success: true,
      message: 'If an account exists, a reset link was sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    // Still return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account exists, a reset link was sent.'
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ 
        error: 'Token and password are required.' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters.' 
      });
    }

    // Find user by reset token
    const result = await query(
      `SELECT id, password_reset_expires 
       FROM users 
       WHERE password_reset_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token.' 
      });
    }

    const user = result.rows[0];

    // Check if token is expired
    const now = new Date();
    const expires = new Date(user.password_reset_expires);
    if (now > expires) {
      return res.status(400).json({ 
        error: 'Reset token has expired. Please request a new one.' 
      });
    }

    // Hash new password (same as signup)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset token
    await query(
      `UPDATE users 
       SET password = $1, password_reset_token = NULL, password_reset_expires = NULL 
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    res.json({
      success: true,
      message: 'Password reset successfully.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Failed to reset password.' 
    });
  }
});

export default router;
