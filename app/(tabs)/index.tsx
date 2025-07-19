import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toastService } from '@/lib/toast';
import { useTimezone } from '@/hooks/useTimezone';
import { getCurrentDateInTimezone } from '@/lib/timezone';

import { Colors } from '@/constants/Colors';
import PageTemplate from '@/components/PageTemplate';
import { ConnectionTest } from '@/components/ConnectionTest';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { RefreshControl } from 'react-native';
import Avatar from '@/components/Avatar';
import { Button } from 'react-native';
import * as Sentry from '@sentry/react-native';

interface NextLesson {
  courseId: string;
  courseName: string;
  lessonNumber: number;
  lessonTitle: string;
  progress: string;
  lessonId: string;
  url?: string;
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
    isCompleted?: boolean;
  }>>([]);
  const [dailyPractices, setDailyPractices] = useState<DailyPractice[]>([]);
  const [weeklyPractices, setWeeklyPractices] = useState<WeeklyPractice[]>([]);

  // Track when user is returning from recording to avoid unnecessary refresh
  const [lastRecordTime, setLastRecordTime] = useState<number>(0);

  // Add timezone support for daily reset
  const { timezoneInfo, handleDailyResetCheck } = useTimezone();

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        // Set up daily reset check for count-based practices
        if (timezoneInfo) {
          handleDailyResetCheck(() => {
            console.log('🌅 Daily reset triggered for count-based practices - resetting displays');
            // Reset daily practices display to show 0 counts
            setDailyPractices(prev => prev.map(practice => ({
              ...practice,
              current: 0,
              progressPercent: 0,
              status: 'pending' as const
            })));
            // Reload data from database (should be empty for new day)
            loadDashboardData();
          });
        }

        const now = Date.now();
        // Only refresh if it's been more than 2 seconds since last record
        // This prevents refresh when user just recorded something and came back
        if (now - lastRecordTime > 2000) {
          loadDashboardData();
        }
      }
    }, [user?.id, lastRecordTime, timezoneInfo])
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

        // Check if all lessons are completed
        const completedLessons = Array.from(lessonCompletionMap.values()).filter(
          lesson => lesson.听传承 && lesson.看法本
        ).length;

        const isAllLessonsCompleted = completedLessons >= userCourse.course.total_lessons;

        // If all lessons are completed and course is still active, update status and skip adding to display
        if (isAllLessonsCompleted && userCourse.status === 'active') {
          // Update course status to completed - this will hide the card immediately
          await supabase
            .from('user_courses')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('course_id', userCourse.course_id);

          // Skip adding this course to the display since it's now completed
          continue;
        }

        // Find the next incomplete lesson
        let nextLessonNumber = 1;
        let nextLessonId = '';
        let nextLessonTitle = '';
        let nextLessonUrl = '';
        let listenCount = 0;
        let readCount = 0;

        for (let i = 1; i <= userCourse.course.total_lessons; i++) {
          const lessonData = Array.from(lessonCompletionMap.values()).find(l => l.lessonNumber === i);
          if (!lessonData || !lessonData.听传承 || !lessonData.看法本) {
            nextLessonNumber = i;
            const nextLesson = allLessons?.find(l => l.lesson_number === i);
            if (nextLesson) {
              nextLessonId = nextLesson.id;
              nextLessonTitle = nextLesson.title || `第${i}课`;
              nextLessonUrl = nextLesson.url || '';

              // Get study counts for this specific lesson
              const lessonStudyRecords = studyRecords?.filter(record => 
                record.lesson?.lesson_number === i
              ) || [];

              listenCount = lessonStudyRecords.filter(record => 
                record.study_type === '听传承'
              ).length;

              readCount = lessonStudyRecords.filter(record => 
                record.study_type === '看法本'
              ).length;
            } else {
              // If no lesson found, use fallback title
              nextLessonTitle = `第${i}课`;
            }
            break;
          }
        }

        allCourseLessons.push({
          courseId: userCourse.course_id,
          courseName: userCourse.course.name,
          lessonNumber: nextLessonNumber,
          lessonTitle: nextLessonTitle,
          lessonId: nextLessonId,
          url: nextLessonUrl,
          progress: `听传承: ${listenCount}次 | 看法本: ${readCount}次`,
          isCompleted: false
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
        .order('created_at', { ascending: true })
        .limit(3);

      if (error) throw error;

      // Use timezone-aware date for count-based practices
      const today = timezoneInfo 
        ? getCurrentDateInTimezone(timezoneInfo.timezone)
        : new Date().toISOString().split('T')[0];

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

      // Use timezone-aware date for weekly practices
      const today = timezoneInfo 
        ? getCurrentDateInTimezone(timezoneInfo.timezone)
        : new Date().toISOString().split('T')[0];

      // Use Monday as week start for consistency with getCurrentWeekStart()
      // Calculate week start based on timezone-aware today
      const todayDate = timezoneInfo 
        ? new Date(getCurrentDateInTimezone(timezoneInfo.timezone) + 'T00:00:00')
        : new Date();

      const dayOfWeek = todayDate.getDay();
      const diff = todayDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(todayDate.setDate(diff));
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
    router.push('/profile');
  };

  const navigateToStudy = () => {
    router.push('/(tabs)/study');
  };

  const recordStudy = async (courseId: string, lessonNumber: number, studyType: '听传承' | '看法本') => {
    if (!user) return;

    try {
      // Optimistic update: immediately update the progress text
      setCourseLessons(prev => prev.map(lesson => {
        if (lesson.courseId === courseId && lesson.lessonNumber === lessonNumber) {
          const currentProgress = lesson.progress;
          const [listenPart, readPart] = currentProgress.split(' | ');
          const listenCount = parseInt(listenPart.match(/\d+/)?.[0] || '0');
          const readCount = parseInt(readPart.match(/\d+/)?.[0] || '0');

          const newListenCount = studyType === '听传承' ? listenCount + 1 : listenCount;
          const newReadCount = studyType === '看法本' ? readCount + 1 : readCount;

          return {
            ...lesson,
            progress: `听传承: ${newListenCount}次 | 看法本: ${newReadCount}次`
          };
        }
        return lesson;
      }));

      // Show success toast immediately
      toastService.success({
        title: '学习记录已保存',
        message: `${studyType}完成 - 继续加油！`
      });

      const today = new Date().toISOString().split('T')[0];

      // Find the lesson
      const { data: lessons, error: lessonError } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('course_id', courseId)
        .eq('lesson_number', lessonNumber)
        .limit(1);

      if (lessonError || !lessons || lessons.length === 0) {
        toastService.error({
          title: '课程信息有误',
          message: '无法找到对应的课程内容'
        });
        // Revert optimistic update
        loadCourseLessons();
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

      // Background refresh to ensure data consistency
      setTimeout(() => {
        loadCourseLessons();
      }, 1000);

    } catch (error) {
      console.error('Error recording study:', error);
      toastService.error({
        title: '保存失败',
        message: '网络异常，请稍后重试'
      });

      // Revert optimistic update on error
      loadCourseLessons();
    }
  };

  const navigateToPractice = () => {
    router.push('/(tabs)/practice');
  };



  // Handle tapping the whole practice card to view details
  const handlePracticeCardTap = (practice: any) => {
    // All practice types now use the unified practice-detail page
    router.push({
      pathname: '/practice-detail/[practiceId]',
      params: {
        practiceId: practice.id,
      },
    });
  };

  // Handle quick complete button (check mark)
  const handleQuickComplete = async (e: any, practice: any) => {
    e.stopPropagation(); // Prevent card tap

    if (practice.status === 'completed') {
      // Already completed, just show message
      toastService.info({
        title: '今日目标已达成',
        message: '继续保持！明日再接再厉'
      });
      return;
    }

    // Calculate remaining amount to complete daily target
    const remaining = practice.target - practice.current;

    // Optimistic update: immediately update UI
    updatePracticeOptimistically(practice.id, remaining, practice.type);

    // Show success toast immediately
    toastService.success({
      title: '已完成今日目标',
      message: `${practice.name} +${remaining.toLocaleString()} ${practice.unit}`
    });

    // Record in background
    try {
      await recordQuickCompleteBackground(practice, remaining);
    } catch (error) {
      // Revert optimistic update on error
      console.error('❌ Error recording practice:', error);
      toastService.error({
        title: '记录失败',
        message: '请检查网络连接后重试'
      });

      // Refresh data to revert optimistic changes
      loadDashboardData();
    }
  };

  // Handle add record button (plus)
  const handleAddRecord = (e: any, practice: any) => {
    e.stopPropagation(); // Prevent card tap

    // Track when user is going to record
    setLastRecordTime(Date.now());

    // All practice types now use the unified practice-detail page
        router.push({
          pathname: '/practice-detail/[practiceId]',
          params: {
            practiceId: practice.id,
          },
        });
  };

  // Optimistic update helper function
  const updatePracticeOptimistically = (practiceId: string, amount: number, practiceType: 'count' | 'time') => {
    if (practiceType === 'time') {
      // Update weekly practices
      setWeeklyPractices(prev => prev.map(practice => {
        if (practice.id === practiceId) {
          const newWeekSessions = practice.weekSessions + 1;
          const newTodaySessions = practice.todaySessions + 1;

          return {
            ...practice,
            weekSessions: newWeekSessions,
            todaySessions: newTodaySessions,
            status: newWeekSessions >= practice.weekTarget ? 'completed' : 'in_progress',
            todayDetails: practice.todayDetails 
              ? `${practice.todayDetails}；第${newTodaySessions}座${amount}分钟`
              : `第${newTodaySessions}座${amount}分钟`
          };
        }
        return practice;
      }));
    } else {
      // Update daily practices
      setDailyPractices(prev => prev.map(practice => {
        if (practice.id === practiceId) {
          const newCurrent = practice.current + amount;
          const newProgressPercent = Math.min((newCurrent / practice.target) * 100, 100);

          return {
            ...practice,
            current: newCurrent,
            progressPercent: newProgressPercent,
            status: newCurrent >= practice.target ? 'completed' : 'in_progress'
          };
        }
        return practice;
      }));
    }
  };

  // Background recording function (no UI updates)
  const recordQuickCompleteBackground = async (practice: any, amount: number) => {
    if (!user) return;

    // Use timezone-aware date for recording
    const recordDate = timezoneInfo 
      ? getCurrentDateInTimezone(timezoneInfo.timezone)
      : new Date().toISOString().split('T')[0];

    if (practice.type === 'time') {
      // For time-based practices, create a meditation record with target duration
      const { error } = await supabase
        .from('meditation_records')
        .insert({
          user_id: user.id,
          practice_id: practice.practiceId,
          record_date: recordDate,
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
          record_date: recordDate,
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
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了，早点休息';
    if (hour < 12) return '早上好，开始今日修行';
    if (hour < 18) return '下午好，精进不懈';
    return '晚上好，回顾今日收获';
  };

  if (loading) {
    return (
      <PageTemplate
        title="修行主页"
        subtitle={getGreeting()}
        rightAction={{
          component: <Avatar dharmaName={userDharmaName} size={32} />,
          onPress: navigateToProfile
        }}
        scrollable={false}
        backgroundColor={Colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="修行主页"
      subtitle={`${getGreeting()} • ${userDharmaName}居士`}
      rightAction={{
        component: <Avatar dharmaName={userDharmaName} size={32} />,
        onPress: navigateToProfile
      }}
      scrollable={false}
      backgroundColor={Colors.background}
      padding={0}
    >
        <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >


          {/* Study Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>今日学习</Text>
              <TouchableOpacity onPress={navigateToStudy}>
                <Text style={styles.viewMoreText}>查看更多</Text>
              </TouchableOpacity>
            </View>

            {courseLessons.map((nextLesson, index) => (
              <View 
                key={index} 
                style={styles.studyCard}
              >
                <View style={styles.studyCardHeader}>
                  <View style={styles.studyCardTitleContainer}>
                    <TouchableOpacity onPress={() => router.push(`/course-detail/${nextLesson.courseId}`)}>
                      <Text style={styles.courseName}>{nextLesson.courseName}</Text>
                    </TouchableOpacity>
                    <Text style={styles.continueStudyText}>继续学习 · {nextLesson.lessonTitle}</Text>
                  </View>
                </View>
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
              </View>
            ))}
          </View>

          {/* Practice Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>今日修行</Text>
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
                      {practice.current.toLocaleString()}/{practice.target.toLocaleString()} {practice.unit}
                    </Text>
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
                      onPress={(e) => handleQuickComplete(e, practice)}
                    >
                      <Ionicons 
                        name="checkmark-circle-outline" 
                        size={24} 
                        color={practice.status === 'completed' ? '#10B981' : '#6B7280'} 
                      />
                    </TouchableOpacity>

                    <View style={styles.actionButtonSpacer} />

                    <TouchableOpacity
                      onPress={(e) => handleAddRecord(e, practice)}
                    >
                      <Ionicons 
                        name="add-circle-outline" 
                        size={24} 
                        color={Colors.primary} 
                      />
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
                    {practice.status === 'completed' && ' 已完成'}
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
                      onPress={(e) => handleAddRecord(e, practice)}
                    >
                      <Ionicons 
                        name="add-circle-outline" 
                        size={24} 
                        color={Colors.primary} 
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {courseLessons.length === 0 && (
              <TouchableOpacity style={styles.studyCard} onPress={navigateToStudy}>
                <Text style={styles.noStudyText}>暂无进行中的课程，点击查看课程库</Text>
              </TouchableOpacity>
            )}

            {dailyPractices.length === 0 && weeklyPractices.length === 0 && (
              <TouchableOpacity style={styles.practiceCard} onPress={navigateToPractice}>
                <Text style={styles.noPracticeText}>暂无修行项目，点击添加</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 1: Try it</ThemedText>
          <ThemedText>
            Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
            Press{' '}
            <ThemedText type="defaultSemiBold">
              {Platform.select({
                ios: 'cmd + d',
                android: 'cmd + m',
                web: 'F12'
              })}
            </ThemedText>{' '}
            to open developer tools.
          </ThemedText>
        </ThemedView>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 12,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  viewMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  studyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,```python
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
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
  quickActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
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
  listenButton: {
    backgroundColor: '#10B981',
  },
  readButton: {
    backgroundColor: Colors.primary,
  },
  onlineButton: {
    backgroundColor: '#F59E0B',
  },
  quickActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
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
    height: 6,backgroundColor: '#f0f0f0',
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
  noStudyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  testDescription: {
    marginBottom: 12,
  },
});