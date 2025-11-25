import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toastService } from '@/lib/toast';
import { useTimezone } from '@/hooks/useTimezone';
import { getCurrentDateInTimezone } from '@/lib/timezone';
import DateTimePicker from '@react-native-community/datetimepicker';

import { DesignSystem } from '@/constants/DesignSystem';
import { Colors } from '@/constants/Colors';
import { ComponentTokens } from '@/utils/componentTokens';
import PageTemplate from '@/components/PageTemplate';
import { ConnectionTest } from '@/components/ConnectionTest';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { RefreshControl } from 'react-native';
import Avatar from '@/components/Avatar';

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
  const [dailyPractices, setDailyPractices] = useState<DailyPractice[]>([]);
  const [weeklyPractices, setWeeklyPractices] = useState<WeeklyPractice[]>([]);

  // Track when user is returning from recording to avoid unnecessary refresh
  const [lastRecordTime, setLastRecordTime] = useState<number>(0);

  // Add timezone support for daily reset
  const { timezoneInfo, handleDailyResetCheck } = useTimezone();

  // Date selection state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return timezoneInfo 
      ? getCurrentDateInTimezone(timezoneInfo.timezone)
      : new Date().toISOString().split('T')[0];
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Update selected date to today when timezone info changes or on mount
  useEffect(() => {
    if (timezoneInfo) {
      const today = getCurrentDateInTimezone(timezoneInfo.timezone);
      // Only update if selectedDate is not already set to today
      if (!selectedDate || selectedDate !== today) {
        setSelectedDate(today);
      }
    }
  }, [timezoneInfo]);

  // Reload data when selected date changes
  useEffect(() => {
    if (user?.id && selectedDate) {
      loadDashboardData();
    }
  }, [selectedDate]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        // Set up daily reset check for count-based practices
        if (timezoneInfo) {
          handleDailyResetCheck(() => {
            console.log('🌅 Daily reset triggered for count-based practices - resetting displays');
            // Reset to today when daily reset triggers
            const today = getCurrentDateInTimezone(timezoneInfo.timezone);
            setSelectedDate(today);
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
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Use selected date instead of always today
      const targetDate = selectedDate;

      const practicesData: DailyPractice[] = [];

      for (const project of projects || []) {
        if (project.practices.type === 'count') {
          // Get today's records for count-based practices
          const { data: todayRecords, error: recordsError } = await supabase
            .from('daily_records')
            .select('count')
            .eq('user_id', user.id)
            .eq('practice_project_id', project.id)
            .eq('record_date', targetDate);

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
        .eq('target_period', 'weekly');

      if (error) throw error;

      // Use selected date instead of always today
      const targetDate = selectedDate;

      // Use Monday as week start for consistency with getCurrentWeekStart()
      // Calculate week start based on selected date
      const todayDate = new Date(selectedDate + 'T00:00:00');

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
            .lte('record_date', targetDate);

          if (weekError) throw weekError;

          const weekSessions = weekRecords?.length || 0;
          const todayRecords = weekRecords?.filter(r => r.record_date === targetDate) || [];
          const todaySessions = todayRecords.length;

          let status: 'completed' | 'in_progress' | 'pending' = 'pending';
          const weekTarget = project.weekly_target || 7; // Default to 7 if not set
          if (weekSessions >= weekTarget) status = 'completed';
          else if (weekSessions > 0) status = 'in_progress';

          const todayDetails = todayRecords.length > 0 
            ? todayRecords.map((record, index) => `第${index + 1}座${record.duration_minutes}分钟`).join('；')
            : undefined;

          practicesData.push({
            id: project.id,
            name: project.practices.name,
            weekSessions,
            weekTarget: weekTarget,
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

  const navigateToPractice = () => {
    router.push('/(tabs)/practice');
  };



  // Handle tapping the whole practice card to view history
  const handlePracticeCardTap = (practice: any) => {
    // Navigate directly to practice detail screen
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

    if (practice.type === 'time' || practice.weekSessions !== undefined) {
      // For meditation practices (both daily and weekly), navigate to meditation record modal
      router.push({
        pathname: '/modals/meditation-record',
        params: {
          practiceProjectId: practice.id,
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
          count: amount
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
    return '像最后一天那样去生活';
  };

  const getDateDisplay = () => {
    const dateObj = new Date(selectedDate + 'T00:00:00');
    return dateObj.toLocaleDateString('zh-CN', { 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const isToday = () => {
    const today = timezoneInfo 
      ? getCurrentDateInTimezone(timezoneInfo.timezone)
      : new Date().toISOString().split('T')[0];
    return selectedDate === today;
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      setSelectedDate(dateString);
    }
  };

  const handleReturnToToday = () => {
    const today = timezoneInfo 
      ? getCurrentDateInTimezone(timezoneInfo.timezone)
      : new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  if (loading) {
    return (
      <PageTemplate
        title="当日"
        subtitle={getGreeting()}
        rightAction={{
          component: <Avatar dharmaName={userDharmaName} size={32} />,
          onPress: navigateToProfile
        }}
        scrollable={false}
        backgroundColor={Colors.background}
        padding={0}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="当日"
      subtitle={getGreeting()}
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
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
          {/* Practice Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TouchableOpacity 
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                <Text style={styles.sectionTitle}>{getDateDisplay()}</Text>
                <Ionicons name="calendar-outline" size={18} color="#666" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
              <View style={styles.headerActions}>
                {!isToday() && (
                  <TouchableOpacity onPress={handleReturnToToday} style={{ marginRight: 16 }}>
                    <Text style={styles.returnTodayText}>返回今日</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => router.push('/modals/share-practice')}>
                  <Text style={styles.shareText}>分享</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Practice Cards */}
            <View>
              {/* Daily Practices */}
              {dailyPractices.map((practice) => (
                <TouchableOpacity 
                  key={practice.id} 
                  style={styles.practiceCard}
                  onPress={() => handlePracticeCardTap(practice)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardContentRow}>
                    <View style={styles.practiceInfo}>
                      <Text style={styles.practiceName} numberOfLines={1}>
                        {practice.name}
                      </Text>
                      <Text style={styles.practiceCount}>
                        {practice.current.toLocaleString()}/{practice.target.toLocaleString()}{practice.unit}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.practiceActions}>
                      <TouchableOpacity
                        onPress={(e) => handleQuickComplete(e, practice)}
                      >
                        <Ionicons 
                          name="checkmark-circle-outline" 
                          size={28} 
                          color={practice.status === 'completed' ? '#10B981' : '#9CA3AF'} 
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={(e) => handleAddRecord(e, practice)}
                      >
                        <Ionicons 
                          name="add-circle-outline" 
                          size={28} 
                          color={DesignSystem.colors.primary} 
                        />
                      </TouchableOpacity>
                    </View>
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
                  <View style={styles.cardContentRow}>
                    <View style={styles.practiceInfo}>
                      <Text style={styles.practiceName} numberOfLines={1}>
                        {practice.name}
                      </Text>
                      <Text style={styles.practiceCount}>
                        本周 {practice.weekSessions}/{practice.weekTarget}座
                      </Text>
                    </View>

                    {/* Action Button for Weekly Practices */}
                    <View style={styles.practiceActions}>
                      <TouchableOpacity
                        onPress={(e) => handleAddRecord(e, practice)}
                      >
                        <Ionicons 
                          name="add-circle-outline" 
                          size={28} 
                          color={DesignSystem.colors.primary} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            

            {dailyPractices.length === 0 && weeklyPractices.length === 0 && (
              <TouchableOpacity style={styles.practiceCard} onPress={navigateToPractice}>
                <Text style={styles.noPracticeText}>暂无修行项目，点击添加</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={new Date(selectedDate + 'T00:00:00')}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  returnTodayText: {
    fontSize: 14,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
  shareText: {
    fontSize: 14,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
  viewMoreText: {
    fontSize: 14,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
  practiceCard: {
    ...ComponentTokens.card.variants.outlined,
    padding: ComponentTokens.card.padding.comfortable,
    marginHorizontal: ComponentTokens.card.margin.spacious,
    marginBottom: ComponentTokens.card.margin.spacious,
  },
  cardContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  practiceInfo: {
    flex: 1,
    marginRight: 12,
  },
  practiceName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  practiceCount: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  practiceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noPracticeText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});