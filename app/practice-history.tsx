import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ToastAndroid,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { presetProjectNameService } from '@/lib/database';
import { toastService } from '@/lib/toast';
import PageTemplate from '@/components/PageTemplate';
import ProgressBar from '@/components/ProgressBar';
import PracticeRecordCard from '@/components/PracticeRecordCard';
import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTokens, ComponentTextStyles } from '@/utils/componentTokens';
import { Typography } from '@/utils/typography';

type TabType = 'journal' | 'practice' | 'completion';

interface DailyRecord {
  id: string;
  user_id: string;
  practice_project_id: string;
  record_date: string;
  count: number;
  notes?: string;
  created_at: string;
}

export default function PracticeHistoryScreen() {
  const { user } = useAuth();
  const {
    projectId,
    practiceName
  } = useLocalSearchParams<{
    projectId: string;
    practiceName: string;
  }>();

  const [activeTab, setActiveTab] = useState<TabType>('journal');
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingRecords, setDeletingRecords] = useState<Set<string>>(new Set());
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [presetProjectName, setPresetProjectName] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  useEffect(() => {
    if (user && projectId) {
      loadData();
    }
  }, [user, projectId]);

  useFocusEffect(
    React.useCallback(() => {
      if (user && projectId) {
        loadData();
      }
    }, [user, projectId])
  );

  const loadData = async () => {
    if (!user || !projectId) return;

    try {
      setLoading(true);

      // Load project info
      const { data: project, error: projectError } = await supabase
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
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError) throw projectError;
      setProjectInfo(project);

      // Load preset project name if needed
      if (project.preset_project_id) {
        try {
          const presets = await presetProjectNameService.getPresetProjectNames();
          const preset = presets.find(p => p.id === project.preset_project_id);
          if (preset) {
            setPresetProjectName(preset.name);
          }
        } catch (presetError) {
          console.error('Error loading preset project name:', presetError);
        }
      }

      // Load records based on practice type
      const isTimeBased = project.practices?.type === 'time';
      const tableName = isTimeBased ? 'meditation_records' : 'daily_records';
      const queryColumn = isTimeBased ? 'practice_id' : 'practice_project_id';
      const practiceRefId = isTimeBased ? project.practice_id : projectId;

      const { data: recordsData, error: recordsError } = await supabase
        .from(tableName)
        .select('*')
        .eq(queryColumn, practiceRefId)
        .eq('user_id', user.id)
        .order('record_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;

      setRecords(recordsData || []);
      console.log('📋 Loaded records:', recordsData?.length || 0);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      Alert.alert('错误', '加载数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleEditRecord = (record: DailyRecord) => {
    const isTimeBased = projectInfo?.practices?.type === 'time';
    router.push({
      pathname: isTimeBased ? '/modals/meditation-record' : '/modals/custom-record',
      params: {
        projectId,
        practiceName,
        practiceType: projectInfo?.practices?.type || 'count',
        editRecordId: record.id,
        ...(isTimeBased && { 
          practiceId: projectInfo?.practice_id,
          practiceProjectId: projectId 
        })
      }
    });
  };

  const handleEditProject = () => {
    if (!projectInfo) return;
    
    router.push({
      pathname: '/practice-config',
      params: {
        practiceId: projectInfo.practice_id,
        practiceName: projectInfo.practices?.name || practiceName,
        practiceType: projectInfo.practices?.type || 'count',
        practiceUnit: projectInfo.practices?.unit || '次',
        practiceDescription: projectInfo.practices?.description || '',
        editMode: 'true',
        projectId: projectId,
        currentTotalTarget: projectInfo.total_target?.toString() || '',
        currentDailyTarget: projectInfo.daily_target?.toString() || '',
        currentWeeklyTarget: projectInfo.weekly_target?.toString() || '',
        currentStartDate: projectInfo.start_date || '',
        currentEndDate: projectInfo.end_date || '',
        currentTargetPeriod: projectInfo.target_period || 'daily',
        currentGoalType: projectInfo.goal_type || 'total',
        currentProjectName: projectInfo.project_name || '',
        currentPresetId: projectInfo.preset_project_id || ''
      }
    });
  };

  const handleAddRecord = () => {
    const isTimeBased = projectInfo?.practices?.type === 'time';
    router.push({
      pathname: isTimeBased ? '/modals/meditation-record' : '/modals/custom-record',
      params: {
        projectId,
        practiceName,
        practiceType: projectInfo?.practices?.type || 'count',
        ...(isTimeBased && { 
          practiceId: projectInfo?.practice_id,
          practiceProjectId: projectId 
        })
      }
    });
  };

  const handleDeleteProject = () => {
    if (!projectInfo) return;
    setShowDeleteDialog(true);
  };

  const handleConfirmDeleteProject = async () => {
    if (!projectInfo || !user) return;

    setShowDeleteDialog(false);
    setIsDeletingProject(true);
    
    try {
      // Only user_created practices can be deleted
      if (projectInfo.source_type === 'class_required') {
        toastService.error({
          title: '无法删除',
          message: '系统必修项目不能删除'
        });
        setIsDeletingProject(false);
        return;
      }

      const { classCurriculumService } = await import('@/lib/database');
      const result = await classCurriculumService.deletePracticeProject(user.id, projectId);

      if (result.success) {
        toastService.success({
          title: '删除成功',
          message: `${projectInfo.practices?.name} 已删除`
        });
        router.back();
      } else {
        toastService.error({
          title: '删除失败',
          message: result.error || '请稍后重试'
        });
      }
    } catch (error) {
      console.error('Error deleting practice:', error);
      toastService.error({
        title: '删除失败',
        message: '请稍后重试'
      });
    } finally {
      setIsDeletingProject(false);
    }
  };

  const handleDelete = async (record: DailyRecord) => {
    if (!user?.id) {
      Alert.alert('错误', '用户认证失败，请重新登录');
      return;
    }

    // Optimistic update
    setDeletingRecords(prev => new Set(prev).add(record.id));

    try {
      // Determine which table to delete from based on practice type
      const isTimeBased = projectInfo?.practices?.type === 'time';
      const tableName = isTimeBased ? 'meditation_records' : 'daily_records';

      // Delete the record
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', record.id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Update project's current count only for count-based practices
      if (projectInfo && !isTimeBased) {
        const newCurrentCount = Math.max(0, projectInfo.current_count - (record as any).count);
        const { error: updateError } = await supabase
          .from('user_practice_projects')
          .update({ 
            current_count: newCurrentCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Update local project info
        setProjectInfo(prev => ({ ...prev, current_count: newCurrentCount }));
      }

      // Remove from UI
      setRecords(prev => prev.filter(r => r.id !== record.id));

      if (Platform.OS === 'android') {
        ToastAndroid.show('✅ 记录已删除', ToastAndroid.SHORT);
      } else {
        Alert.alert('成功', '记录已删除');
      }

    } catch (error) {
      console.error('❌ Delete operation failed:', error);

      // Revert optimistic update
      setDeletingRecords(prev => {
        const newSet = new Set(prev);
        newSet.delete(record.id);
        return newSet;
      });

      if (Platform.OS === 'android') {
        ToastAndroid.show('❌ 删除失败，请重试', ToastAndroid.LONG);
      } else {
        Alert.alert('错误', `删除失败: ${error.message || '请重试'}`);
      }
    } finally {
      setDeletingRecords(prev => {
        const newSet = new Set(prev);
        newSet.delete(record.id);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateProgress = () => {
    if (!projectInfo) return { percentage: 0, current: 0, target: null };

    const current = projectInfo.current_count || 0;
    const target = projectInfo.total_target || null;
    const percentage = target ? Math.min((current / target) * 100, 100) : 0;

    return { percentage, current, target };
  };

  const getDisplayProjectName = (projectInfo: any) => {
    return projectInfo.project_name || presetProjectName || practiceName;
  };

  if (loading) {
    return (
      <PageTemplate
        title={`${practiceName} - 详情`}
        subtitle={undefined}
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={DesignSystem.colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignSystem.colors.redTara} />
          <Text style={styles.loadingText}>正在加载...</Text>
        </View>
      </PageTemplate>
    );
  }

  const progress = calculateProgress();

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'journal', label: '日志', icon: 'book-outline' },
    { key: 'practice', label: '功课', icon: 'settings-outline' },
    { key: 'completion', label: '圆满', icon: 'stats-chart-outline' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'journal':
        const isTimeBased = projectInfo?.practices?.type === 'time';
        const unit = isTimeBased ? '分钟' : (projectInfo?.practices?.unit || '次');
        const progressText = progress.target
          ? `${progress.current.toLocaleString()}/${progress.target.toLocaleString()}${unit} · ${Math.round(progress.percentage)}%`
          : `已完成 ${progress.current.toLocaleString()}${unit}`;
        
        return (
          <View style={styles.tabContent}>
            {/* Progress Overview */}
            <View style={styles.progressOverview}>
              <Text style={styles.progressOverviewText}>{progressText}</Text>
              {progress.target && (
                <ProgressBar 
                  progress={progress.percentage} 
                  size="medium"
                  fillColor={DesignSystem.colors.greenTara}
                />
              )}
            </View>

            {/* Add Record Button for Journal Tab */}
            <View style={styles.addRecordContainer}>
              <TouchableOpacity 
                style={styles.addRecordButton}
                onPress={handleAddRecord}
              >
                <Ionicons name="add-circle" size={24} color={DesignSystem.colors.whiteTara} />
                <Text style={styles.addRecordButtonText}>添加记录</Text>
              </TouchableOpacity>
            </View>

            {/* Records List */}
            <View style={styles.recordsSection}>
              {records.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="document-text-outline" size={48} color={DesignSystem.colors.textTertiary} />
                  <Text style={styles.emptyText}>暂无修行记录</Text>
                  <Text style={styles.emptySubtext}>点击上方按钮开始记录</Text>
                </View>
              ) : (
                <View style={styles.recordsList}>
                  {records.map((record) => {
                    const isDeleting = deletingRecords.has(record.id);
                    return (
                      <PracticeRecordCard
                        key={record.id}
                        record={record}
                        practiceType={projectInfo?.practices?.type === 'time' ? 'time' : 'count'}
                        practiceUnit={projectInfo?.practices?.unit || '次'}
                        isDeleting={isDeleting}
                        showActions={true}
                        onEdit={() => handleEditRecord(record)}
                        onDelete={() => handleDelete(record)}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        );

      case 'practice':
        return (
          <View style={styles.tabContent}>
            {/* Project Info Card */}
            <View style={styles.practiceInfoCard}>
              <Text style={styles.practiceInfoTitle}>{getDisplayProjectName(projectInfo)}</Text>
              
              {projectInfo?.practices?.description && (
                <Text style={styles.practiceInfoDescription}>{projectInfo.practices.description}</Text>
              )}

              <View style={styles.divider} />

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>开始日期</Text>
                    <Text style={styles.statValue}>
                      {projectInfo?.start_date ? formatDate(projectInfo.start_date) : '未设置'}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>状态</Text>
                    <Text style={[styles.statValue, styles.statusText]}>
                      {projectInfo?.status === 'active' ? '进行中' : 
                       projectInfo?.status === 'completed' ? '已完成' : '未开始'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>结束日期</Text>
                    <Text style={styles.statValue}>
                      {projectInfo?.target_end_date ? formatDate(projectInfo.target_end_date) : '持续修行'}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>类型</Text>
                    <Text style={styles.statValue}>
                      {projectInfo?.source_type === 'class_required' ? '班级必修' : '自建项目'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>已修行</Text>
                    <Text style={styles.statValue}>
                      {projectInfo?.start_date 
                        ? `${Math.max(0, Math.ceil((new Date().getTime() - new Date(projectInfo.start_date).getTime()) / (1000 * 60 * 60 * 24)))}天`
                        : '0天'}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>剩余</Text>
                    <Text style={styles.statValue}>
                      {projectInfo?.target_end_date 
                        ? `${Math.max(0, Math.ceil((new Date(projectInfo.target_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}天`
                        : '无期限'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Progress Section */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {progress.target 
                    ? `${progress.current.toLocaleString()}/${progress.target.toLocaleString()} ${projectInfo?.practices?.unit || '次'}`
                    : `已完成 ${progress.current.toLocaleString()} ${projectInfo?.practices?.unit || '次'}`
                  }
                </Text>
                {progress.target && (
                  <Text style={styles.progressPercentage}>
                    {progress.percentage.toFixed(1)}%
                  </Text>
                )}
              </View>

              {progress.target && (
                <View style={styles.progressBarContainer}>
                  <ProgressBar 
                    progress={progress.percentage} 
                    size="thick" 
                    containerStyle={{ flex: 1 }}
                    fillColor={DesignSystem.colors.greenTara}
                  />
                </View>
              )}

              {projectInfo?.daily_target && (
                <Text style={styles.dailyTarget}>
                  每日目标：{projectInfo.daily_target.toLocaleString()} {projectInfo?.practices?.unit || '次'}
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.practiceActionsContainer}>
              <TouchableOpacity 
                style={styles.practiceActionButton}
                onPress={handleEditProject}
              >
                <View style={styles.practiceActionIcon}>
                  <Ionicons name="create-outline" size={24} color={DesignSystem.colors.primary} />
                </View>
                <View style={styles.practiceActionContent}>
                  <Text style={styles.practiceActionTitle}>编辑设置</Text>
                  <Text style={styles.practiceActionSubtitle}>修改目标、日期等配置</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={DesignSystem.colors.textTertiary} />
              </TouchableOpacity>

              {projectInfo?.source_type === 'user_created' && (
                <TouchableOpacity 
                  style={[styles.practiceActionButton, styles.practiceActionButtonDanger]}
                  onPress={handleDeleteProject}
                  disabled={isDeletingProject}
                >
                  <View style={[styles.practiceActionIcon, styles.practiceActionIconDanger]}>
                    <Ionicons name="trash-outline" size={24} color={DesignSystem.colors.error} />
                  </View>
                  <View style={styles.practiceActionContent}>
                    <Text style={[styles.practiceActionTitle, styles.practiceActionTitleDanger]}>
                      {isDeletingProject ? '删除中...' : '删除项目'}
                    </Text>
                    <Text style={styles.practiceActionSubtitle}>此操作无法撤销</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={DesignSystem.colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      case 'completion':
        return (
          <View style={styles.tabContent}>
            <View style={styles.completionPlaceholder}>
              <Ionicons name="stats-chart-outline" size={64} color={DesignSystem.colors.textTertiary} />
              <Text style={styles.completionPlaceholderTitle}>报告功能开发中</Text>
              <Text style={styles.completionPlaceholderText}>
                此功能将为您提供详细的修行统计和进度报告
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <PageTemplate
      title={practiceName}
      subtitle={undefined}
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable={true}
      backgroundColor={DesignSystem.colors.background}
      padding={0}
      contentContainerStyle={{
        refreshControl: (
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        )
      }}
    >
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabItem,
              activeTab === tab.key && styles.tabItemActive
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.key ? DesignSystem.colors.primary : DesignSystem.colors.textTertiary} 
            />
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.tabLabelActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>确认删除？</Text>
            <Text style={styles.alertMessage}>
              确定要删除"{projectInfo?.practices?.name}"项目吗？此操作无法撤销。
            </Text>
            <View style={styles.alertButtonContainer}>
              <TouchableOpacity 
                style={styles.alertButtonCancel}
                onPress={() => setShowDeleteDialog(false)}
              >
                <Text style={styles.alertButtonCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.alertButtonConfirm}
                onPress={handleConfirmDeleteProject}
                disabled={isDeletingProject}
              >
                <Text style={styles.alertButtonConfirmText}>
                  {isDeletingProject ? '删除中...' : '删除'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    ...ComponentTextStyles.body,
    marginTop: DesignSystem.spacing.md,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    marginHorizontal: DesignSystem.spacing.lg,
    marginTop: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.xs,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.xs,
    paddingVertical: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
  },
  tabItemActive: {
    backgroundColor: DesignSystem.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabLabel: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textTertiary,
  },
  tabLabelActive: {
    color: DesignSystem.colors.primary,
    fontWeight: DesignSystem.typography.fontWeight.semibold as any,
  },
  tabContent: {
    flex: 1,
  },
  progressOverview: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.sm,
  },
  progressOverviewText: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
  },
  addRecordContainer: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.md,
    paddingBottom: DesignSystem.spacing.md,
  },
  addRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.sm,
    backgroundColor: DesignSystem.colors.primary,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.lg,
  },
  addRecordButtonText: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.whiteTara,
    fontWeight: DesignSystem.typography.fontWeight.semibold as any,
  },
  practiceInfoCard: {
    ...ComponentTokens.card.variants.outlined,
    marginHorizontal: DesignSystem.spacing.lg,
    marginTop: DesignSystem.spacing.lg,
    paddingTop: ComponentTokens.card.padding.spacious,
    paddingLeft: ComponentTokens.card.padding.spacious,
    paddingRight: ComponentTokens.card.padding.spacious,
    paddingBottom: ComponentTokens.card.padding.spacious,
  },
  practiceInfoTitle: {
    ...ComponentTextStyles.subheading,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  practiceInfoDescription: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  practiceActionsContainer: {
    marginHorizontal: DesignSystem.spacing.lg,
    marginTop: DesignSystem.spacing.lg,
    gap: DesignSystem.spacing.sm,
  },
  practiceActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
  },
  practiceActionButtonDanger: {
    borderColor: DesignSystem.colors.error + '30',
  },
  practiceActionIcon: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.borderRadius.md,
    backgroundColor: DesignSystem.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignSystem.spacing.md,
  },
  practiceActionIconDanger: {
    backgroundColor: DesignSystem.colors.error + '15',
  },
  practiceActionContent: {
    flex: 1,
  },
  practiceActionTitle: {
    ...ComponentTextStyles.body,
    fontWeight: DesignSystem.typography.fontWeight.medium as any,
    marginBottom: 2,
  },
  practiceActionTitleDanger: {
    color: DesignSystem.colors.error,
  },
  practiceActionSubtitle: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textTertiary,
  },
  completionPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.xl * 2,
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  completionPlaceholderTitle: {
    ...ComponentTextStyles.subheading,
    color: DesignSystem.colors.textSecondary,
    marginTop: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.sm,
  },
  completionPlaceholderText: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textTertiary,
    textAlign: 'center',
  },
  summaryCard: {
    ...ComponentTokens.card.variants.outlined,
    marginHorizontal: DesignSystem.spacing.lg,
    marginTop: DesignSystem.spacing.lg,
    paddingTop: ComponentTokens.card.padding.spacious,
    paddingLeft: ComponentTokens.card.padding.spacious,
    paddingRight: ComponentTokens.card.padding.spacious,
    paddingBottom: ComponentTokens.card.padding.spacious,
  },
  summaryTitle: {
    ...ComponentTextStyles.subheading,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  practiceDescription: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: DesignSystem.colors.border,
    marginVertical: DesignSystem.spacing.md,
  },
  statsGrid: {
    gap: DesignSystem.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    paddingVertical: DesignSystem.spacing.xs,
  },
  statLabel: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textSecondary,
    marginBottom: DesignSystem.spacing.xs,
  },
  statValue: {
    ...ComponentTextStyles.body,
    fontWeight: DesignSystem.typography.fontWeight.medium as any,
  },
  statusText: {
    color: DesignSystem.colors.greenTara,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  progressText: {
    ...ComponentTextStyles.body,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  progressPercentage: {
    ...ComponentTextStyles.body,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.greenTara, // Green Tara for progress completion indicators
  },
  progressBarContainer: {
    marginBottom: DesignSystem.spacing.md,
  },
  dailyTarget: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
  },
  recordsSection: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.xl,
  },
  sectionTitle: {
    ...ComponentTextStyles.subheading,
    marginBottom: DesignSystem.spacing.md,
  },
  emptyContainer: {
    ...ComponentTokens.card.variants.outlined,
    padding: ComponentTokens.card.padding.spacious,
    alignItems: 'center',
  },
  emptyText: {
    ...ComponentTextStyles.subheading,
    color: DesignSystem.colors.textSecondary,
    marginBottom: DesignSystem.spacing.sm,
  },
  emptySubtext: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textSecondary,
  },
  recordsList: {
    gap: DesignSystem.spacing.md,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: DesignSystem.spacing.md,
    marginTop: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.xl,
    borderRadius: DesignSystem.borderRadius.lg,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
    flex: 1,
  },
  actionButtonPrimary: {
    backgroundColor: DesignSystem.colors.primary,
    borderColor: DesignSystem.colors.primary,
  },
  actionButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.textPrimary,
  },
  actionButtonTextPrimary: {
    color: DesignSystem.colors.whiteTara,
  },
  actionButtonDanger: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderColor: DesignSystem.colors.error,
  },
  actionButtonTextDanger: {
    color: DesignSystem.colors.error,
  },
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.lg,
    marginHorizontal: DesignSystem.spacing.lg,
    maxWidth: 300,
  },
  alertTitle: {
    ...ComponentTextStyles.subheading,
    marginBottom: DesignSystem.spacing.md,
    color: DesignSystem.colors.textPrimary,
  },
  alertMessage: {
    ...ComponentTextStyles.body,
    marginBottom: DesignSystem.spacing.lg,
    color: DesignSystem.colors.textSecondary,
  },
  alertButtonContainer: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
  },
  alertButtonCancel: {
    flex: 1,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    backgroundColor: DesignSystem.colors.backgroundTertiary,
    alignItems: 'center',
  },
  alertButtonCancelText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.textPrimary,
  },
  alertButtonConfirm: {
    flex: 1,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    backgroundColor: DesignSystem.colors.error,
    alignItems: 'center',
  },
  alertButtonConfirmText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.whiteTara,
  },
});