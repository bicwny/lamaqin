import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const practiceId = '5113293b-bb1a-4917-9235-945129992c3b';
const classId = '7651135b-1fd4-4492-a59b-6ffacb2ad1af';

function generateUUID(): string {
  return crypto.randomUUID();
}

async function makePracticeMandatory() {
  try {
    console.log('🔄 Updating practice to mandatory...');
    console.log(`Practice ID: ${practiceId}`);
    console.log(`Class ID: ${classId}`);

    // First, try to find existing record
    const { data: existingData, error: fetchError } = await supabase
      .from('class_required_practices')
      .select()
      .eq('practice_id', practiceId)
      .eq('class_id', classId);

    if (fetchError) {
      console.error('❌ Error querying practice:', fetchError);
      process.exit(1);
    }

    if (existingData && existingData.length > 0) {
      // Update existing record
      console.log('📝 Found existing record, updating...');
      const { data, error } = await supabase
        .from('class_required_practices')
        .update({ is_required: true })
        .eq('practice_id', practiceId)
        .eq('class_id', classId)
        .select();

      if (error) {
        console.error('❌ Error updating practice:', error);
        process.exit(1);
      }

      console.log('✅ Successfully updated practice to mandatory');
      console.log('Updated record:', data);
    } else {
      // Create new record
      console.log('🆕 No existing record found, creating new record...');
      const { data, error } = await supabase
        .from('class_required_practices')
        .insert([
          {
            id: generateUUID(),
            class_id: classId,
            practice_id: practiceId,
            is_required: true,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error('❌ Error creating practice record:', error);
        process.exit(1);
      }

      console.log('✅ Successfully created practice as mandatory');
      console.log('Created record:', data);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

makePracticeMandatory();
