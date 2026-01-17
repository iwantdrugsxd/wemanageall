import { isOrganizationMember } from '../models/organization.js';

/**
 * Middleware to get current organization context from user
 * Adds req.organizationId to request object
 */
export async function getOrganizationContext(req, res, next) {
  try {
    if (!req.isAuthenticated()) {
      req.organizationId = null;
      return next();
    }

    // Get user's current organization
    const { query } = await import('../db/config.js');
    const userResult = await query(
      'SELECT current_organization_id FROM users WHERE id = $1',
      [req.user.id]
    );

    req.organizationId = userResult.rows[0]?.current_organization_id || null;
    req.isTeamMode = req.organizationId !== null;

    // If in team mode, verify membership
    if (req.organizationId) {
      const member = await isOrganizationMember(req.user.id, req.organizationId);
      if (!member) {
        // User is not a member, clear organization
        await query(
          'UPDATE users SET current_organization_id = NULL WHERE id = $1',
          [req.user.id]
        );
        req.organizationId = null;
        req.isTeamMode = false;
      } else {
        req.organizationRole = member.role;
      }
    }

    next();
  } catch (error) {
    console.error('Organization context error:', error);
    req.organizationId = null;
    req.isTeamMode = false;
    next();
  }
}

/**
 * Helper to build organization filter for queries
 */
export function getOrganizationFilter(organizationId) {
  if (organizationId) {
    return {
      where: 'organization_id = $1',
      params: [organizationId]
    };
  } else {
    return {
      where: 'organization_id IS NULL',
      params: []
    };
  }
}




