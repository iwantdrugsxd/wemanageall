import { getUserSubscription, getOrganizationSubscription, canCreateProject, canAddTeamMember } from '../services/subscription.js';

/**
 * Middleware to check if user has access to a feature
 */
export async function checkSubscriptionFeature(feature) {
  return async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Please log in to continue.' });
      }

      let subscription;
      let organizationId = null;

      // Check if user is in team mode
      if (req.organizationId) {
        organizationId = req.organizationId;
        subscription = await getOrganizationSubscription(organizationId);
      } else {
        subscription = await getUserSubscription(req.user.id);
      }

      // Check if subscription is active
      if (subscription.status !== 'active' && subscription.plan_type !== 'free') {
        return res.status(403).json({
          error: 'Your subscription has expired. Please upgrade to continue.',
          upgradeRequired: true,
        });
      }

      const { SUBSCRIPTION_PLANS } = await import('../services/subscription.js');
      const plan = SUBSCRIPTION_PLANS[subscription.plan_type] || SUBSCRIPTION_PLANS.free;

      // Check feature access
      if (plan.features[feature] === false || plan.features[feature] === undefined) {
        return res.status(403).json({
          error: `This feature requires a ${plan.name} plan or higher.`,
          upgradeRequired: true,
          requiredPlan: 'premium',
        });
      }

      req.subscription = subscription;
      req.plan = plan;
      next();
    } catch (error) {
      console.error('Subscription check error:', error);
      res.status(500).json({ error: 'Failed to verify subscription.' });
    }
  };
}

/**
 * Middleware to check if user can create more projects
 */
export async function checkProjectLimit(req, res, next) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Please log in to continue.' });
    }

    const canCreate = await canCreateProject(req.user.id, req.organizationId || null);

    if (!canCreate) {
      return res.status(403).json({
        error: 'You have reached the project limit for your plan. Upgrade to create more projects.',
        upgradeRequired: true,
      });
    }

    next();
  } catch (error) {
    console.error('Project limit check error:', error);
    res.status(500).json({ error: 'Failed to check project limit.' });
  }
}

/**
 * Middleware to check if organization can add more team members
 */
export async function checkTeamMemberLimit(req, res, next) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Please log in to continue.' });
    }

    const { organizationId } = req.params;

    // Get current member count
    const memberCount = await query(
      `SELECT COUNT(*) as count FROM organization_members 
       WHERE organization_id = $1 AND status = 'active'`,
      [organizationId]
    );

    const currentCount = parseInt(memberCount.rows[0].count) || 0;
    const canAdd = await canAddTeamMember(organizationId, currentCount);

    if (!canAdd) {
      return res.status(403).json({
        error: 'You have reached the team member limit for your plan. Upgrade to add more members.',
        upgradeRequired: true,
      });
    }

    next();
  } catch (error) {
    console.error('Team member limit check error:', error);
    res.status(500).json({ error: 'Failed to check team member limit.' });
  }
}
