import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Modal } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { studyService } from '@/lib/database';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTokens } from '@/utils/componentTokens';
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
  const [summary, setSummary] = useState({ 
    听传承: 0, 
    看法本: 0, 
    共修: null as '回顾' | '串讲' | '参加' | '缺席' | null, 
    讲考: null as '讲考' | '提问' | '参加' | '缺席' | null 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, [userId, courseId, lessonId, refreshTrigger]);

  const loadCounts = async () => {
    try {
      const data = await studyService.getLessonStudySummary(userId, courseId, lessonId);
      setSummary(data);
    } catch (error) {
      console.error('Error loading lesson counts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text style={styles.lessonProgress}>加载中...</Text>;
  }

  const isCompleted = summary.听传承 > 0 && summary.看法本 > 0;

  if (showOnlyIcon) {
    return isCompleted ? (
      <Ionicons name="checkmark-done" size={18} color="#28a745" style={{ marginLeft: 8 }} />
    ) : null;
  }

  return (
    <View style={styles.lessonProgressContainer}>
      <Text style={styles.lessonProgress}>
        听传承: {summary.听传承}次 | 看法本: {summary.看法本}次
      </Text>
      {(summary.共修 || summary.讲考) && (
        <Text style={[styles.lessonProgress, { fontSize: 12, color: '#666', marginTop: 2 }]}>
          {summary.共修 && `共修: ${summary.共修}`}
          {summary.共修 && summary.讲考 && ' | '}
          {summary.讲考 && `讲考: ${summary.讲考}`}
        </Text>
      )}
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

  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [pendingRecord, setPendingRecord] = useState<{ lessonNumber: number; studyType: '共修' | '讲考' } | null>(null);

  const recordStudy = async (
    lessonNumber: number, 
    studyType: '听传承' | '看法本' | '共修' | '讲考', 
    status?: '回顾' | '串讲' | '参加' | '缺席' | '讲考' | '提问'
  ) => {
    if (!user || !courseId) return;

    // For 共修/讲考, show status picker if no status provided
    if ((studyType === '共修' || studyType === '讲考') && !status) {
      setPendingRecord({ lessonNumber, studyType });
      setStatusPickerVisible(true);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      await studyService.recordStudy({
        user_id: user.id,
        course_id: courseId,
        lesson_number: lessonNumber,
        study_date: today,
        study_type: studyType,
        study_count_for_lesson: 1,
        status: status  // Only used for 共修/讲考
      });

      toastService.success({
        title: '学习记录已保存',
        message: status ? `${studyType}: ${status}` : `${studyType}完成 - 继续加油！`
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

  const handleStatusSelect = async (status: '回顾' | '串讲' | '参加' | '缺席' | '讲考' | '提问') => {
    if (pendingRecord) {
      await recordStudy(pendingRecord.lessonNumber, pendingRecord.studyType, status);
      setPendingRecord(null);
    }
    setStatusPickerVisible(false);
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

            <View style={styles.recordButtonsContainer}>
              <View style={styles.recordButtonRow}>
                <TouchableOpacity 
                  style={[styles.recordButton, styles.primaryButton, styles.listenButton]}
                  onPress={() => recordStudy(lesson.lesson_number, '听传承')}
                >
                  <Text style={styles.primaryButtonText}>听传承</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.recordButton, styles.primaryButton, styles.readButton]}
                  onPress={() => recordStudy(lesson.lesson_number, '看法本')}
                >
                  <Text style={styles.primaryButtonText}>看法本</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.recordButtonRow}>
                <TouchableOpacity 
                  style={[styles.recordButton, styles.secondaryButton]}
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
                  <Text style={styles.secondaryButtonText}>在线课程</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.recordButton, styles.secondaryButton]}
                  onPress={() => recordStudy(lesson.lesson_number, '共修')}
                >
                  <Text style={styles.secondaryButtonText}>共修</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.recordButton, styles.secondaryButton]}
                  onPress={() => recordStudy(lesson.lesson_number, '讲考')}
                >
                  <Text style={styles.secondaryButtonText}>讲考</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Status Picker Modal for 共修/讲考 */}
        <Modal
          visible={statusPickerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setStatusPickerVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setStatusPickerVisible(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {pendingRecord?.studyType}
              </Text>
              
              {pendingRecord?.studyType === '共修' && (
                <>
                  <TouchableOpacity
                    style={[styles.statusButton, styles.primaryStatusButton]}
                    onPress={() => handleStatusSelect('回顾')}
                  >
                    <Text style={styles.statusButtonText}>回顾</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusButton, styles.primaryStatusButton]}
                    onPress={() => handleStatusSelect('串讲')}
                  >
                    <Text style={styles.statusButtonText}>串讲</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusButton, styles.attendedButton]}
                    onPress={() => handleStatusSelect('参加')}
                  >
                    <Text style={styles.statusButtonText}>✓ 参加</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusButton, styles.absentButton]}
                    onPress={() => handleStatusSelect('缺席')}
                  >
                    <Text style={styles.statusButtonText}>✗ 缺席</Text>
                  </TouchableOpacity>
                </>
              )}

              {pendingRecord?.studyType === '讲考' && (
                <>
                  <TouchableOpacity
                    style={[styles.statusButton, styles.primaryStatusButton]}
                    onPress={() => handleStatusSelect('讲考')}
                  >
                    <Text style={styles.statusButtonText}>讲考</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusButton, styles.primaryStatusButton]}
                    onPress={() => handleStatusSelect('提问')}
                  >
                    <Text style={styles.statusButtonText}>提问</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusButton, styles.attendedButton]}
                    onPress={() => handleStatusSelect('参加')}
                  >
                    <Text style={styles.statusButtonText}>✓ 参加</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusButton, styles.absentButton]}
                    onPress={() => handleStatusSelect('缺席')}
                  >
                    <Text style={styles.statusButtonText}>✗ 缺席</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setStatusPickerVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: DesignSystem.colors.textSecondary,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  courseInfoCard: {
    ...ComponentTokens.card.variants.outlined,
    padding: ComponentTokens.card.padding.spacious,
    marginHorizontal: ComponentTokens.card.margin.spacious,
    marginBottom: ComponentTokens.card.margin.spacious,
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
    color: DesignSystem.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  lessonItem: {
    ...ComponentTokens.card.variants.outlined,
    padding: ComponentTokens.card.padding.comfortable,
    marginHorizontal: ComponentTokens.card.margin.spacious,
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
    color: DesignSystem.colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordButtonsContainer: {
    gap: 8,
  },
  recordButtonRow: {
    flexDirection: 'row',
    gap: 10,
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
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#6B7280',
  },
  listenButton: {
    backgroundColor: '#10B981',
  },
  readButton: {
    backgroundColor: DesignSystem.colors.primary,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: '#6B7280',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  lessonItemSpacing: {
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryStatusButton: {
    backgroundColor: '#3B82F6',
  },
  attendedButton: {
    backgroundColor: '#10B981',
  },
  absentButton: {
    backgroundColor: '#EF4444',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
});