
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const USER_ID = '954dc879-cbfe-4b5f-a7ef-113acf1f5569'; // From the logs

async function debugUserProjects() {
  try {
    console.log('🔍 Checking user practice projects...');
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', USER_ID)
      .single();
    
    if (userError) {
      console.log('❌ User error:', userError);
    } else {
      console.log('✅ User found:', user?.email);
    }
    
    // Check practice projects
    const { data: projects, error: projectsError } = await supabase
      .from('user_practice_projects')
      .select(`
        *,
        practices (
          id,
          name,
          type,
          unit,
          description
        )
      `)
      .eq('user_id', USER_ID);
    
    if (projectsError) {
      console.log('❌ Projects error:', projectsError);
    } else {
      console.log(`✅ Found ${projects?.length || 0} practice projects:`);
      projects?.forEach(project => {
        console.log(`  • ${project.practices?.name}: ${project.current_count}/${project.daily_target}`);
      });
    }
    
    // Check all practice projects (without user filter)
    const { data: allProjects, error: allError } = await supabase
      .from('user_practice_projects')
      .select('user_id, practices(name)')
      .limit(10);
    
    if (allError) {
      console.log('❌ All projects error:', allError);
    } else {
      console.log(`\n📋 Sample of all practice projects (${allProjects?.length || 0}):`);
      allProjects?.forEach(project => {
        console.log(`  • User: ${project.user_id} - Practice: ${project.practices?.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugUserProjects().then(() => {
  console.log('\n✨ Debug completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug script failed:', error);
  process.exit(1);
});
