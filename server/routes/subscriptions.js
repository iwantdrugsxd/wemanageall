import { Router } from 'express';
import { query } from '../db/config.js';
import {
  getUserSubscription,
  getOrganizationSubscription,
  SUBSCRIPTION_PLANS,
  createRazorpaySubscription,
  verifyWebhookSignature,
  canCreateProject,
  canAddTeamMember,
} from '../services/subscription.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// GET /api/subscriptions/plans - Get all available plans
router.get('/plans', (req, res) => {
  try {
    const plans = Object.keys(SUBSCRIPTION_PLANS).map(key => ({
      id: key,
      name: SUBSCRIPTION_PLANS[key].name,
      price: SUBSCRIPTION_PLANS[key].price,
      priceAnnual: SUBSCRIPTION_PLANS[key].priceAnnual || null,
      features: SUBSCRIPTION_PLANS[key].features,
      minSeats: SUBSCRIPTION_PLANS[key].minSeats || null,
      maxSeats: SUBSCRIPTION_PLANS[key].maxSeats || null,
    }));

    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to fetch plans.' });
  }
});

// GET /api/subscriptions/current - Get current user subscription
router.get('/current', requireAuth, async (req, res) => {
  try {
    const subscription = await getUserSubscription(req.user.id);
    const plan = SUBSCRIPTION_PLANS[subscription.plan_type] || SUBSCRIPTION_PLANS.free;

    res.json({
      subscription: {
        ...subscription,
        plan: {
          name: plan.name,
          features: plan.features,
        },
      },
    });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription.' });
  }
});

// GET /api/subscriptions/organization/:id - Get organization subscription
router.get('/organization/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify user is member of organization
    const memberCheck = await query(
      `SELECT role FROM organization_members 
       WHERE organization_id = $1 AND user_id = $2 AND status = 'active'`,
      [id, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this organization.' });
    }

    const subscription = await getOrganizationSubscription(id);
    const plan = SUBSCRIPTION_PLANS[subscription.plan_type] || SUBSCRIPTION_PLANS.free;

    res.json({
      subscription: {
        ...subscription,
        plan: {
          name: plan.name,
          features: plan.features,
        },
      },
    });
  } catch (error) {
    console.error('Get organization subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription.' });
  }
});

