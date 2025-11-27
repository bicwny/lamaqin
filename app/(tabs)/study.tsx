import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, FlatList, Linking, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { studyService, classCurriculumService } from '@/lib/database';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/constants/DesignSystem';
import { Colors } from '@/constants/Colors';
import { ComponentTokens } from '@/utils/componentTokens';
import PageHeader from '@/components/PageHeader';
import PageTemplate from '@/components/PageTemplate';
import { router, useLocalSearchParams } from 'expo-router';
import { toastService } from '@/lib/toast';
import { CourseSkeleton } from '@/components/SkeletonLoader';

// Component to display lesson progress with real-time counts
const LessonProgressDisplay = ({ userId, courseId, lessonId, refreshTrigger }: {
  userId: string;
  courseId: string;
  lessonId: string;
  refreshTrigger?: number;
}) => {
  const [counts, setCounts] = useState({ 听传承: 0, 看法本: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, [userId, courseId, lessonId, refreshTrigger]);

  const loadCounts = async () => {
    try {
      const summary = await studyService.getLessonStudySummary(userId, courseId, lessonId);
      setCounts({ 听传承: summary.听传承, 看法本: summary.看法本 });
    } catch (error) {
      console.error('Error loading lesson counts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text style={styles.lessonProgress}>加载中...</Text>;
  }

  const isCompleted = counts.听传承 > 0 && counts.看法本 > 0;

  return (
    <View style={styles.lessonProgressContainer}>
      <Text style={styles.lessonProgress}>
        听传承: {counts.听传承}次 | 看法本: {counts.看法本}次
      </Text>
      {isCompleted && <Text style={styles.completionCheck}>✅</Text>}
    </View>
  );
};

interface Course {
  id: string;
  name: string;
  total_lessons: number;
  teacher?: string;
  description?: string;
}

interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'paused';
  joined_date: string;
  progress_percentage: number;
  course: Course;
}

interface StudyProgress {
  courseId: string;
  currentLesson: number;
  listenCount: Record<number, number>;
  totalLessonsStudied: number;
  progressPercentage: number;
  lastStudiedLesson: number;
}

interface CourseLesson {
  id: string;
  lesson_number: number;
  title: string;
  course_id: string;
  url?: string;
}

type ViewMode = 'home' | 'manage' | 'courseDetail';

export default function StudyScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<StudyProgress[]>([]);
  const [courseLessons, setCourseLessons] = useState<Record<string, CourseLesson[]>>({});
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedCourse, setSelectedCourse] = useState<UserCourse | null>(null);
  const [joiningCourse, setJoiningCourse] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadStudyData();
  }, [user]);

  // Handle navigation from index page
  useEffect(() => {
    if (params.courseId && params.viewMode === 'courseDetail' && userCourses.length > 0) {
      const course = userCourses.find(uc => uc.course_id === params.courseId);
      if (course) {
        setSelectedCourse(course);
        setViewMode('courseDetail');
        // Clear the params to prevent re-triggering
        router.setParams({ courseId: undefined, viewMode: undefined });
      }
    }
  }, [params.courseId, params.viewMode, userCourses]);

  const loadStudyData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Loading study data for user:', user.id);

      // Auto-sync courses for enrolled classes (parallelized)
      let enrolledClassesData: any[] = [];
      try {
        enrolledClassesData = await classCurriculumService.getUserEnrolledClasses(user.id);
        console.log('📚 Enrolled classes:', enrolledClassesData.map(c => c.class_curriculum.class_name));
        
        // Sort enrolled classes by display_order
        enrolledClassesData.sort((a, b) => 
          (a.class_curriculum.display_order || 999) - (b.class_curriculum.display_order || 999)
        );
        
        setEnrolledClasses(enrolledClassesData);
        
        // Parallelize class syncing
        const syncPromises = enrolledClassesData
          .filter(enrollment => enrollment.status === 'active')
          .map(async (enrollment) => {
            console.log(`🔄 Syncing courses for ${enrollment.class_curriculum.class_name}...`);
            const count = await classCurriculumService.syncUserCoursesWithClassRequirements(user.id, enrollment.class_id);
            console.log(`✅ Synced ${count} courses for ${enrollment.class_curriculum.class_name}`);
            return count;
          });
        
        await Promise.all(syncPromises);
      } catch (err) {
        console.error('❌ Failed to sync class courses:', err);
      }

      // Load user's courses (freshly synced) and all courses in parallel
      const [userCoursesData, allCoursesData] = await Promise.all([
        getUserCourses(user.id),
        studyService.getCourses()
      ]);
      
      setUserCourses(userCoursesData);
      setAllCourses(allCoursesData);

      // Load progress data
      const progressData = await studyService.getUserStudyProgress(user.id);
      const organizedProgress = processProgressData(progressData, userCoursesData);
      setProgress(organizedProgress);

      // Recalculate progress for all enrolled courses in parallel (massive speed boost!)
      console.log('🔄 Calculating progress for', userCoursesData.length, 'courses in parallel...');
      const progressPromises = userCoursesData.map(async (userCourse) => {
        try {
          await studyService.calculateProgress(user.id, userCourse.course_id);
          return { courseId: userCourse.course_id, success: true };
        } catch (error) {
          console.error(`❌ Failed to calculate progress for ${userCourse.course.name}:`, error);
          return { courseId: userCourse.course_id, success: false };
        }
      });
      
      await Promise.all(progressPromises);

      // Reload user courses to get updated progress percentages
      const updatedUserCoursesData = await getUserCourses(user.id);
      setUserCourses(updatedUserCoursesData);

      console.log('📊 Updated user courses after progress calculation:', updatedUserCoursesData.map(uc => ({
        name: uc.course.name,
        progress: uc.progress_percentage
      })));

      // Load lessons for enrolled courses in parallel (with error handling)
      console.log('🔄 Loading lessons for', updatedUserCoursesData.length, 'courses in parallel...');
      const lessonsPromises = updatedUserCoursesData.map(async (userCourse) => {
        try {
          const lessons = await studyService.getCourseLessons(userCourse.course_id);
          return { courseId: userCourse.course_id, lessons, success: true };
        } catch (error) {
          console.error(`❌ Failed to load lessons for ${userCourse.course.name}:`, error);
          return { courseId: userCourse.course_id, lessons: [], success: false };
        }
      });
      
      const lessonsResults = await Promise.all(lessonsPromises);
      const lessonsData: Record<string, CourseLesson[]> = {};
      lessonsResults.forEach(result => {
        if (result.success || result.lessons.length > 0) {
          lessonsData[result.courseId] = result.lessons;
        }
      });
      setCourseLessons(lessonsData);

      console.log('📚 Loaded user courses:', userCoursesData.length);
      console.log('📖 Loaded progress records:', progressData.length);
    } catch (error) {
      console.error('❌ Error loading study data:', error);
      setUserCourses([]);
      setAllCourses([]);
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserCourses = async (userId: string): Promise<UserCourse[]> => {
    try {
      console.log('🔍 Fetching user courses for:', userId);
      const userCourses = await studyService.getUserCourses(userId);
      console.log('✅ Successfully fetched user courses:', userCourses.length);
      return userCourses;
    } catch (error) {
      console.error('❌ Error getting user courses:', error);
      return [];
    }
  };

  const processProgressData = (studyRecords: any[], userCourses: UserCourse[]) => {
    const progressMap: Record<string, StudyProgress> = {};

    // Initialize progress for all user courses
    userCourses.forEach(userCourse => {
      const courseId = userCourse.course_id;
      progressMap[courseId] = {
        courseId,
        currentLesson: 1,
        listenCount: {},
        totalLessonsStudied: 0,
        progressPercentage: userCourse.progress_percentage || 0,
        lastStudiedLesson: 1
      };
    });

    // Process study records
    studyRecords.forEach(record => {
      const courseId = record.course_id;
      if (progressMap[courseId] && record.lesson) {
        const lessonNum = record.lesson.lesson_number;

        // Track listen count for each lesson
        progressMap[courseId].listenCount[lessonNum] = 
          (progressMap[courseId].listenCount[lessonNum] || 0) + record.study_count_for_lesson;

        // Update last studied lesson
        if (lessonNum > progressMap[courseId].lastStudiedLesson) {
          progressMap[courseId].lastStudiedLesson = lessonNum;
          progressMap[courseId].currentLesson = lessonNum;
        }
      }
    });

    // Calculate progress statistics
    Object.values(progressMap).forEach(progress => {
      const userCourse = userCourses.find(uc => uc.course_id === progress.courseId);
      if (userCourse) {
        progress.totalLessonsStudied = Object.keys(progress.listenCount).length;
        progress.progressPercentage = (progress.totalLessonsStudied / userCourse.course.total_lessons) * 100;
      }
    });

    return Object.values(progressMap);
  };

  const recordStudy = async (courseId: string, lessonNumber: number, studyType: '听传承' | '看法本') => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      await studyService.recordStudy({
        user_id: user.id,
        course_id: courseId,
        lesson_number: lessonNumber,
        study_date: today,
        study_type: studyType,
        study_count_for_lesson: 1
      });

      toastService.success({
        title: '学习记录已保存',
        message: `${studyType}完成 - 继续加油！`
      });

      // Trigger refresh of lesson counts
      setRefreshTrigger(prev => prev + 1);
      loadStudyData(); // Refresh overall data
    } catch (error) {
      console.error('Error recording study:', error);
      toastService.error({ 
        title: '保存失败', 
        message: '网络异常，请稍后重试' 
      });
    }
  };

  const joinCourse = async (courseId: string) => {
    if (!user) return;

    try {
      console.log('🔄 加入课程:', courseId);
      setJoiningCourse(courseId);

      // Check if user is already enrolled (both in state and database)
      const isAlreadyEnrolledInState = userCourses.some(uc => uc.course_id === courseId);
      if (isAlreadyEnrolledInState) {
        toastService.info({
        title: '已加入课程',
        message: '您已经在学习这门课程了'
      });
        setViewMode('home');
        return;
      }

      // Double-check against database to catch sync issues
      try {
        const dbUserCourses = await studyService.getUserCourses(user.id);
        const isAlreadyEnrolledInDb = dbUserCourses.some(uc => uc.course_id === courseId);
        if (isAlreadyEnrolledInDb) {
          console.log('⚠️ Course enrollment found in DB but not in state - syncing...');
          setUserCourses(dbUserCourses);
          toastService.info({
        title: '已加入课程',
        message: '您已经在学习这门课程了'
      });
          setViewMode('home');
          return;
        }
      } catch (dbError) {
        console.error('❌ Error checking database for existing enrollment:', dbError);
      }

      const userCourse = await studyService.joinCourse(user.id, courseId);

      setUserCourses(prev => [...prev, userCourse]);

      const newProgress: StudyProgress = {
        courseId: courseId,
        currentLesson: 1,
        listenCount: {},
        totalLessonsStudied: 0,
        progressPercentage: 0,
        lastStudiedLesson: 1
      };
      setProgress(prev => [...prev, newProgress]);

      toastService.success({ 
        title: '课程加入成功', 
        message: '开始您的学习之旅吧！' 
      });
      setViewMode('home');

      console.log('✅ 课程加入成功');
    } catch (error) {
      console.error('❌ Error joining course:', error);
      // Handle duplicate key error specifically
      if (error?.code === '23505') {
        toastService.info({
        title: '已加入课程',
        message: '课程数据已同步'
      });
        // Reload data to sync state
        loadStudyData();
      } else {
        toastService.error({ 
          title: '加入失败', 
          message: '网络异常，请稍后重试' 
        });
      }
    } finally {
      setJoiningCourse(null);
    }
  };

  const pauseCourse = async (courseId: string) => {
    if (!user) return;

    console.log('🔄 pauseCourse called for:', courseId);
    try {
      const result = await studyService.updateCourseStatus(user.id, courseId, 'paused');
      console.log('✅ pauseCourse result:', result);
      setUserCourses(prev => 
        prev.map(uc => 
          uc.course_id === courseId ? { ...uc, status: 'paused' } : uc
        )
      );
      toastService.info({
        title: '课程已暂停',
        message: '可在课程管理中恢复学习'
      });
    } catch (error) {
      console.error('❌ Error pausing course:', error);
      toastService.error({ 
        title: '暂停失败', 
        message: '请稍后重试' 
      });
    }
  };

  const resumeCourse = async (courseId: string) => {
    if (!user) return;

    try {
      await studyService.updateCourseStatus(user.id, courseId, 'active');
      setUserCourses(prev => 
        prev.map(uc => 
          uc.course_id === courseId ? { ...uc, status: 'active' } : uc
        )
      );
      toastService.success({ 
        title: '课程已恢复', 
        message: '继续您的学习进度' 
      });
    } catch (error) {
      console.error('Error resuming course:', error);
      toastService.error({ 
        title: '恢复失败', 
        message: '请稍后重试' 
      });
    }
  };

  const getCourseProgress = (courseId: string) => {
    return progress.find(p => p.courseId === courseId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '';
      case 'paused': return '';
      case 'completed': return '';
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '学习中';
      case 'paused': return '已暂停';
      case 'completed': return '已完成';
      default: return '未开始';
    }
  };

  const availableCourses = allCourses.filter(course => 
    !userCourses.some(uc => uc.course_id === course.id)
  );

  // Group courses by class with proper ordering
  const groupCoursesByClass = () => {
    const grouped: Record<string, { class: any; courses: (UserCourse & { display_order?: number })[] }> = {};
    const coursesInClasses = new Set<string>();
    
    // First, group courses by class
    enrolledClasses.forEach(enrollment => {
      const classCourses = enrollment.required_courses || [];
      
      // Get user's enrolled courses for this class (only active courses)
      const coursesForClass = userCourses
        .filter(uc => uc.status === 'active') // Only show active courses
        .map(userCourse => {
          // Find the display_order for this course in this class
          const courseLink = classCourses.find((rc: any) => rc.course_id === userCourse.course_id);
          return {
            ...userCourse,
            display_order: courseLink?.display_order || 999
          };
        })
        .filter(uc => {
          // Check if this course belongs to this class
          const belongsToClass = classCourses.some((rc: any) => rc.course_id === uc.course_id);
          if (belongsToClass) {
            coursesInClasses.add(uc.course_id);
          }
          return belongsToClass;
        })
        .sort((a, b) => (a.display_order || 999) - (b.display_order || 999));
      
      if (coursesForClass.length > 0) {
        grouped[enrollment.class_id] = {
          class: enrollment,
          courses: coursesForClass
        };
      }
    });
    
    // Add a special group for courses not in any class (active only)
    const orphanCourses = userCourses
      .filter(uc => uc.status === 'active' && !coursesInClasses.has(uc.course_id))
      .map(uc => ({ ...uc, display_order: 999 }));
    
    if (orphanCourses.length > 0) {
      grouped['_orphan'] = {
        class: { class_curriculum: { class_name: '其他课程' } },
        courses: orphanCourses
      };
    }
    
    return grouped;
  };

  if (loading) {
    return (
      <PageTemplate
        title="闻思"
        subtitle="好好闻思，别乱跑。"
        scrollable={false}
        backgroundColor={Colors.background}
        padding={0}
      >
        <ScrollView style={styles.scrollView}>
          <CourseSkeleton count={4} />
        </ScrollView>
      </PageTemplate>
    );
  }

  // Home View
  if (viewMode === 'home') {
    if (userCourses.length === 0) {
      return (
        <PageTemplate
          title="闻思"
          subtitle="好好闻思，别乱跑。"
          scrollable={false}
          backgroundColor={Colors.background}
          padding={0}
        >
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.emptyState}>
              <View style={styles.iconContainer}>
                <Ionicons name="ear-outline" size={80} color="#9CA3AF" />
              </View>

              <Text style={styles.emptyTitle}>开始你的学习之旅</Text>
              <Text style={styles.emptyDescription}>
                添加你的第一门课程，开始系统的闻思历程
              </Text>

              <TouchableOpacity 
                style={styles.browseButton} 
                onPress={() => setViewMode('manage')}
              >
                <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                <Text style={styles.browseButtonText}>管理课程</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </PageTemplate>
      );
    }

    return (
      <PageTemplate
        title="闻思"
        subtitle="好好闻思，别乱跑。"
        rightAction={{
          text: "管理课程",
          onPress: () => setViewMode('manage')
        }}
        scrollable={false}
        backgroundColor={Colors.background}
        padding={0}
      >
        <ScrollView style={styles.scrollView}>
          {(() => {
            const groupedCourses = groupCoursesByClass();
            const classesToShow = enrolledClasses.filter(enrollment => 
              enrollment.status === 'active' && groupedCourses[enrollment.class_id]
            );
            
            return (
              <>
                {classesToShow.map(enrollment => {
                  const classData = groupedCourses[enrollment.class_id];

                  return (
                    <View key={enrollment.class_id} style={styles.section}>
                      <View style={styles.classHeader}>
                        <Text style={styles.className}>【{enrollment.class_curriculum.class_name}】</Text>
                      </View>

                      {classData.courses.map(userCourse => {
                        const courseProgress = getCourseProgress(userCourse.course_id);
                        const currentLesson = courseProgress?.currentLesson || 1;
                        const totalLessonsStudied = courseProgress?.totalLessonsStudied || 0;
                        const progressPercentage = userCourse.progress_percentage || 0;

                        return (
                          <TouchableOpacity 
                            key={userCourse.id} 
                            style={styles.courseCard}
                            onPress={() => router.push(`/course-detail/${userCourse.course_id}`)}
                          >
                            <View style={styles.courseHeader}>
                              <Text style={styles.courseName}>{userCourse.course.name}</Text>
                              <Text style={styles.courseInfo}>
                                {userCourse.course.teacher} • 共{userCourse.course.total_lessons}课
                              </Text>
                            </View>

                            <View style={styles.progressContainer}>
                              <View style={styles.progressTextRow}>
                                <Text style={styles.progressText}>
                                  完成进度：{progressPercentage.toFixed(1)}%
                                </Text>
                                <Text style={styles.currentLessonText}>
                                  {totalLessonsStudied === 0 ? '尚未开始' : `上次完成：第${currentLesson}课`}
                                </Text>
                              </View>

                              <View style={styles.progressBarContainer}>
                                <View style={styles.progressBarBg}>
                                  <View 
                                    style={[
                                      styles.progressBarFill, 
                                      { width: `${Math.min(progressPercentage, 100)}%` }
                                    ]} 
                                  />
                                </View>
                              </View>
                            </View>

                            <TouchableOpacity 
                              style={styles.continueButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                router.push(`/course-detail/${userCourse.course_id}`);
                              }}
                            >
                              <Text style={styles.continueButtonText}>继续学习</Text>
                            </TouchableOpacity>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })}
                
                {/* Show orphan courses at the end */}
                {groupedCourses['_orphan'] && (
                  <View key="_orphan" style={styles.section}>
                    <View style={styles.classHeader}>
                      <Text style={styles.className}>【{groupedCourses['_orphan'].class.class_curriculum.class_name}】</Text>
                    </View>

                    {groupedCourses['_orphan'].courses.map(userCourse => {
                      const courseProgress = getCourseProgress(userCourse.course_id);
                      const currentLesson = courseProgress?.currentLesson || 1;
                      const totalLessonsStudied = courseProgress?.totalLessonsStudied || 0;
                      const progressPercentage = userCourse.progress_percentage || 0;

                      return (
                        <TouchableOpacity 
                          key={userCourse.id} 
                          style={styles.courseCard}
                          onPress={() => router.push(`/course-detail/${userCourse.course_id}`)}
                        >
                          <View style={styles.courseHeader}>
                            <Text style={styles.courseName}>{userCourse.course.name}</Text>
                            <Text style={styles.courseInfo}>
                              {userCourse.course.teacher} • 共{userCourse.course.total_lessons}课
                            </Text>
                          </View>

                          <View style={styles.progressContainer}>
                            <View style={styles.progressTextRow}>
                              <Text style={styles.progressText}>
                                完成进度：{progressPercentage.toFixed(1)}%
                              </Text>
                              <Text style={styles.currentLessonText}>
                                {totalLessonsStudied === 0 ? '尚未开始' : `上次完成：第${currentLesson}课`}
                              </Text>
                            </View>

                            <View style={styles.progressBarContainer}>
                              <View style={styles.progressBarBg}>
                                <View 
                                  style={[
                                    styles.progressBarFill, 
                                    { width: `${Math.min(progressPercentage, 100)}%` }
                                  ]} 
                                />
                              </View>
                            </View>
                          </View>

                          <TouchableOpacity 
                            style={styles.continueButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              router.push(`/course-detail/${userCourse.course_id}`);
                            }}
                          >
                            <Text style={styles.continueButtonText}>继续学习</Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </>
            );
          })()}

          {/* Course Summary Footer */}
          <View style={styles.courseSummary}>
            <Text style={styles.courseSummaryText}>
              {userCourses.length}门课程已加入
              {userCourses.filter(uc => uc.status === 'paused').length > 0 && 
                `，${userCourses.filter(uc => uc.status === 'paused').length}门课程已暂停`
              }
            </Text>
          </View>
        </ScrollView>
      </PageTemplate>
    );
  }

  // Course Management View
  if (viewMode === 'manage') {
    return (
      <PageTemplate
        title="课程管理"
        subtitle="管理您的学习课程"
        showBackButton={true}
        onBackPress={() => setViewMode('home')}
        scrollable={false}
        backgroundColor={Colors.background}
        padding={0}
      >
        <ScrollView style={styles.scrollView}>
          {userCourses.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>我的课程</Text>
              </View>

              {userCourses.map(userCourse => {
                const courseProgress = getCourseProgress(userCourse.course_id);
                const progressPercentage = userCourse.progress_percentage || 0;

                return (
                  <View key={userCourse.id} style={styles.manageCourseCard}>
                    <View style={styles.courseHeader}>
                      <Text style={styles.courseName}>
                        {userCourse.course.name}
                      </Text>
                      <Text style={styles.courseDetails}>
                        {userCourse.course.teacher} • 共{userCourse.course.total_lessons}课 • {progressPercentage.toFixed(1)}%完成
                      </Text>
                      <Text style={styles.statusText}>
                        状态：{getStatusText(userCourse.status)}
                      </Text>
                    </View>

                    <View style={styles.buttonRow}>
                      {userCourse.status === 'active' ? (
                        <>
                          <TouchableOpacity 
                            style={styles.primaryButton}
                            onPress={() => router.push(`/course-detail/${userCourse.course_id}`)}
                          >
                            <Text style={styles.buttonText}>继续学习</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.secondaryButton}
                            onPress={() => pauseCourse(userCourse.course_id)}
                          >
                            <Text style={styles.secondaryButtonText}>暂停</Text>
                          </TouchableOpacity>
                        </>
                      ) : userCourse.status === 'paused' ? (
                        <TouchableOpacity 
                          style={styles.primaryButton}
                          onPress={() => resumeCourse(userCourse.course_id)}
                        >
                          <Text style={styles.buttonText}>恢复学习</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {availableCourses.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>可加入课程</Text>
              </View>

              {availableCourses.map(course => (
                <View key={course.id} style={styles.availableCourseCard}>
                  <View style={styles.courseHeader}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.courseDetails}>
                      {course.teacher} • {course.total_lessons}课
                    </Text>
                    {course.description && (
                      <Text style={styles.courseDescription}>{course.description}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.joinButton,
                      joiningCourse === course.id && styles.joinButtonLoading
                    ]}
                    onPress={() => joinCourse(course.id)}
                    disabled={joiningCourse === course.id}
                  >
                    <Text style={styles.joinButtonText}>
                      {joiningCourse === course.id ? '加入中...' : '加入学习'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </PageTemplate>
    );
  }

  // Course Detail View
  if (viewMode === 'courseDetail' && selectedCourse) {
    const courseProgress = getCourseProgress(selectedCourse.course_id);
    const lessons = courseLessons[selectedCourse.course_id] || [];

    return (
      <PageTemplate
        title={selectedCourse.course.name}
        showBackButton={true}
        onBackPress={() => setViewMode('home')}
        scrollable={false}
        backgroundColor={Colors.background}
        padding={0}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.section}>
            <View style={styles.courseInfoCard}>
              <Text style={styles.courseInfoTitle}>课程信息</Text>
              <View style={styles.courseInfoRow}>
                <Text style={styles.courseInfoLabel}>授课老师：</Text>
                <Text style={styles.courseInfoValue}>{selectedCourse.course.teacher}</Text>
              </View>
              <View style={styles.courseInfoRow}>
                <Text style={styles.courseInfoLabel}>总课数：</Text>
                <Text style={styles.courseInfoValue}>{selectedCourse.course.total_lessons}课</Text>
              </View>
              <View style={styles.courseInfoRow}>
                <Text style={styles.courseInfoLabel}>完成进度：</Text>
                <Text style={styles.courseInfoValue}>
                  {(selectedCourse.progress_percentage || 0).toFixed(1)}% 
                  ({Math.round((selectedCourse.progress_percentage || 0) * selectedCourse.course.total_lessons / 100)}/{selectedCourse.course.total_lessons}课)
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>课程内容</Text>
            </View>
            {lessons.map(lesson => (
              <View key={lesson.id} style={styles.lessonItem}>
                <View style={styles.lessonHeader}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <LessonProgressDisplay
                    userId={user.id}
                    courseId={selectedCourse.course_id}
                    lessonId={lesson.id}
                    refreshTrigger={refreshTrigger}
                  />
                </View>
                <View style={styles.recordButtons}>
                  <TouchableOpacity
                    style={[styles.recordButton, styles.listenButton]}
                    onPress={() => recordStudy(selectedCourse.course_id, lesson.lesson_number, '听传承')}
                  >
                    <Text style={styles.recordButtonText}>听传承</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.recordButton, styles.readButton]}
                    onPress={() => recordStudy(selectedCourse.course_id, lesson.lesson_number, '看法本')}
                  >
                    <Text style={styles.recordButtonText}>看法本</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.recordButton, styles.viewButton]}
                    onPress={() => {
                      if (lesson.url) {
                        Linking.openURL(lesson.url).catch(err => {
                          console.error('Failed to open URL:', err);
                          toastService.error({
                            title: '无法打开链接',
                            message: '请检查网络连接或稍后重试'
                          });
                        });
                      } else {
                        toastService.info({
                          title: '暂无在线链接',
                          message: '该课程资源正在准备中'
                        });
                      }
                    }}
                  >
                    <Text style={styles.recordButtonText}>在线课程</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </PageTemplate>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  classHeader: {
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  className: {
    fontSize: 20,
    fontWeight: '700',
    color: DesignSystem.colors.yellowTara,
    letterSpacing: -0.3,
  },
  courseCard: {
    ...ComponentTokens.card.variants.outlined,
    padding: ComponentTokens.card.padding.spacious,
    marginHorizontal: ComponentTokens.card.margin.spacious,
    marginBottom: ComponentTokens.card.margin.spacious,
  },
  manageCourseCard: {
    ...ComponentTokens.card.variants.outlined,
    padding: ComponentTokens.card.padding.comfortable,
    marginHorizontal: ComponentTokens.card.margin.spacious,
    marginBottom: ComponentTokens.card.margin.spacious,
  },
  availableCourseCard: {
    ...ComponentTokens.card.variants.outlined,
    padding: ComponentTokens.card.padding.comfortable,
    marginHorizontal: ComponentTokens.card.margin.spacious,
    marginBottom: ComponentTokens.card.margin.spacious,
  },
  courseHeader: {
    marginBottom: 12,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  courseInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  courseDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  statusText: {
    fontSize: 13,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  currentLessonText: {
    fontSize: 13,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: DesignSystem.colors.primary,
    borderRadius: 3,
  },
  continueButton: {
    backgroundColor: DesignSystem.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: DesignSystem.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  secondaryButtonText: {
    color: DesignSystem.colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  joinButton: {
    backgroundColor: DesignSystem.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  joinButtonLoading:{
    backgroundColor: '#9CA3AF',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  lessonItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lessonProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonProgress: {
    fontSize: 12,
    color: '#777',
    marginRight: 5,
  },
  completionCheck: {
    fontSize: 14,
    color: Colors.success,
  },
  recordButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  recordButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  listenButton: {
    backgroundColor: Colors.accent,
  },
  readButton: {
    backgroundColor: Colors.secondary,
  },
  viewButton: {
    backgroundColor: Colors.tertiary,
  },
  courseSummary: {
    padding: 20,
    alignItems: 'center',
  },
  courseSummaryText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  courseInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  courseInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  courseInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  courseInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 80,
  },
  courseInfoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 500,
  },
  iconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginLeft: 8,
  },
});