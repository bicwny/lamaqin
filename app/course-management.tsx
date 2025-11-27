import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { studyService, UserCourse } from '@/lib/database';
import { DesignSystem } from '@/constants/DesignSystem';
import { Colors } from '@/constants/Colors';
import { ComponentTokens } from '@/utils/componentTokens';
import PageTemplate from '@/components/PageTemplate';
import { router } from 'expo-router';
import { toastService } from '@/lib/toast';
import { CourseSkeleton } from '@/components/SkeletonLoader';

interface Course {
  id: string;
  name: string;
  total_lessons: number;
  teacher?: string;
  description?: string;
}

export default function CourseManagementScreen() {
  const { user } = useAuth();
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningCourse, setJoiningCourse] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [userCoursesData, allCoursesData] = await Promise.all([
        studyService.getUserCourses(user.id),
        studyService.getCourses()
      ]);
      
      setUserCourses(userCoursesData);
      setAllCourses(allCoursesData);
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
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

  const pauseCourse = async (courseId: string) => {
    console.log('🔴 pauseCourse called with courseId:', courseId);
    if (!user) {
      console.log('🔴 pauseCourse: No user found, returning early');
      return;
    }
    console.log('🔴 pauseCourse: User ID:', user.id);

    try {
      console.log('🔴 pauseCourse: Calling studyService.updateCourseStatus...');
      await studyService.updateCourseStatus(user.id, courseId, 'paused');
      console.log('🔴 pauseCourse: updateCourseStatus completed successfully');
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
      console.error('🔴 pauseCourse ERROR:', error);
      toastService.error({ 
        title: '暂停失败', 
        message: '请稍后重试' 
      });
    }
  };

  const resumeCourse = async (courseId: string) => {
    console.log('🟢 resumeCourse called with courseId:', courseId);
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

  const joinCourse = async (courseId: string) => {
    if (!user) return;

    try {
      setJoiningCourse(courseId);

      const isAlreadyEnrolled = userCourses.some(uc => uc.course_id === courseId);
      if (isAlreadyEnrolled) {
        toastService.info({
          title: '已加入课程',
          message: '您已经在学习这门课程了'
        });
        return;
      }

      const userCourse = await studyService.joinCourse(user.id, courseId);
      setUserCourses(prev => [...prev, userCourse]);

      toastService.success({ 
        title: '课程加入成功', 
        message: '开始您的学习之旅吧！' 
      });
    } catch (error: any) {
      console.error('Error joining course:', error);
      if (error?.code === '23505') {
        toastService.info({
          title: '已加入课程',
          message: '课程数据已同步'
        });
        loadData();
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

  const availableCourses = allCourses.filter(course => 
    !userCourses.some(uc => uc.course_id === course.id)
  );

  if (loading) {
    return (
      <PageTemplate
        title="课程管理"
        subtitle="管理您的学习课程"
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={Colors.background}
      >
        <ScrollView style={styles.scrollView}>
          <CourseSkeleton count={4} />
        </ScrollView>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="课程管理"
      subtitle="管理您的学习课程"
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable={false}
      backgroundColor={Colors.background}
    >
      <ScrollView style={styles.scrollView}>
        {userCourses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>我的课程</Text>
            </View>

            {userCourses.map(userCourse => {
              const progressPercentage = userCourse.progress_percentage || 0;
              const isActive = userCourse.status === 'active';
              const isPaused = userCourse.status === 'paused';
              const isCompleted = userCourse.status === 'completed';

              return (
                <View key={userCourse.id} style={styles.manageCourseCard}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.courseInfo}>
                      <Text style={styles.courseName}>
                        {userCourse.course.name}
                      </Text>
                      <Text style={styles.teacherName}>
                        {userCourse.course.teacher}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      isActive && styles.statusBadgeActive,
                      isPaused && styles.statusBadgePaused,
                      isCompleted && styles.statusBadgeCompleted,
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        isActive && styles.statusTextActive,
                        isPaused && styles.statusTextPaused,
                        isCompleted && styles.statusTextCompleted,
                      ]}>
                        {getStatusText(userCourse.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.progressInfo}>
                      <Text style={styles.lessonCount}>共{userCourse.course.total_lessons}课</Text>
                      <Text style={styles.progressPercent}>{progressPercentage.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBarFill, { width: `${Math.min(progressPercentage, 100)}%` }]} />
                    </View>
                  </View>

                  <View style={styles.buttonRow}>
                    {isActive ? (
                      <>
                        <TouchableOpacity 
                          style={styles.primaryButton}
                          activeOpacity={0.7}
                          onPress={() => {
                            console.log('🔵 继续学习 button pressed');
                            router.push(`/course-detail/${userCourse.course_id}`);
                          }}
                        >
                          <Text style={styles.buttonText}>继续学习</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.secondaryButton}
                          activeOpacity={0.7}
                          onPress={() => {
                            console.log('🔴 暂停 button pressed for course:', userCourse.course_id);
                            pauseCourse(userCourse.course_id);
                          }}
                        >
                          <Text style={styles.secondaryButtonText}>暂停</Text>
                        </TouchableOpacity>
                      </>
                    ) : isPaused ? (
                      <TouchableOpacity 
                        style={styles.primaryButton}
                        activeOpacity={0.7}
                        onPress={() => {
                          console.log('🟢 恢复学习 button pressed for course:', userCourse.course_id);
                          resumeCourse(userCourse.course_id);
                        }}
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
                <View style={styles.availableCardTopRow}>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.teacherName}>{course.teacher}</Text>
                  </View>
                  <View style={styles.lessonBadge}>
                    <Text style={styles.lessonBadgeText}>{course.total_lessons}课</Text>
                  </View>
                </View>

                {course.description && (
                  <Text style={styles.courseDescription}>{course.description}</Text>
                )}

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

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
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
  manageCourseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  courseInfo: {
    flex: 1,
    marginRight: 12,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  teacherName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusBadgePaused: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  statusBadgeCompleted: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  statusTextActive: {
    color: DesignSystem.colors.primary,
  },
  statusTextPaused: {
    color: '#f59e0b',
  },
  statusTextCompleted: {
    color: '#16a34a',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonCount: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 13,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: DesignSystem.colors.primary,
    borderRadius: 3,
  },
  availableCourseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  availableCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lessonBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  lessonBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  courseDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
    marginBottom: 16,
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
    cursor: 'pointer' as any,
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
    cursor: 'pointer' as any,
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
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  joinButtonLoading: {
    backgroundColor: '#9CA3AF',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
