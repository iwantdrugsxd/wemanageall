import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

/**
 * Fix corrupted session table
 * Drops and recreates the session table properly
 */
async function fixSessionTable() {
  console.log('\n🔧 Fixing Session Table\n');
  console.log('================================\n');

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Drop existing session table if it exists
    console.log('🗑️  Dropping existing session table...');
    await client.query('DROP TABLE IF EXISTS session CASCADE;');
    console.log('✅ Session table dropped');

    // Create session table with correct structure
    console.log('📝 Creating new session table...');
    await client.query(`
      CREATE TABLE session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL,
        CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE
      )
      WITH (OIDS=FALSE);
    `);
    console.log('✅ Session table created');

    // Create index
    console.log('📝 Creating session expire index...');
    await client.query(`
      CREATE INDEX IDX_session_expire ON session(expire);
    `);
    console.log('✅ Index created');

    // Verify table structure
    const tableInfo = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'session' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Session table structure:');
    tableInfo.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'})`);
    });

    // Check for primary key
    const pkInfo = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'session' 
      AND constraint_type = 'PRIMARY KEY';
    `);

    if (pkInfo.rows.length > 0) {
      console.log(`\n✅ Primary key exists: ${pkInfo.rows[0].constraint_name}`);
    } else {
      console.warn('\n⚠️  No primary key found!');
    }

    await client.end();

    console.log('\n================================');
    console.log('✅ Session table fixed successfully!\n');
    console.log('Next steps:');
    console.log('  1. Restart your Render service');
    console.log('  2. Log in again');
    console.log('  3. Sessions should now persist correctly\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error fixing session table:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Check that DATABASE_URL is correct');
    console.error('  2. Verify database connection');
    console.error('  3. Ensure you have DROP/CREATE permissions\n');
    process.exit(1);
  }
}

fixSessionTable();


