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
 * Initialize the OFA database
 * Creates the database if it doesn't exist and runs the schema
 */
async function initDatabase() {
  console.log('\n🚀 OFA Database Initialization\n');
  console.log('================================\n');

  // First, connect to PostgreSQL default database to create our database
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'postgres', // Connect to default database first
  });

  try {
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Check if database exists
    const dbName = process.env.DB_NAME || 'ofa_db';
    const checkDb = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDb.rows.length === 0) {
      // Create database
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created`);
    } else {
      console.log(`ℹ️  Database "${dbName}" already exists`);
    }

    await adminClient.end();

    // Now connect to our database and run schema
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: dbName,
    });

    await client.connect();
    console.log(`✅ Connected to database "${dbName}"`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await client.query(schema);
    console.log('✅ Schema applied successfully');

    // Verify tables
    const tables = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log('\n📋 Tables created:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.tablename}`);
    });

    await client.end();

    console.log('\n================================');
    console.log('✅ Database initialization complete!\n');
    console.log('Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Visit: http://localhost:5173\n');

  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Make sure PostgreSQL is running');
    console.error('  2. Check your database credentials in .env');
    console.error('  3. Ensure the postgres user has CREATE DATABASE permission\n');
    process.exit(1);
  }
}

initDatabase();













