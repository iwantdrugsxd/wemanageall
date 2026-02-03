// Quick script to create the Supabase storage bucket
// Run this once: node create-bucket.js

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

async function createBucket() {
  try {
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('unload-recordings', {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['audio/webm', 'audio/mpeg', 'audio/wav'],
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket already exists');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Bucket created successfully');
    }

    // Create storage policies
    console.log('\n📝 Note: You still need to run the SQL policies from supabase-setup.sql');
    console.log('   Go to Supabase Dashboard > SQL Editor and run the storage policy SQL');
    
  } catch (error) {
    console.error('❌ Error creating bucket:', error.message);
    process.exit(1);
  }
}

createBucket();













