/**
 * One-time script to sync meditation practice current_count with actual record counts
 * Run this once to fix existing data
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncMeditationCounts() {
  console.log('🔄 Starting meditation count sync...');

  // Get all active time-based practice projects
  const { data: projects, error: projectsError } = await supabase
    .from('user_practice_projects')
    .select(`
      id,
      user_id,
      practice_id,
      current_count,
      practices!inner(id, type)
    `)
    .eq('status', 'active')
    .eq('practices.type', 'time');

  if (projectsError) {
    console.error('❌ Error fetching projects:', projectsError);
    return;
  }

  console.log(`📋 Found ${projects?.length || 0} time-based practice projects`);

  for (const project of projects || []) {
    // Count actual meditation records
    const { data: records, error: recordsError } = await supabase
      .from('meditation_records')
      .select('id')
      .eq('user_id', project.user_id)
      .eq('practice_id', project.practice_id);

    if (recordsError) {
      console.error(`❌ Error counting records for project ${project.id}:`, recordsError);
      continue;
    }

    const actualCount = records?.length || 0;
    const storedCount = project.current_count || 0;

    if (actualCount !== storedCount) {
      console.log(`🔧 Syncing project ${project.id}: ${storedCount} → ${actualCount}`);
      
      const { error: updateError } = await supabase
        .from('user_practice_projects')
        .update({ 
          current_count: actualCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (updateError) {
        console.error(`❌ Error updating project ${project.id}:`, updateError);
      } else {
        console.log(`✅ Updated project ${project.id}`);
      }
    } else {
      console.log(`✓ Project ${project.id} already in sync (${actualCount} records)`);
    }
  }

  console.log('✅ Meditation count sync complete!');
}

syncMeditationCounts().catch(console.error);
