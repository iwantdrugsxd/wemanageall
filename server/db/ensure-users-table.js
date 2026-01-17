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

    if (checkTable.rows[0].exists) {
      console.log('✅ Users table exists');
      return true;
    }

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
        current_organization_id UUID
      );
    `);

    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await query('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);');

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

    console.log('✅ Essential tables created successfully');
    console.log('⚠️  Note: Run "node server/db/init-render.js" to create all tables');
    return true;

  } catch (error) {
    console.error('❌ Error ensuring users table:', error.message);
    return false;
  }
}

