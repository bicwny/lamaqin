import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://clqjuugskotxxngownvj.supabase.co';
const supabaseKey = 'sb_publishable_rCVN8zGi53mErpF8D56U4w_vNtfVR3q';

const supabase = createClient(supabaseUrl, supabaseKey);

// All 87 lessons organized by volume
const lessons = [
  // 第一册
  { number: 1, title: '第一册：关于慈善的思考' },
  { number: 2, title: '第一册：放生利众勤修佛法' },
  { number: 3, title: '第一册：真正的"财富"' },
  { number: 4, title: '第一册：佛教空性观' },
  { number: 5, title: '第一册：藏文化的修心养生观' },
  { number: 6, title: '第一册：信仰与人生' },
  // 第二册
  { number: 7, title: '第二册：佛教眼中的神秘' },
  { number: 8, title: '第二册：红尘苦海有爱共渡' },
  { number: 9, title: '第二册：佛教眼中的物质世界' },
  { number: 10, title: '第二册：上海复旦大学国学社问答' },
  { number: 11, title: '第二册：如何做到真正的随喜' },
  // 第三册
  { number: 12, title: '第三册：世界并非你看到的那样' },
  { number: 13, title: '第三册：如何面对痛苦' },
  { number: 14, title: '第三册：佛教如何看待风水起卦' },
  { number: 15, title: '第三册：浅谈佛教无神论' },
  { number: 16, title: '第三册：北大国学社问答' },
  // 第四册
  { number: 17, title: '第四册：前世今生论' },
  { number: 18, title: '第四册：幸福的根本是心' },
  { number: 19, title: '第四册：佛教的真理观' },
  { number: 20, title: '第四册：佛教与慈善' },
  { number: 21, title: '第四册：修心与积福' },
  { number: 22, title: '第四册：宗教信仰——超越科学的大科学' },
  // 第五册
  { number: 23, title: '第五册：心的本性是光明' },
  { number: 24, title: '第五册：佛教的人生观' },
  { number: 25, title: '第五册：做才是得到' },
  { number: 26, title: '第五册：压力与释放' },
  { number: 27, title: '第五册：深信因果才能远离灾难' },
  { number: 28, title: '第五册：佛教与人生' },
  // 第六册
  { number: 29, title: '第六册：佛法——心灵的甘露' },
  { number: 30, title: '第六册：生命中最重要的一件事' },
  { number: 31, title: '第六册：真正的慈善' },
  { number: 32, title: '第六册：浅谈藏传佛教的三大教派' },
  { number: 33, title: '第六册：宗教多元与文明对话' },
  // 第七册
  { number: 34, title: '第七册：佛教与生活' },
  { number: 35, title: '第七册：佛教眼中的物质' },
  { number: 36, title: '第七册：轮回之苦' },
  { number: 37, title: '第七册：如何面对绝症' },
  { number: 38, title: '第七册：佛教的真理——缘起性空' },
  { number: 39, title: '第七册：问佛陀情为何物' },
  // 第八册
  { number: 40, title: '第八册：走近藏传佛教' },
  { number: 41, title: '第八册：因果规律与佛教道德' },
  { number: 42, title: '第八册：藏传佛教的发展及其哲学意义' },
  { number: 43, title: '第八册：密宗文化与现代社会' },
  { number: 44, title: '第八册：佛教的伦理价值' },
  // 第九册
  { number: 45, title: '第九册：学佛的最大障碍' },
  { number: 46, title: '第九册：科学怎样成为幸福的因' },
  { number: 47, title: '第九册：为什么学佛' },
  { number: 48, title: '第九册：人品善良——性格开朗——心灵高尚' },
  { number: 49, title: '第九册：你从哪里来——生从何来死往何去' },
  { number: 50, title: '第九册：佛教的死亡观' },
  // 第十册
  { number: 51, title: '第十册：怎样变成有福报的人' },
  { number: 52, title: '第十册：怎样面对痛苦' },
  { number: 53, title: '第十册：藏传佛教的现代意义' },
  { number: 54, title: '第十册：密宗的智慧与方便' },
  { number: 55, title: '第十册：藏文化的保护和现代化' },
  // 第十一册
  { number: 56, title: '第十一册：藏传佛教的特点和修行次第' },
  { number: 57, title: '第十一册：漫谈佛教无常观' },
  { number: 58, title: '第十一册：佛教是迷信还是智信' },
  { number: 59, title: '第十一册：谈佛教的无我观' },
  // 第十二册
  { number: 60, title: '第十二册：快乐与痛苦的真相' },
  { number: 61, title: '第十二册：如何善待我们的心灵' },
  { number: 62, title: '第十二册：心之源泉' },
  { number: 63, title: '第十二册：和谐拯救危机' },
  { number: 64, title: '第十二册：藏传佛教引导现代心灵的价值' },
  { number: 65, title: '第十二册：佛教的无常观对现代人有哪些现实意义' },
  // 第十三册
  { number: 66, title: '第十三册：信仰的力量' },
  { number: 67, title: '第十三册：佛教的慈悲观' },
  { number: 68, title: '第十三册：佛教与时代的沟通' },
  { number: 69, title: '第十三册：佛教是世界和平的保证' },
  { number: 70, title: '第十三册：宗教与科学是冲突的吗' },
  // 第十四册
  { number: 71, title: '第十四册：如何面对幸福与痛苦' },
  { number: 72, title: '第十四册：信仰佛教一定要皈依吗' },
  { number: 73, title: '第十四册：国学与佛学' },
  { number: 74, title: '第十四册：佛教的幸福观' },
  // 第十五册
  { number: 75, title: '第十五册：佛教四谛概说' },
  { number: 76, title: '第十五册：藏传佛教的学修体系' },
  { number: 77, title: '第十五册：什么才是迷信' },
  { number: 78, title: '第十五册：当佛教的四谛遇到量子物理' },
  { number: 79, title: '第十五册：佛教的福报观——谁偷走了我的福报' },
  // 第十六册
  { number: 80, title: '第十六册：佛教的无神论、环保观及幸福观' },
  { number: 81, title: '第十六册：敦煌及藏传佛教、无神论、无我观' },
  { number: 82, title: '第十六册：佛教在当今社会中如何存在' },
  // 第十七册
  { number: 83, title: '第十七册：佛教的幸福观' },
  { number: 84, title: '第十七册：藏传佛教的特点及学修方法' },
  { number: 85, title: '第十七册：金刚上师与灌顶' },
  // 第十八册
  { number: 86, title: '第十八册：心性的奥秘' },
  { number: 87, title: '第十八册：佛教的人生观、幸福观及其思想' }
];

