
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
          <View style={styles.emptyRecordsContainer}>
            <Ionicons name="time-outline" size={48} color={DesignSystem.colors.textSecondary} />
            <Text style={styles.noRecordsText}>暂无观修记录</Text>
            <Text style={styles.noRecordsSubtext}>开始您的第一次观修吧</Text>
          </View>
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
          <View style={styles.recordIconContainer}>
            <Ionicons name="time" size={20} color={DesignSystem.colors.primary} />
          </View>
          <View style={styles.recordContent}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordTitle}>
                第{record.session_number || 1}座 · {record.duration_minutes}分钟
              </Text>
              <Text style={styles.recordTime}>
                {new Date(record.created_at).toLocaleTimeString('zh-CN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
            <Text style={styles.recordDate}>
              {new Date(record.record_date).toLocaleDateString('zh-CN')}
            </Text>
          </View>
        </TouchableOpacity>
      ));
    } else {
      // Show recent count-based records
      if (practiceRecords.length === 0) {
        return (
          <View style={styles.emptyRecordsContainer}>
            <Ionicons name="checkmark-circle-outline" size={48} color={DesignSystem.colors.textSecondary} />
            <Text style={styles.noRecordsText}>暂无修行记录</Text>
            <Text style={styles.noRecordsSubtext}>记录您的第一次修行</Text>
          </View>
        );
      }

      return practiceRecords.slice(0, 5).map((record) => (
        <View key={record.id} style={styles.recordItem}>
          <View style={styles.recordIconContainer}>
            <Ionicons name="add-circle" size={20} color={DesignSystem.colors.practiceComplete} />
          </View>
          <View style={styles.recordContent}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordTitle}>
                +{record.count.toLocaleString()} {project.practices.unit}
              </Text>
              <Text style={styles.recordTime}>
                {new Date(record.created_at).toLocaleTimeString('zh-CN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
            <Text style={styles.recordDate}>
              {new Date(record.record_date).toLocaleDateString('zh-CN')}
            </Text>
            {record.notes && (
              <View style={styles.recordNotes}>
                <Text style={styles.notesText} numberOfLines={2}>
                  {record.notes}
                </Text>
              </View>
            )}
          </View>
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
          <View style={styles.progressStatsRow}>
            <View style={styles.progressStat}>
              <Text style={styles.progressNumber}>
                {progress.current.toLocaleString()}
              </Text>
              <Text style={styles.progressLabel}>已完成</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressNumber}>
                {progress.target.toLocaleString()}
              </Text>
              <Text style={styles.progressLabel}>目标</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressNumber}>
                {project.daily_target.toLocaleString()}
              </Text>
              <Text style={styles.progressLabel}>每日</Text>
            </View>
          </View>
          <Text style={styles.progressUnit}>{project.practices.unit}</Text>
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
            <View style={styles.progressStatsRow}>
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>{weeklyCount}</Text>
                <Text style={styles.progressLabel}>本周</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>{weeklyTarget}</Text>
                <Text style={styles.progressLabel}>目标</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>{todayCount}</Text>
                <Text style={styles.progressLabel}>今日</Text>
              </View>
            </View>
            <Text style={styles.progressUnit}>座观修</Text>
            {weeklyCount >= weeklyTarget && (
              <View style={styles.completionBadge}>
                <Ionicons name="checkmark-circle" size={16} color={DesignSystem.colors.practiceComplete} />
                <Text style={styles.completionText}>本周目标已达成</Text>
              </View>
            )}
            {todayCount > 0 && todayDetails && (
              <Text style={styles.sessionDetails}>
                今日详情：{todayDetails}
              </Text>
            )}
          </View>
        );
      } else {
        return (
          <View style={styles.progressDetails}>
            <View style={styles.progressStatsRow}>
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>{todayCount}</Text>
                <Text style={styles.progressLabel}>今日</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>{target}</Text>
                <Text style={styles.progressLabel}>目标</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressNumber}>
                  {Math.round((todayCount / target) * 100)}%
                </Text>
                <Text style={styles.progressLabel}>完成度</Text>
              </View>
            </View>
            <Text style={styles.progressUnit}>座观修</Text>
            {todayCount >= target && (
              <View style={styles.completionBadge}>
                <Ionicons name="checkmark-circle" size={16} color={DesignSystem.colors.practiceComplete} />
                <Text style={styles.completionText}>今日目标已达成</Text>
              </View>
            )}
            {todayCount > 0 && todayDetails && (
              <Text style={styles.sessionDetails}>
                今日详情：{todayDetails}
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
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.practiceTypeContainer}>
            <View style={styles.practiceTypeBadge}>
              <Text style={styles.practiceTypeText}>
                {project.practices.type === 'count' ? '计数类' : '计时类'}
                {project.practices.type === 'time' && project.target_period === 'weekly' && ' · 周目标'}
              </Text>
            </View>
            {progress.isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={18} color={DesignSystem.colors.practiceComplete} />
                <Text style={styles.completedText}>已完成</Text>
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
          <Text style={styles.sectionTitle}>进度统计</Text>
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

        {/* Project Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>项目信息</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="calendar-outline" size={20} color={DesignSystem.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>开始日期</Text>
                <Text style={styles.infoValue}>{project.start_date}</Text>
              </View>
            </View>

            {project.target_end_date && (
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="flag-outline" size={20} color={DesignSystem.colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>目标日期</Text>
                  <Text style={styles.infoValue}>{project.target_end_date}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="pulse-outline" size={20} color={DesignSystem.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>状态</Text>
                <Text style={[
                  styles.infoValue,
                  progress.isCompleted ? styles.statusCompleted : styles.statusActive
                ]}>
                  {progress.isCompleted ? '已完成' : '进行中'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Records Section */}
        <View style={styles.recordsSection}>
          <View style={styles.recordsHeader}>
            <Text style={styles.sectionTitle}>最近记录</Text>
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

        {/* Bottom spacing for floating buttons */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity
          style={styles.secondaryFloatingButton}
          onPress={handleEditPractice}
        >
          <Ionicons name="create-outline" size={20} color={DesignSystem.colors.primary} />
          <Text style={styles.secondaryButtonText}>编辑</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryFloatingButton}
          onPress={handleRecord}
        >
          <Ionicons name="add" size={24} color={DesignSystem.colors.textInverse} />
          <Text style={styles.primaryButtonText}>
            {project.practices.type === 'time' ? '记录观修' : '记录修行'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 120, // Space for floating buttons
  },
  
  // Hero Section
  heroSection: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    paddingHorizontal: DesignSystem.spacing.xl,
    paddingTop: DesignSystem.spacing.xl,
    paddingBottom: DesignSystem.spacing['2xl'],
  },
  practiceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.lg,
  },
  practiceTypeBadge: {
    backgroundColor: DesignSystem.colors.primary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.md,
  },
  practiceTypeText: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textInverse,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.practiceComplete,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.md,
    gap: DesignSystem.spacing.xs,
  },
  completedText: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textInverse,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
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

  // Section Styles
  progressSection: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    marginHorizontal: DesignSystem.spacing.lg,
    marginTop: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.xl,
  },
  infoSection: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    marginHorizontal: DesignSystem.spacing.lg,
    marginTop: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.xl,
  },
  recordsSection: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    marginHorizontal: DesignSystem.spacing.lg,
    marginTop: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.xl,
  },
  sectionTitle: {
    ...Typography.styles.subheading('lg'),
    marginBottom: DesignSystem.spacing.lg,
  },

  // Progress Details
  progressDetails: {
    alignItems: 'center',
  },
  progressStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: DesignSystem.spacing.sm,
  },
  progressStat: {
    alignItems: 'center',
    flex: 1,
  },
  progressNumber: {
    ...Typography.styles.dharmaTitle('xl'),
    color: DesignSystem.colors.primary,
    fontWeight: DesignSystem.typography.fontWeight.bold,
  },
  progressLabel: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textSecondary,
    marginTop: DesignSystem.spacing.xs,
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: DesignSystem.colors.borderLight,
    marginHorizontal: DesignSystem.spacing.md,
  },
  progressUnit: {
    ...Typography.styles.body('base'),
    color: DesignSystem.colors.textSecondary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    marginBottom: DesignSystem.spacing.md,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.md,
    marginTop: DesignSystem.spacing.lg,
    width: '100%',
  },
  progressBar: {
    ...ComponentTokens.progress.practice.container,
    flex: 1,
  },
  progressFill: {
    ...ComponentTokens.progress.practice.fill,
  },
  progressPercentage: {
    ...Typography.styles.subheading('base'),
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.primary,
    minWidth: 50,
    textAlign: 'right',
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.practiceComplete,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.md,
    gap: DesignSystem.spacing.xs,
    marginTop: DesignSystem.spacing.md,
  },
  completionText: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textInverse,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  sessionDetails: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textSecondary,
    marginTop: DesignSystem.spacing.md,
    textAlign: 'center',
    lineHeight: DesignSystem.typography.lineHeight.relaxed * DesignSystem.typography.fontSize.sm,
  },

  // Info Grid
  infoGrid: {
    gap: DesignSystem.spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.md,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignSystem.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textSecondary,
    marginBottom: DesignSystem.spacing.xs,
  },
  infoValue: {
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

  // Records
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.lg,
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
    gap: DesignSystem.spacing.md,
  },
  emptyRecordsContainer: {
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing['2xl'],
    gap: DesignSystem.spacing.md,
  },
  noRecordsText: {
    ...Typography.styles.body('base'),
    color: DesignSystem.colors.textSecondary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  noRecordsSubtext: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textSecondary,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: DesignSystem.colors.background,
    padding: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.md,
    gap: DesignSystem.spacing.md,
  },
  recordIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: DesignSystem.spacing.xs,
  },
  recordContent: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing.xs,
  },
  recordTitle: {
    ...Typography.styles.body('base'),
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
    flex: 1,
    marginRight: DesignSystem.spacing.sm,
  },
  recordTime: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textSecondary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  recordDate: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textSecondary,
  },
  recordNotes: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    padding: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.sm,
    marginTop: DesignSystem.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: DesignSystem.colors.primary,
  },
  notesText: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textPrimary,
    lineHeight: DesignSystem.typography.lineHeight.normal * DesignSystem.typography.fontSize.sm,
  },

  // Floating Buttons
  bottomSpacing: {
    height: DesignSystem.spacing.xl,
  },
  floatingButtons: {
    position: 'absolute',
    bottom: DesignSystem.spacing.xl,
    left: DesignSystem.spacing.lg,
    right: DesignSystem.spacing.lg,
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  primaryFloatingButton: {
    ...ComponentTokens.button.primary,
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.sm,
    shadowColor: DesignSystem.colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryFloatingButton: {
    ...ComponentTokens.button.secondary,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.xs,
    shadowColor: DesignSystem.colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    ...ComponentTextStyles.button.primary,
  },
  secondaryButtonText: {
    ...ComponentTextStyles.button.secondary,
  },
});
