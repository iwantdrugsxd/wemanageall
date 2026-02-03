import { query } from './config.js';

/**
 * Create dashboard-related tables if they don't exist
 * Run this if daily_intentions or other dashboard tables are missing
 */
export async function createDashboardTables() {
  try {
    console.log('🔧 Creating dashboard tables...\n');

    // Create organizations table first (needed for foreign keys)
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
    console.log('✅ organizations table');

    // Create projects table
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
    console.log('✅ projects table');

    // Create daily_intentions table
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
    console.log('✅ daily_intentions table');

    // Create thinking_space_entries table
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
    console.log('✅ thinking_space_entries table');

    // Create journal_entries table
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
    console.log('✅ journal_entries table');

    // Create calendar_events table
    await query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE,
        all_day BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);');
    console.log('✅ calendar_events table');

    // Create tasks table
    await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
        priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        due_date DATE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query('CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);');
    console.log('✅ tasks table');

    console.log('\n✅ All dashboard tables created successfully!\n');
    return true;

  } catch (error) {
    console.error('❌ Error creating dashboard tables:', error.message);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createDashboardTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}



