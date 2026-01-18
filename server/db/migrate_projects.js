import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

/**
 * Run database migration for projects system
 */
async function runMigration() {
  console.log('\n🔄 Projects System Database Migration\n');
  console.log('================================\n');

  const dbName = process.env.DB_NAME || 'ofa_db';

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: dbName,
  });

  try {
    await client.connect();
    console.log(`✅ Connected to database "${dbName}"`);

    // Read and execute migration
    const migrationPath = path.join(__dirname, 'migrate_projects_system.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    await client.query(migration);
    console.log('✅ Migration applied successfully');

    // Verify tables exist
    const tables = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename IN ('projects', 'project_phases', 'project_tasks', 'project_milestones', 'project_notes')
      ORDER BY tablename
    `);

    console.log('\n📋 Projects system tables verified:');
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.tablename}`);
    });

    if (tables.rows.length < 5) {
      console.log('\n⚠️  Warning: Some tables may be missing. Check the migration output above.');
    }

    await client.end();

    console.log('\n================================');
    console.log('✅ Migration complete!\n');
    console.log('You can now use the Projects system.\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Make sure PostgreSQL is running');
    console.error('  2. Check your database credentials in .env');
    console.error('  3. Ensure the database exists (run: npm run db:init)');
    console.error('  4. Check that you have the necessary permissions\n');
    process.exit(1);
  }
}

runMigration();








