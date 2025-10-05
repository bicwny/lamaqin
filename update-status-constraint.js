// Quick script to update study_records status constraint
// Run with: node update-status-constraint.js

const { createClient } = require('@supabase/supabase-js');
require('react-native-url-polyfill/auto');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateConstraint() {
  console.log('Updating study_records status constraint...');
  
  // Supabase JS client doesn't support DDL directly
  // User needs to run this in Supabase SQL Editor:
  console.log('\nPlease run this SQL in your Supabase SQL Editor:');
  console.log('---------------------------------------------------');
  console.log(`
ALTER TABLE study_records DROP CONSTRAINT IF EXISTS study_records_status_check;

ALTER TABLE study_records ADD CONSTRAINT study_records_status_check 
  CHECK (status IN ('回顾', '串讲', '参加', '缺席', '讲考', '提问'));
  `);
  console.log('---------------------------------------------------\n');
  console.log('Instructions:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Open the SQL Editor');
  console.log('3. Copy and paste the SQL above');
  console.log('4. Click "Run"');
}

updateConstraint();
