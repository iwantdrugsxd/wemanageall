import { Router } from 'express';
import { query } from '../db/config.js';
// Organization middleware removed - no longer using organizations

const router = Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in to continue.' });
};

// Initialize projects tables
const initTables = async () => {
  try {
    // Projects table
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image_url TEXT,
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        start_date DATE,
        color VARCHAR(7) DEFAULT '#9333EA',
        icon VARCHAR(10) DEFAULT '📋',
        is_favorite BOOLEAN DEFAULT FALSE,
        template_id UUID,
        archived_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add columns if they don't exist
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'color') THEN
          ALTER TABLE projects ADD COLUMN color VARCHAR(7) DEFAULT '#9333EA';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'icon') THEN
          ALTER TABLE projects ADD COLUMN icon VARCHAR(10) DEFAULT '📋';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'is_favorite') THEN
          ALTER TABLE projects ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'template_id') THEN
          ALTER TABLE projects ADD COLUMN template_id UUID;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'archived_at') THEN
          ALTER TABLE projects ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
        END IF;
      END $$;
    `);
    
    // Project tags table
    await query(`
      CREATE TABLE IF NOT EXISTS project_tags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        tag VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, tag)
      )
    `);
    
    // Project phases table (needed before tasks)
    await query(`
      CREATE TABLE IF NOT EXISTS project_phases (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Project tasks table
    await query(`
      CREATE TABLE IF NOT EXISTS project_tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        due_date DATE,
        assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
        phase_id UUID REFERENCES project_phases(id) ON DELETE SET NULL,
        parent_task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
        order_index INTEGER DEFAULT 0,
        time_estimate INTEGER,
        time_spent INTEGER DEFAULT 0,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurrence_pattern VARCHAR(20) CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    // Add new columns if they don't exist
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'priority') THEN
          ALTER TABLE project_tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'time_estimate') THEN
          ALTER TABLE project_tasks ADD COLUMN time_estimate INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'time_spent') THEN
          ALTER TABLE project_tasks ADD COLUMN time_spent INTEGER DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'is_recurring') THEN
          ALTER TABLE project_tasks ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'recurrence_pattern') THEN
          ALTER TABLE project_tasks ADD COLUMN recurrence_pattern VARCHAR(20) CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly'));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'parent_task_id') THEN
          ALTER TABLE project_tasks ADD COLUMN parent_task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `);
    
    // Task dependencies table
    await query(`
      CREATE TABLE IF NOT EXISTS task_dependencies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
        depends_on_task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(task_id, depends_on_task_id),
        CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id)
      )
    `);
    
    // Time tracking table
    await query(`
      CREATE TABLE IF NOT EXISTS task_time_entries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE NOT NULL,
        ended_at TIMESTAMP WITH TIME ZONE,
        duration_minutes INTEGER,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Project templates table
    await query(`
      CREATE TABLE IF NOT EXISTS project_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(10) DEFAULT '📋',
        color VARCHAR(7) DEFAULT '#9333EA',
        is_public BOOLEAN DEFAULT FALSE,
        template_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Activity log table
    await query(`
      CREATE TABLE IF NOT EXISTS project_activity_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action_type VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Project sharing table
    await query(`
      CREATE TABLE IF NOT EXISTS project_sharing (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        share_code VARCHAR(20) UNIQUE NOT NULL,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT TRUE,
        access_level VARCHAR(20) DEFAULT 'editor' CHECK (access_level IN ('viewer', 'editor', 'admin')),
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Project collaborators table
    await query(`
      CREATE TABLE IF NOT EXISTS project_collaborators (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE(project_id, user_id)
      )
    `);
    
    // Project milestones table
    await query(`
      CREATE TABLE IF NOT EXISTS project_milestones (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        milestone_date DATE NOT NULL,
        phase_id UUID REFERENCES project_phases(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Project notes table
    await query(`
      CREATE TABLE IF NOT EXISTS project_notes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500),
        content TEXT NOT NULL,
        task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_favorite ON projects(user_id, is_favorite) WHERE is_favorite = TRUE`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_tags_project_id ON project_tags(project_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_tags_tag ON project_tags(tag)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_tasks_priority ON project_tasks(priority)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_tasks_parent ON project_tasks(parent_task_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON task_dependencies(task_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_task_time_entries_task_id ON task_time_entries(task_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_templates_user_id ON project_templates(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_activity_log_project_id ON project_activity_log(project_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_sharing_project_id ON project_sharing(project_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_sharing_share_code ON project_sharing(share_code)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON project_phases(project_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON project_milestones(project_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id)`);
    
    console.log('Projects tables initialized successfully');
  } catch (error) {
    console.error('Error initializing projects tables:', error);
    throw error;
  }
};

let tablesInitialized = false;
const ensureTables = async () => {
  if (!tablesInitialized) {
    await initTables();
    tablesInitialized = true;
  }
};

// Helper function to calculate project progress
const calculateProgress = async (projectId) => {
  try {
    const result = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed
       FROM project_tasks
       WHERE project_id = $1`,
      [projectId]
    );
    
    const { total, completed } = result.rows[0];
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  } catch (error) {
    console.error('Error calculating progress:', error);
    return 0;
  }
};

// Helper function to generate share code
const generateShareCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper function to check if user has access to project
const checkProjectAccess = async (projectId, userId) => {
  // Check if user is owner
  const ownerCheck = await query(
    `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
    [projectId, userId]
  );
  
  if (ownerCheck.rows.length > 0) {
    return { hasAccess: true, role: 'owner' };
  }
  
  // Check if user is collaborator
  const collabCheck = await query(
    `SELECT role FROM project_collaborators WHERE project_id = $1 AND user_id = $2`,
    [projectId, userId]
  );
  
  if (collabCheck.rows.length > 0) {
    return { hasAccess: true, role: collabCheck.rows[0].role };
  }
  
  return { hasAccess: false, role: null };
};

// GET /api/projects - Get all user's projects with next task info
router.get('/', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { favorite, tag, archived } = req.query;
    
    let queryText = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.cover_image_url,
        p.progress,
        p.start_date,
        p.color,
        p.icon,
        p.is_favorite,
        p.archived_at,
        p.created_at,
        COUNT(DISTINCT pt.id) as task_count,
        COUNT(DISTINCT CASE WHEN pt.status = 'done' THEN pt.id END) as completed_count,
        CASE 
          WHEN p.user_id = $1 THEN 'owner'
          ELSE COALESCE(MAX(pc.role), 'viewer')
        END as user_role
       FROM projects p
       LEFT JOIN project_tasks pt ON p.id = pt.project_id
       LEFT JOIN project_collaborators pc ON p.id = pc.project_id AND pc.user_id = $1
       WHERE (p.user_id = $1 OR EXISTS (
         SELECT 1 FROM project_collaborators pc2 
         WHERE pc2.project_id = p.id AND pc2.user_id = $1
       ))
    `;
    
    const params = [req.user.id];
    
    // Organization filter removed - no longer using organizations
    
    // Always filter out archived projects by default unless explicitly requested
    if (archived !== 'true') {
      queryText += ` AND p.archived_at IS NULL`;
    } else if (archived === 'true') {
      queryText += ` AND p.archived_at IS NOT NULL`;
    }
    
    if (favorite === 'true') {
      queryText += ` AND p.is_favorite = TRUE`;
    }
    
    queryText += ` GROUP BY p.id, p.name, p.description, p.cover_image_url, p.progress, p.start_date, p.color, p.icon, p.is_favorite, p.archived_at, p.created_at, p.user_id`;
    
    if (tag) {
      queryText += ` HAVING EXISTS (
        SELECT 1 FROM project_tags ptags 
        WHERE ptags.project_id = p.id AND ptags.tag = $${params.length + 1}
      )`;
      params.push(tag);
    }
    
    queryText += ` ORDER BY p.is_favorite DESC, p.created_at DESC`;
    
    const result = await query(queryText, params);
    
    // Get tags, collaborators, and share codes for each project
    const projectsWithTags = await Promise.all(result.rows.map(async (project) => {
      const tagsResult = await query(
        `SELECT tag FROM project_tags WHERE project_id = $1`,
        [project.id]
      );
      
      const collaboratorsResult = await query(
        `SELECT 
          pc.user_id,
          pc.role,
          u.name as user_name,
          u.email as user_email
         FROM project_collaborators pc
         JOIN users u ON pc.user_id = u.id
         WHERE pc.project_id = $1
         ORDER BY pc.joined_at ASC`,
        [project.id]
      );
      
      // Get active share code
      const shareResult = await query(
        `SELECT share_code FROM project_sharing
         WHERE project_id = $1 AND is_active = TRUE
         ORDER BY created_at DESC
         LIMIT 1`,
        [project.id]
      );
      
      return {
        ...project,
        tags: tagsResult.rows.map(r => r.tag),
        collaborators: collaboratorsResult.rows,
        share_code: shareResult.rows[0]?.share_code || null,
        user_role: project.user_role || 'owner'
      };
    }));
    
    // Get next task for each project
    const projects = await Promise.all(projectsWithTags.map(async (project) => {
      const nextTaskResult = await query(
        `SELECT id, title, status, due_date, priority
         FROM project_tasks
         WHERE project_id = $1 AND status != 'done'
         ORDER BY 
           CASE priority
             WHEN 'high' THEN 1
             WHEN 'medium' THEN 2
             WHEN 'low' THEN 3
           END,
           CASE status
             WHEN 'in_progress' THEN 1
             WHEN 'todo' THEN 2
           END,
           due_date ASC NULLS LAST,
           created_at ASC
         LIMIT 1`,
        [project.id]
      );
      
      const remainingTasksResult = await query(
        `SELECT COUNT(*) as count
         FROM project_tasks
         WHERE project_id = $1 AND status != 'done'`,
        [project.id]
      );
      
      const progress = project.task_count > 0
        ? Math.round((project.completed_count / project.task_count) * 100)
        : 0;
      
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        cover_image_url: project.cover_image_url,
        color: project.color || '#9333EA',
        icon: project.icon || '📋',
        is_favorite: project.is_favorite || false,
        tags: project.tags || [],
        progress: progress,
        start_date: project.start_date,
        created_at: project.created_at,
        nextTask: nextTaskResult.rows[0] || null,
        tasksRemaining: parseInt(remainingTasksResult.rows[0]?.count || 0),
      };
    }));

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
});

// GET /api/projects/:id - Get single project with all data
router.get('/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    
    // Check project access
    const access = await checkProjectAccess(id, req.user.id);
    if (!access.hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this project.' });
    }
    
    // Get project (owner or collaborator)
    const projectResult = await query(
      `SELECT p.*,
        CASE 
          WHEN p.user_id = $2 THEN 'owner'
          ELSE COALESCE(pc.role, 'viewer')
        END as user_role
       FROM projects p
       LEFT JOIN project_collaborators pc ON p.id = pc.project_id AND pc.user_id = $2
       WHERE p.id = $1 AND (p.user_id = $2 OR EXISTS (
         SELECT 1 FROM project_collaborators pc2 
         WHERE pc2.project_id = p.id AND pc2.user_id = $2
       ))`,
      [id, req.user.id]
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    
    const project = projectResult.rows[0];
    
    // Get tasks
    const tasksResult = await query(
      `SELECT * FROM project_tasks
       WHERE project_id = $1
       ORDER BY order_index ASC, created_at ASC`,
      [id]
    );
    
    // Get phases
    const phasesResult = await query(
      `SELECT * FROM project_phases
       WHERE project_id = $1
       ORDER BY order_index ASC`,
      [id]
    );
    
    // Get milestones
    const milestonesResult = await query(
      `SELECT * FROM project_milestones
       WHERE project_id = $1
       ORDER BY milestone_date ASC`,
      [id]
    );
    
    // Get notes
    const notesResult = await query(
      `SELECT * FROM project_notes
       WHERE project_id = $1
       ORDER BY updated_at DESC`,
      [id]
    );
    
    // Get collaborators
    const collaboratorsResult = await query(
      `SELECT 
        pc.user_id,
        pc.role,
        pc.joined_at,
        u.name as user_name,
        u.email as user_email
       FROM project_collaborators pc
       JOIN users u ON pc.user_id = u.id
       WHERE pc.project_id = $1
       ORDER BY pc.joined_at ASC`,
      [id]
    );
    
    // Get share code
    const shareResult = await query(
      `SELECT share_code, access_level, is_active, expires_at
       FROM project_sharing
       WHERE project_id = $1 AND is_active = TRUE
       ORDER BY created_at DESC
       LIMIT 1`,
      [id]
    );
    
    // Calculate progress
    const progress = await calculateProgress(id);
    
    res.json({
      project: {
        ...project,
        progress,
        user_role: projectResult.rows[0].user_role
      },
      tasks: tasksResult.rows,
      phases: phasesResult.rows,
      milestones: milestonesResult.rows,
      notes: notesResult.rows,
      collaborators: collaboratorsResult.rows,
      share_code: shareResult.rows[0]?.share_code || null,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
});

// POST /api/projects - Create new project
router.post('/', requireAuth, async (req, res) => {
  // Check project limit
  try {
    const { canCreateProject } = await import('../services/subscription.js');
    const canCreate = await canCreateProject(req.user.id, null);
    
    if (!canCreate) {
      return res.status(403).json({
        error: 'You have reached the project limit for your plan. Upgrade to create more projects.',
        upgradeRequired: true,
      });
    }
  } catch (error) {
    console.error('Project limit check error:', error);
    // Continue if check fails (graceful degradation)
  }
  try {
    await ensureTables();
    
    const { name, description, cover_image_url, start_date, color, icon, tags, template_id } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required.' });
    }
    
    // If template_id provided, load template data
    let templateData = null;
    if (template_id) {
      const templateResult = await query(
        `SELECT template_data FROM project_templates WHERE id = $1 AND (user_id = $2 OR is_public = TRUE)`,
        [template_id, req.user.id]
      );
      if (templateResult.rows.length > 0) {
        templateData = templateResult.rows[0].template_data;
      }
    }

    const result = await query(
      `INSERT INTO projects (user_id, name, description, cover_image_url, start_date, progress, color, icon, template_id)
       VALUES ($1, $2, $3, $4, $5, 0, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        name.trim(),
        description?.trim() || null,
        cover_image_url || null,
        start_date || null,
        color || '#9333EA',
        icon || '📋',
        template_id || null
      ]
    );
    
    const project = result.rows[0];
    
    // Generate share code
    let shareCode = generateShareCode();
    let codeExists = true;
    while (codeExists) {
      const checkResult = await query(
        `SELECT id FROM project_sharing WHERE share_code = $1`,
        [shareCode]
      );
      if (checkResult.rows.length === 0) {
        codeExists = false;
      } else {
        shareCode = generateShareCode();
      }
    }
    
    // Create share code entry
    await query(
      `INSERT INTO project_sharing (project_id, share_code, created_by, access_level)
       VALUES ($1, $2, $3, 'editor')`,
      [project.id, shareCode, req.user.id]
    );
    
    // Add owner as collaborator
    await query(
      `INSERT INTO project_collaborators (project_id, user_id, role, invited_by)
       VALUES ($1, $2, 'owner', $2)
       ON CONFLICT DO NOTHING`,
      [project.id, req.user.id]
    );
    
    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tag of tags) {
        await query(
          `INSERT INTO project_tags (project_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [project.id, tag.trim()]
        );
      }
    }
    
    // If template data exists, create phases and initial tasks
    if (templateData) {
      if (templateData.phases) {
        for (const phase of templateData.phases) {
          const phaseResult = await query(
            `INSERT INTO project_phases (project_id, name, description, order_index)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [project.id, phase.name, phase.description || null, phase.order_index || 0]
          );
          
          if (phase.tasks && phaseResult.rows[0]) {
            for (const task of phase.tasks) {
              await query(
                `INSERT INTO project_tasks (project_id, user_id, title, description, status, priority, phase_id, order_index)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                  project.id,
                  req.user.id,
                  task.title,
                  task.description || null,
                  task.status || 'todo',
                  task.priority || 'medium',
                  phaseResult.rows[0].id,
                  task.order_index || 0
                ]
              );
            }
          }
        }
      }
    }
    
    // Log activity
    await query(
      `INSERT INTO project_activity_log (project_id, user_id, action_type, entity_type, description)
       VALUES ($1, $2, 'project_created', 'project', $3)`,
      [project.id, req.user.id, `Created project "${project.name}"`]
    );

    res.json({
      success: true,
      project: project,
      share_code: shareCode,
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project.' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    const { name, description, cover_image_url, start_date, progress, color, icon, is_favorite, tags } = req.body;
    
    const result = await query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           cover_image_url = COALESCE($3, cover_image_url),
           start_date = COALESCE($4, start_date),
           progress = COALESCE($5, progress),
           color = COALESCE($6, color),
           icon = COALESCE($7, icon),
           is_favorite = COALESCE($8, is_favorite),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [name, description, cover_image_url, start_date, progress, color, icon, is_favorite, id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    
    // Update tags if provided
    if (tags !== undefined) {
      // Delete existing tags
      await query(`DELETE FROM project_tags WHERE project_id = $1`, [id]);
      
      // Add new tags
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tag of tags) {
          await query(
            `INSERT INTO project_tags (project_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [id, tag.trim()]
          );
        }
      }
    }
    
    res.json({
      success: true,
      project: result.rows[0],
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project.' });
  }
});

