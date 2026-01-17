import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

/**
 * Remove unique constraint from daily_intentions table
 */
async function removeConstraint() {
  console.log('\n🔧 Removing Unique Constraint from daily_intentions\n');
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

    // Check if constraint exists
    const checkResult = await client.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'daily_intentions'::regclass 
      AND conname = 'daily_intentions_user_id_entry_date_key'
    `);

    if (checkResult.rows.length > 0) {
      console.log('⚠️  Found unique constraint, removing it...');
      
      // Remove the constraint
      await client.query(`
        ALTER TABLE daily_intentions 
        DROP CONSTRAINT daily_intentions_user_id_entry_date_key
      `);
      
      console.log('✅ Unique constraint removed successfully!');
      console.log('   Multiple intentions per day are now allowed.\n');
    } else {
      console.log('ℹ️  No unique constraint found.');
      console.log('   The table already allows multiple intentions per day.\n');
    }

    // Verify the constraint is gone
    const verifyResult = await client.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'daily_intentions'::regclass 
      AND conname = 'daily_intentions_user_id_entry_date_key'
    `);

    if (verifyResult.rows.length === 0) {
      console.log('✅ Verification: Constraint successfully removed\n');
    } else {
      console.log('⚠️  Warning: Constraint still exists\n');
    }

    await client.end();

    console.log('================================');
    console.log('✅ Migration complete!\n');
    console.log('You can now add multiple intentions per day.\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Make sure PostgreSQL is running');
    console.error('  2. Check your database credentials in .env');
    console.error('  3. Ensure the database exists');
    console.error('  4. Check that you have the necessary permissions\n');
    process.exit(1);
  }
}

removeConstraint();








