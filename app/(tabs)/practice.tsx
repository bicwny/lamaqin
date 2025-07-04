
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
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
    router.push('/modals/add-practice');
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>加载修行数据中...</Text>
      </View>
    );
  }

  if (projects.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>📿 开始您的修行之旅</Text>
        <Text style={styles.emptyDescription}>
          还没有修行项目，点击下方按钮开始添加您的第一个修行目标吧！
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPractice}>
          <Text style={styles.addButtonText}>+ 添加修法</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>📿 修行记录</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPractice}>
          <Text style={styles.addButtonText}>+ 添加修法</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.projectsList}>
        {projects.map((project) => {
          const progress = calculateProgress(project);
          const isTimeBasedWeekly = project.practices.type === 'time' && project.target_period === 'weekly';

          return (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.practices.name}</Text>
                <Text style={styles.projectType}>
                  {project.practices.type === 'count' ? '计数类' : '计时类'}
                  {project.practices.type === 'time' && project.target_period === 'weekly' && ' (周)'}
                </Text>
              </View>

              <View style={styles.progressContainer}>
                {project.practices.type === 'count' ? (
                  <View>
                    <Text style={styles.progressText}>
                      {progress.current}/{progress.target} {project.practices.unit}
                    </Text>
                    <Text style={styles.dailyTarget}>
                      (每日目标: {project.daily_target} {project.practices.unit})
                    </Text>
                  </View>
                ) : (
                  <View>
                    {isTimeBasedWeekly ? (
                      <Text style={styles.progressText}>
                        {Math.ceil((new Date(project.target_end_date).getTime() - new Date(project.start_date).getTime()) / (7 * 24 * 60 * 60 * 1000))}周 
                        {progress.isCompleted ? ' ✅' : ' ☐'}
                      </Text>
                    ) : (
                      <Text style={styles.progressText}>
                        {Math.ceil((new Date(project.target_end_date).getTime() - new Date(project.start_date).getTime()) / (24 * 60 * 60 * 1000))}天 
                        {progress.isCompleted ? ' ✅' : ' ☐'}
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
  );
}

// Component to display weekly progress for time-based practices
function WeeklyProgressDisplay({ project, user }: { project: PracticeProject; user: any }) {
  const [weeklyRecords, setWeeklyRecords] = useState<MeditationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklyRecords();
  }, [project.id]);

  const loadWeeklyRecords = async () => {
    if (!user?.id) return;

    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const { data: records, error } = await supabase
        .from('meditation_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('practice_id', project.practice_id)
        .gte('record_date', startOfWeek.toISOString().split('T')[0])
        .lte('record_date', endOfWeek.toISOString().split('T')[0])
        .order('created_at', { ascending: true });

      if (error) throw error;

      setWeeklyRecords(records || []);
    } catch (error) {
      console.error('Error loading weekly records:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text style={styles.weeklyProgressText}>加载中...</Text>;
  }

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
}

const styles = StyleSheet.create({
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
});
