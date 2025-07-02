
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Current user from logs
const USER_ID = '954dc879-cbfe-4b5f-a7ef-113acf1f5569';
const USER_EMAIL = 'fob.design@gmail.com';

async function setupUserPractices() {
  try {
    console.log(`🔧 Setting up practice projects for: ${USER_EMAIL}`);

    // First, get available practices
    const { data: practices, error: practicesError } = await supabase
      .from('practices')
      .select('id, name, type, unit');

    if (practicesError) {
      console.error('❌ Error fetching practices:', practicesError);
      return;
    }

    console.log(`📋 Found ${practices.length} available practices`);

    // Define practice projects to create
    const practiceProjects = [
      { 
        practice_name: '六字大明咒', 
        daily_target: 3000, 
        current_count: 2847,
        target_count: 100000,
        status: 'active'
      },
      { 
        practice_name: '百字明', 
        daily_target: 108, 
        current_count: 45,
        target_count: 10000,
        status: 'active'
      },
      { 
        practice_name: '心经', 
        daily_target: 21, 
        current_count: 7,
        target_count: 1000,
        status: 'active'
      },
      { 
        practice_name: '禅修', 
        daily_target: 30, 
        current_count: 25,
        target_count: 1000,
        status: 'active'
      },
      { 
        practice_name: '顶礼', 
        daily_target: 108, 
        current_count: 0,
        target_count: 100000,
        status: 'not_started'
      },
      { 
        practice_name: '发心', 
        daily_target: 3, 
        current_count: 1,
        target_count: 1000,
        status: 'active'
      }
    ];

    // Create practice projects
    for (const projectData of practiceProjects) {
      const practice = practices.find(p => p.name === projectData.practice_name);
      
      if (!practice) {
        console.log(`⚠️  Practice "${projectData.practice_name}" not found in database`);
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
        console.log(`✅ Practice project "${projectData.practice_name}" already exists`);
        continue;
      }

      // Create new practice project
      const { data: newProject, error: projectError } = await supabase
        .from('user_practice_projects')
        .insert({
          user_id: USER_ID,
          practice_id: practice.id,
          daily_target: projectData.daily_target,
          current_count: projectData.current_count,
          target_count: projectData.target_count,
          status: projectData.status
        })
        .select()
        .single();

      if (projectError) {
        console.error(`❌ Error creating project for "${projectData.practice_name}":`, projectError);
      } else {
        console.log(`✅ Created practice project: ${projectData.practice_name}`);
      }
    }

    // Create some sample daily records for today
    console.log('\n📅 Creating sample daily records for today...');
    const today = new Date().toISOString().split('T')[0];

    const { data: userProjects } = await supabase
      .from('user_practice_projects')
      .select('id, daily_target, practices(name)')
      .eq('user_id', USER_ID);

    for (const project of userProjects || []) {
      // Random completion between 20% and 80% of daily target
      const completionRate = 0.2 + Math.random() * 0.6;
      const count = Math.floor(project.daily_target * completionRate);

      if (count > 0) {
        const { error: recordError } = await supabase
          .from('daily_records')
          .insert({
            user_id: USER_ID,
            practice_project_id: project.id,
            record_date: today,
            count: count,
            notes: `Sample record for ${project.practices.name}`
          });

        if (!recordError) {
          console.log(`✅ Created daily record for ${project.practices.name}: ${count}`);
        }
      }
    }

    console.log('\n🎉 Setup completed successfully!');
    
    // Verify the setup
    const { data: finalProjects } = await supabase
      .from('user_practice_projects')
      .select(`
        id,
        daily_target,
        current_count,
        status,
        practices(name, type, unit)
      `)
      .eq('user_id', USER_ID);

    console.log('\n📊 Verification - User now has practice projects:');
    finalProjects?.forEach(project => {
      console.log(`  • ${project.practices.name}: ${project.current_count}/${project.daily_target} ${project.practices.unit} (${project.status})`);
    });

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupUserPractices();
