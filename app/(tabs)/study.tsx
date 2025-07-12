import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, FlatList, Linking } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { studyService } from '@/lib/database';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import PageHeader from '@/components/PageHeader';
import { router, useLocalSearchParams } from 'expo-router';
import { toastService } from '@/lib/toast';

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
      {isCompleted && <Text style={styles.completionCheck}>已完成</Text>}
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
}

type ViewMode = 'home' | 'manage' | 'courseDetail';

export default function StudyScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<StudyProgress[]>([]);
  const [courseLessons, setCourseLessons] = useState<Record<string, CourseLesson[]>>({});
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

      // Load user's courses
      const userCoursesData = await getUserCourses(user.id);
      setUserCourses(userCoursesData);

      // Load all available courses
      const allCoursesData = await studyService.getCourses();
      setAllCourses(allCoursesData);

      // Load progress data
      const progressData = await studyService.getUserStudyProgress(user.id);
      const organizedProgress = processProgressData(progressData, userCoursesData);
      setProgress(organizedProgress);

      // Recalculate progress for all enrolled courses to ensure accuracy
      for (const userCourse of userCoursesData) {
        await studyService.calculateProgress(user.id, userCourse.course_id);
      }

      // Reload user courses to get updated progress percentages
      const updatedUserCoursesData = await getUserCourses(user.id);
      setUserCourses(updatedUserCoursesData);

      console.log('📊 Updated user courses after progress calculation:', updatedUserCoursesData.map(uc => ({
        name: uc.course.name,
        progress: uc.progress_percentage
      })));

      // Load lessons for enrolled courses
      const lessonsData: Record<string, CourseLesson[]> = {};
      for (const userCourse of userCoursesData) {
        const lessons = await studyService.getCourseLessons(userCourse.course_id);
        lessonsData[userCourse.course_id] = lessons;
      }
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

    try {
      await studyService.updateCourseStatus(user.id, courseId, 'paused');
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
      console.error('Error pausing course:', error);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader 
          title="闻思学习" 
          subtitle="系统学习佛法课程"
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Home View
  if (viewMode === 'home') {
    if (userCourses.length === 0) {
      return (
        <SafeAreaView style={styles.container}>
          <PageHeader 
            title="闻思学习" 
            subtitle="系统学习佛法课程"
          />
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

            <View style={styles.emptyState}>
              <View style={styles.iconContainer}>
                <Ionicons name="book-outline" size={80} color="#9CA3AF" />
              </View>

              <Text style={styles.emptyTitle}>还没有课程，开始学习吧</Text>
              <Text style={styles.emptyDescription}>
                选择您感兴趣的课程，开始系统的闻思学习
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
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <PageHeader 
          title="闻思学习" 
          subtitle="系统学习佛法课程"
          rightAction={{
            text: "管理课程",
            onPress: () => setViewMode('manage')
          }}
        />
        <ScrollView style={styles.scrollView}>

          <Text style={styles.sectionTitle}>我的课程：</Text>

          {userCourses.filter(uc => uc.status === 'active').map(userCourse => {
            const courseProgress = getCourseProgress(userCourse.course_id);
            const currentLesson = courseProgress?.currentLesson || 1;
            const progressPercentage = userCourse.progress_percentage || 0;

            return (
              <TouchableOpacity 
                key={userCourse.id} 
                style={styles.courseCard}
                onPress={() => {
                  setSelectedCourse(userCourse);
                  setViewMode('courseDetail');
                }}
              >
                <Text style={styles.courseName}>{userCourse.course.name}</Text>
                <Text style={styles.courseInfo}>
                  {userCourse.course.total_lessons}课 | 完成 {progressPercentage.toFixed(1)}%
                </Text>
                <Text style={styles.lastStudied}>
                  上次完成：第{currentLesson}课
                </Text>

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

          {/* Course Summary Footer */}
          <View style={styles.courseSummary}>
            <Text style={styles.courseSummaryText}>
              {userCourses.length}门课程已加入，{userCourses.filter(uc => uc.status === 'paused').length}门课程已隐藏
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Course Management View
  if (viewMode === 'manage') {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader 
          title="课程管理" 
          subtitle="管理您的学习课程"
          showBackButton={true}
          onBackPress={() => setViewMode('home')}
        />
        <ScrollView style={styles.scrollView}>

          {userCourses.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>我的课程：</Text>
              {userCourses.map(userCourse => {
                const courseProgress = getCourseProgress(userCourse.course_id);
                const progressPercentage = userCourse.progress_percentage || 0;

                return (
                  <View key={userCourse.id} style={styles.manageCourseCard}>
                    <View style={styles.courseHeader}>
                      <Text style={styles.courseName}>
                        {userCourse.course.name} {getStatusIcon(userCourse.status)}{getStatusText(userCourse.status)}
                      </Text>
                      <Text style={styles.courseDetails}>
                        {userCourse.course.teacher} | {userCourse.course.total_lessons}课 | {progressPercentage.toFixed(1)}%完成
                      </Text>
                    </View>

                    <View style={styles.buttonRow}>
                      {userCourse.status === 'active' ? (
                        <>
                          <TouchableOpacity 
                            style={styles.primaryButton}
                            onPress={() => {
                              setSelectedCourse(userCourse);
                              setViewMode('courseDetail');
                            }}
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
            </>
          )}

          {availableCourses.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>可加入课程：</Text>
              {availableCourses.map(course => (
                <View key={course.id} style={styles.availableCourseCard}>
                  <View style={styles.courseHeader}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.courseDetails}>
                      {course.teacher} | {course.total_lessons}课
                    </Text>
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
            </>
          )}

          </ScrollView>
      </SafeAreaView>
    );
  }

  // Course Detail View
  if (viewMode === 'courseDetail' && selectedCourse) {
    const courseProgress = getCourseProgress(selectedCourse.course_id);
    const lessons = courseLessons[selectedCourse.course_id] || [];

    return (
      <SafeAreaView style={styles.container}>
        <PageHeader 
          title={selectedCourse.course.name}
          subtitle="课程详情与学习记录"
          showBackButton={true}
          onBackPress={() => setViewMode('home')}
        />
        <ScrollView style={styles.scrollView}>

          <View style={styles.courseInfoCard}>
            <Text style={styles.courseInfoTitle}>课程信息：</Text>
            <Text style={styles.courseInfoText}>授课老师：{selectedCourse.course.teacher}</Text>
            <Text style={styles.courseInfoText}>总课数：{selectedCourse.course.total_lessons}课</Text>
            <Text style={styles.courseInfoText}>
              完成进度：{(selectedCourse.progress_percentage || 0).toFixed(1)}% 
              ({Math.round((selectedCourse.progress_percentage || 0) * selectedCourse.course.total_lessons / 100)}/{selectedCourse.course.total_lessons}课)
            </Text>
          </View>

          <Text style={styles.sectionTitle}>课程内容：</Text>

          {lessons.map(lesson => {
            const listenCount = courseProgress?.listenCount[lesson.lesson_number] || 0;
            const kanfabenCount = courseProgress?.listenCount[lesson.lesson_number] || 0;
            const isCompleted = listenCount > 0 && kanfabenCount > 0;

            return (
              <View key={lesson.id} style={styles.lessonItem}>
                <View style={styles.lessonHeader}>
                  <View style={styles.lessonTitleRow}>
                    <Text style={styles.lessonTitle}>
                      {lesson.title}
                    </Text>
                  </View>
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
                        // Open URL directly in user's default browser
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
            );
          })}

          </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  courseCard: {
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
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  courseTeacher: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.2,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});