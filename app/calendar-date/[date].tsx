import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabase';
import { DesignSystem } from '@/constants/DesignSystem';
import { useAuth } from '@/contexts/AuthContext';

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

interface PracticeWithTarget {
  id: string;
  practice_project_id: string;
  practice_name: string;
  current: number;
  target: number;
  unit: string;
  progressPercent: number;
  record_id?: string;
}

interface MeditationRecord {
  id: string;
  record_date: string;
  practice_id: string;
  duration_minutes: number;
  session_number?: number;
  practices?: {
    name: string;
  };
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

export default function CalendarDatePage() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRecords, setDateRecords] = useState<{
    daily: DailyRecord[];
    meditation: MeditationRecord[];
  }>({ daily: [], meditation: [] });
  const [userProjects, setUserProjects] = useState<PracticeProject[]>([]);
  const [practicesWithTargets, setPracticesWithTargets] = useState<PracticeWithTarget[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (user && date) {
      loadUserProjects();
      // Set the selected date based on URL parameter
      setSelectedDate(new Date(date));
    }
  }, [user, date]);

  // Reload data when page comes into focus (e.g., after adding a record)
  useFocusEffect(
    React.useCallback(() => {
      if (user && date) {
        loadDateRecords();
      }
    }, [user, date])
  );

  const loadUserProjects = async () => {
    if (!user) return;

    try {
      const { data: projects, error } = await supabase
        .from('user_practice_projects')
        .select(`
          id,
          practice_id,
          project_name,
          preset_project_id,
          daily_target,
          practices!inner (
            id,
            name,
            type,
            unit
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProjects = (projects || []).map((project: any) => ({
        id: project.id,
        practice_id: project.practice_id,
        project_name: project.project_name,
        preset_project_id: project.preset_project_id,
        daily_target: project.daily_target,
        practices: project.practices,
      }));

      setUserProjects(formattedProjects);
    } catch (error) {
      console.error('Error loading user projects:', error);
    }
  };

  const loadDateRecords = async () => {
    if (!user || !date) return;

    try {
      setLoading(true);

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
        .eq('user_id', user.id)
        .eq('record_date', date);

      if (dailyError) throw dailyError;

      const { data: meditationRecords, error: meditationError } = await supabase
        .from('meditation_records')
        .select(`
          id,
          record_date,
          practice_id,
          duration_minutes,
          session_number,
          practices!inner (
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('record_date', date);

      if (meditationError) throw meditationError;

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

      const formattedMeditation = (meditationRecords || []).map((record: any) => ({
        id: record.id,
        record_date: record.record_date,
        practice_id: record.practice_id,
        duration_minutes: record.duration_minutes,
        session_number: record.session_number,
        practices: record.practices,
      }));

      setDateRecords({
        daily: formattedDaily,
        meditation: formattedMeditation,
      });

      // Calculate practices with targets for display
      await calculatePracticesWithTargets(formattedDaily);
    } catch (error) {
      console.error('Error loading date records:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePracticesWithTargets = async (dailyRecords: DailyRecord[]) => {
    if (!user) return;

    try {
      // Sum all counts by practice_project_id
      const countsByProject = new Map<string, number>();
      dailyRecords.forEach(record => {
        const current = countsByProject.get(record.practice_project_id) || 0;
        countsByProject.set(record.practice_project_id, current + record.count);
      });

      // Get all project IDs that have records
      const projectIds = Array.from(countsByProject.keys());

      if (projectIds.length === 0) {
        setPracticesWithTargets([]);
        return;
      }

      // Fetch targets for these projects
      const { data: projects, error } = await supabase
        .from('user_practice_projects')
        .select('id, daily_target, practices(name, unit)')
        .in('id', projectIds);

      if (error) throw error;

      const practicesData: PracticeWithTarget[] = [];
      
      projects?.forEach((project: any) => {
        const totalCount = countsByProject.get(project.id) || 0;
        const target = project.daily_target || 0;
        const progressPercent = target > 0 ? Math.min((totalCount / target) * 100, 100) : 0;

        practicesData.push({
          id: project.id,
          practice_project_id: project.id,
          practice_name: project.practices.name,
          current: totalCount,
          target,
          unit: project.practices.unit,
          progressPercent,
        });
      });

      setPracticesWithTargets(practicesData);
    } catch (error) {
      console.error('Error calculating practices with targets:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    return `${year}年${month}月${day}日`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      // Navigate to the new date
      router.replace(`/calendar-date/${dateString}`);
      
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    }
  };

  const handleDateHeaderPress = () => {
    setShowDatePicker(true);
  };

  const handleEditRecord = (recordId: string, practiceProjectId: string, practiceName: string, practiceType: string) => {
    router.push({
      pathname: '/modals/custom-record',
      params: {
        editRecordId: recordId,
        projectId: practiceProjectId,
        practiceName,
        practiceType,
        selectedDate: date,
        returnTo: `/calendar-date/${date}`,
      },
    });
  };

  const handleEditMeditationRecord = (recordId: string, practiceId: string, practiceProjectId: string, practiceName: string) => {
    router.push({
      pathname: '/modals/meditation-record',
      params: {
        editRecordId: recordId,
        practiceId,
        practiceProjectId,
        practiceName,
        selectedDate: date,
        returnTo: `/calendar-date/${date}`,
      },
    });
  };

  const handleAddRecord = (project: PracticeProject) => {
    const practiceType = project.practices.type;
    const projectId = project.id;
    const practiceName = project.practices.name;
    const practiceId = project.practice_id;

    if (practiceType === 'meditation') {
      router.push({
        pathname: '/modals/meditation-record',
        params: {
          practiceId,
          practiceProjectId: projectId,
          practiceName,
          selectedDate: date,
          returnTo: `/calendar-date/${date}`,
        },
      });
    } else {
      router.push({
        pathname: '/modals/custom-record',
        params: {
          projectId,
          practiceName,
          practiceType,
          selectedDate: date,
          returnTo: `/calendar-date/${date}`,
        },
      });
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerBackTitle: '回向',
          headerTitle: () => (
            <TouchableOpacity onPress={handleDateHeaderPress}>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{formatDate(date || '')}</Text>
                <Ionicons name="chevron-down" size={16} color="#007AFF" style={styles.headerIcon} />
              </View>
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={DesignSystem.colors.blueTara} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : (
          <>
            {/* Count-based practices with progress bars */}
            {practicesWithTargets.length > 0 && (
              <View style={styles.section}>
                {practicesWithTargets.map((practice) => {
                  const recordForPractice = dateRecords.daily.find(r => r.practice_project_id === practice.id);
                  return (
                    <TouchableOpacity 
                      key={practice.id}
                      style={styles.practiceCard}
                      onPress={() => recordForPractice && handleEditRecord(
                        recordForPractice.id, 
                        recordForPractice.practice_project_id, 
                        recordForPractice.practices.name, 
                        recordForPractice.practices.type
                      )}
                      activeOpacity={0.7}
                    >
                      <View style={styles.practiceHeader}>
                        <Text style={styles.practiceName} numberOfLines={1}>
                          {practice.practice_name}
                        </Text>
                      </View>

                      <View style={styles.countPercentageRow}>
                        <Text style={styles.practiceCount}>
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

                      <View style={styles.practiceActions}>
                        <Ionicons 
                          name="checkmark-circle-outline" 
                          size={24} 
                          color={practice.progressPercent >= 100 ? '#10B981' : '#6B7280'} 
                        />

                        <View style={styles.actionButtonSpacer} />

                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            const project = userProjects.find(p => p.id === practice.id);
                            if (project) {
                              handleAddRecord(project);
                            }
                          }}
                        >
                          <Ionicons 
                            name="add-circle-outline" 
                            size={24} 
                            color={DesignSystem.colors.primary} 
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Meditation records */}
            {dateRecords.meditation.length > 0 && (
              <View style={styles.section}>
                {dateRecords.meditation.map((record: any) => {
                  const matchingProject = userProjects.find(p => p.practice_id === record.practice_id);
                  const practiceName = record.practices?.name || '观修';
                  
                  return (
                    <TouchableOpacity 
                      key={record.id}
                      style={styles.practiceCard}
                      onPress={() => handleEditMeditationRecord(
                        record.id, 
                        record.practice_id, 
                        matchingProject?.id || '', 
                        practiceName
                      )}
                      activeOpacity={0.7}
                    >
                      <View style={styles.practiceHeader}>
                        <Text style={styles.practiceName} numberOfLines={1}>
                          {practiceName}
                        </Text>
                      </View>
                      <Text style={styles.weeklyProgress}>
                        第{record.session_number || 1}座 {record.duration_minutes}分钟
                      </Text>

                      <View style={styles.practiceActions}>
                        <View style={styles.actionButtonSpacer} />
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            if (matchingProject) {
                              handleAddRecord(matchingProject);
                            }
                          }}
                        >
                          <Ionicons 
                            name="add-circle-outline" 
                            size={24} 
                            color={DesignSystem.colors.primary} 
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Empty state */}
            {practicesWithTargets.length === 0 && dateRecords.meditation.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>这一天还没有修行记录</Text>
                <Text style={styles.emptyStateSubtext}>点击下方项目添加记录</Text>
              </View>
            )}

            {/* Add more records section */}
            {userProjects.length > 0 && (
              <View style={styles.addMoreSection}>
                <Text style={styles.sectionLabel}>添加记录</Text>
                {userProjects.map((project) => (
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
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerIcon: {
    marginLeft: 2,
  },
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
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
  section: {
    marginBottom: 16,
  },
  practiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  practiceHeader: {
    marginBottom: 6,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.textPrimary,
  },
  countPercentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  practiceCount: {
    fontSize: 14,
    color: DesignSystem.colors.textSecondary,
  },
  progressPercent: {
    fontSize: 12,
    color: DesignSystem.colors.textSecondary,
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
    backgroundColor: DesignSystem.colors.primary,
    borderRadius: 3,
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
    color: DesignSystem.colors.textPrimary,
    marginBottom: 4,
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignSystem.colors.textSecondary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: DesignSystem.colors.textTertiary,
  },
  addMoreSection: {
    marginTop: 16,
    paddingHorizontal: 16,
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
});
