import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { DesignSystem } from '@/constants/DesignSystem';
import { router } from 'expo-router';
import { toastService } from '@/lib/toast';

interface CalendarViewProps {
  userId: string;
  onDateSelect?: (date: string) => void;
}

interface DailyRecord {
  record_date: string;
  practice_project_id: string;
  count: number;
  practices: {
    name: string;
    unit: string;
  };
}

interface MeditationRecord {
  record_date: string;
  practice_id: string;
  duration_minutes: number;
  session_number?: number;
}

export default function CalendarView({ userId, onDateSelect }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [markedDates, setMarkedDates] = useState<any>({});
  const [dateRecords, setDateRecords] = useState<{
    daily: DailyRecord[];
    meditation: MeditationRecord[];
  }>({ daily: [], meditation: [] });
  const [showDateModal, setShowDateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadMarkedDates();
  }, [userId]);

  const loadMarkedDates = async () => {
    try {
      setLoading(true);
      
      // Get current month's date range
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];

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

  const loadDateRecords = async (date: string) => {
    try {
      setModalLoading(true);

      // Load daily records for this date
      const { data: dailyRecords, error: dailyError } = await supabase
        .from('daily_records')
        .select(`
          record_date,
          practice_project_id,
          count,
          user_practice_projects!inner(
            practices(name, unit)
          )
        `)
        .eq('user_id', userId)
        .eq('record_date', date);

      if (dailyError) throw dailyError;

      // Load meditation records for this date
      const { data: meditationRecords, error: meditationError } = await supabase
        .from('meditation_records')
        .select('record_date, practice_id, duration_minutes, session_number')
        .eq('user_id', userId)
        .eq('record_date', date);

      if (meditationError) throw meditationError;

      // Format the data
      const formattedDaily = (dailyRecords || []).map((record: any) => ({
        record_date: record.record_date,
        practice_project_id: record.practice_project_id,
        count: record.count,
        practices: {
          name: record.user_practice_projects.practices.name,
          unit: record.user_practice_projects.practices.unit,
        },
      }));

      setDateRecords({
        daily: formattedDaily,
        meditation: meditationRecords || [],
      });
    } catch (error) {
      console.error('Error loading date records:', error);
      toastService.error({
        title: '加载失败',
        message: '当日记录加载失败',
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDayPress = async (day: DateData) => {
    const dateStr = day.dateString;
    setSelectedDate(dateStr);
    await loadDateRecords(dateStr);
    setShowDateModal(true);

    if (onDateSelect) {
      onDateSelect(dateStr);
    }
  };

  const handleAddRecord = () => {
    setShowDateModal(false);
    // Navigate to add record modal with selected date
    router.push({
      pathname: '/modals/custom-record',
      params: {
        selectedDate: selectedDate,
      },
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DesignSystem.colors.blueTara} />
        <Text style={styles.loadingText}>加载日历...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
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

      <Modal
        visible={showDateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{formatDate(selectedDate)}</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Ionicons name="close" size={24} color={DesignSystem.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {modalLoading ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="small" color={DesignSystem.colors.blueTara} />
              </View>
            ) : (
              <ScrollView style={styles.modalScroll}>
                {dateRecords.daily.length === 0 && dateRecords.meditation.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={48} color={DesignSystem.colors.textTertiary} />
                    <Text style={styles.emptyText}>这天还没有修行记录</Text>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddRecord}>
                      <Ionicons name="add" size={20} color="#ffffff" />
                      <Text style={styles.addButtonText}>添加记录</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {dateRecords.daily.map((record, index) => (
                      <View key={`daily-${index}`} style={styles.recordItem}>
                        <Ionicons name="checkmark-circle" size={20} color={DesignSystem.colors.greenTara} />
                        <Text style={styles.recordText}>
                          {record.practices.name}: {record.count} {record.practices.unit}
                        </Text>
                      </View>
                    ))}
                    {dateRecords.meditation.map((record, index) => (
                      <View key={`meditation-${index}`} style={styles.recordItem}>
                        <Ionicons name="checkmark-circle" size={20} color={DesignSystem.colors.greenTara} />
                        <Text style={styles.recordText}>
                          观修第{record.session_number || 1}座: {record.duration_minutes} 分钟
                        </Text>
                      </View>
                    ))}
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DesignSystem.colors.textPrimary,
  },
  modalScroll: {
    padding: 20,
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: DesignSystem.colors.textSecondary,
    marginTop: 12,
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.blueTara,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border,
    gap: 12,
  },
  recordText: {
    fontSize: 16,
    color: DesignSystem.colors.textPrimary,
    flex: 1,
  },
});