// POST /api/subscriptions/start-trial - Start 7-day trial
router.post('/start-trial', requireAuth, async (req, res) => {
  try {
    const { planType, seats = 1 } = req.body;

    if (!planType || !SUBSCRIPTION_PLANS[planType]) {
      return res.status(400).json({ error: 'Invalid plan type.' });
    }

    // Only allow premium and team_starter trials
    if (planType !== 'premium' && planType !== 'team_starter') {
      return res.status(400).json({ error: 'Trial not available for this plan.' });
    }

    // Check if user has already used a trial
    const existingSub = await query(
      `SELECT trial_end FROM user_subscriptions 
       WHERE user_id = $1 AND trial_end IS NOT NULL
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (existingSub.rows.length > 0 && existingSub.rows[0].trial_end) {
      return res.status(400).json({ 
        error: 'You have already used your free trial. Please subscribe to continue.' 
      });
    }

    const plan = SUBSCRIPTION_PLANS[planType];

    // Validate seats for team plans
    if (planType === 'team_starter') {
      if (seats < plan.minSeats) {
        return res.status(400).json({ error: `Minimum ${plan.minSeats} seats required for Team plan.` });
      }
      if (seats > plan.maxSeats) {
        return res.status(400).json({ error: `Maximum ${plan.maxSeats} seats allowed for Team plan.` });
      }
    }

    // Calculate trial end (7 days from now)
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    // Create or update subscription with trial
    const subscriptionResult = await query(
      `INSERT INTO user_subscriptions 
       (user_id, plan_type, status, trial_end, current_period_end, seats, max_seats)
       VALUES ($1, $2, 'trial', $3, $4, $5, $6)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         plan_type = $2,
         status = 'trial',
         trial_end = $3,
         current_period_end = $4,
         seats = $5,
         max_seats = $6,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        req.user.id,
        planType,
        trialEnd,
        trialEnd,
        planType === 'team_starter' ? seats : 1,
        plan.maxSeats || 1,
      ]
    );

    // Update user subscription status
    await query(
      `UPDATE users SET subscription_plan = $1, subscription_status = 'trial' WHERE id = $2`,
      [planType, req.user.id]
    );

    const subscription = subscriptionResult.rows[0];
    const planData = SUBSCRIPTION_PLANS[planType];

    res.json({
      success: true,
      subscription: {
        ...subscription,
        plan: {
          name: planData.name,
          features: planData.features,
        },
      },
    });
  } catch (error) {
    console.error('Start trial error:', error);
    res.status(500).json({
      error: 'Failed to start trial.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /api/subscriptions/create - Create subscription (initiate payment)
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { planType, billingCycle = 'monthly', seats = 1, organizationId = null } = req.body;

    if (!planType || !SUBSCRIPTION_PLANS[planType]) {
      return res.status(400).json({ error: 'Invalid plan type.' });
    }

    const plan = SUBSCRIPTION_PLANS[planType];
    // Remove hard requirement for organization - Team plans can be user-level subscriptions

    // Validate seats for team plans
    if (plan.minSeats && seats < plan.minSeats) {
      return res.status(400).json({ error: `Minimum ${plan.minSeats} seats required for this plan.` });
    }

    if (plan.maxSeats && seats > plan.maxSeats) {
      return res.status(400).json({ error: `Maximum ${plan.maxSeats} seats allowed for this plan.` });
    }

    // Create Razorpay subscription
    const razorpayData = await createRazorpaySubscription(
      req.user.id,
      planType,
      billingCycle,
      seats
    );

    // Calculate period end
    const periodEnd = new Date();
    if (billingCycle === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Save subscription to database (status = 'expired' until webhook activates it)
    // This ensures access is NOT granted until payment is confirmed
    const subscriptionResult = await query(
      `INSERT INTO user_subscriptions 
       (user_id, plan_type, status, razorpay_subscription_id, razorpay_plan_id, 
        billing_cycle, amount, seats, max_seats, current_period_end, trial_end)
       VALUES ($1, $2, 'expired', $3, $4, $5, $6, $7, $8, $9, NULL)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         plan_type = $2,
         status = 'expired',
         razorpay_subscription_id = $3,
         razorpay_plan_id = $4,
         billing_cycle = $5,
         amount = $6,
         seats = $7,
         max_seats = $8,
         current_period_end = $9,
         trial_end = NULL,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        req.user.id,
        planType,
        razorpayData.razorpaySubscriptionId,
        razorpayData.razorpayPlanId,
        billingCycle,
        razorpayData.amount,
        seats,
        plan.maxSeats || 1,
        periodEnd,
      ]
    );

    // Update user subscription status (but keep as expired until webhook)
    await query(
      `UPDATE users SET subscription_plan = $1, subscription_status = 'expired' WHERE id = $2`,
      [planType, req.user.id]
    );

    res.json({
      success: true,
      subscription: subscriptionResult.rows[0],
      razorpay: {
        subscriptionId: razorpayData.razorpaySubscriptionId,
        planId: razorpayData.razorpayPlanId,
        amount: razorpayData.amount,
        amountInPaise: razorpayData.amountInPaise,
      },
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      error: 'Failed to create subscription.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// NOTE: Webhook route is handled in server/index.js with raw body capture
// This ensures proper signature verification using the raw Buffer

// POST /api/subscriptions/cancel - Cancel subscription
router.post('/cancel', requireAuth, async (req, res) => {
  try {
    const subscription = await getUserSubscription(req.user.id);

    if (!subscription.razorpay_subscription_id) {
      return res.status(400).json({ error: 'No active subscription to cancel.' });
    }

    // Cancel in Razorpay
    const { razorpayInstance } = await import('../services/subscription.js');
    if (razorpayInstance) {
      await razorpayInstance.subscriptions.cancel(subscription.razorpay_subscription_id);
    }

    // Update in database
    await query(
      `UPDATE user_subscriptions 
       SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [req.user.id]
    );

    await query(
      `UPDATE users SET subscription_status = 'cancelled' WHERE id = $1`,
      [req.user.id]
    );

    res.json({ success: true, message: 'Subscription cancelled successfully.' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription.' });
  }
});

// GET /api/subscriptions/check-feature - Check if user has access to a feature
router.get('/check-feature/:feature', requireAuth, async (req, res) => {
  try {
    const { feature } = req.params;
    const { organizationId } = req.query;

    const { hasFeatureAccess } = await import('../services/subscription.js');
    const hasAccess = await hasFeatureAccess(req.user.id, feature, organizationId || null);

    res.json({ hasAccess, feature });
  } catch (error) {
    console.error('Check feature error:', error);
    res.status(500).json({ error: 'Failed to check feature access.' });
  }
});

export default router;
