
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { studyService } from '@/lib/database';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/constants/DesignSystem';
import { componentHelpers } from '@/utils/componentTokens';
import { ComponentTextStyles } from '@/constants/DesignSystem';
import PageTemplate from '@/components/PageTemplate';
import { router, useLocalSearchParams } from 'expo-router';
import { toastService } from '@/lib/toast';

// Component to display lesson progress with real-time counts
const LessonProgressDisplay = ({ userId, courseId, lessonId, refreshTrigger, showOnlyIcon }: {
  userId: string;
  courseId: string;
  lessonId: string;
  refreshTrigger?: number;
  showOnlyIcon?: boolean;
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

  if (showOnlyIcon) {
    return isCompleted ? (
      <Ionicons name="checkmark-done" size={18} color={DesignSystem.colors.greenTara} style={{ marginLeft: DesignSystem.spacing.xs }} />
    ) : null;
  }

  return (
    <View style={styles.lessonProgressContainer}>
      <Text style={styles.lessonProgress}>
        听传承: {counts.听传承}次 | 看法本: {counts.看法本}次
      </Text>
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
      <PageTemplate
        title="课程详情" 
        subtitle="加载中..."
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </PageTemplate>
    );
  }

  if (!userCourse) {
    return (
      <PageTemplate
        title="课程详情" 
        subtitle="课程未找到"
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>课程未找到</Text>
        </View>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={userCourse.course.name}
      subtitle="课程详情与学习记录"
      showBackButton={true}
      onBackPress={() => router.back()}
      backgroundColor={DesignSystem.colors.background}
      padding={0}
    >

        <View style={styles.courseInfoCard}>
          <Text style={styles.courseInfoTitle}>课程信息：</Text>
          <Text style={styles.courseInfoText}>
            讲解：{userCourse.course.teacher} • 完成：{Math.round((userCourse.progress_percentage || 0) * userCourse.course.total_lessons / 100)}/{userCourse.course.total_lessons}课（{(userCourse.progress_percentage || 0).toFixed(1)}%）
          </Text>
        </View>

        <Text style={styles.sectionTitle}>课程内容：</Text>

        {lessons.map((lesson, index) => (
          <View key={lesson.id} style={[styles.lessonItem, index > 0 && styles.lessonItemSpacing]}>
            <View style={styles.lessonHeader}>
              <View style={styles.lessonTitleRow}>
                <Text style={styles.lessonTitle}>
                  {lesson.title}
                </Text>
                <LessonProgressDisplay 
                  userId={user.id} 
                  courseId={courseId} 
                  lessonId={lesson.id} 
                  refreshTrigger={refreshTrigger}
                  showOnlyIcon={true}
                />
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

    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing.lg,
  },
  loadingText: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    marginTop: DesignSystem.spacing.md,
  },
  sectionTitle: {
    ...ComponentTextStyles.heading,
    color: DesignSystem.colors.textPrimary,
    marginTop: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  courseInfoCard: {
    ...componentHelpers.getCardStyle('elevated', 'lg'),
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    marginBottom: DesignSystem.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: DesignSystem.colors.yellowTara, // Yellow Tara for wisdom and learning
  },
  courseInfoTitle: {
    ...ComponentTextStyles.subheading,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.xs,
  },
  courseInfoText: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    marginBottom: DesignSystem.spacing.xxs,
  },
  lessonItem: {
    ...componentHelpers.getCardStyle('elevated', 'md'),
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    marginHorizontal: DesignSystem.spacing.lg,
  },
  lessonHeader: {
    marginBottom: DesignSystem.spacing.sm,
  },
  lessonTitle: {
    ...ComponentTextStyles.subheading,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.xxs,
    flex: 1,
  },
  lessonProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: DesignSystem.spacing.xxs,
  },
  lessonProgress: {
    ...ComponentTextStyles.caption,
    color: DesignSystem.colors.textSecondary,
    flex: 1,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordButtons: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  recordButton: {
    ...componentHelpers.getButtonStyle('primary', 'md'),
    flex: 1,
    alignItems: 'center',
  },
  listenButton: {
    backgroundColor: DesignSystem.colors.greenTara, // Green Tara for completion and growth
  },
  readButton: {
    backgroundColor: DesignSystem.colors.yellowTara, // Yellow Tara for wisdom and study
  },
  viewButton: {
    backgroundColor: DesignSystem.colors.orangeTara, // Orange Tara for compassionate access to teachings
  },
  recordButtonText: {
    ...ComponentTextStyles.button,
    color: DesignSystem.colors.textInverse,
  },
  lessonItemSpacing: {
    marginTop: DesignSystem.spacing.sm,
  },
});
