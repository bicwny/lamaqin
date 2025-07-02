
import { supabase, testConnection } from './supabase';
import { Database } from '@/types/database';

// Re-export testConnection for convenience
export { testConnection };

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

  async getUserPracticeProjects(userId: string): Promise<UserPracticeProject[]> {
    const { data, error } = await supabase
      .from('user_practice_projects')
      .select(`
        *,
        theme:themes(*),
        practice:practices(*)
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
    const { data, error } = await supabase
      .from('study_records')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data;
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
