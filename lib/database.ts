import { supabase, testConnection } from './supabase';
import type { 
  User, 
  Practice, 
  UserPracticeProject, 
  DailyRecord, 
  MeditationRecord, 
  StudyRecord, 
  MindfulnessRecord 
} from '@/types/database';

// Re-export testConnection for convenience
export { testConnection };

// Re-export types
export type { User, Practice, UserPracticeProject, DailyRecord, MeditationRecord, StudyRecord, MindfulnessRecord };

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

interface PracticeRecord {
  user_id: string;
  project_id: string;
  practice_id: string;
  record_date: string;
  count: number;
  notes?: string;
}

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

export const practiceService = {
  // Record a count-based practice
  async recordCountPractice(record: PracticeRecord) {
    try {
      console.log('🔄 Recording count practice...', record);

      const { data, error } = await supabase
        .from('practice_records')
        .insert(record)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Count practice recorded successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error recording count practice:', error);
      throw error;
    }
  },

  // Get practice records for a project
  async getPracticeRecords(projectId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('practice_records')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .order('record_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching practice records:', error);
      throw error;
    }
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
        practices(
          id,
          name,
          type,
          unit,
          description
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching user practice projects:', error);
      throw error;
    }

    console.log('📋 User practice projects:', data);
    return data || [];
  },

  async createUserPracticeProject(
    userId: string,
    practiceId: string,
    targetCount: number,
    dailyTarget: number,
    startDate?: string,
    targetEndDate?: string,
    targetPeriod?: 'daily' | 'weekly',
    themeId?: string,
    goalType?: string
  ) {
    const { data, error } = await supabase
      .from('user_practice_projects')
      .insert({
        user_id: userId,
        practice_id: practiceId,
        theme_id: themeId || null,
        target_count: targetCount,
        daily_target: dailyTarget,
        start_date: startDate || new Date().toISOString().split('T')[0],
        target_end_date: targetEndDate || null,
        target_period: targetPeriod || 'daily',
        goal_type: goalType || 'fixed_duration',
        status: 'active'
      })
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
      .select('*')
      .eq('user_id', userId)
      .eq('record_date', date);

    if (error) throw error;
    return data || [];
  },

  async recordPractice(
    arg1: Omit<DailyRecord, 'id' | 'created_at'> | string,
    arg2?: string,
    arg3?: number,
    arg4?: string
  ): Promise<DailyRecord | void> {
    // Get UTC time for all record operations
    const now = new Date();
    const utcTime = now.toISOString().split('T')[1].split('.')[0]; // HH:MM:SS in UTC

    if (typeof arg1 === 'object') {
      // Case 1: Called with a DailyRecord object
      const record = { ...arg1, record_time: utcTime }; // Add UTC time
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
    } else {
      // Case 2: Called with individual parameters
      const userId = arg1;
      const projectId = arg2 as string;
      const amount = arg3 as number;
      const date = arg4 as string;

      // First check if a record already exists for this date
      const { data: existingRecord, error: existingRecordError } = await supabase
        .from('daily_records')
        .select('id, count')
        .eq('user_id', userId)
        .eq('practice_project_id', projectId)
        .eq('record_date', date)
        .maybeSingle();

      if (existingRecordError) throw existingRecordError;

      if (existingRecord) {
        // Update existing record with UTC time
        const { error: updateError } = await supabase
          .from('daily_records')
          .update({ 
            count: existingRecord.count + amount,
            record_time: utcTime // Update UTC time
          })
          .eq('id', existingRecord.id);

        if (updateError) throw updateError;
      } else {
        // Create new record with UTC time
        const { error: insertError } = await supabase
          .from('daily_records')
          .insert({
            user_id: userId,
            practice_project_id: projectId,
            record_date: date,
            record_time: utcTime, // Store UTC time
            count: amount
          });

        if (insertError) throw insertError;
      }

      // Update project's current_count
      const { data: project, error: projectError } = await supabase
        .from('user_practice_projects')
        .select('current_count')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      if (project) {
        const { error: updateError } = await supabase
          .from('user_practice_projects')
          .update({ current_count: project.current_count + amount })
          .eq('id', projectId);

        if (updateError) throw updateError;
      }
    }

    return undefined;
  }
};