async function createDaxueCourse() {
  try {
    console.log('🔍 Creating 大学演讲 course on Supabase...\n');
    
    // Create the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        name: '大学演讲',
        teacher: '索达吉堪布著',
        total_lessons: 87,
        description: '索达吉堪布在世界各大高等学府的演讲合集，共18册87个主题'
      })
      .select()
      .single();
    
    if (courseError) {
      console.error('❌ Error creating course:', courseError);
      return;
    }
    
    console.log(`✅ Created course: ${course.name} (ID: ${course.id})\n`);
    
    // Create all 87 lessons
    console.log('📚 Creating 87 lessons...');
    
    const lessonData = lessons.map(lesson => ({
      course_id: course.id,
      lesson_number: lesson.number,
      title: lesson.title
    }));
    
    const { error: lessonsError } = await supabase
      .from('course_lessons')
      .insert(lessonData);
    
    if (lessonsError) {
      console.error('❌ Error creating lessons:', lessonsError);
      return;
    }
    
    console.log(`✅ Created ${lessons.length} lessons\n`);
    
    // Link to four classes
    const targetClasses = [
      '预科：基础',
      '预科：入行',
      '预科：净土',
      '预科：加行'
    ];
    
    // Get all classes
    const { data: classes, error: classError } = await supabase
      .from('class_curricula')
      .select('id, class_name');
    
    if (classError) {
      console.error('❌ Error fetching classes:', classError);
      return;
    }
    
    console.log('🔗 Linking course to classes...');
    
    for (const className of targetClasses) {
      const classData = classes?.find(c => c.class_name === className);
      
      if (!classData) {
        console.log(`⚠️  Class "${className}" not found`);
        continue;
      }
      
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
    
    console.log('\n🎉 Successfully created 大学演讲 course with 87 lessons and linked to 4 classes!');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

createDaxueCourse();
