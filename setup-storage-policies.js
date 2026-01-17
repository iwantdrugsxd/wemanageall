// Script to set up Supabase storage policies
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPolicies() {
  try {
    // Read the SQL file
    const sql = fs.readFileSync('setup-storage-policies.sql', 'utf8');
    
    console.log('📝 To set up storage policies, run this SQL in Supabase SQL Editor:');
    console.log('\n' + '='.repeat(60));
    console.log(sql);
    console.log('='.repeat(60));
    console.log('\nOr go to: https://supabase.com/dashboard/project/nogqzpfnttilcamfpmps/storage/policies');
    console.log('   and create the policies manually for the "unload-recordings" bucket.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupPolicies();