// Meditation Records
export const meditationService = {
  async getMeditationRecords(userId: string, practiceId?: string): Promise<MeditationRecord[]> {
    let query = supabase
      .from('meditation_records')
      .select('*')
      .eq('user_id', userId)
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (practiceId) {
      query = query.eq('practice_id', practiceId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error loading meditation records:', error);
      throw error;
    }

    console.log(`📊 Loaded ${data?.length || 0} meditation records for practice ${practiceId}`);
    return data || [];
  },

  async recordMeditation(record: Omit<MeditationRecord, 'id' | 'created_at'>): Promise<MeditationRecord> {
    const now = new Date();
    const recordData: any = {
      user_id: record.user_id,
      practice_id: record.practice_id,
      record_date: record.record_date,
      duration_minutes: record.duration_minutes,
      created_at: now.toISOString()
    };

    // Add optional fields
    if (record.session_number) recordData.session_number = record.session_number;
    if (record.method) recordData.method = record.method;
    if (record.reflection && record.reflection.trim()) {
      recordData.reflection = record.reflection;
      recordData.reflection_created_at = now.toISOString();
    }

    const { data, error } = await supabase
      .from('meditation_records')
      .insert(recordData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 🆕 观后感功能扩展
  async updateMeditationReflection(
    recordId: string,
    reflection: string,
    userId: string
  ): Promise<MeditationRecord> {
    const { data, error } = await supabase
      .from('meditation_records')
      .update({
        reflection,
        reflection_created_at: new Date().toISOString()
      })
      .eq('id', recordId)
      .eq('user_id', userId) // 安全检查：确保用户只能修改自己的记录
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async recordMeditationWithReflection(record: {
    user_id: string;
    practice_id: string;
    record_date: string;
    duration_minutes: number;
    session_number?: number;
    reflection?: string;
  }): Promise<MeditationRecord> {
    console.log('💾 Saving meditation record to Supabase:', record);

    const now = new Date();
    const recordData: any = {
      user_id: record.user_id,
      practice_id: record.practice_id,
      record_date: record.record_date,
      duration_minutes: record.duration_minutes,
      created_at: now.toISOString()
    };

    // Add optional fields
    if (record.session_number) recordData.session_number = record.session_number;
    if (record.reflection && record.reflection.trim()) {
      recordData.reflection = record.reflection;
      recordData.reflection_created_at = now.toISOString();
    }

    console.log('📝 Final record data being inserted:', recordData);

    const { data, error } = await supabase
      .from('meditation_records')
      .insert(recordData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving meditation record:', error);
      throw error;
    }

    console.log('✅ Meditation record saved successfully:', data);
    return data;
  },

  // 🆕 获取带观后感的记录详情
  async getMeditationRecordWithReflection(recordId: string, userId: string): Promise<MeditationRecord | null> {
    const { data, error } = await supabase
      .from('meditation_records')
      .select('*')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // 🆕 获取有观后感的记录统计
  async getReflectionStats(userId: string): Promise<{ totalRecords: number; withReflection: number }> {
    const { data, error } = await supabase
      .from('meditation_records')
      .select('id, reflection')
      .eq('user_id', userId);

    if (error) throw error;

    const totalRecords = data?.length || 0;
    const withReflection = data?.filter(record => record.reflection && record.reflection.trim().length > 0).length || 0;

    return { totalRecords, withReflection };
  },

  // 🆕 编辑观修记录（包括时长和观后感）
  async updateMeditationRecord(
    recordId: string,
    userId: string,
    updates: {
      duration_minutes?: number;
      reflection?: string;
      session_number?: number;
    }
  ): Promise<MeditationRecord> {
    const updateData: any = { ...updates };

    // 如果更新了观后感，记录更新时间
    if (updates.reflection !== undefined) {
      updateData.reflection_created_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('meditation_records')
      .update(updateData)
      .eq('id', recordId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 🆕 删除观修记录
  async deleteMeditationRecord(recordId: string, userId: string): Promise<void> {
    console.log('🗑️ deleteMeditationRecord called with:', { recordId, userId });

    // First check if the record exists and belongs to the user
    const { data: existingRecord, error: fetchError } = await supabase
      .from('meditation_records')
      .select('id, user_id')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('❌ Error checking record existence:', fetchError);
      throw new Error('无法找到要删除的记录');
    }

    if (!existingRecord) {
      console.error('❌ Record not found or does not belong to user');
      throw new Error('记录不存在或无权限删除');
    }

    console.log('✅ Record found, proceeding with deletion');

    const { error } = await supabase
      .from('meditation_records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Deletion error:', error);
      throw error;
    }

    console.log('✅ Record deleted successfully from database');
  },

  // 🆕 获取观修方法目录
  async getMeditationTopics(practiceId: string): Promise<Array<{
    id: string;
    topic_number: number;
    title: string;
    description?: string;
  }>> {
    const { data, error } = await supabase
      .from('meditation_topics')
      .select('id, topic_number, title, description')
      .eq('practice_id', practiceId)
      .order('topic_number');

    if (error) {
      console.error('❌ Error loading meditation topics:', error);
      // Return empty array if topics don't exist rather than throwing
      return [];
    }
    return data || [];
  },

  // 🆕 简化版本：每座就是每条记录
  async getMeditationProgress(userId: string, practiceId?: string): Promise<{ 
    completedSessions: number; 
    totalSessions: number;
    currentWeekSessions: number;
    todaySessions: number;
  }> {
    let query = supabase
      .from('meditation_records')
      .select('id, record_date, session_number')
      .eq('user_id', userId);

    if (practiceId) {
      query = query.eq('practice_id', practiceId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const records = data || [];
    const today = new Date().toISOString().split('T')[0];
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const weekStart = startOfWeek.toISOString().split('T')[0];

    return {
      completedSessions: records.length, // 每条记录 = 1座
      totalSessions: 92,
      currentWeekSessions: records.filter(r => r.record_date >= weekStart).length,
      todaySessions: records.filter(r => r.record_date === today).length
    };
  },

  // 🆕 获取周期内的观修详情（用于主页显示）
  async getPeriodMeditationDetails(
    userId: string,
    practiceId: string,
    period: 'daily' | 'weekly'
  ): Promise<{
    sessions: Array<{ duration: number; sessionNumber?: number }>;
    detailString: string;
  }> {
    const today = new Date().toISOString().split('T')[0];
    let startDate = today;

    if (period === 'weekly') {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startDate = startOfWeek.toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('meditation_records')
      .select('duration_minutes, session_number, created_at')
      .eq('user_id', userId)
      .eq('practice_id', practiceId)
      .gte('record_date', startDate)
      .lte('record_date', today)
      .order('created_at');

    if (error) throw error;

    const sessions = (data || []).map((record, index) => ({
      duration: record.duration_minutes,
      sessionNumber: record.session_number || (index + 1)
    }));

    const detailString = sessions
      .map((session, index) => `第${index + 1}座: ${session.duration}分钟`)
      .join('; ');

    return { sessions, detailString };
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

  async recordStudy(record: {
    user_id: string;
    course_id: string;
    lesson_number: number;
    study_date: string;
    study_type: '听传承' | '看法本';
    study_count_for_lesson: number;
  }) {
    try {
      // First, get the lesson record - handle potential duplicates by taking the first one
      const { data: lessons, error: lessonError } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('course_id', record.course_id)
        .eq('lesson_number', record.lesson_number)
        .limit(1);

      if (lessonError) {
        console.error('❌ Error finding lesson:', lessonError);
        throw lessonError;
      }

      if (!lessons || lessons.length === 0) {
        throw new Error(`Lesson ${record.lesson_number} not found for course ${record.course_id}`);
      }

      const lesson = lessons[0]; // Take the first lesson if there are duplicates

      // Store UTC timestamp
      const now = new Date();
      const utcTime = now.toISOString().split('T')[1].split('.')[0]; // HH:MM:SS in UTC

      const studyRecord = {
        user_id: record.user_id,
        course_id: record.course_id,
        lesson_id: lesson.id,
        study_date: record.study_date,
        study_time: utcTime, // Store UTC time
        study_type: record.study_type,
        study_count_for_lesson: record.study_count_for_lesson
      };

      const { data, error } = await supabase
        .from('study_records')
        .insert(studyRecord)
        .select()
        .single();

      if (error) {
        console.error('❌ Error inserting study record:', error);
        throw error;
      }

      // Update progress after recording
      await this.calculateProgress(record.user_id, record.course_id);

      return data;
    } catch (err) {
      console.error('❌ recordStudy failed:', err);
      throw err;
    }
  },

  async getCourseLessons(courseId: string) {
    const { data, error } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('lesson_number');

    if (error) throw error;
    return data || [];
  },

  async updateCourseStatus(userId: string, courseId: string, status: 'active' | 'paused' | 'completed') {
    const { data, error } = await supabase
      .from('user_courses')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async quitCourse(userId: string, courseId: string) {
    const { data, error } = await supabase
      .from('user_courses')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) throw error;
    return data;
  },

  async getUserCourses(userId: string): Promise<UserCourse[]> {
    try {
      const { data, error } = await supabase
        .from('user_courses')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', userId)
        .order('joined_date', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user courses:', error);
        throw error;
      }

      console.log('📚 Raw user courses data:', data);
      return data || [];
    } catch (err) {
      console.error('❌ getUserCourses failed:', err);
      throw err;
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
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('total_lessons')
      .eq('id', courseId)
      .single();

    if (courseError) {
      console.error('❌ Error fetching course for progress calculation:', courseError);
      return 0;
    }

    if (!course) {
      console.error('❌ Course not found for ID:', courseId);
      return 0;
    }

    console.log(`📊 Course ${courseId} has ${course.total_lessons} total lessons`);

    // Get all study records for this course with lesson info
    const { data: studyRecords } = await supabase
      .from('study_records')
      .select(`
        lesson_id, 
        study_type,
        lesson:course_lessons(lesson_number)
      `)
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (!studyRecords || studyRecords.length === 0) {
      // Update progress in user_courses
      await supabase
        .from('user_courses')
        .update({
          progress_percentage: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('course_id', courseId);
      return 0;
    }

    // Group records by lesson and check if both types are completed
    const lessonCompletionMap = new Map<string, { 听传承: boolean, 看法本: boolean, lessonNumber: number }>();
    
    studyRecords.forEach(record => {
      if (!lessonCompletionMap.has(record.lesson_id)) {
        const lesson = Array.isArray(record.lesson) ? record.lesson[0] : record.lesson;
        lessonCompletionMap.set(record.lesson_id, { 
          听传承: false, 
          看法本: false,
          lessonNumber: lesson?.lesson_number || 0
        });
      }
      
      const lessonData = lessonCompletionMap.get(record.lesson_id)!;
      if (record.study_type === '听传承') {
        lessonData.听传承 = true;
      } else if (record.study_type === '看法本') {
        lessonData.看法本 = true;
      }
    });

    // Count lessons that have both types completed
    const completedLessons = Array.from(lessonCompletionMap.values()).filter(
      lesson => lesson.听传承 && lesson.看法本
    );

    console.log(`📊 Progress calculation for course ${courseId}:`);
    console.log(`   Total lessons in course: ${course.total_lessons}`);
    console.log(`   Lessons with records: ${lessonCompletionMap.size}`);
    console.log(`   Completed lessons (both types): ${completedLessons.length}`);
    console.log(`   Completed lesson numbers:`, completedLessons.map(l => l.lessonNumber).sort((a, b) => a - b));

    const progress = (completedLessons.length / course.total_lessons) * 100;

    console.log(`   Calculated progress: ${progress}% (${completedLessons.length}/${course.total_lessons})`);

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
  },

  async getLessonStudySummary(userId: string, courseId: string, lessonId: string) {
    const { data, error } = await supabase
      .from('study_records')
      .select('study_type, study_count_for_lesson, study_date')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('lesson_id', lessonId)
      .order('study_date');

    if (error) throw error;

    const records = data || [];
    const summary = {
      听传承: 0,
      看法本: 0,
      details: [] as Array<{ date: string; type: '听传承' | '看法本'; count: number }>
    };

    records.forEach(record => {
      // Each record represents one instance of study
      const studyType = record.study_type as '听传承' | '看法本';
      summary[studyType] += 1; // Count each record as one instance
      summary.details.push({
        date: record.study_date,
        type: studyType,
        count: 1
      });
    });

    return summary;
  }
};

// Mindfulness Records
// Note: record_time is stored in UTC, convert to local time for display
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

// Preset Project Names
export const presetProjectNameService = {
  async getPresetProjectNames(): Promise<Array<{
    id: string;
    name: string;
    category?: string;
    display_order: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('preset_project_names')
        .select('id, name, category, display_order')
        .eq('is_active', true)
        .order('display_order')
        .order('name');

      if (error) {
        console.error('❌ Error fetching preset project names:', error);
        // Return fallback data if database query fails
        return [
          { id: 'fallback-1', name: '前行班', category: '基础修行', display_order: 1 },
          { id: 'fallback-2', name: '金刚萨埵法会', category: '法会共修', display_order: 2 },
          { id: 'fallback-3', name: '地藏法会', category: '法会共修', display_order: 3 }
        ];
      }

      return data || [];
    } catch (err) {
      console.error('❌ Exception fetching preset project names:', err);
      return [];
    }
  },

  async addPresetProjectName(name: string, category?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('preset_project_names')
        .insert({
          name,
          category: category || '自定义',
          display_order: 999
        });

      if (error) throw error;
    } catch (err) {
      console.error('❌ Error adding preset project name:', err);
      throw err;
    }
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

export type UserCourse = {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  joined_date: string;
  progress_percentage: number;
  updated_at: string;
  course: any;
};

// ============================================
// CLASS CURRICULUM SYSTEM SERVICES
// ============================================

import type {
  ClassCurriculum,
  ClassRequiredCourse,
  ClassRequiredPractice,
  UserEnrolledClass,
  UserClassProgress,
  EnrolledClassWithDetails
} from '@/types/database';

export const classCurriculumService = {
  async getAllClassCurricula(): Promise<ClassCurriculum[]> {
    const { data, error } = await supabase
      .from('class_curricula')
      .select('*')
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  async getClassCurriculumByName(className: string): Promise<ClassCurriculum | null> {
    const { data, error } = await supabase
      .from('class_curricula')
      .select('*')
      .eq('class_name', className)
      .single();

    if (error) throw error;
    return data;
  },

  async enrollUserInClass(userId: string, classId: string): Promise<UserEnrolledClass> {
    const { data: existingEnrollment } = await supabase
      .from('user_enrolled_classes')
      .select('*')
      .eq('user_id', userId)
      .eq('class_id', classId)
      .single();

    if (existingEnrollment) {
      return existingEnrollment;
    }

    const { data, error } = await supabase
      .from('user_enrolled_classes')
      .insert({
        user_id: userId,
        class_id: classId,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('user_class_progress')
      .insert({
        user_id: userId,
        class_id: classId,
        courses_completed: 0,
        practices_completed: 0,
        overall_progress_percentage: 0
      });

    return data;
  },

  async getUserEnrolledClasses(userId: string): Promise<EnrolledClassWithDetails[]> {
    const { data, error } = await supabase
      .from('user_enrolled_classes')
      .select(`
        *,
        class_curriculum:class_curricula!inner(*)
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;

    const enrichedData = await Promise.all(
      (data || []).map(async (enrollment: any) => {
        const [courses, practices, progress] = await Promise.all([
          this.getClassRequiredCourses(enrollment.class_id),
          this.getClassRequiredPractices(enrollment.class_id),
          this.getUserClassProgress(userId, enrollment.class_id)
        ]);

        return {
          ...enrollment,
          class_curriculum: enrollment.class_curriculum,
          required_courses: courses,
          required_practices: practices,
          progress
        };
      })
    );

    return enrichedData;
  },

  async getClassRequiredCourses(classId: string): Promise<(ClassRequiredCourse & { course: any })[]> {
    const { data, error } = await supabase
      .from('class_required_courses')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('class_id', classId);

    if (error) throw error;
    return data || [];
  },

  async getClassRequiredPractices(classId: string): Promise<(ClassRequiredPractice & { practice: any })[]> {
    const { data, error } = await supabase
      .from('class_required_practices')
      .select(`
        *,
        practice:practices(*)
      `)
      .eq('class_id', classId);

    if (error) throw error;
    return data || [];
  },

  async createPracticeProjectsForClass(userId: string, classId: string): Promise<void> {
    const requiredPractices = await this.getClassRequiredPractices(classId);

    const projectsToCreate = requiredPractices.map(req => ({
      user_id: userId,
      practice_id: req.practice_id,
      target_count: req.target_count,
      daily_target: req.daily_target,
      current_count: 0,
      status: 'active' as const
    }));

    if (projectsToCreate.length > 0) {
      const { error } = await supabase
        .from('user_practice_projects')
        .insert(projectsToCreate);

      if (error) throw error;
    }
  },

  async syncPracticeProjectsWithClassRequirements(userId: string, classId: string): Promise<number> {
    const requiredPractices = await this.getClassRequiredPractices(classId);
    
    let updatedCount = 0;

    for (const req of requiredPractices) {
      const { data: existingProject } = await supabase
        .from('user_practice_projects')
        .select('*')
        .eq('user_id', userId)
        .eq('practice_id', req.practice_id)
        .eq('status', 'active')
        .single();

      if (existingProject && (existingProject.target_count === 0 || existingProject.target_count === null)) {
        const { error } = await supabase
          .from('user_practice_projects')
          .update({
            target_count: req.target_count,
            daily_target: req.daily_target
          })
          .eq('id', existingProject.id);

        if (!error) {
          updatedCount++;
        }
      }
    }

    return updatedCount;
  },

  async updateEnrollmentStatus(
    userId: string, 
    classId: string, 
    status: 'active' | 'completed' | 'paused'
  ): Promise<void> {
    const { error } = await supabase
      .from('user_enrolled_classes')
      .update({ 
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('user_id', userId)
      .eq('class_id', classId);

    if (error) throw error;
  },

  async getUserClassProgress(userId: string, classId: string): Promise<UserClassProgress | null> {
    const { data, error } = await supabase
      .from('user_class_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('class_id', classId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateClassProgress(
    userId: string,
    classId: string,
    updates: Partial<UserClassProgress>
  ): Promise<void> {
    const { error } = await supabase
      .from('user_class_progress')
      .update(updates)
      .eq('user_id', userId)
      .eq('class_id', classId);

    if (error) throw error;
  }
};