// PATCH /api/projects/:id/favorite - Toggle favorite
router.patch('/:id/favorite', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    const { is_favorite } = req.body;
    
    const result = await query(
      `UPDATE projects
       SET is_favorite = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [is_favorite, id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    
    res.json({
      success: true,
      project: result.rows[0],
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to update favorite status.' });
  }
});

// POST /api/projects/:id/archive - Archive project
router.post('/:id/archive', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    
    const result = await query(
      `UPDATE projects
       SET archived_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    
    res.json({
      success: true,
      project: result.rows[0],
    });
  } catch (error) {
    console.error('Archive project error:', error);
    res.status(500).json({ error: 'Failed to archive project.' });
  }
});

// POST /api/projects/:id/unarchive - Unarchive project
router.post('/:id/unarchive', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    
    const result = await query(
      `UPDATE projects
       SET archived_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    
    res.json({
      success: true,
      project: result.rows[0],
    });
  } catch (error) {
    console.error('Unarchive project error:', error);
    res.status(500).json({ error: 'Failed to unarchive project.' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    
    const result = await query(
      `DELETE FROM projects
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

// ============================================
// TASKS ROUTES
// ============================================

// GET /api/projects/:id/tasks - Get all tasks for a project
router.get('/:id/tasks', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    const { status } = req.query;
    
    let queryText = `
      SELECT * FROM project_tasks
      WHERE project_id = $1 AND user_id = $2
    `;
    const params = [id, req.user.id];
    
    if (status) {
      queryText += ` AND status = $3`;
      params.push(status);
    }
    
    queryText += ` ORDER BY order_index ASC, created_at ASC`;
    
    const result = await query(queryText, params);
    
    res.json({ tasks: result.rows });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// POST /api/projects/:id/tasks - Create new task
router.post('/:id/tasks', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    const { 
      title, 
      description, 
      status, 
      due_date, 
      phase_id, 
      priority, 
      time_estimate,
      is_recurring,
      recurrence_pattern,
      parent_task_id,
      depends_on
    } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }
    
    // Get max order_index for this project
    const orderResult = await query(
      `SELECT COALESCE(MAX(order_index), 0) + 1 as next_order
       FROM project_tasks
       WHERE project_id = $1`,
      [id]
    );
    const nextOrder = orderResult.rows[0]?.next_order || 1;
    
    const result = await query(
      `INSERT INTO project_tasks (project_id, user_id, title, description, status, due_date, phase_id, order_index, priority, time_estimate, is_recurring, recurrence_pattern, parent_task_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        id,
        req.user.id,
        title.trim(),
        description?.trim() || null,
        status || 'todo',
        due_date || null,
        phase_id || null,
        nextOrder,
        priority || 'medium',
        time_estimate || null,
        is_recurring || false,
        recurrence_pattern || null,
        parent_task_id || null
      ]
    );
    
    const task = result.rows[0];
    
    // Add dependencies if provided
    if (depends_on && Array.isArray(depends_on) && depends_on.length > 0) {
      for (const depTaskId of depends_on) {
        await query(
          `INSERT INTO task_dependencies (task_id, depends_on_task_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [task.id, depTaskId]
        );
      }
    }
    
    // Update project progress
    const progress = await calculateProgress(id);
    await query(
      `UPDATE projects SET progress = $1 WHERE id = $2`,
      [progress, id]
    );
    
    // Log activity
    await query(
      `INSERT INTO project_activity_log (project_id, user_id, action_type, entity_type, entity_id, description)
       VALUES ($1, $2, 'task_created', 'task', $3, $4)`,
      [id, req.user.id, task.id, `Created task "${task.title}"`]
    );
    
    res.json({
      success: true,
      task: task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// PUT /api/projects/:id/tasks/:taskId - Update task
router.put('/:id/tasks/:taskId', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id, taskId } = req.params;
    const { 
      title, 
      description, 
      status, 
      due_date, 
      phase_id, 
      order_index,
      priority,
      time_estimate,
      time_spent,
      is_recurring,
      recurrence_pattern,
      parent_task_id,
      depends_on
    } = req.body;
    
    const result = await query(
      `UPDATE project_tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           due_date = COALESCE($4, due_date),
           phase_id = COALESCE($5, phase_id),
           order_index = COALESCE($6, order_index),
           priority = COALESCE($7, priority),
           time_estimate = COALESCE($8, time_estimate),
           time_spent = COALESCE($9, time_spent),
           is_recurring = COALESCE($10, is_recurring),
           recurrence_pattern = COALESCE($11, recurrence_pattern),
           parent_task_id = COALESCE($12, parent_task_id),
           completed_at = CASE WHEN $3 = 'done' AND status != 'done' THEN CURRENT_TIMESTAMP ELSE completed_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13 AND project_id = $14 AND user_id = $15
       RETURNING *`,
      [title, description, status, due_date, phase_id, order_index, priority, time_estimate, time_spent, is_recurring, recurrence_pattern, parent_task_id, taskId, id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    
    // Update dependencies if provided
    if (depends_on !== undefined) {
      // Delete existing dependencies
      await query(`DELETE FROM task_dependencies WHERE task_id = $1`, [taskId]);
      
      // Add new dependencies
      if (Array.isArray(depends_on) && depends_on.length > 0) {
        for (const depTaskId of depends_on) {
          await query(
            `INSERT INTO task_dependencies (task_id, depends_on_task_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [taskId, depTaskId]
          );
        }
      }
    }
    
    // Update project progress
    const progress = await calculateProgress(id);
    await query(
      `UPDATE projects SET progress = $1 WHERE id = $2`,
      [progress, id]
    );
    
    // Log activity
    await query(
      `INSERT INTO project_activity_log (project_id, user_id, action_type, entity_type, entity_id, description)
       VALUES ($1, $2, 'task_updated', 'task', $3, $4)`,
      [id, req.user.id, taskId, `Updated task "${result.rows[0].title}"`]
    );
    
    res.json({
      success: true,
      task: result.rows[0],
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// DELETE /api/projects/:id/tasks/:taskId - Delete task
router.delete('/:id/tasks/:taskId', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id, taskId } = req.params;
    
    const result = await query(
      `DELETE FROM project_tasks
       WHERE id = $1 AND project_id = $2 AND user_id = $3
       RETURNING id`,
      [taskId, id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    
    // Update project progress
    const progress = await calculateProgress(id);
    await query(
      `UPDATE projects SET progress = $1 WHERE id = $2`,
      [progress, id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

// PATCH /api/projects/:id/tasks/reorder - Reorder tasks
router.patch('/:id/tasks/reorder', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    const { taskOrders } = req.body; // Array of { taskId, order_index }
    
    if (!Array.isArray(taskOrders)) {
      return res.status(400).json({ error: 'taskOrders must be an array.' });
    }
    
    // Update each task's order_index
    for (const { taskId, order_index } of taskOrders) {
      await query(
        `UPDATE project_tasks
         SET order_index = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND project_id = $3 AND user_id = $4`,
        [order_index, taskId, id, req.user.id]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({ error: 'Failed to reorder tasks.' });
  }
});

// ============================================
// NOTES ROUTES
// ============================================

// GET /api/projects/:id/notes - Get all notes for a project
router.get('/:id/notes', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    
    const result = await query(
      `SELECT * FROM project_notes
       WHERE project_id = $1 AND user_id = $2
       ORDER BY updated_at DESC`,
      [id, req.user.id]
    );
    
    res.json({ notes: result.rows });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes.' });
  }
});

// POST /api/projects/:id/notes - Create or update note
router.post('/:id/notes', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    const { title, content, task_id, note_id } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Note content is required.' });
    }
    
    let result;
    if (note_id) {
      // Update existing note
      result = await query(
        `UPDATE project_notes
         SET title = COALESCE($1, title),
             content = $2,
             task_id = COALESCE($3, task_id),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 AND project_id = $5 AND user_id = $6
         RETURNING *`,
        [title, content.trim(), task_id, note_id, id, req.user.id]
      );
    } else {
      // Create new note
      result = await query(
        `INSERT INTO project_notes (project_id, user_id, title, content, task_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, req.user.id, title?.trim() || null, content.trim(), task_id || null]
      );
    }
    
    res.json({
      success: true,
      note: result.rows[0],
    });
  } catch (error) {
    console.error('Save note error:', error);
    res.status(500).json({ error: 'Failed to save note.' });
  }
});

// DELETE /api/projects/:id/notes/:noteId - Delete note
router.delete('/:id/notes/:noteId', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id, noteId } = req.params;
    
    const result = await query(
      `DELETE FROM project_notes
       WHERE id = $1 AND project_id = $2 AND user_id = $3
       RETURNING id`,
      [noteId, id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note.' });
  }
});

// ============================================
// PHASES ROUTES
// ============================================

// POST /api/projects/:id/phases - Create phase
router.post('/:id/phases', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    const { name, description, order_index } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Phase name is required.' });
    }
    
    const result = await query(
      `INSERT INTO project_phases (project_id, name, description, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, name.trim(), description?.trim() || null, order_index || 0]
    );
    
    res.json({
      success: true,
      phase: result.rows[0],
    });
  } catch (error) {
    console.error('Create phase error:', error);
    res.status(500).json({ error: 'Failed to create phase.' });
  }
});

// PUT /api/projects/:id/phases/:phaseId - Update phase
router.put('/:id/phases/:phaseId', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id, phaseId } = req.params;
    const { name, description, order_index } = req.body;
    
    const result = await query(
      `UPDATE project_phases
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           order_index = COALESCE($3, order_index),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND project_id = $5
       RETURNING *`,
      [name?.trim(), description?.trim(), order_index, phaseId, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Phase not found.' });
    }
    
    res.json({
      success: true,
      phase: result.rows[0],
    });
  } catch (error) {
    console.error('Update phase error:', error);
    res.status(500).json({ error: 'Failed to update phase.' });
  }
});

// DELETE /api/projects/:id/phases/:phaseId - Delete phase
router.delete('/:id/phases/:phaseId', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id, phaseId } = req.params;
    
    const result = await query(
      `DELETE FROM project_phases
       WHERE id = $1 AND project_id = $2
       RETURNING id`,
      [phaseId, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Phase not found.' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete phase error:', error);
    res.status(500).json({ error: 'Failed to delete phase.' });
  }
});

// ============================================
// MILESTONES ROUTES
// ============================================

// POST /api/projects/:id/milestones - Create milestone
router.post('/:id/milestones', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    const { name, description, milestone_date, phase_id } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Milestone name is required.' });
    }
    
    if (!milestone_date) {
      return res.status(400).json({ error: 'Milestone date is required.' });
    }
    
    const result = await query(
      `INSERT INTO project_milestones (project_id, name, description, milestone_date, phase_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, name.trim(), description?.trim() || null, milestone_date, phase_id || null]
    );
    
    res.json({
      success: true,
      milestone: result.rows[0],
    });
  } catch (error) {
    console.error('Create milestone error:', error);
    res.status(500).json({ error: 'Failed to create milestone.' });
  }
});

// PUT /api/projects/:id/milestones/:milestoneId - Update milestone
router.put('/:id/milestones/:milestoneId', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id, milestoneId } = req.params;
    const { name, description, milestone_date, phase_id } = req.body;
    
    const result = await query(
      `UPDATE project_milestones
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           milestone_date = COALESCE($3, milestone_date),
           phase_id = COALESCE($4, phase_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND project_id = $6
       RETURNING *`,
      [name?.trim(), description?.trim(), milestone_date, phase_id, milestoneId, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found.' });
    }
    
    res.json({
      success: true,
      milestone: result.rows[0],
    });
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({ error: 'Failed to update milestone.' });
  }
});

