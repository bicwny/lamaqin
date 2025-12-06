import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { supabase } from '@/lib/supabase';
import { DesignSystem } from '@/constants/DesignSystem';
import { router } from 'expo-router';
import { toastService } from '@/lib/toast';
import { getUserTimezone, getCurrentDateInTimezone } from '@/lib/timezone';
import { Ionicons } from '@expo/vector-icons';
import CalendarInfoCard from '@/components/CalendarInfoCard';

interface DailyRecord {
  id: string;
  record_date: string;
  count: number;
  practice_project_id: string;
  practices: {
    name: string;
    unit: string;
    type: string;
  };
}

interface MeditationRecord {
  id: string;
  record_date: string;
  duration_minutes: number;
  practice_id: string;
  practices: {
    name: string;
  } | null;
}

interface CalendarViewProps {
  userId: string;
  onDateSelect?: (date: string) => void;
}

export default function CalendarView({ userId, onDateSelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [markedDates, setMarkedDates] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [userTimezone, setUserTimezone] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateRecords, setSelectedDateRecords] = useState<{
    daily: DailyRecord[];
    meditation: MeditationRecord[];
  }>({ daily: [], meditation: [] });
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    initializeTimezone();
  }, [userId]);

  const initializeTimezone = async () => {
    const timezoneInfo = await getUserTimezone();
    setUserTimezone(timezoneInfo.timezone);
    loadMarkedDates(undefined, timezoneInfo.timezone);
    
    const todayStr = getCurrentDateInTimezone(timezoneInfo.timezone);
    setSelectedDate(todayStr);
    loadSelectedDateRecords(todayStr);
  };

  const loadMarkedDates = async (specificDate?: string, timezone?: string) => {
    try {
      setLoading(true);
      
      // Use passed timezone or get from state
      const tz = timezone || userTimezone;
      
      // Get today's date in user's timezone
      const todayStr = tz ? getCurrentDateInTimezone(tz) : new Date().toISOString().split('T')[0];
      const today = new Date(todayStr);
      
      let startDate: string;
      let endDate: string;
      
      if (specificDate) {
        // Load one month before and after the specific date
        const baseDate = new Date(specificDate);
        const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1);
        const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 2, 0);
        startDate = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-01`;
        endDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
      } else {
        // Load 6 months range (3 months before and after today)
        const firstDay = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 4, 0);
        startDate = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-01`;
        endDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
      }

      // Load daily records
      const { data: dailyRecords, error: dailyError } = await supabase
        .from('daily_records')
        .select('record_date')
        .eq('user_id', userId)
        .gte('record_date', startDate)
        .lte('record_date', endDate);

      if (dailyError) throw dailyError;

      // Load meditation records
      const { data: meditationRecords, error: meditationError } = await supabase
        .from('meditation_records')
        .select('record_date')
        .eq('user_id', userId)
        .gte('record_date', startDate)
        .lte('record_date', endDate);

      if (meditationError) throw meditationError;

      // Combine and mark dates
      const allDates = new Set<string>();
      dailyRecords?.forEach(record => allDates.add(record.record_date));
      meditationRecords?.forEach(record => allDates.add(record.record_date));

      const marked: any = {};
      allDates.forEach(date => {
        marked[date] = {
          marked: true,
          dotColor: DesignSystem.colors.redTara,
          isToday: date === todayStr,
        };
      });

      // Mark today even if no records
      if (!marked[todayStr]) {
        marked[todayStr] = {
          isToday: true,
        };
      } else {
        marked[todayStr].isToday = true;
      }

      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading calendar dates:', error);
      toastService.error({
        title: '加载失败',
        message: '日历数据加载失败',
      });
    } finally {
      setLoading(false);
    }
  };


  const loadSelectedDateRecords = async (dateStr: string) => {
    try {
      setLoadingRecords(true);

      const { data: dailyRecords, error: dailyError } = await supabase
        .from('daily_records')
        .select(`
          id,
          record_date,
          practice_project_id,
          count,
          user_practice_projects!inner (
            practices (
              name,
              unit,
              type
            )
          )
        `)
        .eq('user_id', userId)
        .eq('record_date', dateStr);

      if (dailyError) throw dailyError;

      const { data: meditationRecords, error: meditationError } = await supabase
        .from('meditation_records')
        .select(`
          id,
          record_date,
          duration_minutes,
          practice_id,
          practices (
            name
          )
        `)
        .eq('user_id', userId)
        .eq('record_date', dateStr);

      if (meditationError) throw meditationError;

      const formattedDaily = (dailyRecords || []).map((record: any) => ({
        id: record.id,
        record_date: record.record_date,
        count: record.count,
        practice_project_id: record.practice_project_id,
        practices: {
          name: record.user_practice_projects?.practices?.name || '未知项目',
          unit: record.user_practice_projects?.practices?.unit || '次',
          type: record.user_practice_projects?.practices?.type || 'count',
        },
      }));

      const formattedMeditation = (meditationRecords || []).map((record: any) => ({
        id: record.id,
        record_date: record.record_date,
        duration_minutes: record.duration_minutes,
        practice_id: record.practice_id,
        practices: record.practices,
      }));

      setSelectedDateRecords({
        daily: formattedDaily,
        meditation: formattedMeditation,
      });
    } catch (error) {
      console.error('Error loading selected date records:', error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleDayPress = (day: DateData) => {
    const dateStr = day.dateString;
    
    setSelectedDate(dateStr);
    loadSelectedDateRecords(dateStr);

    if (onDateSelect) {
      onDateSelect(dateStr);
    }
  };

  const handleViewFullDetails = () => {
    if (selectedDate) {
      router.push(`/calendar-date/${selectedDate}`);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${month}月${day}日`;
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DesignSystem.colors.blueTara} />
        <Text style={styles.loadingText}>加载日历...</Text>
      </View>
    );
  }

  // Get max date using timezone-aware calculation
  const maxDate = userTimezone ? getCurrentDateInTimezone(userTimezone) : new Date().toISOString().split('T')[0];

  const updatedMarkedDates = { ...markedDates };
  if (selectedDate) {
    updatedMarkedDates[selectedDate] = {
      ...updatedMarkedDates[selectedDate],
      selected: true,
      selectedColor: DesignSystem.colors.blueTara,
    };
  }

  const hasRecords = selectedDateRecords.daily.length > 0 || selectedDateRecords.meditation.length > 0;

  return (
    <View style={styles.container}>
      <Calendar
        current={currentMonth || undefined}
        maxDate={maxDate}
        markedDates={updatedMarkedDates}
        onDayPress={handleDayPress}
        enableSwipeMonths={true}
        onMonthChange={(month) => {
          console.log('📅 Month changed to:', month.dateString);
          setCurrentMonth(month.dateString);
          loadMarkedDates(month.dateString, userTimezone);
          setSelectedDate(null);
          setSelectedDateRecords({ daily: [], meditation: [] });
        }}
        dayComponent={({ date, state, marking }) => {
          const customMarking = marking as any;
          const isToday = customMarking?.isToday;
          const hasDot = customMarking?.marked;
          const isDisabled = state === 'disabled';
          const isSelected = date?.dateString === selectedDate;
          
          return (
            <TouchableOpacity
              onPress={() => date && handleDayPress({ dateString: date.dateString, day: date.day, month: date.month, year: date.year, timestamp: date.timestamp })}
              disabled={isDisabled}
              style={[
                styles.dayContainer,
                isToday && !isSelected && styles.todayContainer,
                isSelected && styles.selectedContainer,
              ]}
            >
              <Text style={[
                styles.dayText,
                isToday && !isSelected && styles.todayText,
                isSelected && styles.selectedText,
                isDisabled && styles.disabledText,
              ]}>
                {date?.day}
              </Text>
              {hasDot && !isSelected && (
                <View style={[styles.dot, { backgroundColor: marking?.dotColor || DesignSystem.colors.redTara }]} />
              )}
              {hasDot && isSelected && (
                <View style={[styles.dot, { backgroundColor: '#ffffff' }]} />
              )}
            </TouchableOpacity>
          );
        }}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: DesignSystem.colors.textPrimary,
          selectedDayBackgroundColor: DesignSystem.colors.blueTara,
          selectedDayTextColor: '#ffffff',
          todayTextColor: DesignSystem.colors.redTara,
          dayTextColor: DesignSystem.colors.textPrimary,
          textDisabledColor: DesignSystem.colors.textTertiary,
          dotColor: DesignSystem.colors.redTara,
          selectedDotColor: '#ffffff',
          arrowColor: DesignSystem.colors.blueTara,
          monthTextColor: DesignSystem.colors.textPrimary,
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
      />

      {selectedDate && (
        <>
          <CalendarInfoCard dateString={selectedDate} />
          <View style={styles.previewSection}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>{formatDisplayDate(selectedDate)} 记录</Text>
          </View>

          {loadingRecords ? (
            <View style={styles.previewLoading}>
              <ActivityIndicator size="small" color={DesignSystem.colors.blueTara} />
            </View>
          ) : hasRecords ? (
            <View style={styles.recordsList}>
              {selectedDateRecords.daily.map((record, index) => (
                <View key={`daily-${index}`} style={styles.recordItem}>
                  <Text style={styles.recordName}>{record.practices.name}</Text>
                  <Text style={styles.recordValue}>+{record.count}{record.practices.unit}</Text>
                </View>
              ))}
              {(() => {
                const groupedMeditation = selectedDateRecords.meditation.reduce((acc: { [key: string]: number }, record) => {
                  const practiceName = record.practices?.name || '观修';
                  acc[practiceName] = (acc[practiceName] || 0) + record.duration_minutes;
                  return acc;
                }, {});

                return Object.entries(groupedMeditation).map(([name, minutes], index) => (
                  <View key={`meditation-${index}`} style={styles.recordItem}>
                    <Text style={styles.recordName}>{name}</Text>
                    <Text style={styles.recordValue}>+{minutes}分钟</Text>
                  </View>
                ));
              })()}
            </View>
          ) : (
            <View style={styles.noRecords}>
              <Text style={styles.noRecordsText}>当日暂无记录</Text>
            </View>
          )}

          <TouchableOpacity style={styles.ctaButton} onPress={handleViewFullDetails}>
            <Text style={styles.ctaButtonText}>
              {hasRecords ? '查看详情 / 添加记录' : '添加记录'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: DesignSystem.colors.textSecondary,
  },
  dayContainer: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: DesignSystem.colors.redTara,
    borderRadius: 16,
    width: 32,
    height: 32,
  },
  dayText: {
    fontSize: 14,
    color: DesignSystem.colors.textPrimary,
    textAlign: 'center',
  },
  todayText: {
    color: DesignSystem.colors.redTara,
    fontWeight: 'bold',
  },
  disabledText: {
    color: DesignSystem.colors.textTertiary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  selectedContainer: {
    backgroundColor: DesignSystem.colors.blueTara,
    borderRadius: 16,
    width: 32,
    height: 32,
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  previewSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.border,
  },
  previewHeader: {
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.textPrimary,
  },
  previewLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  recordsList: {
    gap: 8,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: 8,
  },
  recordName: {
    fontSize: 14,
    color: DesignSystem.colors.textPrimary,
  },
  recordValue: {
    fontSize: 14,
    fontWeight: '600',
    color: DesignSystem.colors.primary,
  },
  noRecords: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  noRecordsText: {
    fontSize: 14,
    color: DesignSystem.colors.textTertiary,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignSystem.colors.blueTara,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    gap: 4,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
