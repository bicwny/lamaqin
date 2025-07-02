
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const USER_EMAIL = 'patriziolin@gmail.com';
const USER_ID = 'cd3b8ae2-df3f-442f-996f-9c12a10aff19';

// Practice projects to create
const PRACTICE_PROJECTS = [
  { practice_name: '六字大明咒', daily_target: 3000 },
  { practice_name: '百字明', daily_target: 108 },
  { practice_name: '心经', daily_target: 21 },
  { practice_name: '禅修', daily_target: 30 }, // 30 minutes
  { practice_name: '拜佛', daily_target: 108 },
  { practice_name: '发心', daily_target: 1 }
];

async function setupUserPractices() {
  try {
    console.log('🔧 Setting up practice projects for user:', USER_EMAIL);
    
    // First, get all available practices
    const { data: practices, error: practicesError } = await supabase
      .from('practices')
      .select('id, name, type, unit');
    
    if (practicesError) {
      console.error('❌ Error fetching practices:', practicesError);
      return;
    }
    
    console.log('📋 Available practices:', practices.length);
    
    // Create practice projects for each specified practice
    for (const projectConfig of PRACTICE_PROJECTS) {
      const practice = practices.find(p => p.name === projectConfig.practice_name);
      
      if (!practice) {
        console.log(`⚠️ Practice "${projectConfig.practice_name}" not found, skipping...`);
        continue;
      }
      
      // Check if project already exists
      const { data: existingProject } = await supabase
        .from('user_practice_projects')
        .select('id')
        .eq('user_id', USER_ID)
        .eq('practice_id', practice.id)
        .single();
      
      if (existingProject) {
        console.log(`✅ Practice project "${practice.name}" already exists`);
        continue;
      }
      
      // Create the practice project
      const { data: newProject, error: projectError } = await supabase
        .from('user_practice_projects')
        .insert({
          user_id: USER_ID,
          practice_id: practice.id,
          daily_target: projectConfig.daily_target
        })
        .select()
        .single();
      
      if (projectError) {
        console.error(`❌ Error creating project for "${practice.name}":`, projectError);
      } else {
        console.log(`✅ Created practice project: "${practice.name}" (target: ${projectConfig.daily_target} ${practice.unit})`);
      }
    }
    
    // Verify the setup
    const { data: userProjects, error: verifyError } = await supabase
      .from('user_practice_projects')
      .select(`
        id,
        daily_target,
        practices (
          name,
          type,
          unit
        )
      `)
      .eq('user_id', USER_ID);
    
    if (verifyError) {
      console.error('❌ Error verifying setup:', verifyError);
    } else {
      console.log('\n🎉 Setup complete! User now has', userProjects.length, 'practice projects:');
      userProjects.forEach(project => {
        console.log(`  • ${project.practices.name}: ${project.daily_target} ${project.practices.unit}/day`);
      });
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupUserPractices().then(() => {
  console.log('\n✨ Practice projects setup completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Setup script failed:', error);
  process.exit(1);
});
