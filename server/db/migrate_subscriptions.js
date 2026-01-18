import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run database migration for subscription system
 */
async function runSubscriptionMigration() {
  console.log('\n🔄 Subscription System Migration\n');
  console.log('================================\n');

  try {
    // Read and execute migration
    const migrationPath = path.join(__dirname, 'migrate_subscriptions.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Creating subscription tables...');
    await query(migration);
    console.log('✅ Subscription tables created');

    // Verify tables exist
    const tables = await query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename IN ('user_subscriptions', 'subscription_history', 'organization_subscriptions')
      ORDER BY tablename
    `);

    console.log(`\n📋 Tables created: ${tables.rows.length}`);
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.tablename}`);
    });

    // Check columns added to users and organizations
    const userColumns = await query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('subscription_plan', 'subscription_status')
    `);

    const orgColumns = await query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'organizations' 
      AND column_name IN ('subscription_plan', 'subscription_status')
    `);

    console.log(`\n📋 User columns added: ${userColumns.rows.length}`);
    console.log(`📋 Organization columns added: ${orgColumns.rows.length}`);

    console.log('\n================================');
    console.log('✅ Subscription migration complete!\n');

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
  runSubscriptionMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default runSubscriptionMigration;



import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run database migration for subscription system
 */
async function runSubscriptionMigration() {
  console.log('\n🔄 Subscription System Migration\n');
  console.log('================================\n');

  try {
    // Read and execute migration
    const migrationPath = path.join(__dirname, 'migrate_subscriptions.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Creating subscription tables...');
    await query(migration);
    console.log('✅ Subscription tables created');

    // Verify tables exist
    const tables = await query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename IN ('user_subscriptions', 'subscription_history', 'organization_subscriptions')
      ORDER BY tablename
    `);

    console.log(`\n📋 Tables created: ${tables.rows.length}`);
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.tablename}`);
    });

    // Check columns added to users and organizations
    const userColumns = await query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('subscription_plan', 'subscription_status')
    `);

    const orgColumns = await query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'organizations' 
      AND column_name IN ('subscription_plan', 'subscription_status')
    `);

    console.log(`\n📋 User columns added: ${userColumns.rows.length}`);
    console.log(`📋 Organization columns added: ${orgColumns.rows.length}`);

    console.log('\n================================');
    console.log('✅ Subscription migration complete!\n');

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
  runSubscriptionMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

