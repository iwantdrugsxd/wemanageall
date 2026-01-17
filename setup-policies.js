// Script to set up storage policies via Supabase API
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('📝 Storage policies need to be set up manually in Supabase Dashboard.');
console.log('   1. Go to: https://supabase.com/dashboard/project/nogqzpfnttilcamfpmps/storage/policies');
console.log('   2. Select the "unload-recordings" bucket');
console.log('   3. Or run the SQL from setup-storage-policies.sql in SQL Editor');
console.log('\n✅ Bucket created! Policies can be set up via dashboard or SQL.');
