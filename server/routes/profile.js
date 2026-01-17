import { Router } from 'express';
import { 
  getUserProfile, 
  updateUser, 
  updateIdentity, 
  updateFocusAreas, 
  updatePreferences,
  updateOnboardingStep 
} from '../models/user.js';

const router = Router();

/**
 * Middleware to ensure user is authenticated
 */
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Log detailed session info for debugging
  console.warn('⚠️  Unauthenticated request:', {
    path: req.path,
    method: req.method,
    hasSession: !!req.session,
    sessionID: req.sessionID,
    sessionPassport: req.session?.passport,
    hasUser: !!req.user,
    userID: req.user?.id,
    isAuthenticated: req.isAuthenticated(),
    cookies: req.headers.cookie ? 'present' : 'missing',
    cookieHeader: req.headers.cookie?.substring(0, 50) + '...'
  });
  
  // Check if session has passport data but user isn't set
  if (req.session?.passport?.user) {
    console.warn('⚠️  Session has passport.user but req.user is not set:', req.session.passport.user);
    console.warn('   This suggests deserialization failed or is pending');
  }
  
  res.status(401).json({ error: 'Please log in to continue.' });
};

/**
 * GET /api/profile
 * Get current user's profile
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

/**
 * PUT /api/profile
 * Update user profile
 */
router.put('/', requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow direct password updates through this route
    delete updates.password;
    delete updates.id;
    delete updates.email;
    
    const profile = await updateUser(req.user.id, updates);
    res.json({ 
      success: true, 
      profile 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

/**
 * POST /api/profile/onboarding
 * Update onboarding progress
 */
router.post('/onboarding', requireAuth, async (req, res) => {
  try {
    // Verify session is still valid
    if (!req.isAuthenticated() || !req.user) {
      console.error('❌ Session expired during onboarding request');
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    
    const { step, data } = req.body;
    
    if (typeof step !== 'number' || step < 0 || step > 7) {
      return res.status(400).json({ error: 'Invalid step number.' });
    }
    
    console.log(`📝 Saving onboarding step ${step} for user ${req.user.id}`);
    
    const profile = await updateOnboardingStep(req.user.id, step, data);
    
    // Ensure session is saved after update
    req.session.save((err) => {
      if (err) {
        console.error('Session save error after onboarding update:', err);
      }
    });
    
    res.json({
      success: true,
      profile,
      completed: profile.onboardingCompleted
    });
  } catch (error) {
    console.error('Update onboarding error:', error);
    res.status(500).json({ error: 'Failed to update onboarding progress.' });
  }
});

/**
 * POST /api/profile/identity
 * Update identity section (vision, values, roles)
 */
router.post('/identity', requireAuth, async (req, res) => {
  try {
    const { vision, values, roles } = req.body;
    
    const profile = await updateIdentity(req.user.id, {
      vision,
      values,
      roles
    });
    
    res.json({ 
      success: true, 
      profile 
    });
  } catch (error) {
    console.error('Update identity error:', error);
    res.status(500).json({ error: 'Failed to update identity.' });
  }
});

/**
 * POST /api/profile/context
 * Update life context (focus areas, current goal)
 */
router.post('/context', requireAuth, async (req, res) => {
  try {
    const { focusAreas, currentGoal } = req.body;
    
    let profile = req.user;
    
    if (focusAreas) {
      profile = await updateFocusAreas(req.user.id, focusAreas);
    }
    
    if (currentGoal !== undefined) {
      profile = await updateUser(req.user.id, { currentGoal });
    }
    
    res.json({ 
      success: true, 
      profile 
    });
  } catch (error) {
    console.error('Update context error:', error);
    res.status(500).json({ error: 'Failed to update context.' });
  }
});

/**
 * POST /api/profile/preferences
 * Update user preferences
 */
router.post('/preferences', requireAuth, async (req, res) => {
  try {
    const { reminderTime, reviewDay, tone } = req.body;
    
    const profile = await updatePreferences(req.user.id, {
      reminderTime,
      reviewDay,
      tone
    });
    
    res.json({ 
      success: true, 
      profile 
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences.' });
  }
});

export default router;
