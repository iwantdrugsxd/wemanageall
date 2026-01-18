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
 * Install and enable pgvector extension
 */
async function installPgvector() {
  console.log('\n🔧 Installing pgvector Extension\n');
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
    console.log(`✅ Connected to database "${dbName}"\n`);

    // Check if pgvector is already installed
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      ) as is_installed
    `);

    if (checkResult.rows[0]?.is_installed) {
      console.log('✅ pgvector extension is already installed\n');
      await client.end();
      return;
    }

    // Try to create the extension
    console.log('Attempting to create pgvector extension...\n');
    
    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS vector`);
      console.log('✅ pgvector extension created successfully!\n');
    } catch (error) {
      console.error('❌ Failed to create pgvector extension\n');
      console.error('Error:', error.message);
      console.error('\n📋 Installation Instructions:\n');
      console.error('pgvector needs to be installed on your PostgreSQL server first.\n');
      console.error('Installation methods:\n');
      console.error('  Ubuntu/Debian:');
      console.error('    sudo apt-get install postgresql-14-pgvector');
      console.error('    (Adjust version number to match your PostgreSQL version)\n');
      console.error('  macOS (Homebrew):');
      console.error('    brew install pgvector\n');
      console.error('  Or compile from source:');
      console.error('    https://github.com/pgvector/pgvector#installation\n');
      console.error('After installing, run this migration again.\n');
      await client.end();
      process.exit(1);
    }

    // Verify installation
    const verifyResult = await client.query(`
      SELECT extversion FROM pg_extension WHERE extname = 'vector'
    `);

    if (verifyResult.rows.length > 0) {
      console.log(`✅ pgvector extension verified (version: ${verifyResult.rows[0].extversion})\n`);
    }

    // Test vector type
    try {
      await client.query(`SELECT '[1,2,3]'::vector(3)`);
      console.log('✅ Vector type is working correctly\n');
    } catch (error) {
      console.warn('⚠️  Vector type test failed:', error.message);
    }

    await client.end();

    console.log('================================');
    console.log('✅ pgvector installation complete!\n');
    console.log('You can now use semantic search features in the Knowledge Engine.\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Make sure PostgreSQL is running');
    console.error('  2. Check your database credentials in .env');
    console.error('  3. Ensure you have superuser privileges (pgvector requires it)');
    console.error('  4. Install pgvector on your PostgreSQL server first\n');
    process.exit(1);
  }
}

installPgvector();








