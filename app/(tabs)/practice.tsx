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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { presetProjectNameService } from '@/lib/database';
import PageHeader from '@/components/PageHeader';
import { toastService } from '@/lib/toast';

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
  const [presetProjectNames, setPresetProjectNames] = useState<{[key: string]: string}>({});
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
    if (!user) return;

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

      // Load preset project names for projects that use presets
      const presetIds = practiceProjects?.filter(p => p.preset_project_id).map(p => p.preset_project_id) || [];
      if (presetIds.length > 0) {
        try {
          const presets = await presetProjectNameService.getPresetProjectNames();
          const presetMap: {[key: string]: string} = {};
          presets.forEach(preset => {
            presetMap[preset.id] = preset.name;
          });
          setPresetProjectNames(presetMap);
        } catch (presetError) {
          console.error('Error loading preset project names:', presetError);
        }
      }

      setProjects(practiceProjects || []);
    } catch (error) {
      console.error('Error loading practice data:', error);
      toastService.error({ title: '❌ 加载失败', message: '修行数据加载失败，请重试' });
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

  const handleAddPractice = () => {
    router.push('/add-practice');
  };

  const handleCustomRecord = async (projectId: string, practiceName: string) => {
    console.log('🔄 handleCustomRecord called with project:', projectId, practiceName);

    const project = projects.find(p => p.id === projectId);
    if (!project) {
      toastService.error({ title: '❌ 项目错误', message: '未找到修行项目' });
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
    // Navigate to dedicated practice detail screen
    router.push({
      pathname: '/practice-detail/[practiceId]',
      params: {
        practiceId: projectId,
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader 
          title="修行记录" 
          rightAction={{
            text: "添加",
            onPress: handleAddPractice
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (projects.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader 
          title="修行记录" 
          rightAction={{
            text: "添加",
            onPress: handleAddPractice
          }}
        />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>


          <View style={styles.emptyState}>
            <View style={styles.iconContainer}>
              <Ionicons name="flower-outline" size={80} color="#9CA3AF" />
            </View>

            <Text style={styles.emptyTitle}>开始你的修行之旅</Text>
            <Text style={styles.emptyDescription}>
              添加你的第一个修行项目，开始记录你的精神成长历程
            </Text>

            <TouchableOpacity 
              style={styles.browseButton} 
              onPress={handleAddPractice}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
              <Text style={styles.browseButtonText}>添加修行项目</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
      <SafeAreaView style={styles.container}>
        <PageHeader 
          title="修行记录" 
          rightAction={{
            text: "添加",
            onPress: handleAddPractice
          }}
        />
        <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >


        <Text style={styles.sectionTitle}>我的修行项目：</Text>

        {projects.map((project) => {
          const progress = calculateProgress(project);
          const isTimeBasedWeekly = project.practices.type === 'time' && project.target_period === 'weekly';

          // Unified display logic based on target_end_date
          const practiceDisplayType = project.target_end_date ? '固定时长' : '持续进行';
          const totalWeeks = project.target_end_date 
            ? Math.ceil((new Date(project.target_end_date).getTime() - new Date(project.start_date).getTime()) / (7 * 24 * 60 * 60 * 1000))
            : null;

          return (
            <View key={project.id} style={styles.practiceCard}>
              <View style={styles.practiceHeader}>
                <Text style={styles.practiceType}>
                  {project.practices.type === 'count' ? '计数类' : '计时类'}
                  {project.practices.type === 'time' && project.target_period === 'weekly' && ' (周)'}
                </Text>
              </View>

              <Text style={styles.practiceName}>
                {project.practices.name}
                {project.practices.type === 'time' && ` (${practiceDisplayType})`}
                {project.practices.type === 'time' && totalWeeks && ` - ${totalWeeks}周`}
              </Text>

              {/* Project Name Display */}
              {(project.project_name || project.preset_project_id) && (
                <Text style={styles.projectName}>
                  项目: {project.project_name || presetProjectNames[project.preset_project_id] || '预设项目'}
                </Text>
              )}

              <View style={styles.progressContainer}>
                {project.practices.type === 'count' ? (
                  <View>
                    <Text style={styles.practiceInfo}>
                      {progress.current.toLocaleString()}/{progress.target.toLocaleString()} {project.practices.unit}
                    </Text>
                    <Text style={styles.practiceDetails}>
                      每日目标：{project.daily_target.toLocaleString()} {project.practices.unit}
                    </Text>
                  </View>
                ) : (
                  <View>
                    {project.target_period === 'weekly' ? (
                      <Text style={styles.practiceInfo}>
                        本周目标：{project.daily_target}座 (每周{project.daily_target}座)
                      </Text>
                    ) : (
                      <Text style={styles.practiceInfo}>
                        总进度：{progress.current}/{progress.target}天
                      </Text>
                    )}

                    <WeeklyProgressDisplay
                      project={project}
                      user={user}
                    />
                  </View>
                )}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => handleViewDetails(project.id, project.practices.name)}
                >
                  <Text style={styles.secondaryButtonText}>查看详情</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => handleCustomRecord(project.id, project.practices.name)}
                >
                  <Text style={styles.buttonText}>
                    {project.practices.type === 'time' ? '记录观修' : '记录'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
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
    const weeklyTarget = project.daily_target; // Use daily_target which represents weekly sessions for weekly projects

    return (
      <View style={styles.weeklyProgress}>
        <Text style={styles.weeklyProgressText}>
          本周进度：{weeklyCount}/{weeklyTarget}座{weeklyCount >= weeklyTarget ? ' ✅' : ''}
        </Text>
        {todayCount > 0 && todayDetails && (
          <Text style={styles.weeklyProgressSubtext}>
            今日：{todayDetails}
          </Text>
        )}
      </View>
    );
  } else {
    return (
      <View style={styles.weeklyProgress}>
        <Text style={styles.weeklyProgressText}>
          今日进度：{todayCount}/{target}座{todayCount >= target ? ' ✅' : ''}
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

// New component to display total sessions
function TotalSessionsDisplay({ practiceId, userId }: { practiceId: string; userId: string }) {
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalSessions = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('meditation_records')
          .select('*, topic_number', { count: 'exact' })
          .eq('user_id', userId)
          .eq('practice_id', practiceId);

        if (error) {
          throw error;
        }

        setTotalSessions(data ? data.length : 0);
      } catch (error) {
        console.error('Error fetching total sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalSessions();
  }, [practiceId, userId]);

  if (loading) {
    return <Text style={styles.totalSessions}>总数: 加载中...</Text>;
  }

  return <Text style={styles.totalSessions}>🧘 {totalSessions} 次观修</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 16,
  },
  manageButton: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  practiceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  practiceHeader: {
    marginBottom: 8,
  },
  practiceType: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
  },
  totalSessions: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  practiceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  projectName: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  practiceInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  practiceDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 16,
  },
  weeklyProgress: {
    marginTop: 8,
  },
  weeklyProgressText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
    marginBottom: 4,
  },
  weeklyProgressSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 500,
  },
  iconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.3,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginLeft: 8,
  },
});