import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { supabase } from '@/lib/supabase';
import { DesignSystem } from '@/constants/DesignSystem';
import { router } from 'expo-router';
import { toastService } from '@/lib/toast';

interface CalendarViewProps {
  userId: string;
  onDateSelect?: (date: string) => void;
}

export default function CalendarView({ userId, onDateSelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [markedDates, setMarkedDates] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkedDates();
  }, [userId]);


  const loadMarkedDates = async (specificDate?: string) => {
    try {
      setLoading(true);
      
      // Get date range - either for a specific month or a broader range
      const today = new Date();
      let startDate: string;
      let endDate: string;
      
      if (specificDate) {
        // Load one month before and after the specific date
        const baseDate = new Date(specificDate);
        const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1);
        const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 2, 0);
        startDate = firstDay.toISOString().split('T')[0];
        endDate = lastDay.toISOString().split('T')[0];
      } else {
        // Load 6 months range (3 months before and after today)
        const firstDay = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 4, 0);
        startDate = firstDay.toISOString().split('T')[0];
        endDate = lastDay.toISOString().split('T')[0];
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
          dotColor: DesignSystem.colors.greenTara,
        };
      });

      // Mark today
      const todayStr = today.toISOString().split('T')[0];
      if (marked[todayStr]) {
        marked[todayStr] = {
          ...marked[todayStr],
          selected: true,
          selectedColor: DesignSystem.colors.blueTara,
        };
      } else {
        marked[todayStr] = {
          selected: true,
          selectedColor: DesignSystem.colors.blueTara,
        };
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


  const handleDayPress = (day: DateData) => {
    const dateStr = day.dateString;
    
    // Navigate to the calendar date page
    router.push(`/calendar-date/${dateStr}`);

    if (onDateSelect) {
      onDateSelect(dateStr);
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DesignSystem.colors.blueTara} />
        <Text style={styles.loadingText}>加载日历...</Text>
      </View>
    );
  }

  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      <Calendar
        current={currentMonth || undefined}
        maxDate={maxDate}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        enableSwipeMonths={true}
        onMonthChange={(month) => {
          console.log('📅 Month changed to:', month.dateString);
          setCurrentMonth(month.dateString);
          loadMarkedDates(month.dateString);
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
          dotColor: DesignSystem.colors.greenTara,
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
});
