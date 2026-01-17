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
 * Initialize the OFA database on Render
 * Uses DATABASE_URL environment variable
 */
async function initDatabase() {
  console.log('\n🚀 OFA Database Initialization (Render)\n');
  console.log('================================\n');

  // Get DATABASE_URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.error('Please set DATABASE_URL in your Render environment variables.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await client.query(statement);
        if (i % 10 === 0) {
          process.stdout.write('.');
        }
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists') && 
            !error.message.includes('duplicate') &&
            !error.message.includes('IF NOT EXISTS')) {
          console.error(`\n❌ Error executing statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }

    console.log('\n✅ Schema applied successfully\n');

    // Verify tables
    const tables = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log('📋 Tables created:');
    tables.rows.forEach(row => {
      console.log(`   ✅ ${row.tablename}`);
    });

    await client.end();

    console.log('\n================================');
    console.log('✅ Database initialization complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Check that DATABASE_URL is set correctly');
    console.error('  2. Verify database connection string');
    console.error('  3. Ensure database exists\n');
    process.exit(1);
  }
}

initDatabase();

