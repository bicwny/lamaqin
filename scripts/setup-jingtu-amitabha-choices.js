const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const JINGTU_CLASS_NAME = '预科：净土';

const AMITABHA_PRACTICES = [
  {
    name: '阿弥陀佛名号（汉）',
    type: 'count',
    unit: '遍',
    description: '汉语念诵阿弥陀佛名号 - 每日5000遍，总目标6350000遍',
    daily_target: 5000,
    total_target: 6350000,
    display_order: 1
  },
  {
    name: '阿弥陀佛圣号（藏）',
    type: 'count',
    unit: '遍',
    description: '藏语念诵阿弥陀佛圣号 - 每日900遍，总目标1143000遍',
    daily_target: 900,
    total_target: 1143000,
    display_order: 2
  },
  {
    name: '阿弥陀佛（汉）',
    type: 'count',
    unit: '遍',
    description: '简短汉语念诵阿弥陀佛 - 每日7500遍，总目标9525000遍',
    daily_target: 7500,
    total_target: 9525000,
    display_order: 3
  }
];

async function setupJingtuAmitabhaChoices() {
  try {
    console.log('🙏 Setting up 预科：净土 Amitabha recitation choices...\n');

    console.log('Step 1: Getting 预科：净土 class ID...');
    const { data: classData, error: classError } = await supabase
      .from('class_curricula')
      .select('id, class_name')
      .eq('class_name', JINGTU_CLASS_NAME)
      .single();

    if (classError || !classData) {
      console.error('❌ Error finding class:', classError?.message || 'Class not found');
      console.log('Available classes:');
      const { data: allClasses } = await supabase
        .from('class_curricula')
        .select('id, class_name');
      allClasses?.forEach(c => console.log(`  - ${c.class_name} (${c.id})`));
      return;
    }

    console.log(`✅ Found class: ${classData.class_name} (${classData.id})\n`);
    const classId = classData.id;

    console.log('Step 2: Creating/updating Amitabha practices...');
    const practiceIds = [];

    for (const practice of AMITABHA_PRACTICES) {
      const { data: existingPractice } = await supabase
        .from('practices')
        .select('id, name')
        .eq('name', practice.name)
        .single();

      let practiceId;
      if (existingPractice) {
        console.log(`  ⏭️  Practice "${practice.name}" already exists (${existingPractice.id})`);
        practiceId = existingPractice.id;
      } else {
        const { data: newPractice, error: insertError } = await supabase
          .from('practices')
          .insert({
            name: practice.name,
            type: practice.type,
            unit: practice.unit,
            description: practice.description
          })
          .select()
          .single();

        if (insertError) {
          console.error(`  ❌ Error creating practice "${practice.name}":`, insertError.message);
          continue;
        }
        console.log(`  ✅ Created practice "${practice.name}" (${newPractice.id})`);
        practiceId = newPractice.id;
      }

      practiceIds.push({
        ...practice,
        id: practiceId
      });
    }

    console.log('\nStep 3: Adding practices to class with optional choice group...');

    for (const practice of practiceIds) {
      const { data: existingLink } = await supabase
        .from('class_required_practices')
        .select('id')
        .eq('class_id', classId)
        .eq('practice_id', practice.id)
        .single();

      if (existingLink) {
        const { error: updateError } = await supabase
          .from('class_required_practices')
          .update({
            choice_group: 'amitabha_recitation',
            is_optional: true,
            total_target: practice.total_target,
            daily_target: practice.daily_target,
            practice_category: 'count'
          })
          .eq('id', existingLink.id);

        if (updateError) {
          console.error(`  ❌ Error updating link for "${practice.name}":`, updateError.message);
        } else {
          console.log(`  ✅ Updated "${practice.name}" as optional choice`);
        }
      } else {
        const { error: insertError } = await supabase
          .from('class_required_practices')
          .insert({
            class_id: classId,
            practice_id: practice.id,
            choice_group: 'amitabha_recitation',
            is_optional: true,
            total_target: practice.total_target,
            daily_target: practice.daily_target,
            practice_category: 'count'
          });

        if (insertError) {
          console.error(`  ❌ Error linking "${practice.name}":`, insertError.message);
        } else {
          console.log(`  ✅ Linked "${practice.name}" as optional choice`);
        }
      }
    }

    console.log('\nStep 4: Verifying configuration...');
    const { data: verification, error: verifyError } = await supabase
      .from('class_required_practices')
      .select(`
        id,
        choice_group,
        is_optional,
        daily_target,
        total_target,
        practice:practices(name)
      `)
      .eq('class_id', classId)
      .eq('is_optional', true);

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError.message);
      return;
    }

    console.log('\n📋 Optional practices configured for 预科：净土:');
    console.log('─'.repeat(80));
    console.log('| Practice Name                  | Daily Target | Total Target    | Choice Group        |');
    console.log('─'.repeat(80));
    
    verification?.forEach(item => {
      const name = (item.practice?.name || 'Unknown').padEnd(30);
      const daily = String(item.daily_target || '-').padEnd(12);
      const total = String(item.total_target || '-').padEnd(15);
      const group = (item.choice_group || '-').padEnd(19);
      console.log(`| ${name} | ${daily} | ${total} | ${group} |`);
    });
    
    console.log('─'.repeat(80));

    console.log('\n✅ Setup complete! Users enrolling in 预科：净土 will now see the recitation choice.');
    console.log('   They must select at least one of the three Amitabha recitation options.\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setupJingtuAmitabhaChoices();
