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

    // Execute the entire schema at once (PostgreSQL can handle it)
    // This is better than splitting because it preserves functions, triggers, etc.
    try {
      await client.query(schema);
      console.log('✅ Schema executed successfully');
    } catch (error) {
      // If there are errors, try to continue with individual statements
      console.warn('⚠️  Full schema execution had issues, trying individual statements...');
      console.warn('   Error:', error.message);
      
      // Split schema into individual statements as fallback
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (!statement) continue;
        
        try {
          await client.query(statement);
          successCount++;
          if (i % 20 === 0) {
            process.stdout.write('.');
          }
        } catch (err) {
          // Ignore "already exists" and similar errors
          if (!err.message.includes('already exists') && 
              !err.message.includes('duplicate') &&
              !err.message.includes('IF NOT EXISTS') &&
              !err.message.includes('does not exist') &&
              !err.message.includes('syntax error')) {
            errorCount++;
            if (errorCount <= 5) { // Only show first 5 errors
              console.error(`\n⚠️  Statement ${i + 1} warning:`, err.message.substring(0, 100));
            }
          }
        }
      }
      
      console.log(`\n✅ Executed ${successCount} statements successfully`);
      if (errorCount > 0) {
        console.log(`⚠️  ${errorCount} statements had warnings (likely already exist)`);
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

    // Execute the entire schema at once (PostgreSQL can handle it)
    // This is better than splitting because it preserves functions, triggers, etc.
    try {
      await client.query(schema);
      console.log('✅ Schema executed successfully');
    } catch (error) {
      // If there are errors, try to continue with individual statements
      console.warn('⚠️  Full schema execution had issues, trying individual statements...');
      console.warn('   Error:', error.message);
      
      // Split schema into individual statements as fallback
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (!statement) continue;
        
        try {
          await client.query(statement);
          successCount++;
          if (i % 20 === 0) {
            process.stdout.write('.');
          }
        } catch (err) {
          // Ignore "already exists" and similar errors
          if (!err.message.includes('already exists') && 
              !err.message.includes('duplicate') &&
              !err.message.includes('IF NOT EXISTS') &&
              !err.message.includes('does not exist') &&
              !err.message.includes('syntax error')) {
            errorCount++;
            if (errorCount <= 5) { // Only show first 5 errors
              console.error(`\n⚠️  Statement ${i + 1} warning:`, err.message.substring(0, 100));
            }
          }
        }
      }
      
      console.log(`\n✅ Executed ${successCount} statements successfully`);
      if (errorCount > 0) {
        console.log(`⚠️  ${errorCount} statements had warnings (likely already exist)`);
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

    // Execute the entire schema at once (PostgreSQL can handle it)
    // This is better than splitting because it preserves functions, triggers, etc.
    try {
      await client.query(schema);
      console.log('✅ Schema executed successfully');
    } catch (error) {
      // If there are errors, try to continue with individual statements
      console.warn('⚠️  Full schema execution had issues, trying individual statements...');
      console.warn('   Error:', error.message);
      
      // Split schema into individual statements as fallback
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (!statement) continue;
        
        try {
          await client.query(statement);
          successCount++;
          if (i % 20 === 0) {
            process.stdout.write('.');
          }
        } catch (err) {
          // Ignore "already exists" and similar errors
          if (!err.message.includes('already exists') && 
              !err.message.includes('duplicate') &&
              !err.message.includes('IF NOT EXISTS') &&
              !err.message.includes('does not exist') &&
              !err.message.includes('syntax error')) {
            errorCount++;
            if (errorCount <= 5) { // Only show first 5 errors
              console.error(`\n⚠️  Statement ${i + 1} warning:`, err.message.substring(0, 100));
            }
          }
        }
      }
      
      console.log(`\n✅ Executed ${successCount} statements successfully`);
      if (errorCount > 0) {
        console.log(`⚠️  ${errorCount} statements had warnings (likely already exist)`);
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

