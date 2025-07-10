import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

import { Colors } from '@/constants/Colors';
import PageHeader from '@/components/PageHeader';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

interface NextLesson {
  courseId: string;
  courseName: string;
  lessonNumber: number;
  lessonTitle: string;
  progress: string;
}

interface DailyPractice {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  status: 'completed' | 'in_progress' | 'pending';
  progressPercent: number;
  type: 'count' | 'time';
}

interface WeeklyPractice {
  id: string;
  name: string;
  weekSessions: number;
  weekTarget: number;
  todaySessions: number;
  status: 'completed' | 'in_progress' | 'pending';
  todayDetails?: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [courseLessons, setCourseLessons] = useState<Array<{
    courseId: string;
    courseName: string;
    lessonNumber: number;
    lessonTitle: string;
    progress: string;
    lessonId: string;
    url?: string;
  }>>([]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        loadDashboardData();
      }
    }, [user?.id])
  );

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      await Promise.all([
        loadCourseLessons(),
        loadDailyPractices(),
        loadWeeklyPractices()
      ]);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const loadCourseLessons = async () => {
    try {
      // Get user's active courses with progress
      const { data: userCourses, error } = await supabase
        .from('user_courses')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('progress_percentage', { ascending: false });

      if (error) throw error;

      if (!userCourses || userCourses.length === 0) {
        setCourseLessons([]);
        return;
      }

      const allCourseLessons = [];

      for (const userCourse of userCourses) {
        // Get study records to find the next incomplete lesson
        const { data: studyRecords, error: studyError } = await supabase
          .from('study_records')
          .select(`
            lesson_id,
            study_type,
            lesson:course_lessons(lesson_number, title, id)
          `)
          .eq('user_id', user.id)
          .eq('course_id', userCourse.course_id);

        if (studyError) throw studyError;

        // Get all lessons for this course to find the next one
        const { data: allLessons, error: lessonsError } = await supabase
          .from('course_lessons')
          .select('*')
          .eq('course_id', userCourse.course_id)
          .order('lesson_number');

        if (lessonsError) throw lessonsError;

        // Find completed lessons (both 听传承 and 看法本)
        const lessonCompletionMap = new Map();
        studyRecords?.forEach(record => {
          if (!lessonCompletionMap.has(record.lesson_id)) {
            lessonCompletionMap.set(record.lesson_id, { 
              听传承: false, 
              看法本: false,
              lessonNumber: record.lesson?.lesson_number || 0,
              title: record.lesson?.title || `第${record.lesson?.lesson_number || 0}课`
            });
          }

          const lessonData = lessonCompletionMap.get(record.lesson_id);
          if (record.study_type === '听传承') {
            lessonData.听传承 = true;
          } else if (record.study_type === '看法本') {
            lessonData.看法本 = true;
          }
        });

        // Find the next incomplete lesson
        let nextLessonNumber = 1;
        let nextLessonId = '';
        let nextLessonTitle = '第1课';
        let nextLessonUrl = '';

        for (let i = 1; i <= userCourse.course.total_lessons; i++) {
          const lessonData = Array.from(lessonCompletionMap.values()).find(l => l.lessonNumber === i);
          if (!lessonData || !lessonData.听传承 || !lessonData.看法本) {
            nextLessonNumber = i;
            const nextLesson = allLessons?.find(l => l.lesson_number === i);
            if (nextLesson) {
              nextLessonId = nextLesson.id;
              nextLessonTitle = nextLesson.title || `第${i}课`;
              nextLessonUrl = nextLesson.url || '';
            }
            break;
          }
        }

        const completedLessons = Array.from(lessonCompletionMap.values()).filter(
          lesson => lesson.听传承 && lesson.看法本
        ).length;

        allCourseLessons.push({
          courseId: userCourse.course_id,
          courseName: userCourse.course.name,
          lessonNumber: nextLessonNumber,
          lessonTitle: nextLessonTitle,
          lessonId: nextLessonId,
          url: nextLessonUrl,
          progress: `${completedLessons}/${userCourse.course.total_lessons}课已完成 (${Math.round((completedLessons / userCourse.course.total_lessons) * 100)}%)`
        });
      }

      setCourseLessons(allCourseLessons);

    } catch (error) {
      console.error('Error loading course lessons:', error);
      setCourseLessons([]);
    }
  };

  const loadDailyPractices = async () => {
    try {
      const { data: projects, error } = await supabase
        .from('user_practice_projects')
        .select(`
          *,
          practices(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .eq('target_period', 'daily')
        .limit(3);

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const practicesData: DailyPractice[] = [];

      for (const project of projects || []) {
        if (project.practices.type === 'count') {
          // Get today's records for count-based practices
          const { data: todayRecords, error: recordsError } = await supabase
            .from('daily_records')
            .select('count')
            .eq('user_id', user.id)
            .eq('practice_project_id', project.id)
            .eq('record_date', today);

          if (recordsError) throw recordsError;

          const todayCount = todayRecords?.reduce((sum, record) => sum + record.count, 0) || 0;
          const progressPercent = Math.min((todayCount / project.daily_target) * 100, 100);

          let status: 'completed' | 'in_progress' | 'pending' = 'pending';
          if (todayCount >= project.daily_target) status = 'completed';
          else if (todayCount > 0) status = 'in_progress';

          practicesData.push({
            id: project.id,
            name: project.practices.name,
            current: todayCount,
            target: project.daily_target,
            unit: project.practices.unit,
            status,
            progressPercent,
            type: 'count'
          });
        }
      }

      setDailyPractices(practicesData);
    } catch (error) {
      console.error('❌ Error loading daily practices:', error);
      setDailyPractices([]);
    }
  };

  const loadWeeklyPractices = async () => {
    try {
      const { data: projects, error } = await supabase
        .from('user_practice_projects')
        .select(`
          *,
          practices(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .eq('target_period', 'weekly')
        .limit(3);

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];

      // Use Monday as week start for consistency with getCurrentWeekStart()
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      const weekStart = monday.toISOString().split('T')[0];

      const practicesData: WeeklyPractice[] = [];

      for (const project of projects || []) {
        if (project.practices.type === 'time') {
          // Get this week's meditation records
          const { data: weekRecords, error: weekError } = await supabase
            .from('meditation_records')
            .select('duration_minutes, record_date')
            .eq('user_id', user.id)
            .eq('practice_id', project.practice_id)
            .gte('record_date', weekStart)
            .lte('record_date', today);

          if (weekError) throw weekError;

          const weekSessions = weekRecords?.length || 0;
          const todayRecords = weekRecords?.filter(r => r.record_date === today) || [];
          const todaySessions = todayRecords.length;

          let status: 'completed' | 'in_progress' | 'pending' = 'pending';
          if (weekSessions >= project.daily_target) status = 'completed';
          else if (weekSessions > 0) status = 'in_progress';

          const todayDetails = todayRecords.length > 0 
            ? todayRecords.map((record, index) => `第${index + 1}座${record.duration_minutes}分钟`).join('；')
            : undefined;

          practicesData.push({
            id: project.id,
            name: project.practices.name,
            weekSessions,
            weekTarget: project.daily_target,
            todaySessions,
            status,
            todayDetails,
            practiceId: project.practice_id,
            type: 'time'
          });
        }
      }

      setWeeklyPractices(practicesData);
    } catch (error) {
      console.error('❌ Error loading weekly practices:', error);
      setWeeklyPractices([]);
    }
  };

  const navigateToProfile = () => {
    router.push('/(tabs)/profile');
  };

  const navigateToStudy = () => {
    router.push('/(tabs)/study');
  };

  const recordStudy = async (courseId: string, lessonNumber: number, studyType: '听传承' | '看法本') => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Find the lesson
      const { data: lessons, error: lessonError } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('course_id', courseId)
        .eq('lesson_number', lessonNumber)
        .limit(1);

      if (lessonError || !lessons || lessons.length === 0) {
        Alert.alert('错误', '课程信息有误');
        return;
      }

      const studyRecord = {
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessons[0].id,
        study_date: today,
        study_type: studyType,
        study_count_for_lesson: 1
      };

      const { error } = await supabase
        .from('study_records')
        .insert(studyRecord);

      if (error) throw error;

      Alert.alert('成功', `${studyType}记录已保存`);

      // Refresh the lessons
      loadCourseLessons();
    } catch (error) {
      console.error('Error recording study:', error);
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const navigateToPractice = () => {
    router.push('/(tabs)/practice');
  };



  // Handle tapping the whole practice card to view history
  const handlePracticeCardTap = (practice: any) => {
    if (practice.type === 'time' || practice.weekSessions !== undefined) {
      // For meditation practices (both daily and weekly), show meditation history
      router.push({
        pathname: '/meditation-history',
        params: {
          practiceId: practice.practiceId || practice.id,
          practiceName: practice.name,
        },
      });
    } else {
      // For count-based practices, show regular history
      router.push({
        pathname: '/practice-history',
        params: {
          projectId: practice.id,
          practiceName: practice.name,
        },
      });
    }
  };

  // Handle quick complete button (check mark)
  const handleQuickComplete = async (e: any, practice: any) => {
    e.stopPropagation(); // Prevent card tap

    if (practice.status === 'completed') {
      // Already completed, just show message
      Alert.alert('已完成', '今日目标已达成！');
      return;
    }

    // Calculate remaining amount to complete daily target
    const remaining = practice.target - practice.current;

    Alert.alert(
      '快速完成',
      `需要记录 ${remaining.toLocaleString()} ${practice.unit} 来完成今日目标，确认记录？`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确认', 
          onPress: () => recordQuickComplete(practice, remaining)
        }
      ]
    );
  };

  // Handle add record button (plus)
  const handleAddRecord = (e: any, practice: any) => {
    e.stopPropagation(); // Prevent card tap

    if (practice.type === 'time' || practice.weekSessions !== undefined) {
      // For meditation practices (both daily and weekly), navigate to meditation record modal
      router.push({
        pathname: '/modals/meditation-record',
        params: {
          projectId: practice.id,
          practiceId: practice.practiceId || practice.id,
          practiceName: practice.name,
        },
      });
    } else {
      // For count-based practices, show custom record modal
      router.push({
        pathname: '/modals/custom-record',
        params: {
          projectId: practice.id,
          practiceName: practice.name,
          practiceType: practice.type,
        },
      });
    }
  };

  // Record quick complete amount
  const recordQuickComplete = async (practice: any, amount: number) => {
    if (!user) return;

    try {
      setLoading(true);

      if (practice.type === 'time') {
        // For time-based practices, create a meditation record with target duration
        const { error } = await supabase
          .from('meditation_records')
          .insert({
            user_id: user.id,
            practice_id: practice.practiceId,
            record_date: new Date().toISOString().split('T')[0],
            duration_minutes: amount, // Use remaining amount as duration
            session_number: 1,
          });

        if (error) throw error;
      } else {
        // For count-based practices, create a daily record
        const { error: recordError } = await supabase
          .from('daily_records')
          .insert({
            user_id: user.id,
            practice_project_id: practice.id,
            record_date: new Date().toISOString().split('T')[0],
            count: amount,
            notes: '快速完成今日目标'
          });

        if (recordError) throw recordError;

        // Update project's current count
        const { error: updateError } = await supabase
          .from('user_practice_projects')
          .update({ 
            current_count: practice.current + amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', practice.id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      // Reload data to reflect changes
      loadDashboardData();

      Alert.alert('成功', '已完成今日目标！');
    } catch (error) {
      console.error('❌ Error recording quick complete:', error);
      Alert.alert('错误', '记录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙 夜深了，早点休息';
    if (hour < 12) return '🌅 早上好，开始今日修行';
    if (hour < 18) return '☀️ 下午好，精进不懈';
    return '🌆 晚上好，回顾今日收获';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      default: return '⏳';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <PageHeader 
            title="🏠 修行主页"
            subtitle={getGreeting()}
            rightAction={{
              text: "👤",
              onPress: navigateToProfile
            }}
          />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <PageHeader 
          title="🏠 修行主页"
          subtitle={`${getGreeting()} • 圆青居士 · 修行第365天 🔥`}
          rightAction={{
            text: "👤",
            onPress: navigateToProfile
          }}
        />


        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Study Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📚 今日学习</Text>
              <TouchableOpacity onPress={navigateToStudy}>
                <Text style={styles.viewMoreText}>查看更多</Text>
              </TouchableOpacity>
            </View>

            {courseLessons.map((nextLesson, index) => (
              <TouchableOpacity key={index} style={styles.studyCard} onPress={navigateToStudy}>
                <View style={styles.studyCardHeader}>
                  <Text style={styles.studyCardTitle}>下一课</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.courseName}>{nextLesson.courseName}</Text>
                <Text style={styles.lessonTitle}>{nextLesson.lessonTitle}</Text>
                <Text style={styles.progressText}>{nextLesson.progress}</Text>
                <View style={styles.quickActionButtons}>
                  <TouchableOpacity 
                    style={[styles.quickActionButton, styles.listenButton]}
                    onPress={() => recordStudy(nextLesson.courseId, nextLesson.lessonNumber, '听传承')}
                  >
                    <Text style={styles.quickActionButtonText}>听传承</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.quickActionButton, styles.readButton]}
                    onPress={() => recordStudy(nextLesson.courseId, nextLesson.lessonNumber, '看法本')}
                  >
                    <Text style={styles.quickActionButtonText}>看法本</Text>
                  </TouchableOpacity>
                  {nextLesson.url ? (
                    <TouchableOpacity 
                      style={[styles.quickActionButton, styles.onlineButton]}
                      onPress={() => Linking.openURL(nextLesson.url || '')}
                    >
                      <Text style={styles.quickActionButtonText}>在线课程</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <View style={styles.continueButton}>
                  <Text style={styles.continueButtonText}>继续学习</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Practice Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📿 今日修行</Text>
              <TouchableOpacity onPress={navigateToPractice}>
                <Text style={styles.viewMoreText}>查看更多</Text>
              </TouchableOpacity>
            </View>

            {/* Daily Practices */}
            {dailyPractices.map((practice) => (
              <TouchableOpacity 
                key={practice.id} 
                style={styles.practiceCard}
                onPress={() => handlePracticeCardTap(practice)}
                activeOpacity={0.7}
              >
                <View style={styles.practiceHeader}>
                  <View style={styles.practiceNameRow}>
                    <Text style={styles.practiceStatusIcon}>
                      {getStatusIcon(practice.status)}
                    </Text>
                    <Text style={styles.practiceName}>{practice.name}</Text>
                  </View>
                  <Text style={styles.practiceCount}>
                    {practice.current.toLocaleString()}/{practice.target.toLocaleString()} {practice.unit}
                  </Text>
                </View>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${Math.min(practice.progressPercent, 100)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressPercent}>
                    {Math.round(practice.progressPercent)}%
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.practiceActions}>
                  <TouchableOpacity 
                    style={[
                      styles.actionButton, 
                      styles.checkButton,
                      practice.status === 'completed' && styles.checkButtonCompleted
                    ]}
                    onPress={(e) => handleQuickComplete(e, practice)}
                  >
                    <Text style={[
                      styles.actionButtonText,
                      practice.status === 'completed' && styles.checkButtonCompletedText
                    ]}>
                      {practice.status === 'completed' ? '✓' : '✓'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.addButton]}
                    onPress={(e) => handleAddRecord(e, practice)}
                  >
                    <Text style={styles.actionButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}

            {/* Weekly Practices */}
            {weeklyPractices.map((practice) => (
              <TouchableOpacity 
                key={practice.id} 
                style={styles.practiceCard}
                onPress={() => handlePracticeCardTap(practice)}
                activeOpacity={0.7}
              >
                <View style={styles.practiceHeader}>
                  <View style={styles.practiceNameRow}>
                    <Text style={styles.practiceStatusIcon}>
                      {getStatusIcon(practice.status)}
                    </Text>
                    <Text style={styles.practiceName}>{practice.name}</Text>
                  </View>
                </View>
                <Text style={styles.weeklyProgress}>
                  本周 {practice.weekSessions}/{practice.weekTarget}座
                  {practice.status === 'completed' && ' ✅'}
                </Text>
                {practice.todaySessions > 0 && practice.todayDetails && (
                  <Text style={styles.todayDetails}>
                    今日：{practice.todayDetails}
                  </Text>
                )}

                {/* Action Button for Weekly Practices */}
                <View style={styles.practiceActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.addButton]}
                    onPress={(e) => handleAddRecord(e, practice)}
                  >
                    <Text style={styles.actionButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}

            {dailyPractices.length === 0 && weeklyPractices.length === 0 && (
              <TouchableOpacity style={styles.practiceCard} onPress={navigateToPractice}>
                <Text style={styles.noPracticeText}>🙏 暂无修行项目，点击添加</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
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
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  viewMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  studyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studyCardTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  quickActionButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  listenButton: {
    backgroundColor: '#28a745',
  },
  readButton: {
    backgroundColor: '#007bff',
  },
  onlineButton: {
    backgroundColor: '#da4347',
  },
  quickActionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noStudyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  practiceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  practiceHeader: {
    marginBottom: 8,
  },
  practiceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  practiceStatusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  practiceCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginRight: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
    minWidth: 35,
  },
  practiceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  checkButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#28a745',
  },
  checkButtonCompleted: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  addButton: {
    backgroundColor: '#f8f9fa',
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
  },
  checkButtonCompletedText: {
    color: 'white',
  },
  weeklyProgress: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  todayDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  noPracticeText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});