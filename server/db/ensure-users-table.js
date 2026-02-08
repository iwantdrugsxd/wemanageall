import { query } from './config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Ensure the users table exists
 * If not, create it along with essential tables
 */
export async function ensureUsersTable() {
  try {
    // Check if users table exists
    const checkTable = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!checkTable.rows[0].exists) {
      console.log('⚠️  Users table not found. Initializing essential tables...');

      // Enable UUID extension
      await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

      // Create users table
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255),
          google_id VARCHAR(255) UNIQUE,
          photo TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          onboarding_completed BOOLEAN DEFAULT FALSE,
          onboarding_step INTEGER DEFAULT 0,
          vision TEXT,
          reminder_time TIME,
          review_day VARCHAR(50),
          tone VARCHAR(50) DEFAULT 'coach',
          current_goal TEXT,
          life_phase VARCHAR(50),
          subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium', 'team_starter', 'team_pro', 'enterprise')),
          subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial')),
          default_mode VARCHAR(50) DEFAULT 'individual' CHECK (default_mode IN ('individual', 'team')),
          current_organization_id UUID,
          lock_entries_default BOOLEAN DEFAULT FALSE,
          password_reset_token TEXT,
          password_reset_expires TIMESTAMP WITH TIME ZONE
        );
      `);
    } else {
      console.log('✅ Users table exists');
    }

    // Always check for and add missing columns (for both new and existing tables)
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'lock_entries_default') THEN
          ALTER TABLE users ADD COLUMN lock_entries_default BOOLEAN DEFAULT FALSE;
          RAISE NOTICE 'Added column lock_entries_default';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_reset_token') THEN
          ALTER TABLE users ADD COLUMN password_reset_token TEXT;
          RAISE NOTICE 'Added column password_reset_token';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_reset_expires') THEN
          ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP WITH TIME ZONE;
          RAISE NOTICE 'Added column password_reset_expires';
        END IF;
      END $$;
    `);

    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await query('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);');

    // Create organizations table (needed for foreign keys)
    await query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'team', 'enterprise')),
        max_members INTEGER DEFAULT 5,
        subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'team_starter', 'team_pro', 'enterprise')),
        subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial')),
        workspace_code VARCHAR(50) UNIQUE,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);');

    // Create projects table (needed for foreign keys)
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'on_hold')),
        priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        color VARCHAR(7),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);');

    // Create user_values table
    await query(`
      CREATE TABLE IF NOT EXISTS user_values (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        value VARCHAR(255) NOT NULL,
        UNIQUE(user_id, value)
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_user_values_user_id ON user_values(user_id);');

    // Create user_roles table
    await query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(255) NOT NULL,
        UNIQUE(user_id, role)
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);');

    // Create user_focus_areas table
    await query(`
      CREATE TABLE IF NOT EXISTS user_focus_areas (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        focus_area VARCHAR(255) NOT NULL,
        UNIQUE(user_id, focus_area)
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_user_focus_areas_user_id ON user_focus_areas(user_id);');

    // Create daily_intentions table (for dashboard)
    await query(`
      CREATE TABLE IF NOT EXISTS daily_intentions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        intention TEXT NOT NULL,
        entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_daily_intentions_user_id ON daily_intentions(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_daily_intentions_entry_date ON daily_intentions(entry_date);');

    // Create thinking_space_entries table (for dashboard)
    await query(`
      CREATE TABLE IF NOT EXISTS thinking_space_entries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        mode VARCHAR(20) NOT NULL DEFAULT 'freewrite' CHECK (mode IN ('freewrite', 'stuck', 'decision')),
        entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_thinking_space_user_id ON thinking_space_entries(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_thinking_space_entry_date ON thinking_space_entries(entry_date);');

    // Create journal_entries table (for dashboard)
    await query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
        content TEXT NOT NULL,
        mood VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, entry_date)
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date);');

    // Create calendar_events table (for dashboard) - with all columns
    await query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        type VARCHAR(20) DEFAULT 'event' CHECK (type IN ('event', 'task', 'note', 'reminder')),
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL,
        all_day BOOLEAN DEFAULT FALSE,
        timezone VARCHAR(50) DEFAULT 'UTC',
        color VARCHAR(7) DEFAULT '#3B6E5C',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_time_range CHECK (end_time > start_time)
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);');
    await query('CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(type);');
    await query('CREATE INDEX IF NOT EXISTS idx_calendar_events_date_range ON calendar_events(user_id, start_time, end_time);');

    // Create tasks table (for dashboard) - with all columns
    await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        goal_id UUID,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
        priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        due_date DATE,
        time_estimate INTEGER,
        time_spent INTEGER DEFAULT 0,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);');

    // Create knowledge_events table (for insights/knowledge system)
    await query(`
      CREATE TABLE IF NOT EXISTS knowledge_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        source TEXT NOT NULL,
        event_type TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        project_id UUID NULL,
        mood TEXT NULL,
        sentiment TEXT NULL,
        intensity INTEGER NULL,
        tags TEXT[] DEFAULT ARRAY[]::TEXT[],
        raw_metadata JSONB DEFAULT '{}'::JSONB
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_knowledge_events_user_time ON knowledge_events(user_id, timestamp DESC);');
    console.log('✅ knowledge_events table');

    // Create knowledge_insights table (for insights/knowledge system)
    await query(`
      CREATE TABLE IF NOT EXISTS knowledge_insights (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scope TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        sources UUID[] DEFAULT ARRAY[]::UUID[],
        confidence REAL DEFAULT 0.0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        seen_at TIMESTAMPTZ NULL,
        dismissed_at TIMESTAMPTZ NULL,
        muted BOOLEAN DEFAULT FALSE,
        meta JSONB DEFAULT '{}'::JSONB
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_knowledge_insights_user_scope ON knowledge_insights(user_id, scope, created_at DESC);');
    console.log('✅ knowledge_insights table');

    console.log('✅ Essential tables created successfully');
    console.log('⚠️  Note: Run "node server/db/init-render.js" to create all tables');
    return true;

  } catch (error) {
    console.error('❌ Error ensuring users table:', error.message);
    return false;
  }
}
