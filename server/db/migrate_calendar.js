import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run database migration for calendar_events table
 */
async function runCalendarMigration() {
  console.log('\n🔄 Calendar Events Table Migration\n');
  console.log('================================\n');

  try {
    // First, ensure the update_updated_at_column function exists
    console.log('📋 Creating update_updated_at_column function...');
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    console.log('✅ Function created/updated');

    // Read and execute calendar schema migration
    const migrationPath = path.join(__dirname, 'calendar_schema.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Creating calendar_events table...');
    await query(migration);
    console.log('✅ Calendar events table created');

    // Verify table exists
    const tableCheck = await query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename = 'calendar_events'
    `);

    if (tableCheck.rows.length > 0) {
      console.log('\n✅ calendar_events table verified');
      
      // Check indexes
      const indexes = await query(`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'calendar_events'
        ORDER BY indexname
      `);
      
      console.log(`\n📋 Indexes created: ${indexes.rows.length}`);
      indexes.rows.forEach(row => {
        console.log(`   ✓ ${row.indexname}`);
      });
    } else {
      console.log('\n⚠️  Warning: calendar_events table not found after migration');
    }

    console.log('\n================================');
    console.log('✅ Calendar migration complete!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Make sure PostgreSQL is running');
    console.error('  2. Check your database credentials in .env');
    console.error('  3. Ensure the database exists');
    console.error('  4. Check that you have the necessary permissions');
    console.error('\nError details:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCalendarMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default runCalendarMigration;

