
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
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

interface CourseLesson {
  id: string;
  lesson_number: number;
  title: string;
  course_id: string;
  url?: string;
}

export default function CourseDetailScreen() {
  const { user } = useAuth();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const [userCourse, setUserCourse] = useState<UserCourse | null>(null);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (user && courseId) {
      loadCourseData();
    }
  }, [user, courseId]);

  const loadCourseData = async () => {
    if (!user || !courseId) return;

    try {
      console.log('🔄 Loading course detail data for:', courseId);

      // Load user's enrollment for this course
      const userCourses = await studyService.getUserCourses(user.id);
      const foundUserCourse = userCourses.find(uc => uc.course_id === courseId);

      if (!foundUserCourse) {
        toastService.error({
          title: '课程未找到',
          message: '您尚未加入此课程'
        });
        router.back();
        return;
      }

      setUserCourse(foundUserCourse);

      // Load lessons for this course
      const courseLessons = await studyService.getCourseLessons(courseId);
      setLessons(courseLessons);

      console.log('✅ Course detail data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading course detail:', error);
      toastService.error({
        title: '加载失败',
        message: '无法加载课程信息，请稍后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  const recordStudy = async (lessonNumber: number, studyType: '听传承' | '看法本') => {
    if (!user || !courseId) return;

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

      // Reload course data to update progress
      loadCourseData();
    } catch (error) {
      console.error('Error recording study:', error);
      toastService.error({ 
        title: '保存失败', 
        message: '网络异常，请稍后重试' 
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader 
          title="课程详情" 
          subtitle="加载中..."
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userCourse) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader 
          title="课程详情" 
          subtitle="课程未找到"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>课程未找到</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader 
        title={userCourse.course.name}
        subtitle="课程详情与学习记录"
        showBackButton={true}
        onBackPress={() => router.back()}
      />
      <ScrollView style={styles.scrollView}>

        <View style={styles.courseInfoCard}>
          <Text style={styles.courseInfoTitle}>课程信息：</Text>
          <Text style={styles.courseInfoText}>授课老师：{userCourse.course.teacher}</Text>
          <Text style={styles.courseInfoText}>总课数：{userCourse.course.total_lessons}课</Text>
          <Text style={styles.courseInfoText}>
            完成进度：{(userCourse.progress_percentage || 0).toFixed(1)}% 
            ({Math.round((userCourse.progress_percentage || 0) * userCourse.course.total_lessons / 100)}/{userCourse.course.total_lessons}课)
          </Text>
        </View>

        <Text style={styles.sectionTitle}>课程内容：</Text>

        {lessons.map(lesson => (
          <View key={lesson.id} style={styles.lessonItem}>
            <View style={styles.lessonHeader}>
              <View style={styles.lessonTitleRow}>
                <Text style={styles.lessonTitle}>
                  {lesson.title}
                </Text>
              </View>
              <LessonProgressDisplay 
                userId={user.id}
                courseId={courseId}
                lessonId={lesson.id}
                refreshTrigger={refreshTrigger}
              />
            </View>

            <View style={styles.recordButtons}>
              <TouchableOpacity 
                style={[styles.recordButton, styles.listenButton]}
                onPress={() => recordStudy(lesson.lesson_number, '听传承')}
              >
                <Text style={styles.recordButtonText}>听传承</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.recordButton, styles.readButton]}
                onPress={() => recordStudy(lesson.lesson_number, '看法本')}
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

      </ScrollView>
    </SafeAreaView>
  );
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
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  courseInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  courseInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  courseInfoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  lessonItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  lessonHeader: {
    marginBottom: 12,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  lessonProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  lessonProgress: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  completionCheck: {
    fontSize: 16,
    marginLeft: 8,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  recordButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listenButton: {
    backgroundColor: '#10B981',
  },
  readButton: {
    backgroundColor: Colors.primary,
  },
  viewButton: {
    backgroundColor: '#F59E0B',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
