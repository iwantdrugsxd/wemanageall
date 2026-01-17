# Team/Organization Implementation Guide

## ✅ What's Been Implemented

### Database Schema
- ✅ `organizations` table - Team workspaces
- ✅ `organization_members` table - Team membership with roles
- ✅ `organization_invitations` table - Invitation system
- ✅ `organization_id` column added to all relevant tables:
  - projects
  - tasks
  - calendar_events
  - lists
  - resources
  - expenses
  - income_streams
  - daily_intentions
  - thinking_space_entries
- ✅ User preferences: `default_mode`, `current_organization_id`

### Backend
- ✅ Organization model (`server/models/organization.js`)
- ✅ Organization routes (`server/routes/organizations.js`)
- ✅ Organization middleware (`server/middleware/organization.js`)
- ✅ API endpoints:
  - `GET /api/organizations` - List user's organizations
  - `POST /api/organizations` - Create organization
  - `GET /api/organizations/:id` - Get organization details
  - `GET /api/organizations/:id/members` - List members
  - `POST /api/organizations/:id/invite` - Invite member
  - `POST /api/organizations/invitations/:token/accept` - Accept invitation
  - `PATCH /api/organizations/:id/switch` - Switch to organization
  - `PATCH /api/organizations/switch/individual` - Switch to individual mode

### Frontend
- ✅ Organizations page (`/organizations`)
- ✅ Organization switcher in Layout (top navigation)
- ✅ Route added to App.jsx

## 🔧 Next Steps: Update API Routes

You need to update all API routes to filter by `organization_id`. Here's how:

### Pattern for Updating Routes

**Before:**
```javascript
router.get('/', requireAuth, async (req, res) => {
  const result = await query(
    'SELECT * FROM projects WHERE user_id = $1',
    [req.user.id]
  );
  res.json({ projects: result.rows });
});
```

**After:**
```javascript
import { getOrganizationContext } from '../middleware/organization.js';

router.get('/', requireAuth, getOrganizationContext, async (req, res) => {
  const orgFilter = req.organizationId 
    ? 'organization_id = $2' 
    : 'organization_id IS NULL';
  const params = req.organizationId 
    ? [req.user.id, req.organizationId]
    : [req.user.id];
  
  const result = await query(
    `SELECT * FROM projects WHERE user_id = $1 AND ${orgFilter}`,
    params
  );
  res.json({ projects: result.rows });
});
```

### Routes to Update

1. **Projects** (`server/routes/projects.js`)
   - GET `/api/projects` - Filter by organization_id
   - POST `/api/projects` - Set organization_id on create

2. **Tasks** (`server/routes/tasks.js`)
   - All routes - Filter by organization_id

3. **Calendar** (`server/routes/calendar.js`)
   - GET `/api/calendar/events` - Filter by organization_id
   - POST `/api/calendar/events` - Set organization_id on create

4. **Lists** (`server/routes/lists.js`)
   - All routes - Filter by organization_id

5. **Money** (`server/routes/money.js`)
   - GET `/api/money` - Filter expenses/income by organization_id
   - POST routes - Set organization_id on create

6. **Today/Dashboard** (`server/routes/today.js`)
   - GET `/api/today` - Filter intentions by organization_id
   - POST routes - Set organization_id on create

7. **Resources** (`server/routes/resources.js`)
   - All routes - Filter by organization_id

## 📋 Implementation Checklist

### Phase 1: Core Functionality (DONE ✅)
- [x] Database schema
- [x] Organization model
- [x] Organization routes
- [x] Frontend Organizations page
- [x] Organization switcher in Layout

### Phase 2: Update API Routes (TODO)
- [ ] Update projects routes
- [ ] Update tasks routes
- [ ] Update calendar routes
- [ ] Update lists routes
- [ ] Update money routes
- [ ] Update today/dashboard routes
- [ ] Update resources routes
- [ ] Update emotions/unload routes

### Phase 3: Team Features (TODO)
- [ ] Team member management UI
- [ ] Invitation email sending
- [ ] Team activity feed
- [ ] Shared vs private data visibility
- [ ] Team settings page
- [ ] Role-based permissions UI

### Phase 4: Advanced Features (TODO)
- [ ] Team billing
- [ ] Team analytics
- [ ] Shared templates
- [ ] Team goals/OKRs
- [ ] Team calendar views

## 🎯 How It Works

### Individual Mode (Default)
- User's `current_organization_id` is NULL
- All queries filter: `WHERE user_id = $1 AND organization_id IS NULL`
- User sees only their personal data

### Team Mode
- User switches to an organization
- `current_organization_id` is set
- All queries filter: `WHERE user_id = $1 AND organization_id = $2`
- Each team member sees their own data within the workspace
- Data is isolated per user but within the same organization context

### Data Isolation
- Each user has their own:
  - Daily intentions
  - Tasks
  - Projects
  - Calendar events
  - Lists
  - Resources
  - Expenses/Income
- But all within the same organization workspace
- Organization owner/admin can see team analytics

## 🚀 Quick Start

1. **Run migration** (already done):
   ```bash
   npm run db:migrate-organizations
   ```

2. **Create an organization**:
   - Go to `/organizations`
   - Click "Create Workspace"
   - Fill in name and description

3. **Invite team members**:
   - Go to organization details
   - Click "Invite Member"
   - Enter email address
   - Send invitation link

4. **Switch between modes**:
   - Use organization switcher in top navigation
   - Or go to `/organizations` page

## 📝 Notes

- Users can belong to multiple organizations
- Each user has a "current" organization they're working in
- Data is always scoped to current organization or individual mode
- Organization owner can manage members and settings
- Team members can be: owner, admin, member, or viewer




