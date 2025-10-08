// Buddhist Practice Tracking App - Database Types

export interface User {
  id: string;
  dharma_name?: string;
  lay_name?: string;
  email: string;
  location?: string;
  practice_years?: number;
  class_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  type: 'foundation' | 'puja' | 'meditation' | 'practice';
  created_at: string;
}

export interface Practice {
  id: string;
  name: string;
  type: 'count' | 'time';
  unit: '次' | '分钟';
  description?: string;
  created_at: string;
}

export interface ThemePractice {
  id: string;
  theme_id: string;
  practice_id: string;
  target_count: number;
  is_required: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  total_lessons: number;
  teacher?: string;
  description?: string;
  created_at: string;
}

export interface CourseLesson {
  id: string;
  course_id: string;
  lesson_number: number;
  title: string;
  content_summary?: string;
  url?: string;
  created_at: string;
}

export interface UserPracticeProject {
  id: string;
  user_id: string;
  theme_id?: string;
  practice_id: string;
  project_name?: string;
  preset_project_id?: string;
  total_target?: number;        // 总目标：可选，为null时表示持续修行无期限
  weekly_target?: number;       // 每周目标座数（仅时间类weekly使用）
  start_date?: string;
  target_end_date?: string;
  current_count: number;
  daily_target?: number;        // 每日目标：计数类=每日遍数，时间类weekly时为null
  target_period?: 'daily' | 'weekly';
  status: 'not_started' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface DailyRecord {
  id: string;
  user_id: string;
  practice_project_id: string;
  record_date: string;
  record_time?: string; // UTC time (HH:MM:SS)
  count: number;
  notes?: string;
  created_at: string;
}

export interface MeditationRecord {
  id: string;
  user_id: string;
  practice_id: string;
  record_date: string;
  record_time?: string; // UTC time (HH:MM:SS)
  duration_minutes: number;
  session_number?: number;
  method?: string;
  reflection?: string;
  reflection_created_at?: string;
  created_at: string;
}

export interface StudyRecord {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  study_date: string;
  study_time?: string; // UTC time (HH:MM:SS)
  study_type?: '听上师传承' | '看法本' | '共修' | '讲考';
  study_count_for_lesson: number;
  completed?: boolean;
  status?: '回顾' | '串讲' | '参加' | '缺席' | '讲考' | '提问';
  created_at: string;
}

export interface MindfulnessRecord {
  id: string;
  user_id: string;
  record_date: string;
  record_time: string;
  mind_type: 'good' | 'bad';
  description?: string;
  created_at: string;
}

export interface OneTimeRecord {
  id: string;
  user_id: string;
  record_date: string;
  practice_type: string;
  practice_name: string;
  count_or_duration: string;
  notes?: string;
  created_at: string;
}

export interface PreceptRecord {
  id: string;
  user_id: string;
  precept_type: string;
  record_date: string;
  notes?: string;
  created_at: string;
}

// Enums
export enum AddPracticeMethod {
  JOIN_THEME = 'join_theme',
  SINGLE_PRACTICE = 'single_practice',
  DAILY_ROUTINE = 'daily_routine',
  ONE_TIME = 'one_time'
}

export enum PracticeStatus {
  NOT_STARTED = 'not_started',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

export enum MindType {
  GOOD = 'good',
  BAD = 'bad'
}

// UI Interfaces
export interface DailyPractice {
  name: string;
  current: number;
  target: number;
  type: 'count' | 'time';
  status: 'pending' | 'in_progress' | 'completed';
}

export interface StudyProgress {
  courseId: string;
  currentLesson: number;
  totalLessons: number;
  listenCount: Record<number, number>;
  autoAdvance: boolean;
}

export interface MindfulnessStats {
  daily: { good: number; bad: number };
  weekly: Array<{ date: Date; goodPercent: number }>;
  trends: 'improving' | 'declining' | 'stable';
}

// ============================================
// CLASS CURRICULUM SYSTEM TYPES
// ============================================

export interface ClassCurriculum {
  id: string;
  class_name: '加行' | '入行' | '正科' | '净土';
  display_order: number;
  description?: string;
  created_at: string;
}

export interface ClassRequiredCourse {
  id: string;
  class_id: string;
  course_id: string;
  required_study_types: string[];
  optional_status_fields: string[];
  created_at: string;
}

export interface ClassRequiredPractice {
  id: string;
  class_id: string;
  practice_id: string;
  total_target?: number;        // 总目标：可选，为null时表示持续修行无期限
  weekly_target?: number;       // 每周目标座数
  daily_target?: number;        // 每日目标
  min_duration_minutes?: number;
  practice_category: 'count' | 'session';
  is_required: boolean;
  is_optional?: boolean;
  choice_group?: string;
  created_at: string;
}

export interface UserEnrolledClass {
  id: string;
  user_id: string;
  class_id: string;
  status: 'active' | 'completed' | 'paused';
  enrolled_at: string;
  completed_at?: string;
  created_at: string;
}

export interface UserClassProgress {
  id: string;
  user_id: string;
  class_id: string;
  courses_completed: number;
  practices_completed: number;
  overall_progress_percentage: number;
  started_at: string;
  completed_at?: string;
  created_at: string;
}

// UI types for class curriculum
export interface EnrolledClassWithDetails extends UserEnrolledClass {
  class_curriculum: ClassCurriculum;
  required_courses: (ClassRequiredCourse & { course: Course })[];
  required_practices: (ClassRequiredPractice & { practice: Practice })[];
  progress?: UserClassProgress;
}