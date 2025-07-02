
import { supabase } from '@/lib/supabase';

// Re-export database functions for easier imports
export { 
  createUser,
  getUser,
  getThemes,
  getPractices,
  getCourses,
  getUserPracticeProjects,
  createPracticeProject,
  createDailyRecord,
  getTodayRecords,
  createMeditationRecord,
  createStudyRecord,
  createMindfulnessRecord,
  getTodayMindfulnessRecords
} from '@/lib/database';

// Export supabase client
export { supabase };
