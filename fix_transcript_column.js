import { query } from './server/db/config.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixTranscriptColumn() {
  try {
    console.log('🔧 Adding transcript column to unload_entries...\n');
    
    // Check if column exists first
    const checkResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'unload_entries' 
      AND column_name = 'transcript';
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Transcript column already exists!');
      process.exit(0);
    }
    
    // Add transcript column
    await query(`
      ALTER TABLE unload_entries 
      ADD COLUMN transcript TEXT;
    `);
    
    console.log('✅ Transcript column added successfully!\n');
    console.log('✅ Migration complete! You can now use transcription.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === '42701') {
      console.log('ℹ️  Column already exists (this is okay)');
      process.exit(0);
    }
    console.error('Full error:', error);
    process.exit(1);
  }
}

fixTranscriptColumn();





