import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://clqjuugskotxxngownvj.supabase.co';
const supabaseKey = 'sb_publishable_rCVN8zGi53mErpF8D56U4w_vNtfVR3q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function linkDaxueCourse() {
  try {
    console.log('🔍 Finding classes on Supabase...');
    
    // First, find all classes
    const { data: classes, error: classError } = await supabase
      .from('class_curricula')
      .select('id, class_name')
      .order('display_order');
    
    if (classError) {
      console.error('❌ Error fetching classes:', classError);
      return;
    }
    
    console.log('📚 Available classes:');
    classes?.forEach(c => console.log(`  - ${c.class_name} (${c.id})`));
    
    // Find 大学演讲 course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, name')
      .eq('name', '大学演讲')
      .single();
    
    if (courseError) {
      console.error('❌ Error fetching course:', courseError);
      return;
    }
    
    console.log(`\n✅ Found course: ${course.name} (${course.id})`);
    
    // Classes to link to
    const targetClasses = [
      '预科：基础',
      '预科：入行',
      '预科：净土',
      '预科：加行'
    ];
    
    console.log('\n🔗 Linking course to classes...');
    
    for (const className of targetClasses) {
      const classData = classes?.find(c => c.class_name === className);
      
      if (!classData) {
        console.log(`⚠️  Class "${className}" not found, skipping...`);
        continue;
      }
      
      // Check if already linked
      const { data: existing } = await supabase
        .from('class_required_courses')
        .select('id')
        .eq('class_id', classData.id)
        .eq('course_id', course.id)
        .single();
      
      if (existing) {
        console.log(`✓ Already linked to ${className}`);
        continue;
      }
      
      // Create the link
      const { error: linkError } = await supabase
        .from('class_required_courses')
        .insert({
          class_id: classData.id,
          course_id: course.id,
          required_study_types: ['听传承', '看法本'],
          optional_status_fields: []
        });
      
      if (linkError) {
        console.error(`❌ Error linking to ${className}:`, linkError);
      } else {
        console.log(`✅ Linked to ${className}`);
      }
    }
    
    console.log('\n🎉 Done!');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
linkDaxueCourse();
