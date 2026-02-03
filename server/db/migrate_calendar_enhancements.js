import { query } from './config.js';

export async function migrateCalendarEnhancements() {
  try {
    console.log('Starting calendar enhancements migration...');

    // Add recurrence fields
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'calendar_events' AND column_name = 'recurrence_rule'
        ) THEN
          ALTER TABLE calendar_events ADD COLUMN recurrence_rule JSONB;
        END IF;
      END $$;
    `);

    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'calendar_events' AND column_name = 'recurrence_end_date'
        ) THEN
          ALTER TABLE calendar_events ADD COLUMN recurrence_end_date DATE;
        END IF;
      END $$;
    `);

    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'calendar_events' AND column_name = 'recurrence_count'
        ) THEN
          ALTER TABLE calendar_events ADD COLUMN recurrence_count INTEGER;
        END IF;
      END $$;
    `);

    // Add reminder field
    await query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'calendar_events' AND column_name = 'reminder_minutes'
        ) THEN
          ALTER TABLE calendar_events ADD COLUMN reminder_minutes INTEGER;
        END IF;
      END $$;
    `);

    console.log('Calendar enhancements migration completed successfully');
  } catch (error) {
    console.error('Error in calendar enhancements migration:', error);
    throw error;
  }
}
