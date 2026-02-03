import dotenv from 'dotenv';
import { query } from './config.js';

dotenv.config();

/**
 * Migration: Add Google OAuth Support
 * Adds google_id, photo columns and makes password nullable
 */
async function migrateGoogleOAuth() {
  console.log('\n🔐 Google OAuth Migration');
  console.log('==========================\n');

  try {
    // Check if google_id column exists
    const checkGoogleId = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'google_id'
    `);

    if (checkGoogleId.rows.length === 0) {
      console.log('Adding google_id column...');
      await query(`
        ALTER TABLE users 
        ADD COLUMN google_id VARCHAR(255) UNIQUE
      `);
      await query(`
        CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)
      `);
      console.log('✅ Added google_id column and index');
    } else {
      console.log('✅ google_id column already exists');
    }

    // Check if photo column exists
    const checkPhoto = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'photo'
    `);

    if (checkPhoto.rows.length === 0) {
      console.log('Adding photo column...');
      await query(`
        ALTER TABLE users 
        ADD COLUMN photo TEXT
      `);
      console.log('✅ Added photo column');
    } else {
      console.log('✅ photo column already exists');
    }

    // Make password nullable
    try {
      console.log('Making password column nullable...');
      await query(`
        ALTER TABLE users 
        ALTER COLUMN password DROP NOT NULL
      `);
      console.log('✅ Password column is now nullable');
    } catch (error) {
      if (error.message.includes('does not exist') || error.message.includes('already')) {
        console.log('ℹ️  Password column constraint already updated');
      } else {
        throw error;
      }
    }

    console.log('\n================================');
    console.log('✅ Google OAuth migration complete!');
    console.log('================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

migrateGoogleOAuth();








