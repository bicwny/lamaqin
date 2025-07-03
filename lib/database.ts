
import { supabase, testConnection } from './supabase';
import { Database } from '@/types/database';

// Re-export testConnection for convenience
export { testConnection };

// Legacy function exports for backward compatibility
export async function getUserPracticeProjects(userId: string) {
  return await practiceService.getUserPracticeProjects(userId);
}

export async function getTodayRecords(userId: string, date: string) {
  return await dailyRecordService.getTodayRecords(userId, date);
}

export async function createDailyRecord(record: Omit<DailyRecord, 'id' | 'created_at'>) {
  return await dailyRecordService.recordPractice(record);
}

export type User = Database['public']['Tables']['users']['Row'];
export type Theme = Database['public']['Tables']['themes']['Row'];
export type Practice = Database['public']['Tables']['practices']['Row'];
export type UserPracticeProject = Database['public']['Tables']['user_practice_projects']['Row'];
export type DailyRecord = Database['public']['Tables']['daily_records']['Row'];
export type MeditationRecord = Database['public']['Tables']['meditation_records']['Row'];
export type StudyRecord = Database['public']['Tables']['study_records']['Row'];
export type MindfulnessRecord = Database['public']['Tables']['mindfulness_records']['Row'];

// User Management
export const userService = {
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createProfile(userId: string, profile: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({ id: userId, ...profile })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Practice Management
export const practiceService = {
  async getAllThemes(): Promise<Theme[]> {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('created_at');
    
    if (error) throw error;
    return data || [];
  },

  async getAllPractices(): Promise<Practice[]> {
    const { data, error } = await supabase
      .from('practices')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getUserPracticeProjects(userId: string) {
    const { data, error } = await supabase
      .from('user_practice_projects')
      .select(`
        *,
        practices(*)
      `)
      .eq('user_id', userId)
      .order('created_at');
    
    if (error) throw error;
    return data || [];
  },

  async createPracticeProject(project: Omit<UserPracticeProject, 'id' | 'created_at' | 'updated_at'>): Promise<UserPracticeProject> {
    const { data, error } = await supabase
      .from('user_practice_projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updatePracticeProject(id: string, updates: Partial<UserPracticeProject>): Promise<UserPracticeProject> {
    const { data, error } = await supabase
      .from('user_practice_projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Daily Records
export const dailyRecordService = {
  async getTodayRecords(userId: string, date: string): Promise<DailyRecord[]> {
    const { data, error } = await supabase
      .from('daily_records')
      .select(`
        *,
        practice_project:user_practice_projects(
          *,
          practice:practices(*)
        )
      `)
      .eq('user_id', userId)
      .eq('record_date', date);
    
    if (error) throw error;
    return data || [];
  },

  async recordPractice(record: Omit<DailyRecord, 'id' | 'created_at'>): Promise<DailyRecord> {
    const { data, error } = await supabase
      .from('daily_records')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update practice project progress
    await practiceService.updatePracticeProject(record.practice_project_id, {
      current_count: data.count // This should be cumulative - need to handle properly
    });
    
    return data;
  }
};

// Meditation Records
export const meditationService = {
  async getMeditationRecords(userId: string, startDate?: string, endDate?: string): Promise<MeditationRecord[]> {
    let query = supabase
      .from('meditation_records')
      .select('*')
      .eq('user_id', userId);
    
    if (startDate) query = query.gte('record_date', startDate);
    if (endDate) query = query.lte('record_date', endDate);
    
    const { data, error } = await query.order('record_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async recordMeditation(record: Omit<MeditationRecord, 'id' | 'created_at'>): Promise<MeditationRecord> {
    const { data, error } = await supabase
      .from('meditation_records')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getMeditationProgress(userId: string): Promise<{ completedSessions: number; totalSessions: number }> {
    const { data, error } = await supabase
      .from('meditation_records')
      .select('session_number')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    const uniqueSessions = new Set(data?.map(r => r.session_number) || []);
    return {
      completedSessions: uniqueSessions.size,
      totalSessions: 92
    };
  }
};

// Study Records
export const studyService = {
  async getCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getUserStudyProgress(userId: string) {
    const { data, error } = await supabase
      .from('study_records')
      .select(`
        *,
        course:courses(*),
        lesson:course_lessons(*)
      `)
      .eq('user_id', userId)
      .order('study_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async recordStudy(record: Omit<StudyRecord, 'id' | 'created_at'>): Promise<StudyRecord> {
    // First, try to find or create the lesson
    let lessonId = record.lesson_id;
    
    // If it's a simple format like "courseId-lesson-number", try to find the actual lesson
    if (lessonId.includes('-lesson-')) {
      const [courseId, , lessonNumber] = lessonId.split('-');
      
      // Try to find the actual lesson in course_lessons table
      const { data: existingLesson } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('course_id', courseId)
        .eq('lesson_number', parseInt(lessonNumber))
        .single();
      
      if (existingLesson) {
        lessonId = existingLesson.id;
      } else {
        // Create a new lesson record if it doesn't exist
        const { data: newLesson } = await supabase
          .from('course_lessons')
          .insert({
            course_id: courseId,
            lesson_number: parseInt(lessonNumber),
            title: `第${lessonNumber}课`,
            content_summary: ''
          })
          .select('id')
          .single();
        
        if (newLesson) {
          lessonId = newLesson.id;
        }
      }
    }

    const { data, error } = await supabase
      .from('study_records')
      .insert({
        ...record,
        lesson_id: lessonId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserCourses(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_courses')
        .select(`
          *,
          courses!inner(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('joined_date');
      
      if (error) {
        console.error('❌ Error getting user courses:', error);
        // Return empty array if table doesn't exist
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          return [];
        }
        throw error;
      }
      
      // Transform the data to match expected structure
      return data?.map(userCourse => ({
        ...userCourse,
        course: userCourse.courses
      })) || [];
    } catch (err) {
      console.error('❌ getUserCourses failed:', err);
      return [];
    }
  },

  async joinCourse(userId: string, courseId: string) {
    try {
      // First insert the user course record
      const { data: userCourseData, error: insertError } = await supabase
        .from('user_courses')
        .insert({
          user_id: userId,
          course_id: courseId,
          status: 'active',
          joined_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error inserting user course:', insertError);
        throw insertError;
      }
      
      // Then fetch the course data separately
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (courseError) {
        console.error('❌ Error fetching course data:', courseError);
        throw courseError;
      }
      
      return {
        ...userCourseData,
        course: courseData
      };
    } catch (err) {
      console.error('❌ joinCourse failed:', err);
      throw err;
    }
  },

  async calculateProgress(userId: string, courseId: string) {
    // Get total lessons for the course
    const { data: course } = await supabase
      .from('courses')
      .select('total_lessons')
      .eq('id', courseId)
      .single();

    if (!course) return 0;

    // Get unique lessons studied by user
    const { data: studiedLessons } = await supabase
      .from('study_records')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('course_id', courseId);

    const uniqueLessons = new Set(studiedLessons?.map(r => r.lesson_id) || []);
    const progress = (uniqueLessons.size / course.total_lessons) * 100;

    // Update progress in user_courses
    await supabase
      .from('user_courses')
      .update({
        progress_percentage: Math.round(progress * 100) / 100,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);

    return progress;
  }
};

// Mindfulness Records
export const mindfulnessService = {
  async getTodayRecords(userId: string, date: string): Promise<MindfulnessRecord[]> {
    const { data, error } = await supabase
      .from('mindfulness_records')
      .select('*')
      .eq('user_id', userId)
      .eq('record_date', date)
      .order('record_time');
    
    if (error) throw error;
    return data || [];
  },

  async recordMindfulness(record: Omit<MindfulnessRecord, 'id' | 'created_at'>): Promise<MindfulnessRecord> {
    const { data, error } = await supabase
      .from('mindfulness_records')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getWeeklyStats(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('mindfulness_records')
      .select('record_date, mind_type')
      .eq('user_id', userId)
      .gte('record_date', startDate)
      .lte('record_date', endDate);
    
    if (error) throw error;
    return data || [];
  }
};

// Statistics
export const statsService = {
  async getDashboardStats(userId: string) {
    // This would be a complex aggregation query
    // For now, return mock data structure
    return {
      practiceProgress: {},
      studyProgress: {},
      mindfulnessStats: {},
      achievements: []
    };
  }
};
