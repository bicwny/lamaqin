
// Run this script to add test practice data for your user
// Usage: node scripts/setup-test-data.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupTestData() {
  // Your user ID from the logs
  const userId = 'cd3b8ae2-df3f-442f-996f-9c12a10aff19';
  
  try {
    // Create practice projects for the user
    const practiceProjects = [
      {
        user_id: userId,
        practice_id: '1', // Assuming practice IDs from your database
        daily_target: 3000,
        current_count: 1250
      },
      {
        user_id: userId,
        practice_id: '2',
        daily_target: 108,
        current_count: 20
      },
      {
        user_id: userId,
        practice_id: '3',
        daily_target: 30,
        current_count: 25
      }
    ];

    for (const project of practiceProjects) {
      const { data, error } = await supabase
        .from('user_practice_projects')
        .insert(project)
        .select();
      
      if (error) {
        console.error('Error creating practice project:', error);
      } else {
        console.log('Created practice project:', data);
      }
    }

    console.log('✅ Test data setup complete!');
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupTestData();
