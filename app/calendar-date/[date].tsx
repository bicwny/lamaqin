import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTokens } from '@/utils/componentTokens';
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
  daily_target?: number;
  weekly_target?: number;
  target_period?: string;
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

  useEffect(() => {
    if (user && date) {
      loadUserProjects();
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
          weekly_target,
          target_period,
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
        weekly_target: project.weekly_target,
        target_period: project.target_period,
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
    } catch (error) {
      console.error('Error loading date records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    return `${year}年${month}月${day}日`;
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
          title: formatDate(date || ''),
          headerBackTitle: '回向',
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
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
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
  recordItem: {
    ...ComponentTokens.card.variants.outlined,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: ComponentTokens.card.margin.spacious,
    marginBottom: ComponentTokens.card.margin.spacious,
    gap: 12,
  },
  recordText: {
    fontSize: 16,
    color: DesignSystem.colors.textPrimary,
    flex: 1,
  },
  projectItem: {
    ...ComponentTokens.card.variants.outlined,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: ComponentTokens.card.margin.spacious,
    marginBottom: ComponentTokens.card.margin.spacious,
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
    fontSize: 16,
    color: DesignSystem.colors.textSecondary,
  },
});
