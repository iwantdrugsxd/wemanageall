import { Router } from 'express';
import { query } from '../db/config.js';
import {
  createOrganization,
  getOrganizationById,
  getUserOrganizations,
  isOrganizationMember,
  getOrganizationMembers,
  inviteToOrganization,
  acceptInvitation,
  removeMember,
  updateMemberRole,
  getInvitationByToken,
  getOrganizationByCode,
  joinOrganizationByCode
} from '../models/organization.js';

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

/**
 * GET /api/organizations
 * Get user's organizations
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const organizations = await getUserOrganizations(req.user.id);
    res.json({ success: true, organizations });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ error: 'Failed to fetch organizations.' });
  }
});

/**
 * GET /api/organizations/:id
 * Get organization details
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const org = await getOrganizationById(req.params.id);
    
    if (!org) {
      return res.status(404).json({ error: 'Organization not found.' });
    }
    
    // Check if user is member
    const member = await isOrganizationMember(req.user.id, req.params.id);
    if (!member) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    
    res.json({ success: true, organization: org });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Failed to fetch organization.' });
  }
});

/**
 * POST /api/organizations
 * Create new organization
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, plan } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Organization name is required.' });
    }
    
    const org = await createOrganization(req.user.id, { name, description, plan });
    res.status(201).json({ success: true, organization: org });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ error: error.message || 'Failed to create organization.' });
  }
});

/**
 * GET /api/organizations/:id/members
 * Get organization members
 */
router.get('/:id/members', requireAuth, async (req, res) => {
  try {
    const member = await isOrganizationMember(req.user.id, req.params.id);
    if (!member) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    
    const members = await getOrganizationMembers(req.params.id);
    res.json({ success: true, members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members.' });
  }
});

/**
 * POST /api/organizations/:id/invite
 * Invite user to organization
 */
router.post('/:id/invite', requireAuth, async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }
    
    // Check permissions
    const member = await isOrganizationMember(req.user.id, req.params.id);
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    
    const invitation = await inviteToOrganization(req.params.id, email, role, req.user.id);
    
    // TODO: Send invitation email
    // For now, return the invitation token (in production, send via email)
    
    res.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: email,
        inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${invitation.token}`
      }
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: error.message || 'Failed to send invitation.' });
  }
});

/**
 * POST /api/organizations/invitations/:token/accept
 * Accept organization invitation
 */
router.post('/invitations/:token/accept', requireAuth, async (req, res) => {
  try {
    const orgId = await acceptInvitation(req.params.token, req.user.id);
    res.json({ success: true, organizationId: orgId });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(400).json({ error: error.message || 'Failed to accept invitation.' });
  }
});

/**
 * GET /api/organizations/invitations/:token
 * Get invitation details
 */
router.get('/invitations/:token', async (req, res) => {
  try {
    const invitation = await getInvitationByToken(req.params.token);
    
    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation.' });
    }
    
    res.json({ success: true, invitation });
  } catch (error) {
    console.error('Get invitation error:', error);
    res.status(500).json({ error: 'Failed to fetch invitation.' });
  }
});

/**
 * DELETE /api/organizations/:id/members/:userId
 * Remove member from organization
 */
router.delete('/:id/members/:userId', requireAuth, async (req, res) => {
  try {
    await removeMember(req.params.id, req.params.userId, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: error.message || 'Failed to remove member.' });
  }
});

/**
 * PATCH /api/organizations/:id/members/:userId/role
 * Update member role
 */
router.patch('/:id/members/:userId/role', requireAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    
    await updateMemberRole(req.params.id, req.params.userId, role, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: error.message || 'Failed to update role.' });
  }
});

/**
 * PATCH /api/organizations/:id/switch
 * Switch user's current organization
 */
router.patch('/:id/switch', requireAuth, async (req, res) => {
  try {
    const member = await isOrganizationMember(req.user.id, req.params.id);
    if (!member) {
      return res.status(403).json({ error: 'Not a member of this organization.' });
    }
    
    await query(
      'UPDATE users SET current_organization_id = $1 WHERE id = $2',
      [req.params.id, req.user.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Switch organization error:', error);
    res.status(500).json({ error: 'Failed to switch organization.' });
  }
});

/**
 * PATCH /api/organizations/switch/individual
 * Switch to individual mode
 */
router.patch('/switch/individual', requireAuth, async (req, res) => {
  try {
    await query(
      'UPDATE users SET current_organization_id = NULL, default_mode = $1 WHERE id = $2',
      ['individual', req.user.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Switch to individual error:', error);
    res.status(500).json({ error: 'Failed to switch to individual mode.' });
  }
});

/**
 * GET /api/organizations/code/:code
 * Get organization details by workspace code
 */
router.get('/code/:code', requireAuth, async (req, res) => {
  try {
    const org = await getOrganizationByCode(req.params.code);
    
    if (!org) {
      return res.status(404).json({ error: 'Invalid workspace code.' });
    }
    
    res.json({ success: true, organization: org });
  } catch (error) {
    console.error('Get organization by code error:', error);
    res.status(500).json({ error: 'Failed to fetch organization.' });
  }
});

/**
 * POST /api/organizations/join
 * Join organization by workspace code
 */
router.post('/join', requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Workspace code is required.' });
    }
    
    const org = await joinOrganizationByCode(code, req.user.id);
    res.json({ success: true, organization: org });
  } catch (error) {
    console.error('Join organization error:', error);
    res.status(400).json({ error: error.message || 'Failed to join workspace.' });
  }
});

export default router;

