import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import PageTemplate from '@/components/PageTemplate';
import ProgressBar from '@/components/ProgressBar';
import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTokens, ComponentTextStyles } from '@/utils/componentTokens';
import { presetProjectNameService } from '@/lib/database';
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
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      toastService.error({ title: '❌ 项目错误', message: '未找到修行项目' });
      return;
    }

    // Use unified practice detail page for both count and time-based practices
    router.push({
      pathname: '/practice-detail/[practiceId]',
      params: {
        practiceId: projectId,
      },
    });
  };

  if (loading) {
    return (
      <PageTemplate
        title="修行记录" 
        rightAction={{
          text: "添加",
          onPress: handleAddPractice
        }}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </PageTemplate>
    );
  }

  if (projects.length === 0) {
    return (
      <PageTemplate
        title="修行记录" 
        rightAction={{
          text: "添加",
          onPress: handleAddPractice
        }}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
        padding={0}
      >
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
      </PageTemplate>
    );
  }

  return (
      <PageTemplate
        title="修行记录" 
        rightAction={{
          text: "添加",
          onPress: handleAddPractice
        }}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
        padding={0}
      >
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

              {/* Practice Name and Project Name Row */}
              <View style={styles.practiceNameRow}>
                <Text style={styles.practiceName}>
                  {project.practices.name}
                  {project.practices.type === 'time' && ` (${practiceDisplayType})`}
                  {project.practices.type === 'time' && totalWeeks && ` - ${totalWeeks}周`}
                </Text>

                {/* Project Name Display */}
                {(project.project_name || project.preset_project_id) && (
                  <View style={styles.projectNamePill}>
                    <Text style={styles.projectNameText}>
                      {project.project_name || presetProjectNames[project.preset_project_id] || '预设项目'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.progressContainer}>
                {project.practices.type === 'count' ? (
                  <View>
                    <Text style={styles.practiceInfo}>
                      {progress.current.toLocaleString()}/{progress.target.toLocaleString()}{project.practices.unit} • 每日：{project.daily_target.toLocaleString()}{project.practices.unit}
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
    </PageTemplate>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: DesignSystem.spacing.lg,
    ...ComponentTextStyles.body,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing['4xl'],
  },
  emptyTitle: {
    ...ComponentTextStyles.heading,
    marginBottom: DesignSystem.spacing.lg,
    textAlign: 'center',
  },
  emptyDescription: {
    ...ComponentTextStyles.body,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing['4xl'],
  },
  addButton: {
    ...ComponentTokens.button.variants.primary,
    ...ComponentTokens.button.sizes.medium,
    alignItems: 'center',
  },
  addButtonText: {
    ...ComponentTextStyles.button.primary,
  },
  projectCard: {
    ...ComponentTokens.card.variants.outlined,
    padding: ComponentTokens.card.padding.comfortable,
    marginHorizontal: DesignSystem.spacing.lg,
    marginVertical: ComponentTokens.card.margin.compact,
  },
  activeProjectCard: {
    borderLeftWidth: 4,
    borderLeftColor: DesignSystem.colors.primary,
  },
  inactiveProjectCard: {
    opacity: 0.7,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing.md,
  },
  projectInfo: {
    flex: 1,
    marginRight: DesignSystem.spacing.md,
  },
  practiceName: {
    ...ComponentTextStyles.subheading,
    marginBottom: DesignSystem.spacing.xs,
  },
  projectName: {
    ...ComponentTextStyles.label,
    marginBottom: DesignSystem.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.md,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: DesignSystem.colors.successBackground,
  },
  inactiveBadge: {
    backgroundColor: DesignSystem.colors.backgroundTertiary,
  },
  statusText: {
    ...ComponentTextStyles.caption,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  activeStatusText: {
    color: DesignSystem.colors.practiceComplete,
  },
  inactiveStatusText: {
    color: DesignSystem.colors.textSecondary,
  },
  progressSection: {
    marginBottom: DesignSystem.spacing.md,
  },
  progressText: {
    ...ComponentTextStyles.body,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.xs,
  },
  progressSubtext: {
    ...ComponentTextStyles.label,
    marginBottom: DesignSystem.spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.md,
  },
  progressPercentage: {
    ...ComponentTextStyles.label,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.sm,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
  },
  primaryAction: {
    ...ComponentTokens.button.variants.primary,
    ...ComponentTokens.button.sizes.small,
  },
  secondaryAction: {
    ...ComponentTokens.button.variants.secondary,
    ...ComponentTokens.button.sizes.small,
  },
  primaryActionText: {
    ...ComponentTextStyles.button.primary,
    fontSize: DesignSystem.typography.fontSize.sm,
  },
  secondaryActionText: {
    ...ComponentTextStyles.button.secondary,
    fontSize: DesignSystem.typography.fontSize.sm,
  },
  fab: {
    position: 'absolute',
    right: DesignSystem.spacing.lg,
    bottom: DesignSystem.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DesignSystem.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignSystem.shadow.lg,
  },
});