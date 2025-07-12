import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, ActivityIndicator } from 'react-native';
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
import { RefreshControl } from 'react-native';
import Avatar from '@/components/Avatar';

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
  const [userDharmaName, setUserDharmaName] = useState('圆青'); // Default dharma name
  const [courseLessons, setCourseLessons] = useState<Array<{
    courseId: string;
    courseName: string;
    lessonNumber: number;
    lessonTitle: string;
    progress: string;
    lessonId: string;
    url?: string;
    listenCount: number;
    readCount: number;
    totalLessons: number;
    completedLessons: number;
    isCourseCompleted: boolean;
  }>>([]);
  const [dailyPractices, setDailyPractices] = useState<DailyPractice[]>([]);
  const [weeklyPractices, setWeeklyPractices] = useState<WeeklyPractice[]>([]);

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
        loadWeeklyPractices(),
        loadUserProfile()
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

        // Count study records by lesson and type
        const lessonStudyMap = new Map();
        studyRecords?.forEach(record => {
          if (!lessonStudyMap.has(record.lesson_id)) {
            lessonStudyMap.set(record.lesson_id, { 
              听传承: 0, 
              看法本: 0,
              lessonNumber: record.lesson?.lesson_number || 0,
              title: record.lesson?.title || `第${record.lesson?.lesson_number || 0}课`
            });
          }

          const lessonData = lessonStudyMap.get(record.lesson_id);
          if (record.study_type === '听传承') {
            lessonData.听传承++;
          } else if (record.study_type === '看法本') {
            lessonData.看法本++;
          }
        });

        // Find the next incomplete lesson
        let currentLessonNumber = 1;
        let currentLessonId = '';
        let currentLessonTitle = '';
        let currentLessonUrl = '';
        let listenCount = 0;
        let readCount = 0;

        for (let i = 1; i <= userCourse.course.total_lessons; i++) {
          const lessonData = Array.from(lessonStudyMap.values()).find(l => l.lessonNumber === i);
          const hasListened = lessonData && lessonData.听传承 > 0;
          const hasRead = lessonData && lessonData.看法本 > 0;

          if (!hasListened || !hasRead) {
            currentLessonNumber = i;
            const currentLesson = allLessons?.find(l => l.lesson_number === i);
            if (currentLesson) {
              currentLessonId = currentLesson.id;
              currentLessonTitle = currentLesson.title || `第${i}课`;
              currentLessonUrl = currentLesson.url || '';
            } else {
              // If no lesson found, use fallback title
              currentLessonTitle = `第${i}课`;
            }

            // Get current counts for this lesson
            if (lessonData) {
              listenCount = lessonData.听传承;
              readCount = lessonData.看法本;
            }
            break;
          }
        }

        const completedLessons = Array.from(lessonStudyMap.values()).filter(
          lesson => lesson.听传承 > 0 && lesson.看法本 > 0
        ).length;

        // Check if course is completed (all lessons have both study types)
        const isCourseCompleted = completedLessons === userCourse.course.total_lessons;

        allCourseLessons.push({
          courseId: userCourse.course_id,
          courseName: userCourse.course.name,
          lessonNumber: currentLessonNumber,
          lessonTitle: currentLessonTitle,
          lessonId: currentLessonId,
          url: currentLessonUrl,
          listenCount,
          readCount,
          totalLessons: userCourse.course.total_lessons,
          completedLessons,
          isCourseCompleted
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

  const loadUserProfile = async () => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('dharma_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error fetching user dharma name:', error);
      } else if (userData?.dharma_name) {
        setUserDharmaName(userData.dharma_name);
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
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

      // Refresh the lessons to update counts and check for lesson completion
      await loadCourseLessons();
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

  const [todayStats, setTodayStats] = useState<{completedCount: number; totalMinutes: number} | null>(null);

  useEffect(() => {
    const fetchTodayStats = async () => {
      if (!user?.id) return;

      try {
        const today = new Date().toISOString().split('T')[0];

        // Fetch count-based practices completed today
        const { data: countRecords, error: countError } = await supabase
          .from('daily_records')
          .select('*')
          .eq('user_id', user.id)
          .eq('record_date', today);

        if (countError) throw countError;

        // Fetch time-based practices (meditation) completed today
        const { data: meditationRecords, error: meditationError } = await supabase
          .from('meditation_records')
          .select('*')
          .eq('user_id', user.id)
          .eq('record_date', today);

        if (meditationError) throw meditationError;

        const completedCount = (countRecords?.length || 0) + (meditationRecords?.length || 0);
        const totalMinutes = meditationRecords?.reduce((sum, record) => sum + record.duration_minutes, 0) || 0;

        setTodayStats({ completedCount, totalMinutes });
      } catch (error) {
        console.error('❌ Error fetching today stats:', error);
        setTodayStats(null);
      }
    };

    fetchTodayStats();
  }, [user?.id]);

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
          subtitle={`${getGreeting()} • ${userDharmaName}居士 · 修行第365天 🔥`}
          rightAction={{
            component: <Avatar dharmaName={userDharmaName} size={32} />,
            onPress: navigateToProfile
          }}
        />


        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {todayStats && (
            <Text style={styles.statsText}>
              {`今日已完成 ${todayStats.completedCount} 项修行，总计 ${todayStats.totalMinutes} 分钟`}
            </Text>
          )}
          {/* Study Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📚 今日学习</Text>
              <TouchableOpacity onPress={navigateToStudy}>
                <Text style={styles.viewMoreText}>查看更多</Text>
              </TouchableOpacity>
            </View>

            {courseLessons.map((currentLesson, index) => (
              <TouchableOpacity key={index} style={styles.studyCard} onPress={navigateToStudy}>
                <View style={styles.studyCardHeader}>
                  <View style={styles.studyCardTitleContainer}>
                    <Text style={styles.courseName}>{currentLesson.courseName}</Text>
                    {currentLesson.isCourseCompleted ? (
                      <Text style={styles.completedCourseText}>🎉 课程已完成！</Text>
                    ) : (
                      <Text style={styles.continueStudyText}>当前学习 · {currentLesson.lessonTitle}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#666" />
                </View>

                {currentLesson.isCourseCompleted ? (
                  <Text style={styles.courseCompletionMessage}>
                    恭喜完成全部 {currentLesson.totalLessons} 课的学习！
                  </Text>
                ) : (
                  <>
                    <Text style={styles.studyProgressText}>
                      听传承: {currentLesson.listenCount}次 | 看法本: {currentLesson.readCount}次
                    </Text>
                    <View style={styles.quickActionButtons}>
                      <TouchableOpacity 
                        style={[styles.quickActionButton, styles.listenButton]}
                        onPress={() => recordStudy(currentLesson.courseId, currentLesson.lessonNumber, '听传承')}
                      >
                        <Text style={styles.quickActionButtonText}>听传承</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.quickActionButton, styles.readButton]}
                        onPress={() => recordStudy(currentLesson.courseId, currentLesson.lessonNumber, '看法本')}
                      >
                        <Text style={styles.quickActionButtonText}>看法本</Text>
                      </TouchableOpacity>
                      {currentLesson.url && (
                        <TouchableOpacity 
                          style={[styles.quickActionButton, styles.onlineButton]}
                          onPress={() => {
                            if (currentLesson.url) {
                              Linking.openURL(currentLesson.url);
                            }
                          }}
                        >
                          <Text style={styles.quickActionButtonText}>在线听课</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}
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

            {/* Practice Cards in Two Columns */}
            <View style={styles.practiceGrid}>
              {/* Daily Practices */}
              {dailyPractices.map((practice) => (
                <TouchableOpacity 
                  key={practice.id} 
                  style={styles.practiceCardColumn}
                  onPress={() => handlePracticeCardTap(practice)}
                  activeOpacity={0.7}
                >
                  <View style={styles.practiceHeader}>
                    <Text style={styles.practiceNameColumn} numberOfLines={1}>
                      {practice.name}
                    </Text>
                  </View>

                  <View style={styles.countPercentageRow}>
                    <Text style={styles.practiceCountColumn}>
                      {practice.current.toLocaleString()}/{practice.target.toLocaleString()} {practice.unit}</Text>
                    <Text style={styles.progressPercent}>
                      {Math.round(practice.progressPercent)}%
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
                  style={styles.practiceCardColumn}
                  onPress={() => handlePracticeCardTap(practice)}
                  activeOpacity={0.7}
                >
                  <View style={styles.practiceHeader}>
                    <Text style={styles.practiceNameColumn} numberOfLines={1}>
                      {practice.name}
                    </Text>
                  </View>
                  <Text style={styles.weeklyProgressColumn}>
                    本周 {practice.weekSessions}/{practice.weekTarget}座
                    {practice.status === 'completed' && ' ✅'}
                  </Text>
                  {practice.todaySessions > 0 && practice.todayDetails && (
                    <Text style={styles.todayDetailsColumn} numberOfLines={2}>
                      今日：{practice.todayDetails}
                    </Text>
                  )}

                  {/* Action Button for Weekly Practices */}
                  <View style={styles.practiceActions}>
                    <View style={styles.actionButtonSpacer} />
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.addButton]}
                      onPress={(e) => handleAddRecord(e, practice)}
                    >
                      <Text style={styles.actionButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

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
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
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
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  studyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studyCardTitleContainer: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  continueStudyText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  studyProgressText: {
    fontSize: 13,
    color: '#da4347',
    marginBottom: 12,
    fontWeight: '500',
  },
  quickActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  listenButton: {
    backgroundColor: '#4CAF50',
  },
  readButton: {
    backgroundColor: '#2196F3',
  },
  onlineButton: {
    backgroundColor: '#F44336',
  },
  quickActionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  completedCourseText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  courseCompletionMessage: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    paddingVertical: 8,
    fontWeight: '500',
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
  practiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  practiceCardColumn: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  practiceHeader: {
    marginBottom: 6,
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
  practiceNameColumn: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  practiceCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  practiceCountColumn: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  countPercentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
   },
  progressPercent: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  practiceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtonSpacer: {
    width: 28,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    fontSize: 14,
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
  weeklyProgressColumn: {
    fontSize: 11,
    color: Colors.text,
    marginBottom: 2,
  },
  todayDetailsColumn: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  noPracticeText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  statsText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    marginVertical: 8,
  }
});