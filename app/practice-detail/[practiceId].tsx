import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { presetProjectNameService } from '@/lib/database';
import PageTemplate from '@/components/PageTemplate';
import { toastService } from '@/lib/toast';
import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTokens, ComponentTextStyles, componentHelpers } from '@/utils/componentTokens';
import { Typography } from '@/utils/typography';

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
  project_name: string;
  preset_project_id: string;
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
  notes?: string;
  created_at: string;
}

export default function PracticeDetailScreen() {
  const { user } = useAuth();
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>();

  const [project, setProject] = useState<PracticeProject | null>(null);
  const [presetProjectName, setPresetProjectName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayRecords, setTodayRecords] = useState<MeditationRecord[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<MeditationRecord[]>([]);
  const [practiceRecords, setPracticeRecords] = useState<any[]>([]);

  useEffect(() => {
    if (user && practiceId) {
      loadPracticeData();
    }
  }, [user, practiceId]);

  useFocusEffect(
    React.useCallback(() => {
      if (user && practiceId) {
        loadPracticeData();
      }
    }, [user, practiceId])
  );

  const loadPracticeData = async () => {
    if (!user || !practiceId) return;

    try {
      setLoading(true);

      // Load practice project
      const { data: practiceData, error } = await supabase
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
        .eq('id', practiceId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setProject(practiceData);

      // Load preset project name if needed
      if (practiceData.preset_project_id) {
        try {
          const presets = await presetProjectNameService.getPresetProjectNames();
          const preset = presets.find(p => p.id === practiceData.preset_project_id);
          if (preset) {
            setPresetProjectName(preset.name);
          }
        } catch (presetError) {
          console.error('Error loading preset project name:', presetError);
        }
      }

      // Load meditation records if it's a time-based practice
      if (practiceData.practices.type === 'time') {
        await loadMeditationRecords(practiceData);
      } else if (practiceData.practices.type === 'count') {
        await loadPracticeRecords(practiceData.id);
      }

    } catch (error) {
      console.error('Error loading practice data:', error);
      toastService.error({ title: '❌ 加载失败', message: '修行数据加载失败，请重试' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMeditationRecords = async (projectData: PracticeProject) => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get today's records
      const { data: todayData, error: todayError } = await supabase
        .from('meditation_records')
        .select('id, user_id, practice_id, record_date, duration_minutes, session_number, created_at')
        .eq('user_id', user.id)
        .eq('practice_id', projectData.practice_id)
        .eq('record_date', today)
        .order('created_at', { ascending: true });

      if (todayError) throw todayError;

      // Get this week's records for weekly projects
      if (projectData.target_period === 'weekly') {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const { data: weeklyData, error: weeklyError } = await supabase
          .from('meditation_records')
          .select('id, user_id, practice_id, record_date, duration_minutes, session_number, created_at')
          .eq('user_id', user.id)
          .eq('practice_id', projectData.practice_id)
          .gte('record_date', startOfWeek.toISOString().split('T')[0])
          .lte('record_date', endOfWeek.toISOString().split('T')[0])
          .order('created_at', { ascending: true });

        if (weeklyError) throw weeklyError;
        setWeeklyRecords(weeklyData || []);
      }

      setTodayRecords(todayData || []);
    } catch (error) {
      console.error('Error loading meditation records:', error);
    }
  };

  const loadPracticeRecords = async (projectId: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('daily_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('practice_project_id', projectId)
        .order('record_date', { ascending: false })
        .limit(10); // Show last 10 records

      if (error) throw error;
      setPracticeRecords(data || []);
    } catch (error) {
      console.error('Error loading practice records:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPracticeData();
  };

  const calculateProgress = () => {
    if (!project) return { percentage: 0, current: 0, target: 0, isCompleted: false };

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

  const handleRecord = () => {
    if (!project) return;

    if (project.practices.type === 'time') {
      // For meditation practices, navigate to the meditation record modal
      router.push({
        pathname: '/modals/meditation-record',
        params: {
          projectId: project.id,
          practiceId: project.practice_id,
          practiceName: project.practices.name,
        },
      });
    } else {
      // For count-based practices, show simple input
      router.push({
        pathname: '/modals/custom-record',
        params: {
          projectId: project.id,
          practiceName: project.practices.name,
          practiceType: project.practices.type,
        },
      });
    }
  };

  const handleViewHistory = () => {
    if (!project) return;

    if (project.practices.type === 'time') {
      // For meditation practices, show meditation history
      router.push({
        pathname: '/meditation-history',
        params: {
          practiceId: project.practice_id,
          practiceName: project.practices.name,
        },
      });
    } else {
      // For count-based practices, show regular history
      router.push({
        pathname: '/practice-history',
        params: {
          projectId: project.id,
          practiceName: project.practices.name,
        },
      });
    }
  };

  const handleEditPractice = () => {
    if (!project) return;

    router.push({
      pathname: '/practice-config',
      params: {
        practiceId: project.practice_id,
        practiceName: project.practices.name,
        practiceType: project.practices.type,
        practiceUnit: project.practices.unit,
        practiceDescription: project.practices.description || '',
        editMode: 'true',
        projectId: project.id,
        currentTargetCount: project.target_count.toString(),
        currentDailyTarget: project.daily_target.toString(),
        currentStartDate: project.start_date,
        currentEndDate: project.target_end_date || '',
        currentTargetPeriod: project.target_period,
        currentGoalType: project.goal_type || 'total',
        currentProjectName: project.project_name || '',
        currentPresetId: project.preset_project_id || '',
      },
    });
  };

  const getDisplayProjectName = () => {
    if (!project) return '';
    return project.project_name || presetProjectName || '预设项目';
  };

  const renderRecentRecords = () => {
    if (!project) return null;

    if (project.practices.type === 'time') {
      // Show recent meditation records
      const recentRecords = [...todayRecords, ...weeklyRecords]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      if (recentRecords.length === 0) {
        return (
          <Text style={styles.noRecordsText}>暂无观修记录</Text>
        );
      }

      return recentRecords.map((record) => (
        <TouchableOpacity
          key={record.id}
          style={styles.recordItem}
          onPress={() => router.push({
            pathname: '/meditation-detail/[recordId]',
            params: { recordId: record.id }
          })}
        >
          <View style={styles.recordHeader}>
            <Text style={styles.recordDate}>
              {new Date(record.record_date).toLocaleDateString('zh-CN')}
            </Text>
            <Text style={styles.recordTime}>
              {new Date(record.created_at).toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          <Text style={styles.recordCount}>
            第{record.session_number || 1}座 · {record.duration_minutes}分钟
          </Text>
        </TouchableOpacity>
      ));
    } else {
      // Show recent count-based records
      if (practiceRecords.length === 0) {
        return (
          <Text style={styles.noRecordsText}>暂无修行记录</Text>
        );
      }

      return practiceRecords.slice(0, 5).map((record) => (
        <View key={record.id} style={styles.recordItem}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordDate}>
              {new Date(record.record_date).toLocaleDateString('zh-CN')}
            </Text>
            <Text style={styles.recordTime}>
              {new Date(record.created_at).toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          <Text style={styles.recordCount}>
            +{record.count.toLocaleString()} {project.practices.unit}
          </Text>
          {record.notes && (
            <View style={styles.recordNotes}>
              <Text style={styles.notesLabel}>备注:</Text>
              <Text style={styles.notesText} numberOfLines={2}>
                {record.notes}
              </Text>
            </View>
          )}
        </View>
      ));
    }
  };

  const renderProgressDetails = () => {
    if (!project) return null;

    const progress = calculateProgress();
    const isTimeBasedWeekly = project.practices.type === 'time' && project.target_period === 'weekly';

    if (project.practices.type === 'count') {
      return (
        <View style={styles.progressDetails}>
          <Text style={styles.progressText}>
            {progress.current.toLocaleString()}/{progress.target.toLocaleString()} {project.practices.unit}
          </Text>
          <Text style={styles.dailyTargetText}>
            每日目标：{project.daily_target.toLocaleString()} {project.practices.unit}
          </Text>
        </View>
      );
    } else {
      const todayCount = todayRecords.length;
      const target = project.daily_target;

      // Format session details for today
      const todayDetails = todayRecords.map((record, index) =>
        `第${index + 1}座${record.duration_minutes}分钟`
      ).join('；');

      if (isTimeBasedWeekly) {
        const weeklyCount = weeklyRecords.length;
        const weeklyTarget = project.daily_target;

        return (
          <View style={styles.progressDetails}>
            <Text style={styles.progressText}>
              本周进度：{weeklyCount}/{weeklyTarget}座{weeklyCount >= weeklyTarget ? ' ✅' : ''}
            </Text>
            {todayCount > 0 && todayDetails && (
              <Text style={styles.sessionDetails}>
                今日：{todayDetails}
              </Text>
            )}
          </View>
        );
      } else {
        return (
          <View style={styles.progressDetails}>
            <Text style={styles.progressText}>
              今日进度：{todayCount}/{target}座{todayCount >= target ? ' ✅' : ''}
            </Text>
            {todayCount > 0 && todayDetails && (
              <Text style={styles.sessionDetails}>
                {todayDetails}
              </Text>
            )}
          </View>
        );
      }
    }
  };

  if (loading) {
    return (
      <PageTemplate
        title="修行详情"
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </PageTemplate>
    );
  }

  if (!project) {
    return (
      <PageTemplate
        title="修行详情"
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>未找到修行项目</Text>
        </View>
      </PageTemplate>
    );
  }

  const progress = calculateProgress();
  const practiceDisplayType = project.target_end_date ? '固定时长' : '持续进行';
  const totalWeeks = project.target_end_date 
    ? Math.ceil((new Date(project.target_end_date).getTime() - new Date(project.start_date).getTime()) / (7 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <PageTemplate
      title={project.practices.name}
      subtitle={project.project_name || project.preset_project_id ? 
        `项目：${getDisplayProjectName()}` : undefined}
      showBackButton={true}
      onBackPress={() => router.back()}
      backgroundColor={DesignSystem.colors.background}
      padding={0}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Main Practice Info Card */}
        <View style={styles.mainCard}>
          {/* Practice Type and Status Header */}
          <View style={styles.practiceHeader}>
            <View style={styles.practiceTypeRow}>
              <Text style={styles.practiceType}>
                {project.practices.type === 'count' ? '计数类' : '计时类'}
                {project.practices.type === 'time' && project.target_period === 'weekly' && ' (周)'}
              </Text>
              {progress.isCompleted && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✅ 已完成</Text>
                </View>
              )}
            </View>

            <Text style={styles.practiceTitle}>
              {project.practices.name}
            </Text>

            {project.practices.description && (
              <Text style={styles.practiceDescription}>
                {project.practices.description}
              </Text>
            )}
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            {renderProgressDetails()}

            {project.practices.type === 'count' && (
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.min(progress.percentage, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressPercentage}>
                  {Math.round(progress.percentage)}%
                </Text>
              </View>
            )}
          </View>

          {/* Project Details */}
          <View style={styles.projectDetails}>
            <Text style={styles.projectDetailsTitle}>项目详情</Text>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>开始日期</Text>
                <Text style={styles.detailValue}>{project.start_date}</Text>
              </View>

              {project.target_end_date && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>目标结束日期</Text>
                  <Text style={styles.detailValue}>{project.target_end_date}</Text>
                </View>
              )}

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>项目状态</Text>
                <Text style={[
                  styles.detailValue,
                  progress.isCompleted ? styles.statusCompleted : styles.statusActive
                ]}>
                  {progress.isCompleted ? '已完成' : '进行中'}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleEditPractice}
            >
              <Ionicons name="create-outline" size={20} color={DesignSystem.colors.primary} />
              <Text style={styles.secondaryButtonText}>编辑项目</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRecord}
            >
              <Ionicons name="add-circle-outline" size={24} color={DesignSystem.colors.textInverse} />
              <Text style={styles.buttonText}>
                {project.practices.type === 'time' ? '记录观修' : '记录修行'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Records Card */}
        <View style={styles.recordsCard}>
          <View style={styles.recordsHeader}>
            <Text style={styles.recordsTitle}>最近记录</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={handleViewHistory}
            >
              <Text style={styles.viewAllText}>查看全部</Text>
              <Ionicons name="chevron-forward" size={16} color={DesignSystem.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.recordsList}>
            {renderRecentRecords()}
          </View>
        </View>
      </ScrollView>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: DesignSystem.spacing.md,
    ...Typography.styles.body('base'),
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing['4xl'],
  },
  emptyText: {
    ...Typography.styles.subheading('lg'),
    color: DesignSystem.colors.textSecondary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: DesignSystem.spacing.lg,
  },
  mainCard: {
    ...ComponentTokens.card.practice,
    margin: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.md,
  },
  practiceHeader: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
  },
  practiceTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.lg,
  },
  practiceType: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textSecondary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  completedBadge: {
    ...ComponentTokens.buddhist.completionBadge,
  },
  completedText: {
    ...ComponentTextStyles.buddhist.completionText,
  },
  practiceTitle: {
    ...Typography.styles.dharmaTitle('2xl'),
    marginBottom: DesignSystem.spacing.md,
    lineHeight: DesignSystem.typography.lineHeight.tight * DesignSystem.typography.fontSize['2xl'],
  },
  practiceDescription: {
    ...Typography.styles.body('base'),
    lineHeight: DesignSystem.typography.lineHeight.relaxed * DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.textSecondary,
  },
  progressSection: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.background,
    marginHorizontal: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
    marginBottom: DesignSystem.spacing.lg,
  },
  progressDetails: {
    marginBottom: DesignSystem.spacing.md,
  },
  progressText: {
    ...Typography.styles.subheading('lg'),
    marginBottom: DesignSystem.spacing.xs,
  },
  dailyTargetText: {
    ...Typography.styles.label('sm'),
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.textSecondary,
  },
  sessionDetails: {
    ...Typography.styles.label('sm'),
    fontStyle: 'italic',
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.textSecondary,
    marginTop: DesignSystem.spacing.xs,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.md,
    marginTop: DesignSystem.spacing.sm,
  },
  progressBar: {
    ...ComponentTokens.progress.practice.container,
    flex: 1,
  },
  progressFill: {
    ...ComponentTokens.progress.practice.fill,
  },
  progressPercentage: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.primary,
    minWidth: 50,
    textAlign: 'right',
  },
  projectDetails: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
  },
  projectDetailsTitle: {
    ...Typography.styles.subheading('lg'),
    marginBottom: DesignSystem.spacing.lg,
  },
  detailsGrid: {
    gap: DesignSystem.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.sm,
  },
  detailLabel: {
    ...Typography.styles.body('base'),
    color: DesignSystem.colors.textSecondary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  detailValue: {
    ...Typography.styles.body('base'),
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
  },
  statusCompleted: {
    color: DesignSystem.colors.practiceComplete,
  },
  statusActive: {
    color: DesignSystem.colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
  },
  primaryButton: {
    ...ComponentTokens.button.primary,
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.sm,
  },
  secondaryButton: {
    ...ComponentTokens.button.secondary,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.xs,
  },
  secondaryButtonText: {
    ...ComponentTextStyles.button.secondary,
  },
  buttonText: {
    ...ComponentTextStyles.button.primary,
  },
  recordsCard: {
    ...ComponentTokens.card.practice,
    margin: DesignSystem.spacing.lg,
    marginTop: 0,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
  },
  recordsTitle: {
    ...Typography.styles.subheading('lg'),
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
  },
  viewAllText: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.primary,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  recordsList: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
  },
  noRecordsText: {
    ...Typography.styles.body('base'),
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: DesignSystem.spacing['2xl'],
    fontStyle: 'italic',
  },
  recordItem: {
    marginBottom: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  recordDate: {
    ...Typography.styles.body('base'),
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
  },
  recordTime: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textSecondary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  recordCount: {
    ...Typography.styles.body('base'),
    color: DesignSystem.colors.textPrimary,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    marginBottom: DesignSystem.spacing.xs,
  },
  recordNotes: {
    backgroundColor: DesignSystem.colors.background,
    padding: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    marginTop: DesignSystem.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: DesignSystem.colors.primary,
  },
  notesLabel: {
    ...Typography.styles.label('sm'),
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textSecondary,
    marginBottom: DesignSystem.spacing.xs,
  },
  notesText: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textPrimary,
    lineHeight: DesignSystem.typography.lineHeight.normal * DesignSystem.typography.fontSize.sm,
  },
  // TEMP DEBUG STYLES - REMOVE LATER
  debugLabel: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: 'white',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1000,
    fontWeight: 'bold',
  },
});