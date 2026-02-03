import Razorpay from 'razorpay';
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
    name: 'Premium',
    price: 9, // $9/month or ₹750/month
    priceAnnual: 90, // $90/year (save 17%)
    features: {
      projects: -1, // Unlimited
      calendarEvents: -1, // Unlimited
      teamMembers: 0,
      storage: 1000, // MB
      analytics: true,
      integrations: true,
      support: 'email',
    },
  },
  team_starter: {
    name: 'Team Starter',
    price: 9, // $9/user/month or ₹750/user/month
    priceAnnual: 90, // $90/user/year
    minSeats: 2,
    maxSeats: 25,
    features: {
      projects: -1,
      calendarEvents: -1,
      teamMembers: 25,
      storage: 5000, // MB
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
 * Get user's current subscription
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
      };
    }

    return result.rows[0];
  } catch (error) {
    console.error('Get user subscription error:', error);
    return {
      plan_type: 'free',
      status: 'active',
      seats: 1,
    };
  }
}

/**
 * Get organization's current subscription
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
      };
    }

    return result.rows[0];
  } catch (error) {
    console.error('Get organization subscription error:', error);
    return {
      plan_type: 'free',
      status: 'active',
      seats: 0,
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

  if (subscription.status !== 'active') {
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

  if (subscription.status !== 'active') {
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
 * Check if user can add team members
 */
export async function canAddTeamMember(organizationId, currentMemberCount) {
  const subscription = await getOrganizationSubscription(organizationId);

  if (subscription.status !== 'active') {
    return false;
  }

  const plan = SUBSCRIPTION_PLANS[subscription.plan_type] || SUBSCRIPTION_PLANS.free;
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
 */
export function verifyWebhookSignature(webhookBody, signature, secret) {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(webhookBody));
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
}

export { razorpayInstance };


