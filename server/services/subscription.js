import Razorpay from 'razorpay';
import crypto from 'crypto';
import { query } from '../db/config.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay
let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Subscription Plans Configuration
 */
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceAnnual: 0,
    features: {
      projects: 3,
      calendarEvents: 50,
      teamMembers: 0, // No team features
      storage: 100, // MB
      analytics: false,
      integrations: false,
      support: 'community',
    },
  },
  premium: {
    name: 'Starter',
    price: 199, // ₹199/month
    priceAnnual: 1990, // ₹1,990/year
    features: {
      projects: -1, // Unlimited
      calendarEvents: -1, // Unlimited
      teamMembers: 0,
      storage: 1024, // MB (1 GB)
      analytics: true,
      integrations: false,
      support: 'email',
    },
  },
  team_starter: {
    name: 'Team',
    price: 499, // ₹499/seat/month
    priceAnnual: 4990, // ₹4,990/seat/year
    minSeats: 2,
    maxSeats: 25,
    features: {
      projects: -1,
      calendarEvents: -1,
      teamMembers: 25, // Hard max, but also enforce purchased seats
      storage: 5120, // MB (5 GB)
      analytics: true,
      integrations: true,
      support: 'priority',
      teamFeatures: true,
    },
  },
  team_pro: {
    name: 'Team Pro',
    price: 19, // $19/user/month or ₹1,500/user/month
    priceAnnual: 190, // $190/user/year
    minSeats: 6,
    maxSeats: 100,
    features: {
      projects: -1,
      calendarEvents: -1,
      teamMembers: 100,
      storage: 20000, // MB
      analytics: true,
      integrations: true,
      support: 'priority',
      teamFeatures: true,
      advancedReporting: true,
      customWorkflows: true,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 0, // Custom pricing
    features: {
      projects: -1,
      calendarEvents: -1,
      teamMembers: -1, // Unlimited
      storage: -1, // Unlimited
      analytics: true,
      integrations: true,
      support: 'dedicated',
      teamFeatures: true,
      advancedReporting: true,
      customWorkflows: true,
      sso: true,
      customFeatures: true,
    },
  },
};

/**
 * Check if a subscription status is active (including valid trials)
 */
function isActiveStatus(status, trialEnd) {
  if (status === 'active') {
    return true;
  }
  
  // Check if trial is still valid
  if (status === 'trial' && trialEnd) {
    const now = new Date();
    const trialEndDate = new Date(trialEnd);
    if (now < trialEndDate) {
      return true; // Trial is still active
    }
  }
  
  return false;
}

/**
 * Get user's current subscription
 * Auto-expires trials that have passed
 */
export async function getUserSubscription(userId) {
  try {
    const result = await query(
      `SELECT * FROM user_subscriptions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Return free plan as default
      return {
        plan_type: 'free',
        status: 'active',
        seats: 1,
        current_period_end: null,
        trial_end: null,
      };
    }

    const subscription = result.rows[0];
    
    // Auto-expire expired trials
    if (subscription.status === 'trial' && subscription.trial_end) {
      const now = new Date();
      const trialEndDate = new Date(subscription.trial_end);
      
      if (now >= trialEndDate) {
        // Trial expired, update to expired status
        await query(
          `UPDATE user_subscriptions 
           SET status = 'expired', updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $1 AND id = $2`,
          [userId, subscription.id]
        );
        
        // Return free plan
        return {
          plan_type: 'free',
          status: 'active',
          seats: 1,
          current_period_end: null,
          trial_end: null,
        };
      }
    }

    return subscription;
  } catch (error) {
    console.error('Get user subscription error:', error);
    return {
      plan_type: 'free',
      status: 'active',
      seats: 1,
      trial_end: null,
    };
  }
}

/**
 * Get organization's current subscription
 * Auto-expires trials that have passed
 */
export async function getOrganizationSubscription(organizationId) {
  try {
    const result = await query(
      `SELECT * FROM organization_subscriptions 
       WHERE organization_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [organizationId]
    );

    if (result.rows.length === 0) {
      return {
        plan_type: 'free',
        status: 'active',
        seats: 0,
        trial_end: null,
      };
    }

    const subscription = result.rows[0];
    
    // Auto-expire expired trials
    if (subscription.status === 'trial' && subscription.trial_end) {
      const now = new Date();
      const trialEndDate = new Date(subscription.trial_end);
      
      if (now >= trialEndDate) {
        // Trial expired, update to expired status
        await query(
          `UPDATE organization_subscriptions 
           SET status = 'expired', updated_at = CURRENT_TIMESTAMP
           WHERE organization_id = $1 AND id = $2`,
          [organizationId, subscription.id]
        );
        
        // Return free plan
        return {
          plan_type: 'free',
          status: 'active',
          seats: 0,
          trial_end: null,
        };
      }
    }

    return subscription;
  } catch (error) {
    console.error('Get organization subscription error:', error);
    return {
      plan_type: 'free',
      status: 'active',
      seats: 0,
      trial_end: null,
    };
  }
}

/**
 * Check if user has access to a feature
 */
export async function hasFeatureAccess(userId, feature, organizationId = null) {
  let subscription;

  if (organizationId) {
    subscription = await getOrganizationSubscription(organizationId);
  } else {
    subscription = await getUserSubscription(userId);
  }

  // Check if subscription is active (including valid trials)
  if (!isActiveStatus(subscription.status, subscription.trial_end)) {
    return false;
  }

  const plan = SUBSCRIPTION_PLANS[subscription.plan_type] || SUBSCRIPTION_PLANS.free;
  return plan.features[feature] !== undefined && plan.features[feature] !== false;
}

