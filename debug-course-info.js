
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCourseInfo() {
  try {
    console.log('🔍 Checking course with ID: 4b68cbbb-d96e-4762-9f3d-0bf129043f36');
    
    // Check the course record
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', '4b68cbbb-d96e-4762-9f3d-0bf129043f36')
      .single();

    if (courseError) {
      console.error('❌ Error fetching course:', courseError);
      return;
    }

    console.log('📚 Course data:', course);

    // Check the lessons for this course
    const { data: lessons, error: lessonsError } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('course_id', '4b68cbbb-d96e-4762-9f3d-0bf129043f36')
      .order('lesson_number');

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    console.log(`📖 Found ${lessons?.length || 0} lessons for this course:`);
    lessons?.forEach(lesson => {
      console.log(`  - Lesson ${lesson.lesson_number}: ${lesson.title}`);
    });

    // Check if total_lessons matches actual lesson count
    if (course && lessons) {
      console.log(`\n📊 Comparison:`);
      console.log(`   total_lessons in course record: ${course.total_lessons}`);
      console.log(`   actual lessons in database: ${lessons.length}`);
      console.log(`   max lesson_number: ${Math.max(...lessons.map(l => l.lesson_number))}`);
      
      if (course.total_lessons !== lessons.length) {
        console.log('⚠️  MISMATCH: total_lessons does not match actual lesson count!');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkCourseInfo();
