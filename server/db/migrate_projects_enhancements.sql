-- ============================================
-- Migration: Projects System Enhancements
-- Adds personalization, priorities, dependencies, and more
-- ============================================

-- ============================================
-- Add columns to projects table
-- ============================================
DO $$ 
BEGIN
    -- Add color theme
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'color') THEN
        ALTER TABLE projects ADD COLUMN color VARCHAR(7) DEFAULT '#9333EA';
    END IF;
    
    -- Add icon/emoji
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'icon') THEN
        ALTER TABLE projects ADD COLUMN icon VARCHAR(10) DEFAULT '📋';
    END IF;
    
    -- Add is_favorite
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'is_favorite') THEN
        ALTER TABLE projects ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add template_id (for project templates)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'template_id') THEN
        ALTER TABLE projects ADD COLUMN template_id UUID;
    END IF;
    
    -- Add archived_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'archived_at') THEN
        ALTER TABLE projects ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- ============================================
-- Project Tags Table
-- ============================================
CREATE TABLE IF NOT EXISTS project_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tags_tag ON project_tags(tag);

-- ============================================
-- Add columns to project_tasks table
-- ============================================
DO $$ 
BEGIN
    -- Add priority
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'priority') THEN
        ALTER TABLE project_tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
    END IF;
    
    -- Add time_estimate (in minutes)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'time_estimate') THEN
        ALTER TABLE project_tasks ADD COLUMN time_estimate INTEGER;
    END IF;
    
    -- Add time_spent (in minutes)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'time_spent') THEN
        ALTER TABLE project_tasks ADD COLUMN time_spent INTEGER DEFAULT 0;
    END IF;
    
    -- Add is_recurring
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'is_recurring') THEN
        ALTER TABLE project_tasks ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add recurrence_pattern
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'recurrence_pattern') THEN
        ALTER TABLE project_tasks ADD COLUMN recurrence_pattern VARCHAR(20) CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly'));
    END IF;
    
    -- Add parent_task_id (for sub-tasks)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_tasks' AND column_name = 'parent_task_id') THEN
        ALTER TABLE project_tasks ADD COLUMN parent_task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- Task Dependencies Table
-- ============================================
CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, depends_on_task_id),
    CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- ============================================
-- Project Templates Table
-- ============================================
CREATE TABLE IF NOT EXISTS project_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '📋',
    color VARCHAR(7) DEFAULT '#9333EA',
    is_public BOOLEAN DEFAULT FALSE,
    template_data JSONB NOT NULL, -- Stores project structure, phases, initial tasks
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_templates_user_id ON project_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_project_templates_public ON project_templates(is_public);

-- ============================================
-- Time Tracking Table
-- ============================================
CREATE TABLE IF NOT EXISTS task_time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_time_entries_task_id ON task_time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_task_time_entries_user_id ON task_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_task_time_entries_started_at ON task_time_entries(started_at);

-- ============================================
-- Project Activity Log Table
-- ============================================
CREATE TABLE IF NOT EXISTS project_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'task_created', 'task_completed', 'task_updated', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'task', 'note', 'milestone', etc.
    entity_id UUID,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_activity_log_project_id ON project_activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_log_user_id ON project_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_log_created_at ON project_activity_log(created_at DESC);

-- ============================================
-- Project Sharing Table
-- ============================================
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
);

CREATE INDEX IF NOT EXISTS idx_project_sharing_project_id ON project_sharing(project_id);
CREATE INDEX IF NOT EXISTS idx_project_sharing_share_code ON project_sharing(share_code);
CREATE INDEX IF NOT EXISTS idx_project_sharing_active ON project_sharing(share_code, is_active) WHERE is_active = TRUE;

-- ============================================
-- Project Collaborators Table
-- ============================================
CREATE TABLE IF NOT EXISTS project_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_role ON project_collaborators(role);

-- ============================================
-- Update triggers
-- ============================================
DROP TRIGGER IF EXISTS update_project_templates_updated_at ON project_templates;
CREATE TRIGGER update_project_templates_updated_at
    BEFORE UPDATE ON project_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

