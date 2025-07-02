import { supabase, testConnection } from './supabase';
import { 
  User, 
  Theme, 
  Practice, 
  Course, 
  UserPracticeProject,
  DailyRecord,
  MeditationRecord,
  StudyRecord,
  MindfulnessRecord 
} from '@/types/database';

// Get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// User operations
export const createUser = async (userData: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Theme operations
export const getThemes = async () => {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('created_at');

  if (error) throw error;
  return data;
};

// Practice operations
export const getPractices = async () => {
  const { data, error } = await supabase
    .from('practices')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

// Course operations
export const getCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

// User practice projects
export const getUserPracticeProjects = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_practice_projects')
    .select(`
      *,
      practices:practice_id (name, type, unit),
      themes:theme_id (name, type)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createPracticeProject = async (projectData: Partial<UserPracticeProject>) => {
  const { data, error } = await supabase
    .from('user_practice_projects')
    .insert(projectData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Daily records
export const createDailyRecord = async (recordData: Partial<DailyRecord>) => {
  const { data, error } = await supabase
    .from('daily_records')
    .insert(recordData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTodayRecords = async (userId: string, date: string) => {
  const { data, error } = await supabase
    .from('daily_records')
    .select(`
      *,
      user_practice_projects:practice_project_id (
        *,
        practices:practice_id (name, type, unit)
      )
    `)
    .eq('user_id', userId)
    .eq('record_date', date);

  if (error) throw error;
  return data;
};

// Meditation records
export const createMeditationRecord = async (recordData: Partial<MeditationRecord>) => {
  const { data, error } = await supabase
    .from('meditation_records')
    .insert(recordData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Study records
export const createStudyRecord = async (recordData: Partial<StudyRecord>) => {
  const { data, error } = await supabase
    .from('study_records')
    .insert(recordData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Mindfulness records
export const createMindfulnessRecord = async (recordData: Partial<MindfulnessRecord>) => {
  const { data, error } = await supabase
    .from('mindfulness_records')
    .insert(recordData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTodayMindfulnessRecords = async (userId: string, date: string) => {
  const { data, error } = await supabase
    .from('mindfulness_records')
    .select('*')
    .eq('user_id', userId)
    .eq('record_date', date);

  if (error) throw error;
  return data;
};

// Re-export test function
export { testConnection };