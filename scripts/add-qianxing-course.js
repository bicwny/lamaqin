
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const USER_ID = '954dc879-cbfe-4b5f-a7ef-113acf1f5569'; // Your user ID from logs

const QIANXING_COURSE = {
  name: '《前行广释》',
  total_lessons: 146,
  teacher: '索达吉堪布',
  description: '大圆满前行广释 - 索达吉堪布讲解的前行修法详细指导'
};

const QIANXING_LESSONS = [
  { lesson_number: 0, title: '上师瑜伽速赐加持', content_summary: '上师瑜伽修法，祈请上师加持' },
  { lesson_number: 1, title: '前行之重要性', content_summary: '讲解前行修法的重要意义和必要性' }
];

// Generate lessons 2-145 (lesson 0 and 1 already defined above)
for (let i = 2; i <= 145; i++) {
  QIANXING_LESSONS.push({
    lesson_number: i,
    title: `第${i}课`,
    content_summary: `《前行广释》第${i}课内容`
  });
}

async function addQianxingCourse() {
  try {
    console.log('🔧 Adding 《前行广释》course...');

    // 1. Check if course already exists
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('id')
      .eq('name', QIANXING_COURSE.name)
      .single();

    let courseId;

    if (existingCourse) {
      console.log('✅ Course already exists, using existing course');
      courseId = existingCourse.id;
    } else {
      // 2. Create the course
      const { data: newCourse, error: courseError } = await supabase
        .from('courses')
        .insert(QIANXING_COURSE)
        .select()
        .single();

      if (courseError) {
        console.error('❌ Error creating course:', courseError);
        return;
      }

      courseId = newCourse.id;
      console.log(`✅ Created course: ${QIANXING_COURSE.name}`);
    }

    // 3. Replace all existing lessons
    console.log('\n📚 Replacing all lessons...');
    
    // Delete all existing lessons for this course
    const { error: deleteError } = await supabase
      .from('course_lessons')
      .delete()
      .eq('course_id', courseId);

    if (deleteError) {
      console.error('❌ Error deleting existing lessons:', deleteError);
      return;
    }

    console.log('✅ Deleted all existing lessons');

    // Add all new lessons
    const allLessons = QIANXING_LESSONS.map(lesson => ({
      course_id: courseId,
      ...lesson
    }));

    // Insert lessons in batches of 100 to avoid API limits
    const batchSize = 100;
    for (let i = 0; i < allLessons.length; i += batchSize) {
      const batch = allLessons.slice(i, i + batchSize);
      
      const { error: lessonsError } = await supabase
        .from('course_lessons')
        .insert(batch);

      if (lessonsError) {
        console.error('❌ Error creating lessons batch:', lessonsError);
        return;
      }

      console.log(`✅ Added lessons ${i + 1}-${Math.min(i + batchSize, allLessons.length)}`);
    }

    // 4. Add user to course (create user_courses record)
    const { data: existingUserCourse } = await supabase
      .from('user_courses')
      .select('id')
      .eq('user_id', USER_ID)
      .eq('course_id', courseId)
      .single();

    if (!existingUserCourse) {
      const { error: userCourseError } = await supabase
        .from('user_courses')
        .insert({
          user_id: USER_ID,
          course_id: courseId,
          status: 'active',
          joined_date: new Date().toISOString().split('T')[0]
        });

      if (userCourseError) {
        console.error('❌ Error adding user to course:', userCourseError);
        return;
      }

      console.log('✅ Added user to course');
    } else {
      console.log('✅ User already enrolled in course');
    }

    // 5. Verify the setup
    console.log('\n📊 Verification:');
    const { data: courseData } = await supabase
      .from('courses')
      .select('id, name, total_lessons')
      .eq('id', courseId)
      .single();

    const { data: lessonsCount } = await supabase
      .from('course_lessons')
      .select('id', { count: 'exact' })
      .eq('course_id', courseId);

    const { data: userCourseData } = await supabase
      .from('user_courses')
      .select('status')
      .eq('user_id', USER_ID)
      .eq('course_id', courseId)
      .single();

    console.log(`✅ Course: ${courseData.name}`);
    console.log(`✅ Total lessons in DB: ${lessonsCount.length}/${courseData.total_lessons}`);
    console.log(`✅ User enrollment status: ${userCourseData.status}`);

    console.log('\n🎉 《前行广释》course setup completed successfully!');
    console.log('👉 You can now refresh your study screen to see the course');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
addQianxingCourse().then(() => {
  console.log('\n✨ Course setup script completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Setup script failed:', error);
  process.exit(1);
});