// DELETE /api/projects/:id/milestones/:milestoneId - Delete milestone
router.delete('/:id/milestones/:milestoneId', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id, milestoneId } = req.params;
    
    const result = await query(
      `DELETE FROM project_milestones
       WHERE id = $1 AND project_id = $2
       RETURNING id`,
      [milestoneId, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found.' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete milestone error:', error);
    res.status(500).json({ error: 'Failed to delete milestone.' });
  }
});

// ============================================
// TASK DEPENDENCIES ROUTES
// ============================================

// GET /api/projects/:id/tasks/:taskId/dependencies - Get task dependencies
router.get('/:id/tasks/:taskId/dependencies', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { taskId } = req.params;
    
    const result = await query(
      `SELECT 
        td.id,
        td.depends_on_task_id,
        pt.title as depends_on_title,
        pt.status as depends_on_status
       FROM task_dependencies td
       JOIN project_tasks pt ON td.depends_on_task_id = pt.id
       WHERE td.task_id = $1`,
      [taskId]
    );
    
    res.json({ dependencies: result.rows });
  } catch (error) {
    console.error('Get dependencies error:', error);
    res.status(500).json({ error: 'Failed to fetch dependencies.' });
  }
});

// POST /api/projects/:id/tasks/:taskId/dependencies - Add dependency
router.post('/:id/tasks/:taskId/dependencies', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { taskId } = req.params;
    const { depends_on_task_id } = req.body;
    
    if (!depends_on_task_id) {
      return res.status(400).json({ error: 'depends_on_task_id is required.' });
    }
    
    const result = await query(
      `INSERT INTO task_dependencies (task_id, depends_on_task_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [taskId, depends_on_task_id]
    );
    
    res.json({
      success: true,
      dependency: result.rows[0],
    });
  } catch (error) {
    console.error('Add dependency error:', error);
    res.status(500).json({ error: 'Failed to add dependency.' });
  }
});

// DELETE /api/projects/:id/tasks/:taskId/dependencies/:depId - Remove dependency
router.delete('/:id/tasks/:taskId/dependencies/:depId', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { depId } = req.params;
    
    await query(
      `DELETE FROM task_dependencies WHERE id = $1`,
      [depId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Remove dependency error:', error);
    res.status(500).json({ error: 'Failed to remove dependency.' });
  }
});

// ============================================
// TIME TRACKING ROUTES
// ============================================

// POST /api/projects/:id/tasks/:taskId/time/start - Start time tracking
router.post('/:id/tasks/:taskId/time/start', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { taskId } = req.params;
    
    // Stop any existing active timers for this user
    await query(
      `UPDATE task_time_entries
       SET ended_at = CURRENT_TIMESTAMP,
           duration_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) / 60
       WHERE user_id = $1 AND ended_at IS NULL`,
      [req.user.id]
    );
    
    // Start new timer
    const result = await query(
      `INSERT INTO task_time_entries (task_id, user_id, started_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING *`,
      [taskId, req.user.id]
    );
    
    res.json({
      success: true,
      timeEntry: result.rows[0],
    });
  } catch (error) {
    console.error('Start time tracking error:', error);
    res.status(500).json({ error: 'Failed to start time tracking.' });
  }
});

// POST /api/projects/:id/tasks/:taskId/time/stop - Stop time tracking
router.post('/:id/tasks/:taskId/time/stop', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { taskId } = req.params;
    const { notes } = req.body;
    
    const result = await query(
      `UPDATE task_time_entries
       SET ended_at = CURRENT_TIMESTAMP,
           duration_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) / 60,
           notes = COALESCE($1, notes)
       WHERE task_id = $2 AND user_id = $3 AND ended_at IS NULL
       RETURNING *`,
      [notes, taskId, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active time entry found.' });
    }
    
    // Update task time_spent
    const timeEntry = result.rows[0];
    await query(
      `UPDATE project_tasks
       SET time_spent = COALESCE(time_spent, 0) + $1
       WHERE id = $2`,
      [Math.round(timeEntry.duration_minutes), taskId]
    );
    
    res.json({
      success: true,
      timeEntry: timeEntry,
    });
  } catch (error) {
    console.error('Stop time tracking error:', error);
    res.status(500).json({ error: 'Failed to stop time tracking.' });
  }
});

// GET /api/projects/:id/tasks/:taskId/time - Get time entries for task
router.get('/:id/tasks/:taskId/time', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { taskId } = req.params;
    
    const result = await query(
      `SELECT * FROM task_time_entries
       WHERE task_id = $1
       ORDER BY started_at DESC`,
      [taskId]
    );
    
    res.json({ timeEntries: result.rows });
  } catch (error) {
    console.error('Get time entries error:', error);
    res.status(500).json({ error: 'Failed to fetch time entries.' });
  }
});

// ============================================
// PROJECT TEMPLATES ROUTES
// ============================================

// GET /api/projects/templates - Get available templates
router.get('/templates', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const result = await query(
      `SELECT * FROM project_templates
       WHERE user_id = $1 OR is_public = TRUE
       ORDER BY is_public DESC, created_at DESC`,
      [req.user.id]
    );
    
    res.json({ templates: result.rows });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates.' });
  }
});

// POST /api/projects/templates - Create template from project
router.post('/templates', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { name, description, project_id, icon, color, is_public } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Template name is required.' });
    }
    
    if (!project_id) {
      return res.status(400).json({ error: 'project_id is required.' });
    }
    
    // Get project data
    const projectResult = await query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2`,
      [project_id, req.user.id]
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    
    // Get phases and tasks
    const phasesResult = await query(
      `SELECT * FROM project_phases WHERE project_id = $1 ORDER BY order_index`,
      [project_id]
    );
    
    const phases = await Promise.all(phasesResult.rows.map(async (phase) => {
      const tasksResult = await query(
        `SELECT title, description, status, priority, order_index
         FROM project_tasks
         WHERE phase_id = $1
         ORDER BY order_index`,
        [phase.id]
      );
      
      return {
        name: phase.name,
        description: phase.description,
        order_index: phase.order_index,
        tasks: tasksResult.rows
      };
    }));
    
    const templateData = {
      phases: phases,
      description: projectResult.rows[0].description
    };
    
    const result = await query(
      `INSERT INTO project_templates (user_id, name, description, icon, color, is_public, template_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        name.trim(),
        description?.trim() || null,
        icon || '📋',
        color || '#9333EA',
        is_public || false,
        JSON.stringify(templateData)
      ]
    );
    
    res.json({
      success: true,
      template: result.rows[0],
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template.' });
  }
});

// ============================================
// ACTIVITY LOG ROUTES
// ============================================

// GET /api/projects/:id/activity - Get project activity
router.get('/:id/activity', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    const { limit = 50 } = req.query;
    
    const result = await query(
      `SELECT * FROM project_activity_log
       WHERE project_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [id, parseInt(limit)]
    );
    
    res.json({ activity: result.rows });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity.' });
  }
});

