import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

interface PracticeProject {
  id: string;
  user_id: string;
  practice_id: string;
  target_count: number;
  current_count: number;
  daily_target: number;
  target_period: string;
  start_date: string;
  target_end_date: string;
  status: string;
  practices: {
    id: string;
    name: string;
    type: string;
    unit: string;
    description: string;
  };
}

interface MeditationRecord {
  id: string;
  user_id: string;
  practice_id: string;
  record_date: string;
  duration_minutes: number;
  session_number?: number;
  created_at: string;
}

export default function PracticeScreen() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PracticeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadPracticeData();
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      loadPracticeData();
    }, [user])
  );

  const loadPracticeData = async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 Loading practice data for user:', user.id);

      const { data: practiceProjects, error } = await supabase
        .from('user_practice_projects')
        .select(`
          *,
          practices (
            id,
            name,
            type,
            unit,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📋 User practice projects:', practiceProjects);
      console.log('📋 Loaded practice projects:', practiceProjects?.length || 0);

      setProjects(practiceProjects || []);
    } catch (error) {
      console.error('Error loading practice data:', error);
      Alert.alert('错误', '加载修行数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPracticeData();
  };

  const calculateProgress = (project: PracticeProject) => {
    if (project.practices.type === 'count') {
      const percentage = Math.min((project.current_count / project.target_count) * 100, 100);
      return {
        current: project.current_count,
        target: project.target_count,
        percentage: percentage,
        isCompleted: project.current_count >= project.target_count,
      };
    } else {
      // For time-based practices, calculate based on sessions
      return {
        current: project.current_count,
        target: project.target_count,
        percentage: Math.min((project.current_count / project.target_count) * 100, 100),
        isCompleted: project.current_count >= project.target_count,
      };
    }
  };

  const getWeeklyProgress = async (projectId: string, practiceId: string) => {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const { data: weeklyRecords, error } = await supabase
        .from('meditation_records')
        .select('*')
        .eq('user_id', user?.id)
        .eq('practice_id', practiceId)
        .gte('record_date', startOfWeek.toISOString().split('T')[0])
        .lte('record_date', endOfWeek.toISOString().split('T')[0])
        .order('created_at', { ascending: true });

      if (error) throw error;

      return weeklyRecords || [];
    } catch (error) {
      console.error('Error getting weekly progress:', error);
      return [];
    }
  };

  const renderWeeklyProgress = (project: PracticeProject, weeklyRecords: MeditationRecord[]) => {
    const completed = weeklyRecords.length;
    const target = project.daily_target;
    const details = weeklyRecords.map((record, index) => 
      `第${index + 1}座: ${record.duration_minutes}分钟`
    ).join('; ');

    return (
      <View style={styles.weeklyProgress}>
        <Text style={styles.weeklyProgressText}>
          本周进度: {details || '暂无记录'} / {target} 座
        </Text>
        {project.practices.type === 'time' && (
          <Text style={styles.weeklyProgressSubtext}>
            (本周: {completed}/{target})
          </Text>
        )}
      </View>
    );
  };

  const handleAddPractice = () => {
    router.push('/add-practice');
  };

  const handleCustomRecord = async (projectId: string, practiceName: string) => {
    console.log('🔄 handleCustomRecord called with project:', projectId, practiceName);

    const project = projects.find(p => p.id === projectId);
    if (!project) {
      Alert.alert('错误', '未找到修行项目');
      return;
    }

    if (project.practices.type === 'time') {
      // For meditation practices, navigate to the meditation record modal
      router.push({
        pathname: '/modals/meditation-record',
        params: {
          projectId: projectId,
          practiceId: project.practice_id,
          practiceName: practiceName,
        },
      });
    } else {
      // For count-based practices, show simple input
      router.push({
        pathname: '/modals/custom-record',
        params: {
          projectId: projectId,
          practiceName: practiceName,
          practiceType: project.practices.type,
        },
      });
    }
  };

  const handleViewDetails = (projectId: string, practiceName: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (project.practices.type === 'time') {
      // For meditation practices, show meditation history
      router.push({
        pathname: '/meditation-history',
        params: {
          practiceId: project.practice_id,
          practiceName: practiceName,
        },
      });
    } else {
      // For count-based practices, show regular history
      router.push({
        pathname: '/practice-history',
        params: {
          projectId: projectId,
          practiceName: practiceName,
        },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center items-center bg-gray-50">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-base text-gray-600">加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (projects.length === 0) {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1 bg-gray-50">
          <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
            <View>
              <Text className="text-2xl font-semibold text-gray-900">修行</Text>
              <Text className="text-base text-gray-600 mt-1">Practice</Text>
            </View>
            <TouchableOpacity 
              className="bg-blue-500 px-4 py-2 rounded-full"
              onPress={() => router.push('/add-practice')}
            >
              <Text className="text-white font-medium">添加</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-2xl font-semibold text-gray-900 mb-4 text-center">开始你的修行之旅</Text>
            <Text className="text-base text-gray-600 text-center mb-8 leading-6">
              添加你的第一个修行项目，开始记录你的精神成长历程。
            </Text>
            <TouchableOpacity 
              className="bg-blue-500 px-6 py-3 rounded-lg"
              onPress={() => router.push('/add-practice')}
            >
              <Text className="text-white font-medium">添加修行项目</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
          <View>
            <Text className="text-2xl font-semibold text-gray-900">修行</Text>
            <Text className="text-base text-gray-600 mt-1">Practice</Text>
          </View>
          <TouchableOpacity 
            className="bg-blue-500 px-4 py-2 rounded-full"
            onPress={() => router.push('/add-practice')}
          >
            <Text className="text-white font-medium">添加</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.projectsList}>
            {projects.map((project) => {
              const progress = calculateProgress(project);
              const isTimeBasedWeekly = project.practices.type === 'time' && project.target_period === 'weekly';

              return (
                <View key={project.id} style={styles.projectCard}>
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectType}>
                      {project.practices.type === 'count' ? '计数类' : '计时类'}
                      {project.practices.type === 'time' && project.target_period === 'weekly' && ' (周)'}
                    </Text>
                  </View>

                  <View style={styles.progressContainer}>
                    {project.practices.type === 'count' ? (
                      <View>
                        <Text style={styles.progressText}>
                          {project.practices.name}
                        </Text>
                        <Text style={styles.progressNumbers}>
                          {progress.current.toLocaleString()}/{progress.target.toLocaleString()} {project.practices.unit}
                        </Text>
                        <Text style={styles.dailyTarget}>
                          每日目标: {project.daily_target.toLocaleString()} {project.practices.unit}
                        </Text>
                      </View>
                    ) : (
                      <View>
                        <Text style={styles.progressText}>
                          {project.practices.name}
                        </Text>
                        {project.target_period === 'weekly' ? (
                          <Text style={styles.progressNumbers}>
                            本周目标: {project.target_count}座 (每日{project.daily_target}座)
                          </Text>
                        ) : (
                          <Text style={styles.progressNumbers}>
                            总进度: {progress.current}/{progress.target}天
                          </Text>
                        )}

                        <WeeklyProgressDisplay
                          project={project}
                          user={user}
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.projectActions}>
                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => handleViewDetails(project.id, project.practices.name)}
                    >
                      <Text style={styles.detailsButtonText}>查看详情</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.recordButton}
                      onPress={() => handleCustomRecord(project.id, project.practices.name)}
                    >
                      <Text style={styles.recordButtonText}>
                        {project.practices.type === 'time' ? '记录观修' : '记录'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Component to display weekly progress for time-based practices
function WeeklyProgressDisplay({ project, user }: { project: PracticeProject; user: any }) {
  const [todayRecords, setTodayRecords] = useState<MeditationRecord[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<MeditationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, [project.id, user?.id]);

  const loadRecords = async () => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get today's records
      const { data: todayData, error: todayError } = await supabase
        .from('meditation_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('practice_id', project.practice_id)
        .eq('record_date', today)
        .order('created_at', { ascending: true });

      if (todayError) throw todayError;

      // Get this week's records for weekly projects
      if (project.target_period === 'weekly') {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const { data: weeklyData, error: weeklyError } = await supabase
          .from('meditation_records')
          .select('*')
          .eq('user_id', user.id)
          .eq('practice_id', project.practice_id)
          .gte('record_date', startOfWeek.toISOString().split('T')[0])
          .lte('record_date', endOfWeek.toISOString().split('T')[0])
          .order('created_at', { ascending: true });

        if (weeklyError) throw weeklyError;
        setWeeklyRecords(weeklyData || []);
      }

      setTodayRecords(todayData || []);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.weeklyProgress}>
        <Text style={styles.weeklyProgressText}>加载中...</Text>
      </View>
    );
  }

  const isWeekly = project.target_period === 'weekly';
  const todayCount = todayRecords.length;
  const target = project.daily_target;

  // Format session details for today
  const todayDetails = todayRecords.map((record, index) =>
    `第${index + 1}座${record.duration_minutes}分钟`
  ).join('；');

  if (isWeekly) {
    const weeklyCount = weeklyRecords.length;
    const weeklyTarget = project.target_count;

    return (
      <View style={styles.weeklyProgress}>
        <Text style={styles.weeklyProgressText}>
          本周进度: {weeklyCount}/{weeklyTarget}座{weeklyCount >= weeklyTarget ? ' ✅' : ''}
        </Text>
        {todayCount > 0 && todayDetails && (
          <Text style={styles.weeklyProgressSubtext}>
            今日: {todayDetails}
          </Text>
        )}
      </View>
    );
  } else {
    return (
      <View style={styles.weeklyProgress}>
        <Text style={styles.weeklyProgressText}>
          今日进度: {todayCount}/{target}座{todayCount >= target ? ' ✅' : ''}
        </Text>
        {todayCount > 0 && todayDetails && (
          <Text style={styles.weeklyProgressSubtext}>
            {todayDetails}
          </Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  projectsList: {
    padding: 16,
  },
  projectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  projectType: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  progressNumbers: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.text,
    marginBottom: 4,
  },
  dailyTarget: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  weeklyProgress: {
    marginTop: 8,
  },
  weeklyProgressText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  weeklyProgressSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  projectActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  detailsButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  recordButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
});