/**
 * Check if user can create more projects
 */
export async function canCreateProject(userId, organizationId = null) {
  let subscription;

  if (organizationId) {
    subscription = await getOrganizationSubscription(organizationId);
  } else {
    subscription = await getUserSubscription(userId);
  }

  // Check if subscription is active (including valid trials)
  if (!isActiveStatus(subscription.status, subscription.trial_end)) {
    return false;
  }

  const plan = SUBSCRIPTION_PLANS[subscription.plan_type] || SUBSCRIPTION_PLANS.free;
  const maxProjects = plan.features.projects;

  if (maxProjects === -1) {
    return true; // Unlimited
  }

  // Count current projects
  const countResult = await query(
    `SELECT COUNT(*) as count FROM projects 
     WHERE user_id = $1 ${organizationId ? 'AND organization_id = $2' : 'AND organization_id IS NULL'}`,
    organizationId ? [userId, organizationId] : [userId]
  );

  const currentCount = parseInt(countResult.rows[0].count) || 0;
  return currentCount < maxProjects;
}

/**
 * Check if user can create more calendar events
 * Counts events in the current month
 */
export async function canCreateCalendarEvent(userId, organizationId = null) {
  let subscription;

  if (organizationId) {
    subscription = await getOrganizationSubscription(organizationId);
  } else {
    subscription = await getUserSubscription(userId);
  }

  // Check if subscription is active (including valid trials)
  if (!isActiveStatus(subscription.status, subscription.trial_end)) {
    return false;
  }

  const plan = SUBSCRIPTION_PLANS[subscription.plan_type] || SUBSCRIPTION_PLANS.free;
  const maxEvents = plan.features.calendarEvents;

  if (maxEvents === -1) {
    return true; // Unlimited
  }

  // Count events in current month (check both calendar_events and events tables)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Count from calendar_events table
  const calendarCountResult = await query(
    `SELECT COUNT(*) as count FROM calendar_events 
     WHERE user_id = $1 
     AND start_time >= $2 
     AND start_time <= $3
     ${organizationId ? 'AND organization_id = $4' : ''}`,
    organizationId 
      ? [userId, startOfMonth, endOfMonth, organizationId]
      : [userId, startOfMonth, endOfMonth]
  );

  // Count from events table (alternative event system)
  const eventsCountResult = await query(
    `SELECT COUNT(*) as count FROM events 
     WHERE user_id = $1 
     AND start_at >= $2 
     AND start_at <= $3`,
    [userId, startOfMonth, endOfMonth]
  );

  const calendarCount = parseInt(calendarCountResult.rows[0]?.count) || 0;
  const eventsCount = parseInt(eventsCountResult.rows[0]?.count) || 0;
  const currentCount = calendarCount + eventsCount;
  
  return currentCount < maxEvents;
}

/**
 * Check if user can add team members
 * For Team plans, also enforces purchased seats limit
 */
export async function canAddTeamMember(organizationId, currentMemberCount) {
  const subscription = await getOrganizationSubscription(organizationId);

  // Check if subscription is active (including valid trials)
  if (!isActiveStatus(subscription.status, subscription.trial_end)) {
    return false;
  }

  // Team features require team_starter plan
  const plan = SUBSCRIPTION_PLANS[subscription.plan_type] || SUBSCRIPTION_PLANS.free;
  if (!plan.features.teamFeatures) {
    return false; // Not a team plan
  }

  // For team plans, enforce purchased seats
  if (subscription.seats && currentMemberCount >= subscription.seats) {
    return false; // Reached purchased seat limit
  }

  const maxMembers = plan.features.teamMembers;
  if (maxMembers === -1) {
    return true; // Unlimited
  }

  return currentMemberCount < maxMembers;
}

/**
 * Create Razorpay subscription
 */
export async function createRazorpaySubscription(userId, planType, billingCycle = 'monthly', seats = 1) {
  if (!razorpayInstance) {
    throw new Error('Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
  }

  const plan = SUBSCRIPTION_PLANS[planType];
  if (!plan) {
    throw new Error(`Invalid plan type: ${planType}`);
  }

  // Calculate amount
  const basePrice = billingCycle === 'annual' ? plan.priceAnnual : plan.price;
  const amount = planType.includes('team') ? basePrice * seats : basePrice;
  const amountInPaise = Math.round(amount * 100); // Razorpay uses paise (smallest currency unit)

  // Create Razorpay plan
  const razorpayPlan = await razorpayInstance.plans.create({
    period: billingCycle === 'annual' ? 'yearly' : 'monthly',
    interval: 1,
    item: {
      name: `${plan.name} Plan`,
      amount: amountInPaise,
      currency: 'INR',
      description: `${plan.name} subscription`,
    },
  });

  // Create Razorpay subscription
  const razorpaySubscription = await razorpayInstance.subscriptions.create({
    plan_id: razorpayPlan.id,
    customer_notify: 1,
    total_count: billingCycle === 'annual' ? 1 : 12, // 1 year or 12 months
    notes: {
      user_id: userId,
      plan_type: planType,
      seats: seats.toString(),
    },
  });

  return {
    razorpayPlanId: razorpayPlan.id,
    razorpaySubscriptionId: razorpaySubscription.id,
    amount: amount,
    amountInPaise: amountInPaise,
  };
}

/**
 * Verify Razorpay webhook signature
 * IMPORTANT: Must use raw body buffer, not JSON.stringify(req.body)
 */
export function verifyWebhookSignature(rawBody, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody); // Use raw buffer, not JSON string
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
}

export { razorpayInstance };