// ============================================
// PROJECT HEALTH DASHBOARD
// ============================================

// GET /api/projects/:id/health - Get project health metrics
router.get('/:id/health', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    
    // Get task statistics
    const taskStats = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo,
        COUNT(CASE WHEN priority = 'high' AND status != 'done' THEN 1 END) as high_priority,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'done' THEN 1 END) as overdue
       FROM project_tasks
       WHERE project_id = $1`,
      [id]
    );
    
    // Get time statistics
    const timeStats = await query(
      `SELECT 
        COALESCE(SUM(time_estimate), 0) as total_estimated,
        COALESCE(SUM(time_spent), 0) as total_spent
       FROM project_tasks
       WHERE project_id = $1`,
      [id]
    );
    
    // Get recent activity count
    const activityCount = await query(
      `SELECT COUNT(*) as count
       FROM project_activity_log
       WHERE project_id = $1 AND created_at > CURRENT_DATE - INTERVAL '7 days'`,
      [id]
    );
    
    const stats = taskStats.rows[0];
    const time = timeStats.rows[0];
    const recentActivity = activityCount.rows[0];
    
    // Calculate health score (0-100)
    let healthScore = 100;
    const total = parseInt(stats.total) || 0;
    const completed = parseInt(stats.completed) || 0;
    const overdue = parseInt(stats.overdue) || 0;
    
    if (total > 0) {
      const completionRate = (completed / total) * 100;
      healthScore = completionRate;
      
      // Penalize for overdue tasks
      if (overdue > 0) {
        healthScore -= (overdue / total) * 30;
      }
    }
    
    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));
    
    // Determine health status
    let healthStatus = 'healthy';
    if (healthScore < 50) {
      healthStatus = 'critical';
    } else if (healthScore < 75) {
      healthStatus = 'warning';
    }
    
    res.json({
      health: {
        score: healthScore,
        status: healthStatus,
        tasks: {
          total: parseInt(stats.total) || 0,
          completed: parseInt(stats.completed) || 0,
          in_progress: parseInt(stats.in_progress) || 0,
          todo: parseInt(stats.todo) || 0,
          high_priority: parseInt(stats.high_priority) || 0,
          overdue: parseInt(stats.overdue) || 0,
        },
        time: {
          estimated_minutes: parseInt(time.total_estimated) || 0,
          spent_minutes: parseInt(time.total_spent) || 0,
        },
        recent_activity: parseInt(recentActivity.count) || 0,
      }
    });
  } catch (error) {
    console.error('Get health error:', error);
    res.status(500).json({ error: 'Failed to fetch health metrics.' });
  }
});

// ============================================
// PROJECT SHARING ROUTES
// ============================================

// POST /api/projects/:id/share - Generate or regenerate share code
router.post('/:id/share', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    const { access_level = 'editor', expires_at } = req.body;
    
    // Check if user is owner or admin
    const access = await checkProjectAccess(id, req.user.id);
    if (!access.hasAccess || (access.role !== 'owner' && access.role !== 'admin')) {
      return res.status(403).json({ error: 'Only project owners and admins can share projects.' });
    }
    
    // Deactivate existing share codes
    await query(
      `UPDATE project_sharing SET is_active = FALSE WHERE project_id = $1`,
      [id]
    );
    
    // Generate new share code
    let shareCode = generateShareCode();
    let codeExists = true;
    while (codeExists) {
      const checkResult = await query(
        `SELECT id FROM project_sharing WHERE share_code = $1`,
        [shareCode]
      );
      if (checkResult.rows.length === 0) {
        codeExists = false;
      } else {
        shareCode = generateShareCode();
      }
    }
    
    // Create new share code
    const result = await query(
      `INSERT INTO project_sharing (project_id, share_code, created_by, access_level, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, shareCode, req.user.id, access_level, expires_at || null]
    );
    
    res.json({
      success: true,
      share_code: shareCode,
      sharing: result.rows[0],
    });
  } catch (error) {
    console.error('Generate share code error:', error);
    res.status(500).json({ error: 'Failed to generate share code.' });
  }
});

