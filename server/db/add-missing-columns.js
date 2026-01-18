import { query } from './config.js';

/**
 * Add missing columns to existing tables
 * This ensures all tables match the local database schema
 */
export async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns to tables...\n');

    // Add columns to tasks table
    console.log('📋 Updating tasks table...');
    await query(`
      DO $$ 
      BEGIN
        -- Add time_estimate (in minutes)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'time_estimate') THEN
          ALTER TABLE tasks ADD COLUMN time_estimate INTEGER;
          RAISE NOTICE 'Added time_estimate column to tasks';
        END IF;
        
        -- Add time_spent (in minutes)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'time_spent') THEN
          ALTER TABLE tasks ADD COLUMN time_spent INTEGER DEFAULT 0;
          RAISE NOTICE 'Added time_spent column to tasks';
        END IF;
        
        -- Add goal_id if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'goal_id') THEN
          ALTER TABLE tasks ADD COLUMN goal_id UUID;
          RAISE NOTICE 'Added goal_id column to tasks';
        END IF;
      END $$;
    `);
    console.log('✅ tasks table updated');

    // Add columns to calendar_events table
    console.log('📅 Updating calendar_events table...');
    await query(`
      DO $$ 
      BEGIN
        -- Add type column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'type') THEN
          ALTER TABLE calendar_events ADD COLUMN type VARCHAR(20) DEFAULT 'event' CHECK (type IN ('event', 'task', 'note', 'reminder'));
          RAISE NOTICE 'Added type column to calendar_events';
        END IF;
        
        -- Add timezone column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'timezone') THEN
          ALTER TABLE calendar_events ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
          RAISE NOTICE 'Added timezone column to calendar_events';
        END IF;
        
        -- Add color column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'color') THEN
          ALTER TABLE calendar_events ADD COLUMN color VARCHAR(7) DEFAULT '#3B6E5C';
          RAISE NOTICE 'Added color column to calendar_events';
        END IF;
        
        -- Make end_time NOT NULL if it's nullable
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'end_time' AND is_nullable = 'YES') THEN
          -- First, set default values for any NULL end_times
          UPDATE calendar_events SET end_time = start_time + INTERVAL '1 hour' WHERE end_time IS NULL;
          -- Then make it NOT NULL
          ALTER TABLE calendar_events ALTER COLUMN end_time SET NOT NULL;
          RAISE NOTICE 'Made end_time NOT NULL in calendar_events';
        END IF;
      END $$;
    `);
    
    // Create indexes for calendar_events if they don't exist
    await query('CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(type);');
    await query('CREATE INDEX IF NOT EXISTS idx_calendar_events_date_range ON calendar_events(user_id, start_time, end_time);');
    console.log('✅ calendar_events table updated');

    // Verify onboarding completion logic - check if step 5 sets completed correctly
    console.log('\n🔍 Verifying onboarding completion logic...');
    const checkResult = await query(`
      SELECT id, email, onboarding_step, onboarding_completed 
      FROM users 
      WHERE onboarding_step >= 5 AND onboarding_completed = false
      LIMIT 5
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('⚠️  Found users with step >= 5 but completed = false. Fixing...');
      await query(`
        UPDATE users 
        SET onboarding_completed = true 
        WHERE onboarding_step >= 5 AND onboarding_completed = false
      `);
      console.log(`✅ Fixed ${checkResult.rows.length} user(s)`);
    } else {
      console.log('✅ All users have correct onboarding status');
    }

    console.log('\n✅ All missing columns added successfully!\n');
    return true;

  } catch (error) {
    console.error('❌ Error adding missing columns:', error.message);
    console.error('   Stack:', error.stack);
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addMissingColumns()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

