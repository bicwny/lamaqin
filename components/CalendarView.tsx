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
  id: string;
  record_date: string;
  practice_project_id: string;
  count: number;
  practices: {
    name: string;
    unit: string;
    type: string;
  };
}

interface MeditationRecord {
  id: string;
  record_date: string;
  practice_id: string;
  practice_project_id: string;
  duration_minutes: number;
  session_number?: number;
}

interface PracticeProject {
  id: string;
  practice_id: string;
  project_name?: string;
  preset_project_id?: string;
  practices: {
    id: string;
    name: string;
    type: string;
    unit: string;
  };
}

export default function CalendarView({ userId, onDateSelect }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [markedDates, setMarkedDates] = useState<any>({});
  const [dateRecords, setDateRecords] = useState<{
    daily: DailyRecord[];
    meditation: MeditationRecord[];
  }>({ daily: [], meditation: [] });
  const [userProjects, setUserProjects] = useState<PracticeProject[]>([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadMarkedDates();
    loadUserProjects();
  }, [userId]);

  const loadUserProjects = async () => {
    try {
      const { data: projects, error } = await supabase
        .from('user_practice_projects')
        .select(`
          id,
          practice_id,
          project_name,
          preset_project_id,
          practices!inner (
            id,
            name,
            type,
            unit
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const formattedProjects = (projects || []).map((project: any) => ({
        id: project.id,
        practice_id: project.practice_id,
        project_name: project.project_name,
        preset_project_id: project.preset_project_id,
        practices: project.practices, // This will be a single object due to the relationship
      }));

      setUserProjects(formattedProjects);
    } catch (error) {
      console.error('Error loading user projects:', error);
    }
  };

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

      // Mark today or preserve selected date
      const todayStr = today.toISOString().split('T')[0];
      const dateToMark = selectedDate || todayStr;
      if (marked[dateToMark]) {
        marked[dateToMark] = {
          ...marked[dateToMark],
          selected: true,
          selectedColor: DesignSystem.colors.blueTara,
        };
      } else {
        marked[dateToMark] = {
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
          id,
          record_date,
          practice_project_id,
          count,
          user_practice_projects!inner(
            practices(name, unit, type)
          )
        `)
        .eq('user_id', userId)
        .eq('record_date', date);

      if (dailyError) throw dailyError;

      // Load meditation records for this date with practice info
      const { data: meditationRecords, error: meditationError } = await supabase
        .from('meditation_records')
        .select(`
          id,
          record_date,
          practice_id,
          duration_minutes,
          session_number,
          practices!inner(name)
        `)
        .eq('user_id', userId)
        .eq('record_date', date);

      if (meditationError) throw meditationError;

      // Format the data
      const formattedDaily = (dailyRecords || []).map((record: any) => ({
        id: record.id,
        record_date: record.record_date,
        practice_project_id: record.practice_project_id,
        count: record.count,
        practices: {
          name: record.user_practice_projects.practices.name,
          unit: record.user_practice_projects.practices.unit,
          type: record.user_practice_projects.practices.type,
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
    
    // Mark the selected date
    setMarkedDates(prev => {
      const updated = { ...prev };
      // Remove selected marking from all dates
      Object.keys(updated).forEach(key => {
        if (updated[key].selected) {
          updated[key] = { ...updated[key], selected: false };
        }
      });
      // Add selected marking to the current date
      updated[dateStr] = {
        ...updated[dateStr],
        selected: true,
        selectedColor: DesignSystem.colors.blueTara,
      };
      return updated;
    });
    
    await loadDateRecords(dateStr);
    setShowDateModal(true);

    if (onDateSelect) {
      onDateSelect(dateStr);
    }
  };

  const handleAddRecord = (project: PracticeProject) => {
    setShowDateModal(false);
    // Navigate to add record modal with selected date and project info
    if (project.practices.type === 'time') {
      router.push({
        pathname: '/modals/meditation-record',
        params: {
          practiceId: project.practice_id,
          practiceProjectId: project.id,
          practiceName: project.practices.name,
          selectedDate: selectedDate,
        },
      });
    } else {
      router.push({
        pathname: '/modals/custom-record',
        params: {
          projectId: project.id,
          practiceName: project.practices.name,
          practiceType: project.practices.type,
          selectedDate: selectedDate,
        },
      });
    }
  };

  const handleEditRecord = (recordId: string, projectId: string, practiceName: string, practiceType: string) => {
    setShowDateModal(false);
    router.push({
      pathname: '/modals/custom-record',
      params: {
        projectId: projectId,
        practiceName: practiceName,
        practiceType: practiceType,
        editRecordId: recordId,
        selectedDate: selectedDate,
      },
    });
  };

  const handleEditMeditationRecord = (recordId: string, practiceId: string, practiceProjectId: string, practiceName: string) => {
    setShowDateModal(false);
    router.push({
      pathname: '/modals/meditation-record',
      params: {
        editRecordId: recordId,
        practiceId,
        practiceProjectId,
        practiceName,
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
        enableSwipeMonths={true}
        onMonthChange={(month) => {
          console.log('📅 Month changed to:', month.dateString);
          loadMarkedDates(month.dateString);
          loadUserProjects();
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
                {/* Existing Records */}
                {(dateRecords.daily.length > 0 || dateRecords.meditation.length > 0) && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>当日记录</Text>
                    {dateRecords.daily.map((record, index) => (
                      <TouchableOpacity 
                        key={`daily-${index}`} 
                        style={styles.recordItem}
                        onPress={() => handleEditRecord(record.id, record.practice_project_id, record.practices.name, record.practices.type)}
                      >
                        <Ionicons name="checkmark-circle" size={20} color={DesignSystem.colors.greenTara} />
                        <Text style={styles.recordText}>
                          {record.practices.name}: {record.count} {record.practices.unit}
                        </Text>
                        <Ionicons name="create-outline" size={18} color={DesignSystem.colors.textTertiary} />
                      </TouchableOpacity>
                    ))}
                    {dateRecords.meditation.map((record: any, index) => {
                      // Find matching practice project
                      const matchingProject = userProjects.find(p => p.practice_id === record.practice_id);
                      const practiceName = record.practices?.name || '观修';
                      
                      return (
                        <TouchableOpacity 
                          key={`meditation-${index}`} 
                          style={styles.recordItem}
                          onPress={() => handleEditMeditationRecord(
                            record.id, 
                            record.practice_id, 
                            matchingProject?.id || '', 
                            practiceName
                          )}
                        >
                          <Ionicons name="checkmark-circle" size={20} color={DesignSystem.colors.greenTara} />
                          <Text style={styles.recordText}>
                            {practiceName} 第{record.session_number || 1}座: {record.duration_minutes} 分钟
                          </Text>
                          <Ionicons name="create-outline" size={18} color={DesignSystem.colors.textTertiary} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Add New Record */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>
                    {dateRecords.daily.length === 0 && dateRecords.meditation.length === 0 
                      ? '选择项目添加记录' 
                      : '添加更多记录'}
                  </Text>
                  {userProjects.length === 0 ? (
                    <View style={styles.emptyProjectsContainer}>
                      <Text style={styles.emptyProjectsText}>还没有修行项目</Text>
                    </View>
                  ) : (
                    userProjects.map((project) => (
                      <TouchableOpacity
                        key={project.id}
                        style={styles.projectItem}
                        onPress={() => handleAddRecord(project)}
                      >
                        <View style={styles.projectInfo}>
                          <Text style={styles.projectName}>{project.practices.name}</Text>
                          {project.project_name && (
                            <Text style={styles.projectSubName}>{project.project_name}</Text>
                          )}
                        </View>
                        <Ionicons name="add-circle" size={24} color={DesignSystem.colors.blueTara} />
                      </TouchableOpacity>
                    ))
                  )}
                </View>
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
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  recordText: {
    fontSize: 16,
    color: DesignSystem.colors.textPrimary,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: DesignSystem.colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.textPrimary,
  },
  projectSubName: {
    fontSize: 14,
    color: DesignSystem.colors.textSecondary,
    marginTop: 4,
  },
  emptyProjectsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyProjectsText: {
    fontSize: 14,
    color: DesignSystem.colors.textTertiary,
  },
});
