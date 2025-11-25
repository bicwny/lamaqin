import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, ActivityIndicator, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toastService } from '@/lib/toast';
import { useTimezone } from '@/hooks/useTimezone';
import { getCurrentDateInTimezone } from '@/lib/timezone';
import { Calendar } from 'react-native-calendars';

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
  const [markedDates, setMarkedDates] = useState<any>({});

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
      const targetDate = selectedDate;

      // Fetch all projects and all records for the date in parallel
      const [projectsResult, recordsResult] = await Promise.all([
        supabase
          .from('user_practice_projects')
          .select(`
            *,
            practices(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .eq('target_period', 'daily')
          .order('created_at', { ascending: true }),
        supabase
          .from('daily_records')
          .select('practice_project_id, count')
          .eq('user_id', user.id)
          .eq('record_date', targetDate)
      ]);

      if (projectsResult.error) throw projectsResult.error;
      if (recordsResult.error) throw recordsResult.error;

      const projects = projectsResult.data || [];
      const records = recordsResult.data || [];

      // Group records by practice_project_id for fast lookup
      const recordsMap = new Map<string, number>();
      records.forEach(record => {
        const currentCount = recordsMap.get(record.practice_project_id) || 0;
        recordsMap.set(record.practice_project_id, currentCount + record.count);
      });

      // Build practices data using the records map
      const practicesData: DailyPractice[] = projects
        .filter(project => project.practices.type === 'count')
        .map(project => {
          const todayCount = recordsMap.get(project.id) || 0;
          const progressPercent = Math.min((todayCount / project.daily_target) * 100, 100);

          let status: 'completed' | 'in_progress' | 'pending' = 'pending';
          if (todayCount >= project.daily_target) status = 'completed';
          else if (todayCount > 0) status = 'in_progress';

          return {
            id: project.id,
            name: project.practices.name,
            current: todayCount,
            target: project.daily_target,
            unit: project.practices.unit,
            status,
            progressPercent,
            type: 'count'
          };
        });

      setDailyPractices(practicesData);
    } catch (error) {
      console.error('❌ Error loading daily practices:', error);
      setDailyPractices([]);
    }
  };

  const loadWeeklyPractices = async () => {
    try {
      const targetDate = selectedDate;

      // Calculate week start based on selected date
      const todayDate = new Date(selectedDate + 'T00:00:00');
      const dayOfWeek = todayDate.getDay();
      const diff = todayDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(todayDate.setDate(diff));
      const weekStart = monday.toISOString().split('T')[0];

      // Fetch all weekly projects and all meditation records for the week in parallel
      const [projectsResult, recordsResult] = await Promise.all([
        supabase
          .from('user_practice_projects')
          .select(`
            *,
            practices(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .eq('target_period', 'weekly'),
        supabase
          .from('meditation_records')
          .select('practice_id, duration_minutes, record_date')
          .eq('user_id', user.id)
          .gte('record_date', weekStart)
          .lte('record_date', targetDate)
      ]);

      if (projectsResult.error) throw projectsResult.error;
      if (recordsResult.error) throw recordsResult.error;

      const projects = projectsResult.data || [];
      const allRecords = recordsResult.data || [];

      // Group records by practice_id for fast lookup
      const recordsMap = new Map<string, { week: any[], today: any[] }>();
      allRecords.forEach(record => {
        if (!recordsMap.has(record.practice_id)) {
          recordsMap.set(record.practice_id, { week: [], today: [] });
        }
        const practiceRecords = recordsMap.get(record.practice_id)!;
        practiceRecords.week.push(record);
        if (record.record_date === targetDate) {
          practiceRecords.today.push(record);
        }
      });

      // Build practices data using the records map
      const practicesData: WeeklyPractice[] = projects
        .filter(project => project.practices.type === 'time')
        .map(project => {
          const records = recordsMap.get(project.practice_id) || { week: [], today: [] };
          const weekSessions = records.week.length;
          const todayRecords = records.today;
          const todaySessions = todayRecords.length;

          const weekTarget = project.weekly_target || 7;
          let status: 'completed' | 'in_progress' | 'pending' = 'pending';
          if (weekSessions >= weekTarget) status = 'completed';
          else if (weekSessions > 0) status = 'in_progress';

          const todayDetails = todayRecords.length > 0 
            ? todayRecords.map((record, index) => `第${index + 1}座${record.duration_minutes}分钟`).join('；')
            : undefined;

          return {
            id: project.id,
            name: project.practices.name,
            weekSessions,
            weekTarget,
            todaySessions,
            status,
            todayDetails,
            practiceId: project.practice_id,
            type: 'time'
          };
        });

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
      await recordQuickCompleteBackground(practice, remaining, selectedDate);
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
          selectedDate: selectedDate,
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
          selectedDate: selectedDate,
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
  const recordQuickCompleteBackground = async (practice: any, amount: number, recordDateParam: string) => {
    if (!user) return;

    // Use the provided selected date (or today if not provided)
    const recordDate = recordDateParam || selectedDate;

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
    return '世间唯一不变的，就是无常';
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

  const handleDateChange = (dateString: string) => {
    setSelectedDate(dateString);
    setShowDatePicker(false);
  };

  // Load marked dates when calendar opens
  const loadMarkedDates = async () => {
    if (!user?.id) return;

    try {
      // Get today's date in the user's timezone to filter out future dates
      const today = timezoneInfo 
        ? getCurrentDateInTimezone(timezoneInfo.timezone)
        : new Date().toISOString().split('T')[0];

      const [dailyResult, meditationResult] = await Promise.all([
        supabase
          .from('daily_records')
          .select('record_date')
          .eq('user_id', user.id)
          .lte('record_date', today),
        supabase
          .from('meditation_records')
          .select('record_date')
          .eq('user_id', user.id)
          .lte('record_date', today)
      ]);

      const datesWithPractices = new Set<string>();
      
      if (dailyResult.data) {
        dailyResult.data.forEach(record => {
          datesWithPractices.add(record.record_date);
        });
      }
      
      if (meditationResult.data) {
        meditationResult.data.forEach(record => {
          datesWithPractices.add(record.record_date);
        });
      }

      const marked: any = {};
      datesWithPractices.forEach(date => {
        marked[date] = {
          marked: true,
          dotColor: DesignSystem.colors.primary
        };
      });

      setMarkedDates(marked);
    } catch (error) {
      console.error('❌ Error loading marked dates:', error);
    }
  };

  // Load marked dates when calendar opens
  useEffect(() => {
    if (showDatePicker) {
      loadMarkedDates();
    }
  }, [showDatePicker]);

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
                <TouchableOpacity onPress={() => router.push({
                  pathname: '/modals/share-practice',
                  params: { date: selectedDate }
                })}>
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

        {/* Calendar Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.calendarOverlay}>
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarHeaderText}>选择日期</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.calendarCloseButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <Calendar
                current={selectedDate}
                minDate="2020-01-01"
                maxDate={new Date().toISOString().split('T')[0]}
                onDayPress={(day: any) => handleDateChange(day.dateString)}
                markedDates={markedDates}
                monthFormat={'yyyy年MM月'}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#1a1a1a',
                  textSectionTitleDisabledColor: '#d9d9d9',
                  selectedDayBackgroundColor: DesignSystem.colors.primary,
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: DesignSystem.colors.primary,
                  dayTextColor: '#1a1a1a',
                  textDisabledColor: '#d9d9d9',
                  dotColor: DesignSystem.colors.primary,
                  selectedDotColor: '#ffffff',
                  arrowColor: DesignSystem.colors.primary,
                  monthTextColor: '#1a1a1a',
                  textDayFontFamily: 'System',
                  textMonthFontFamily: 'System',
                  textDayHeaderFontFamily: 'System',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 14,
                }}
              />
            </View>
          </View>
        </Modal>
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
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '85%',
    maxWidth: 400,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  calendarCloseButton: {
    fontSize: 24,
    color: '#999',
  },
});