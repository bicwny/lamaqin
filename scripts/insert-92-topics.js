
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const topics = [
  { number: 1, title: '思维闲暇之本体' },
  { number: 2, title: '思维差别之圆满' },
  { number: 3, title: '思维恶趣之险地' },
  { number: 4, title: '思维难得之比喻' },
  { number: 5, title: '思维次第之数目' },
  { number: 6, title: '思维无义而空耗' },
  { number: 7, title: '思维因缘与缘起' },
  { number: 8, title: '思维生死之流转' },
  { number: 9, title: '思维暇满之赞颂' },
  { number: 10, title: '思维当生欢喜心' },
  { number: 11, title: '观蕴身而修无常' },
  { number: 12, title: '观世间尊主而修无常' },
  { number: 13, title: '观器情成坏而修无常' },
  { number: 14, title: '观诸佛圣士而修无常' },
  { number: 15, title: '观死亡不定而修无常' },
  { number: 16, title: '观有为法自性而修无常' },
  { number: 17, title: '观骤然死缘而修无常' },
  { number: 18, title: '观独自离世而修无常' },
  { number: 19, title: '观时代士夫而修无常' },
  { number: 20, title: '观无可信赖而修无常' },
  { number: 21, title: '观外缘不定而修无常' },
  { number: 22, title: '观励力希求而修无常' },
  { number: 23, title: '总说生起厌离心' },
  { number: 24, title: '八热地狱之苦' },
  { number: 25, title: '近边地狱之苦' },
  { number: 26, title: '八寒地狱之苦' },
  { number: 27, title: '孤独地狱之苦' },
  { number: 28, title: '饿鬼之苦' },
  { number: 29, title: '旁生之苦' },
  { number: 30, title: '根本苦' },
  { number: 31, title: '生苦' },
  { number: 32, title: '老苦' },
  { number: 33, title: '病苦' },
  { number: 34, title: '死苦' },
  { number: 35, title: '其余分支苦' },
  { number: 36, title: '非天之苦' },
  { number: 37, title: '天人之苦' },
  { number: 38, title: '推理今生来世' },
  { number: 39, title: '身不善业' },
  { number: 40, title: '语不善业' },
  { number: 41, title: '意不善业' },
  { number: 42, title: '身善业' },
  { number: 43, title: '语善业' },
  { number: 44, title: '意善业' },
  { number: 45, title: '随解脱分善' },
  { number: 46, title: '思维一切皆为业之自性' },
  { number: 47, title: '思维差别' },
  { number: 48, title: '共同法相' },
  { number: 49, title: '不共法相' },
  { number: 50, title: '第一次第赞颂' },
  { number: 51, title: '第二次第赞颂' },
  { number: 52, title: '第三次第赞颂' },
  { number: 53, title: '平时之瑜伽' },
  { number: 54, title: '修四事业之次第' },
  { number: 55, title: '遣除病魔之赎死法' },
  { number: 56, title: '皈依分类' },
  { number: 57, title: '思维功德' },
  { number: 58, title: '皈依方法' },
  { number: 59, title: '思维功德生起欢喜' },
  { number: 60, title: '修舍无量心' },
  { number: 61, title: '修慈无量心' },
  { number: 62, title: '修悲无量心' },
  { number: 63, title: '修喜无量心' },
  { number: 64, title: '修炼' },
  { number: 65, title: '思维利益' },
  { number: 66, title: '顶礼支' },
  { number: 67, title: '供养支' },
  { number: 68, title: '忏悔支' },
  { number: 69, title: '随喜支' },
  { number: 70, title: '请转法轮支' },
  { number: 71, title: '请不涅槃支' },
  { number: 72, title: '回向支' },
  { number: 73, title: '正行' },
  { number: 74, title: '修自他平等菩提心' },
  { number: 75, title: '修自他相换菩提心' },
  { number: 76, title: '修自轻他重菩提心' },
  { number: 77, title: '布施度' },
  { number: 78, title: '本体' },
  { number: 79, title: '清净行境' },
  { number: 80, title: '观修大士八大发心' },
  { number: 81, title: '有缘之安忍' },
  { number: 82, title: '无缘之安忍' },
  { number: 83, title: '精进度' },
  { number: 84, title: '思维变化无常之自性' },
  { number: 85, title: '思维贪欲之过患' },
  { number: 86, title: '思维与凡夫交往之过患' },
  { number: 87, title: '思维愦闹之过患' },
  { number: 88, title: '思维静处功德' },
  { number: 89, title: '真实修持静虑' },
  { number: 90, title: '显现观为幻化八喻' },
  { number: 91, title: '观察法性空性' },
  { number: 92, title: '安住于离边中观之义中' }
];

async function insertTopics() {
  try {
    console.log('🔍 Finding 前行观修 practice...');
    
    // Find the practice ID for 前行观修
    const { data: practice, error: practiceError } = await supabase
      .from('practices')
      .select('id')
      .or('name.ilike.%前行%,name.ilike.%观修%')
      .limit(1)
      .single();

    if (practiceError) {
      console.error('❌ Error finding practice:', practiceError);
      return;
    }

    if (!practice) {
      console.log('⚠️ No meditation practice found, creating one...');
      const { data: newPractice, error: createError } = await supabase
        .from('practices')
        .insert({
          name: '前行观修',
          type: 'time',
          unit: '座',
          description: '前行实修法92座观修'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating practice:', createError);
        return;
      }
      practice.id = newPractice.id;
    }

    console.log('📋 Found practice ID:', practice.id);

    // Clear existing topics if table exists
    const { error: deleteError } = await supabase
      .from('meditation_topics')
      .delete()
      .eq('practice_id', practice.id);

    if (deleteError && deleteError.code !== '42P01') {
      console.error('❌ Error clearing existing topics:', deleteError);
      return;
    } else if (deleteError && deleteError.code === '42P01') {
      console.log('⚠️ Table meditation_topics does not exist. Please create it first in Supabase dashboard.');
      console.log('📋 Run the SQL in scripts/create-meditation-topics-manual.sql in your Supabase SQL Editor');
      return;
    } else {
      console.log('✅ Cleared existing topics');
    }

    // Insert new topics
    const topicsToInsert = topics.map(topic => ({
      practice_id: practice.id,
      topic_number: topic.number,
      title: topic.title,
      description: `第${topic.number}修法：${topic.title}`
    }));

    const { error: insertError } = await supabase
      .from('meditation_topics')
      .insert(topicsToInsert);

    if (insertError) {
      console.error('❌ Error inserting topics:', insertError);
    } else {
      console.log('✅ Successfully inserted all 92 meditation topics!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

insertTopics();
