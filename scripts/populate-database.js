
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

// Sample data for populating the database
const THEMES_DATA = [
  { name: '五加行', description: '五加行修法主题，包含顶礼、发心、百字明、供曼达、上师瑜伽', type: 'foundation' },
  { name: '金刚萨埵法会', description: '金刚萨埵净障法会专项修法', type: 'puja' },
  { name: '前行实修法', description: '大圆满前行92座观修系统', type: 'meditation' },
  { name: '基础修行功课', description: '日常基础修行功课', type: 'practice' }
];

const PRACTICES_DATA = [
  { name: '六字大明咒', type: 'count', unit: '次', description: '观音菩萨心咒，消除业障' },
  { name: '百字明', type: 'count', unit: '次', description: '金刚萨埵百字明，净化罪障' },
  { name: '心经', type: 'count', unit: '次', description: '般若波罗蜜多心经' },
  { name: '禅修', type: 'time', unit: '分钟', description: '静坐冥想修行' },
  { name: '拜佛', type: 'count', unit: '次', description: '顶礼诸佛菩萨' },
  { name: '发心', type: 'count', unit: '次', description: '发菩提心，为利众生愿成佛' },
  { name: '顶礼', type: 'count', unit: '次', description: '身语意顶礼上师三宝' },
  { name: '供曼达', type: 'count', unit: '次', description: '供养三千大千世界，积累福德' },
  { name: '上师瑜伽', type: 'count', unit: '次', description: '与上师相应，获得加持' },
  { name: '金刚萨埵心咒', type: 'count', unit: '次', description: '金刚萨埵净障心咒' }
];

const COURSES_DATA = [
  { name: '《入菩萨行论》', total_lessons: 201, teacher: '索达吉堪布', description: '寂天菩萨的菩萨行指南' },
  { name: '《大圆满前行》', total_lessons: 92, teacher: '索达吉堪布', description: '大圆满前行引导文' },
  { name: '《佛子行三十七颂》', total_lessons: 37, teacher: '索达吉堪布', description: '菩萨行的精要教言' }
];

// User practice projects to create
const PRACTICE_PROJECTS = [
  { practice_name: '六字大明咒', daily_target: 3000, current_count: 2847 },
  { practice_name: '禅修', daily_target: 30, current_count: 25 },
  { practice_name: '心经', daily_target: 21, current_count: 7 },
  { practice_name: '百字明', daily_target: 108, current_count: 45 },
  { practice_name: '拜佛', daily_target: 108, current_count: 0 },
  { practice_name: '发心', daily_target: 3, current_count: 1 }
];

