import { query } from './config.js';
import dotenv from 'dotenv';

dotenv.config();

async function addTranscriptColumn() {
  try {
    console.log('Adding transcript column to unload_entries table...');
    
    // Add transcript column
    await query(`
      ALTER TABLE unload_entries 
      ADD COLUMN IF NOT EXISTS transcript TEXT;
    `);
    
    console.log('✅ Transcript column added successfully!');
    
    // Try to add index (might fail if extension not available, that's okay)
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_unload_entries_transcript 
        ON unload_entries USING gin(to_tsvector('english', transcript))
        WHERE transcript IS NOT NULL;
      `);
      console.log('✅ Transcript index created successfully!');
    } catch (indexError) {
      console.log('⚠️  Index creation skipped (full-text search extension may not be available)');
      console.log('   This is optional and won\'t affect functionality.');
    }
    
    console.log('\n✅ Migration complete! The transcript column is now available.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

addTranscriptColumn();









