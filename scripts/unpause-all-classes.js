const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function unpauseAllClasses() {
  try {
    console.log('🔍 Finding all paused class enrollments...');
    
    const { data: pausedEnrollments, error: fetchError } = await supabase
      .from('user_enrolled_classes')
      .select('id, user_id, class_id, status')
      .eq('status', 'paused');

    if (fetchError) {
      console.error('❌ Error fetching paused enrollments:', fetchError.message);
      process.exit(1);
    }

    if (!pausedEnrollments || pausedEnrollments.length === 0) {
      console.log('✅ No paused classes found. All classes are already active or completed.');
      return;
    }

    console.log(`📊 Found ${pausedEnrollments.length} paused class enrollment(s)`);
    console.log('📋 Details:');
    pausedEnrollments.forEach((enrollment, index) => {
      console.log(`   ${index + 1}. User ID: ${enrollment.user_id}, Class ID: ${enrollment.class_id}`);
    });

    console.log('\n🔄 Unpausing all classes...');

    const { data: updatedEnrollments, error: updateError } = await supabase
      .from('user_enrolled_classes')
      .update({ status: 'active' })
      .eq('status', 'paused')
      .select();

    if (updateError) {
      console.error('❌ Error updating enrollments:', updateError.message);
      process.exit(1);
    }

    console.log(`\n✅ Successfully unpaused ${updatedEnrollments.length} class enrollment(s)!`);
    console.log('📝 Updated enrollments:');
    updatedEnrollments.forEach((enrollment, index) => {
      console.log(`   ${index + 1}. User ID: ${enrollment.user_id}, Class ID: ${enrollment.class_id} → Status: ${enrollment.status}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

unpauseAllClasses();
