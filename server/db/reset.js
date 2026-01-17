import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

/**
 * Reset the OFA database
 * Drops and recreates all tables
 */
async function resetDatabase() {
  console.log('\n⚠️  OFA Database Reset\n');
  console.log('================================\n');
  console.log('This will DELETE all data!\n');

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

    // Drop all tables
    await client.query(`
      DROP TABLE IF EXISTS waitlist CASCADE;
      DROP TABLE IF EXISTS journal_entries CASCADE;
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP TABLE IF EXISTS goals CASCADE;
      DROP TABLE IF EXISTS user_focus_areas CASCADE;
      DROP TABLE IF EXISTS user_roles CASCADE;
      DROP TABLE IF EXISTS user_values CASCADE;
      DROP TABLE IF EXISTS session CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    console.log('✅ All tables dropped');

    await client.end();

    console.log('\n================================');
    console.log('✅ Database reset complete!');
    console.log('\nRun "npm run db:init" to recreate tables.\n');

  } catch (error) {
    console.error('\n❌ Database reset failed:', error.message);
    process.exit(1);
  }
}

resetDatabase();











