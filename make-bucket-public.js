// Script to make the Supabase storage bucket public
// Run this once: node make-bucket-public.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeBucketPublic() {
  try {
    // Update bucket to be public
    const { data, error } = await supabase.storage.updateBucket('unload-recordings', {
      public: true,
    });

    if (error) {
      if (error.message.includes('not found')) {
        console.log('❌ Bucket not found. Please create it first.');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Bucket is now public');
      console.log('   Audio files can now be accessed via public URLs');
    }
    
  } catch (error) {
    console.error('❌ Error updating bucket:', error.message);
    process.exit(1);
  }
}

makeBucketPublic();













