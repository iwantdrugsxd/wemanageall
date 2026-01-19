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

// POST /api/subscriptions/create - Create subscription (initiate payment)
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { planType, billingCycle = 'monthly', seats = 1, organizationId = null } = req.body;

    if (!planType || !SUBSCRIPTION_PLANS[planType]) {
      return res.status(400).json({ error: 'Invalid plan type.' });
    }

    // Check if plan requires organization
    const plan = SUBSCRIPTION_PLANS[planType];
    if (plan.features.teamMembers > 0 && !organizationId) {
      return res.status(400).json({ error: 'Team plans require an organization.' });
    }

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

    // Save subscription to database (pending payment)
    let subscriptionResult;
    if (organizationId) {
      subscriptionResult = await query(
        `INSERT INTO organization_subscriptions 
         (organization_id, plan_type, status, razorpay_subscription_id, razorpay_plan_id, 
          billing_cycle, amount_per_seat, total_amount, seats, max_seats, current_period_end)
         VALUES ($1, $2, 'trial', $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (organization_id) 
         DO UPDATE SET 
           plan_type = $2,
           razorpay_subscription_id = $3,
           razorpay_plan_id = $4,
           billing_cycle = $5,
           amount_per_seat = $6,
           total_amount = $7,
           seats = $8,
           max_seats = $9,
           current_period_end = $10,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          organizationId,
          planType,
          razorpayData.razorpaySubscriptionId,
          razorpayData.razorpayPlanId,
          billingCycle,
          plan.price,
          razorpayData.amount * seats,
          seats,
          plan.maxSeats || seats,
          periodEnd,
        ]
      );
    } else {
      subscriptionResult = await query(
        `INSERT INTO user_subscriptions 
         (user_id, plan_type, status, razorpay_subscription_id, razorpay_plan_id, 
          billing_cycle, amount, seats, max_seats, current_period_end)
         VALUES ($1, $2, 'trial', $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           plan_type = $2,
           razorpay_subscription_id = $3,
           razorpay_plan_id = $4,
           billing_cycle = $5,
           amount = $6,
           seats = $7,
           max_seats = $8,
           current_period_end = $9,
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
    }

    // Update user/organization subscription status
    if (organizationId) {
      await query(
        `UPDATE organizations SET subscription_plan = $1, subscription_status = 'trial' WHERE id = $2`,
        [planType, organizationId]
      );
    } else {
      await query(
        `UPDATE users SET subscription_plan = $1, subscription_status = 'trial' WHERE id = $2`,
        [planType, req.user.id]
      );
    }

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

// POST /api/subscriptions/webhook - Razorpay webhook handler
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Razorpay webhook secret not configured');
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);
    const event = req.body.event;
    const payload = req.body.payload;

    // Verify webhook signature
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(rawBody);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== signature) {
      console.error('Invalid webhook signature');
      console.error('Expected:', signature);
      console.error('Generated:', generatedSignature);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Handle different webhook events
    switch (event) {
      case 'subscription.activated':
      case 'subscription.charged':
        await handleSubscriptionActivated(payload.subscription.entity);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload.subscription.entity);
        break;

      case 'subscription.paused':
        await handleSubscriptionPaused(payload.subscription.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
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

// Helper functions for webhook handlers
async function handleSubscriptionActivated(subscription) {
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

async function handleSubscriptionCancelled(subscription) {
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

async function handleSubscriptionPaused(subscription) {
  const subscriptionId = subscription.id;

  await query(
    `UPDATE user_subscriptions SET status = 'expired', updated_at = CURRENT_TIMESTAMP
     WHERE razorpay_subscription_id = $1`,
    [subscriptionId]
  );
}

async function handlePaymentFailed(payment) {
  console.log('Payment failed:', payment);
  // Could send notification to user, retry logic, etc.
}

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
