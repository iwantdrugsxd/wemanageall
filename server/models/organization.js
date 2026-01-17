import { query } from '../db/config.js';
import crypto from 'crypto';

/**
 * Organization Model
 * Handles team workspaces and organization management
 */

/**
 * Generate unique organization slug
 */
function generateSlug(name) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return base;
}

/**
 * Generate unique workspace code (8 characters)
 */
function generateWorkspaceCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0, O, I, 1)
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new organization
 */
export async function createOrganization(ownerId, data) {
  const { name, description, plan = 'free' } = data;
  
  // Generate unique slug
  let slug = generateSlug(name);
  let counter = 0;
  let finalSlug = slug;
  
  while (true) {
    const existing = await query(
      'SELECT id FROM organizations WHERE slug = $1',
      [finalSlug]
    );
    
    if (existing.rows.length === 0) break;
    
    counter++;
    finalSlug = `${slug}-${counter}`;
  }
  
  // Generate unique workspace code
  let workspaceCode;
  while (true) {
    workspaceCode = generateWorkspaceCode();
    const existing = await query(
      'SELECT id FROM organizations WHERE workspace_code = $1',
      [workspaceCode]
    );
    
    if (existing.rows.length === 0) break;
  }
  
  // Create organization
  const result = await query(
    `INSERT INTO organizations (name, slug, description, owner_id, plan, max_members, workspace_code)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, slug, description, owner_id, plan, max_members, workspace_code, created_at`,
    [name, finalSlug, description || null, ownerId, plan, plan === 'free' ? 5 : plan === 'team' ? 25 : 100, workspaceCode]
  );
  
  const org = result.rows[0];
  
  // Add owner as organization member
  await query(
    `INSERT INTO organization_members (organization_id, user_id, role, status, joined_at)
     VALUES ($1, $2, 'owner', 'active', CURRENT_TIMESTAMP)
     ON CONFLICT (organization_id, user_id) DO UPDATE
     SET role = 'owner', status = 'active', joined_at = CURRENT_TIMESTAMP`,
    [org.id, ownerId]
  );
  
  // Update user's current organization
  await query(
    'UPDATE users SET current_organization_id = $1 WHERE id = $2',
    [org.id, ownerId]
  );
  
  return org;
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(orgId) {
  const result = await query(
    `SELECT o.*, 
            u.name as owner_name, u.email as owner_email,
            COUNT(om.id) FILTER (WHERE om.status = 'active') as member_count
     FROM organizations o
     LEFT JOIN users u ON o.owner_id = u.id
     LEFT JOIN organization_members om ON o.id = om.organization_id
     WHERE o.id = $1
     GROUP BY o.id, u.name, u.email, o.workspace_code`,
    [orgId]
  );
  
  return result.rows[0] || null;
}

/**
 * Get user's organizations
 */
export async function getUserOrganizations(userId) {
  const result = await query(
    `SELECT o.*, 
            om.role, om.status as member_status, om.joined_at,
            COUNT(om2.id) FILTER (WHERE om2.status = 'active') as member_count
     FROM organization_members om
     JOIN organizations o ON om.organization_id = o.id
     LEFT JOIN organization_members om2 ON o.id = om2.organization_id
     WHERE om.user_id = $1 AND om.status = 'active'
     GROUP BY o.id, om.role, om.status, om.joined_at, o.workspace_code
     ORDER BY o.created_at DESC`,
    [userId]
  );
  
  return result.rows;
}

/**
 * Check if user is member of organization
 */
export async function isOrganizationMember(userId, orgId) {
  const result = await query(
    `SELECT role, status FROM organization_members
     WHERE user_id = $1 AND organization_id = $2 AND status = 'active'`,
    [userId, orgId]
  );
  
  return result.rows[0] || null;
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(orgId) {
  const result = await query(
    `SELECT om.*, u.name, u.email, u.photo
     FROM organization_members om
     JOIN users u ON om.user_id = u.id
     WHERE om.organization_id = $1
     ORDER BY 
       CASE om.role 
         WHEN 'owner' THEN 1
         WHEN 'admin' THEN 2
         WHEN 'member' THEN 3
         ELSE 4
       END,
       om.joined_at ASC`,
    [orgId]
  );
  
  return result.rows;
}

/**
 * Invite user to organization
 */
export async function inviteToOrganization(orgId, email, role, invitedBy) {
  // Check if user already exists
  const userResult = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  const existingUser = userResult.rows[0];
  
  // Check if already a member
  if (existingUser) {
    const memberCheck = await query(
      'SELECT id FROM organization_members WHERE organization_id = $1 AND user_id = $2',
      [orgId, existingUser.id]
    );
    
    if (memberCheck.rows.length > 0) {
      throw new Error('User is already a member of this organization');
    }
  }
  
  // Check for existing pending invitation
  const existingInvite = await query(
    'SELECT id FROM organization_invitations WHERE organization_id = $1 AND email = $2 AND accepted_at IS NULL',
    [orgId, email.toLowerCase()]
  );
  
  if (existingInvite.rows.length > 0) {
    throw new Error('Invitation already sent to this email');
  }
  
  // Generate invitation token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
  
  // Create invitation
  const result = await query(
    `INSERT INTO organization_invitations (organization_id, email, role, token, invited_by, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, token, expires_at`,
    [orgId, email.toLowerCase(), role, token, invitedBy, expiresAt]
  );
  
  return result.rows[0];
}

/**
 * Accept organization invitation
 */
export async function acceptInvitation(token, userId) {
  // Get invitation
  const inviteResult = await query(
    `SELECT * FROM organization_invitations 
     WHERE token = $1 AND accepted_at IS NULL AND expires_at > NOW()`,
    [token]
  );
  
  if (inviteResult.rows.length === 0) {
    throw new Error('Invalid or expired invitation');
  }
  
  const invitation = inviteResult.rows[0];
  
  // Verify email matches
  const userResult = await query('SELECT email FROM users WHERE id = $1', [userId]);
  if (userResult.rows[0].email.toLowerCase() !== invitation.email) {
    throw new Error('Invitation email does not match your account');
  }
  
  // Add user as member
  await query(
    `INSERT INTO organization_members (organization_id, user_id, role, status, invited_by, joined_at)
     VALUES ($1, $2, $3, 'active', $4, CURRENT_TIMESTAMP)
     ON CONFLICT (organization_id, user_id) DO UPDATE
     SET role = $3, status = 'active', joined_at = CURRENT_TIMESTAMP`,
    [invitation.organization_id, userId, invitation.role, invitation.invited_by]
  );
  
  // Mark invitation as accepted
  await query(
    'UPDATE organization_invitations SET accepted_at = CURRENT_TIMESTAMP WHERE id = $1',
    [invitation.id]
  );
  
  // Update user's current organization
  await query(
    'UPDATE users SET current_organization_id = $1 WHERE id = $2',
    [invitation.organization_id, userId]
  );
  
  return invitation.organization_id;
}

/**
 * Remove member from organization
 */
export async function removeMember(orgId, userId, removedBy) {
  // Check permissions
  const removerRole = await isOrganizationMember(removedBy, orgId);
  const memberRole = await isOrganizationMember(userId, orgId);
  
  if (!removerRole || removerRole.role === 'viewer' || removerRole.role === 'member') {
    throw new Error('Insufficient permissions');
  }
  
  if (memberRole && memberRole.role === 'owner') {
    throw new Error('Cannot remove organization owner');
  }
  
  // Remove member
  await query(
    'UPDATE organization_members SET status = \'suspended\' WHERE organization_id = $1 AND user_id = $2',
    [orgId, userId]
  );
  
  // Clear current organization if it was this one
  await query(
    'UPDATE users SET current_organization_id = NULL WHERE id = $1 AND current_organization_id = $2',
    [userId, orgId]
  );
}

/**
 * Update member role
 */
export async function updateMemberRole(orgId, userId, newRole, updatedBy) {
  // Check permissions
  const updaterRole = await isOrganizationMember(updatedBy, orgId);
  
  if (!updaterRole || (updaterRole.role !== 'owner' && updaterRole.role !== 'admin')) {
    throw new Error('Insufficient permissions');
  }
  
  // Can't change owner role
  const memberRole = await isOrganizationMember(userId, orgId);
  if (memberRole && memberRole.role === 'owner') {
    throw new Error('Cannot change owner role');
  }
  
  // Update role
  await query(
    'UPDATE organization_members SET role = $1 WHERE organization_id = $2 AND user_id = $3',
    [newRole, orgId, userId]
  );
}

/**
 * Get organization invitation by token
 */
export async function getInvitationByToken(token) {
  const result = await query(
    `SELECT oi.*, o.name as organization_name
     FROM organization_invitations oi
     JOIN organizations o ON oi.organization_id = o.id
     WHERE oi.token = $1 AND oi.accepted_at IS NULL AND oi.expires_at > NOW()`,
    [token]
  );
  
  return result.rows[0] || null;
}

/**
 * Get organization by workspace code
 */
export async function getOrganizationByCode(workspaceCode) {
  const result = await query(
    `SELECT o.*, 
            u.name as owner_name, u.email as owner_email,
            COUNT(om.id) FILTER (WHERE om.status = 'active') as member_count
     FROM organizations o
     LEFT JOIN users u ON o.owner_id = u.id
     LEFT JOIN organization_members om ON o.id = om.organization_id
     WHERE o.workspace_code = $1
     GROUP BY o.id, u.name, u.email`,
    [workspaceCode.toUpperCase()]
  );
  
  return result.rows[0] || null;
}

/**
 * Join organization by workspace code
 */
export async function joinOrganizationByCode(workspaceCode, userId) {
  // Get organization
  const org = await getOrganizationByCode(workspaceCode);
  
  if (!org) {
    throw new Error('Invalid workspace code');
  }
  
  // Check if already a member
  const memberCheck = await isOrganizationMember(userId, org.id);
  if (memberCheck) {
    throw new Error('You are already a member of this workspace');
  }
  
  // Check member limit
  if (org.member_count >= org.max_members) {
    throw new Error('Workspace has reached its member limit');
  }
  
  // Add user as member
  await query(
    `INSERT INTO organization_members (organization_id, user_id, role, status, joined_at)
     VALUES ($1, $2, 'member', 'active', CURRENT_TIMESTAMP)
     ON CONFLICT (organization_id, user_id) DO UPDATE
     SET status = 'active', joined_at = CURRENT_TIMESTAMP`,
    [org.id, userId]
  );
  
  // Update user's current organization
  await query(
    'UPDATE users SET current_organization_id = $1 WHERE id = $2',
    [org.id, userId]
  );
  
  return org;
}

