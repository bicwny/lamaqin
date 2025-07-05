
import { supabase } from './supabase';

export interface TopicProgress {
  id: string;
  topic_number: number;
  weekly_target_sessions: number;
  current_week_sessions: number;
  current_week_start_date: string;
  total_completed_weeks: number;
  is_current_week_complete: boolean;
  last_session_date: string | null;
}

export interface TopicProgressSummary {
  totalTopics: number;
  completedTopicsThisWeek: number;
  inProgressTopics: number;
  currentWeekProgress: string;
  nextIncompleteTopicNumber: number | null;
}

/**
 * Get current week start date (Monday)
 */
export function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

/**
 * Get topic progress for a practice project
 */
export async function getTopicProgress(
  userId: string, 
  projectId: string
): Promise<TopicProgress[]> {
  const { data, error } = await supabase
    .from('user_practice_topic_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('practice_project_id', projectId)
    .order('topic_number');

  if (error) {
    console.error('Error fetching topic progress:', error);
    return [];
  }

  return data || [];
}

/**
 * Get topic progress summary for display
 */
export async function getTopicProgressSummary(
  userId: string,
  projectId: string
): Promise<TopicProgressSummary> {
  const progress = await getTopicProgress(userId, projectId);
  
  const completedTopicsThisWeek = progress.filter(p => p.is_current_week_complete).length;
  const inProgressTopics = progress.filter(p => 
    p.current_week_sessions > 0 && !p.is_current_week_complete
  ).length;

  const nextIncompleteTopicNumber = progress.find(p => 
    !p.is_current_week_complete
  )?.topic_number || null;

  const currentWeekProgress = progress
    .filter(p => p.current_week_sessions > 0)
    .map(p => `第${p.topic_number}个法门: ${p.current_week_sessions}/${p.weekly_target_sessions}座`)
    .join('; ');

  return {
    totalTopics: 92,
    completedTopicsThisWeek,
    inProgressTopics,
    currentWeekProgress,
    nextIncompleteTopicNumber,
  };
}

/**
 * Record a meditation session for a specific topic
 */
export async function recordTopicSession(
  userId: string,
  projectId: string,
  practiceId: string,
  topicNumber: number,
  durationMinutes: number,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentWeekStart = getCurrentWeekStart();
    
    // Insert meditation record
    const { error: meditationError } = await supabase
      .from('meditation_records')
      .insert({
        user_id: userId,
        practice_id: practiceId,
        record_date: new Date().toISOString().split('T')[0],
        duration_minutes: durationMinutes,
        topic_number: topicNumber,
        week_start_date: currentWeekStart,
        reflection: notes,
      });

    if (meditationError) throw meditationError;

    // Update topic progress
    const { data: currentProgress } = await supabase
      .from('user_practice_topic_progress')
      .select('*')
      .eq('practice_project_id', projectId)
      .eq('topic_number', topicNumber)
      .single();

    if (currentProgress) {
      const newSessionCount = currentProgress.current_week_sessions + 1;
      const isComplete = newSessionCount >= currentProgress.weekly_target_sessions;

      const { error: updateError } = await supabase
        .from('user_practice_topic_progress')
        .update({
          current_week_sessions: newSessionCount,
          is_current_week_complete: isComplete,
          last_session_date: new Date().toISOString().split('T')[0],
          total_completed_weeks: isComplete && !currentProgress.is_current_week_complete 
            ? currentProgress.total_completed_weeks + 1 
            : currentProgress.total_completed_weeks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentProgress.id);

      if (updateError) throw updateError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error recording topic session:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reset weekly progress for all topics (called weekly)
 */
export async function resetWeeklyProgress(
  userId: string,
  projectId: string
): Promise<void> {
  const currentWeekStart = getCurrentWeekStart();
  
  const { error } = await supabase
    .from('user_practice_topic_progress')
    .update({
      current_week_sessions: 0,
      is_current_week_complete: false,
      current_week_start_date: currentWeekStart,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('practice_project_id', projectId);

  if (error) {
    console.error('Error resetting weekly progress:', error);
    throw error;
  }
}