async function populateDatabase() {
  try {
    console.log('🔧 Starting database population...');

    // 1. Populate themes
    console.log('\n📚 Populating themes...');
    for (const theme of THEMES_DATA) {
      const { data: existingTheme } = await supabase
        .from('themes')
        .select('id')
        .eq('name', theme.name)
        .single();

      if (!existingTheme) {
        const { error } = await supabase
          .from('themes')
          .insert(theme);
        
        if (error) {
          console.error(`❌ Error creating theme "${theme.name}":`, error);
        } else {
          console.log(`✅ Created theme: ${theme.name}`);
        }
      } else {
        console.log(`✅ Theme "${theme.name}" already exists`);
      }
    }

    // 2. Populate practices
    console.log('\n🙏 Populating practices...');
    for (const practice of PRACTICES_DATA) {
      const { data: existingPractice } = await supabase
        .from('practices')
        .select('id')
        .eq('name', practice.name)
        .single();

      if (!existingPractice) {
        const { error } = await supabase
          .from('practices')
          .insert(practice);
        
        if (error) {
          console.error(`❌ Error creating practice "${practice.name}":`, error);
        } else {
          console.log(`✅ Created practice: ${practice.name}`);
        }
      } else {
        console.log(`✅ Practice "${practice.name}" already exists`);
      }
    }

    // 3. Populate courses
    console.log('\n📖 Populating courses...');
    for (const course of COURSES_DATA) {
      const { data: existingCourse } = await supabase
        .from('courses')
        .select('id')
        .eq('name', course.name)
        .single();

      if (!existingCourse) {
        const { data: newCourse, error } = await supabase
          .from('courses')
          .insert(course)
          .select()
          .single();
        
        if (error) {
          console.error(`❌ Error creating course "${course.name}":`, error);
        } else {
          console.log(`✅ Created course: ${course.name}`);
          
          // Create sample lessons for the course
          const lessons = [];
          for (let i = 1; i <= Math.min(5, course.total_lessons); i++) {
            lessons.push({
              course_id: newCourse.id,
              lesson_number: i,
              title: `第${i}课`,
              content_summary: `${course.name}第${i}课内容概要`
            });
          }
          
          if (lessons.length > 0) {
            const { error: lessonsError } = await supabase
              .from('course_lessons')
              .insert(lessons);
            
            if (!lessonsError) {
              console.log(`  ✅ Created ${lessons.length} sample lessons`);
            }
          }
        }
      } else {
        console.log(`✅ Course "${course.name}" already exists`);
      }
    }

    // 4. Get practice IDs and create user practice projects
    console.log('\n👤 Creating user practice projects...');
    const { data: practices } = await supabase
      .from('practices')
      .select('id, name, type, unit');

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

      if (!existingProject) {
        const { error } = await supabase
          .from('user_practice_projects')
          .insert({
            user_id: USER_ID,
            practice_id: practice.id,
            daily_target: projectConfig.daily_target,
            current_count: projectConfig.current_count,
            status: projectConfig.current_count > 0 ? 'active' : 'not_started'
          });
        
        if (error) {
          console.error(`❌ Error creating project for "${practice.name}":`, error);
        } else {
          console.log(`✅ Created practice project: ${practice.name} (${projectConfig.current_count}/${projectConfig.daily_target})`);
        }
      } else {
        console.log(`✅ Practice project "${practice.name}" already exists`);
      }
    }

    // 5. Create some sample daily records for the past week
    console.log('\n📅 Creating sample daily records...');
    const { data: userProjects } = await supabase
      .from('user_practice_projects')
      .select('id, daily_target, practices(name)')
      .eq('user_id', USER_ID);

    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      for (const project of userProjects) {
        // Random practice completion (60-90% of daily target)
        const completionRate = 0.6 + Math.random() * 0.3;
        const count = Math.floor(project.daily_target * completionRate);

        const { data: existingRecord } = await supabase
          .from('daily_records')
          .select('id')
          .eq('user_id', USER_ID)
          .eq('practice_project_id', project.id)
          .eq('record_date', dateStr)
          .single();

        if (!existingRecord && count > 0) {
          await supabase
            .from('daily_records')
            .insert({
              user_id: USER_ID,
              practice_project_id: project.id,
              record_date: dateStr,
              count: count
            });
        }
      }
    }

    // 6. Create some meditation records
    console.log('\n🧘 Creating sample meditation records...');
    const meditationPractice = practices.find(p => p.name === '禅修');
    if (meditationPractice) {
      for (let session = 1; session <= 5; session++) {
        const date = new Date(today);
        date.setDate(date.getDate() - session);
        const dateStr = date.toISOString().split('T')[0];

        const { data: existingMeditation } = await supabase
          .from('meditation_records')
          .select('id')
          .eq('user_id', USER_ID)
          .eq('session_number', session)
          .single();

        if (!existingMeditation) {
          await supabase
            .from('meditation_records')
            .insert({
              user_id: USER_ID,
              practice_id: meditationPractice.id,
              record_date: dateStr,
              session_number: session,
              duration_minutes: 20 + Math.floor(Math.random() * 20),
              session_attempt: 1,
              method: '前行观修'
            });
        }
      }
    }

    // 7. Create some study records
    console.log('\n📚 Creating sample study records...');
    const { data: courses } = await supabase
      .from('courses')
      .select('id, name')
      .limit(1);

    if (courses.length > 0) {
      const { data: lessons } = await supabase
        .from('course_lessons')
        .select('id, lesson_number')
        .eq('course_id', courses[0].id)
        .limit(3);

      for (const lesson of lessons) {
        const date = new Date(today);
        date.setDate(date.getDate() - lesson.lesson_number);
        const dateStr = date.toISOString().split('T')[0];

        const { data: existingStudy } = await supabase
          .from('study_records')
          .select('id')
          .eq('user_id', USER_ID)
          .eq('lesson_id', lesson.id)
          .single();

        if (!existingStudy) {
          await supabase
            .from('study_records')
            .insert({
              user_id: USER_ID,
              course_id: courses[0].id,
              lesson_id: lesson.id,
              study_date: dateStr,
              study_count_for_lesson: 1
            });
        }
      }
    }

    // 8. Create some mindfulness records
    console.log('\n💭 Creating sample mindfulness records...');
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Add 1-3 mindfulness records per day
      const recordsPerDay = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < recordsPerDay; j++) {
        const hour = 8 + Math.floor(Math.random() * 12);
        const minute = Math.floor(Math.random() * 60);
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

        await supabase
          .from('mindfulness_records')
          .insert({
            user_id: USER_ID,
            record_date: dateStr,
            record_time: timeStr,
            mind_type: Math.random() > 0.3 ? 'good' : 'bad',
            description: Math.random() > 0.5 ? '今日心情平静，念诵时专注' : '心有杂念，需要继续努力'
          });
      }
    }

    console.log('\n🎉 Database population completed successfully!');
    
    // Verify the data
    console.log('\n📊 Verification summary:');
    const { data: finalProjects } = await supabase
      .from('user_practice_projects')
      .select('practices(name), daily_target, current_count')
      .eq('user_id', USER_ID);

    console.log(`✅ User has ${finalProjects.length} practice projects:`);
    finalProjects.forEach(project => {
      console.log(`  • ${project.practices.name}: ${project.current_count}/${project.daily_target}`);
    });

  } catch (error) {
    console.error('❌ Database population failed:', error);
  }
}

// Run the population
populateDatabase().then(() => {
  console.log('\n✨ Database population script completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Population script failed:', error);
  process.exit(1);
});
