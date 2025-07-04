
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const USER_EMAIL = 'fob.design@gmail.com';
const USER_ID = '954dc879-cbfe-4b5f-a7ef-113acf1f5569';

async function completeDataWipe() {
  try {
    console.log(`🧹 Starting complete data wipe for: ${USER_EMAIL}`);

    // 1. Delete daily practice records
    const { error: dailyError } = await supabase
      .from('daily_records')
      .delete()
      .eq('user_id', USER_ID);

    if (dailyError) {
      console.error('❌ Error deleting daily records:', dailyError);
    } else {
      console.log('✅ Deleted daily records');
    }

    // 2. Delete meditation records
    const { error: meditationError } = await supabase
      .from('meditation_records')
      .delete()
      .eq('user_id', USER_ID);

    if (meditationError) {
      console.error('❌ Error deleting meditation records:', meditationError);
    } else {
      console.log('✅ Deleted meditation records');
    }

    // 3. Delete mindfulness records
    const { error: mindfulnessError } = await supabase
      .from('mindfulness_records')
      .delete()
      .eq('user_id', USER_ID);

    if (mindfulnessError) {
      console.error('❌ Error deleting mindfulness records:', mindfulnessError);
    } else {
      console.log('✅ Deleted mindfulness records');
    }

    // 4. Delete one-time practice records
    const { error: oneTimeError } = await supabase
      .from('one_time_records')
      .delete()
      .eq('user_id', USER_ID);

    if (oneTimeError) {
      console.error('❌ Error deleting one-time records:', oneTimeError);
    } else {
      console.log('✅ Deleted one-time records');
    }

    // 5. Delete study records
    const { error: studyError } = await supabase
      .from('study_records')
      .delete()
      .eq('user_id', USER_ID);

    if (studyError) {
      console.error('❌ Error deleting study records:', studyError);
    } else {
      console.log('✅ Deleted study records');
    }

    // 6. Delete user practice projects (this will cascade delete related records)
    const { error: projectsError } = await supabase
      .from('user_practice_projects')
      .delete()
      .eq('user_id', USER_ID);

    if (projectsError) {
      console.error('❌ Error deleting practice projects:', projectsError);
    } else {
      console.log('✅ Deleted practice projects');
    }

    // 7. Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    
    const checks = [
      { table: 'daily_records', name: 'Daily records' },
      { table: 'meditation_records', name: 'Meditation records' },
      { table: 'mindfulness_records', name: 'Mindfulness records' },
      { table: 'one_time_records', name: 'One-time records' },
      { table: 'study_records', name: 'Study records' },
      { table: 'user_practice_projects', name: 'Practice projects' }
    ];

    for (const check of checks) {
      const { data, error } = await supabase
        .from(check.table)
        .select('id')
        .eq('user_id', USER_ID);

      if (error) {
        console.error(`❌ Error checking ${check.name}:`, error);
      } else {
        const count = data?.length || 0;
        console.log(`📊 ${check.name}: ${count} remaining`);
      }
    }

    console.log('\n🎉 Data wipe completed!');

  } catch (error) {
    console.error('❌ Error during data wipe:', error);
  }
}

completeDataWipe();