// POST /api/projects/join - Join project by share code
router.post('/join', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { share_code } = req.body;
    
    if (!share_code || !share_code.trim()) {
      return res.status(400).json({ error: 'Share code is required.' });
    }
    
    // Find active share code
    const shareResult = await query(
      `SELECT ps.*, p.name as project_name
       FROM project_sharing ps
       JOIN projects p ON ps.project_id = p.id
       WHERE ps.share_code = $1 AND ps.is_active = TRUE
       AND (ps.expires_at IS NULL OR ps.expires_at > CURRENT_TIMESTAMP)`,
      [share_code.trim().toUpperCase()]
    );
    
    if (shareResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired share code.' });
    }
    
    const sharing = shareResult.rows[0];
    
    // Check if user is already a collaborator
    const existingCheck = await query(
      `SELECT role FROM project_collaborators 
       WHERE project_id = $1 AND user_id = $2`,
      [sharing.project_id, req.user.id]
    );
    
    if (existingCheck.rows.length > 0) {
      return res.json({
        success: true,
        message: 'You are already a collaborator on this project.',
        project_id: sharing.project_id,
        role: existingCheck.rows[0].role,
      });
    }
    
    // Add user as collaborator
    await query(
      `INSERT INTO project_collaborators (project_id, user_id, role, invited_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [sharing.project_id, req.user.id, sharing.access_level, sharing.created_by]
    );
    
    // Log activity
    await query(
      `INSERT INTO project_activity_log (project_id, user_id, action_type, entity_type, description)
       VALUES ($1, $2, 'collaborator_joined', 'project', $3)`,
      [sharing.project_id, req.user.id, `${req.user.name} joined the project`]
    );
    
    res.json({
      success: true,
      message: `Successfully joined "${sharing.project_name}"`,
      project_id: sharing.project_id,
      role: sharing.access_level,
    });
  } catch (error) {
    console.error('Join project error:', error);
    res.status(500).json({ error: 'Failed to join project.' });
  }
});

// GET /api/projects/:id/collaborators - Get project collaborators
router.get('/:id/collaborators', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id } = req.params;
    
    // Check access
    const access = await checkProjectAccess(id, req.user.id);
    if (!access.hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this project.' });
    }
    
    const result = await query(
      `SELECT 
        pc.user_id,
        pc.role,
        pc.joined_at,
        u.name as user_name,
        u.email as user_email,
        p.user_id = $2 as is_owner
       FROM project_collaborators pc
       JOIN users u ON pc.user_id = u.id
       JOIN projects p ON pc.project_id = p.id
       WHERE pc.project_id = $1
       ORDER BY 
         CASE WHEN p.user_id = pc.user_id THEN 1 ELSE 2 END,
         pc.joined_at ASC`,
      [id, req.user.id]
    );
    
    res.json({ collaborators: result.rows });
  } catch (error) {
    console.error('Get collaborators error:', error);
    res.status(500).json({ error: 'Failed to fetch collaborators.' });
  }
});

// DELETE /api/projects/:id/collaborators/:userId - Remove collaborator
router.delete('/:id/collaborators/:userId', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id, userId } = req.params;
    
    // Check if user is owner or admin
    const access = await checkProjectAccess(id, req.user.id);
    if (!access.hasAccess || (access.role !== 'owner' && access.role !== 'admin')) {
      return res.status(403).json({ error: 'Only owners and admins can remove collaborators.' });
    }
    
    // Don't allow removing owner
    const ownerCheck = await query(
      `SELECT user_id FROM projects WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (ownerCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot remove project owner.' });
    }
    
    await query(
      `DELETE FROM project_collaborators 
       WHERE project_id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    // Log activity
    await query(
      `INSERT INTO project_activity_log (project_id, user_id, action_type, entity_type, description)
       VALUES ($1, $2, 'collaborator_removed', 'project', $3)`,
      [id, req.user.id, `Removed collaborator`]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ error: 'Failed to remove collaborator.' });
  }
});

// PUT /api/projects/:id/collaborators/:userId - Update collaborator role
router.put('/:id/collaborators/:userId', requireAuth, async (req, res) => {
  try {
    await ensureTables();
    
    const { id, userId } = req.params;
    const { role } = req.body;
    
    if (!role || !['admin', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, editor, or viewer.' });
    }
    
    // Check if user is owner or admin
    const access = await checkProjectAccess(id, req.user.id);
    if (!access.hasAccess || (access.role !== 'owner' && access.role !== 'admin')) {
      return res.status(403).json({ error: 'Only owners and admins can update roles.' });
    }
    
    // Don't allow changing owner role
    const ownerCheck = await query(
      `SELECT user_id FROM projects WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (ownerCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot change owner role.' });
    }
    
    const result = await query(
      `UPDATE project_collaborators
       SET role = $1
       WHERE project_id = $2 AND user_id = $3
       RETURNING *`,
      [role, id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collaborator not found.' });
    }
    
    res.json({
      success: true,
      collaborator: result.rows[0],
    });
  } catch (error) {
    console.error('Update collaborator role error:', error);
    res.status(500).json({ error: 'Failed to update collaborator role.' });
  }
});

export default router;
