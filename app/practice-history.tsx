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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { presetProjectNameService } from '@/lib/database';
import PageTemplate from '@/components/PageTemplate';
import ProgressBar from '@/components/ProgressBar';
import PracticeRecordCard from '@/components/PracticeRecordCard';
import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';
import { ComponentTokens, ComponentTextStyles } from '@/utils/componentTokens';
import { Typography } from '@/utils/typography';

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

  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingRecords, setDeletingRecords] = useState<Set<string>>(new Set());
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [presetProjectName, setPresetProjectName] = useState<string>('');

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

      // Load daily records
      const { data: recordsData, error: recordsError } = await supabase
        .from('daily_records')
        .select('*')
        .eq('practice_project_id', projectId)
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

  const handleEdit = (record: DailyRecord) => {
    router.push({
      pathname: '/modals/custom-record',
      params: {
        projectId,
        practiceName,
        practiceType: projectInfo?.practices?.type || 'count',
        editRecordId: record.id
      }
    });
  };

  const handleDelete = async (record: DailyRecord) => {
    if (!user?.id) {
      Alert.alert('错误', '用户认证失败，请重新登录');
      return;
    }

    // Optimistic update
    setDeletingRecords(prev => new Set(prev).add(record.id));

    try {
      // Delete the record
      const { error: deleteError } = await supabase
        .from('daily_records')
        .delete()
        .eq('id', record.id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Update project's current count
      if (projectInfo) {
        const newCurrentCount = Math.max(0, projectInfo.current_count - record.count);
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
    if (!projectInfo) return { percentage: 0, current: 0, target: 0 };

    const current = projectInfo.current_count || 0;
    const target = projectInfo.target_count || 1;
    const percentage = Math.min((current / target) * 100, 100);

    return { percentage, current, target };
  };

  const getDisplayProjectName = (projectInfo: any) => {
    return projectInfo.project_name || presetProjectName || '预设项目';
  };

  if (loading) {
    return (
      <PageTemplate
        title={`${practiceName} - 详情`}
        subtitle={undefined}
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary} />
          <Text style={styles.loadingText}>正在加载...</Text>
        </View>
      </PageTemplate>
    );
  }

  const progress = calculateProgress();

  return (
    <PageTemplate
      title={`${practiceName} - 详情`}
      subtitle={undefined}
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable={true}
      backgroundColor={ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"]}
      padding={0}
      contentContainerStyle={{
        refreshControl: (
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        )
      }}
    >
        {/* Progress Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>总体进度</Text>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {progress.current.toLocaleString()}/{progress.target.toLocaleString()} {projectInfo?.practices?.unit || '次'}
            </Text>
            <Text style={styles.progressPercentage}>
              {progress.percentage.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <ProgressBar 
              progress={progress.percentage} 
              size="thick" 
              containerStyle={{ flex: 1 }}
            />
          </View>

          {projectInfo?.daily_target && (
            <Text style={styles.dailyTarget}>
              每日目标：{projectInfo.daily_target.toLocaleString()} {projectInfo?.practices?.unit || '次'}
            </Text>
          )}
        </View>

        {/* Records List */}
        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>修行记录</Text>

          {records.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📭 暂无记录</Text>
              <Text style={styles.emptySubtext}>开始您的第一次记录吧！</Text>
            </View>
          ) : (
            <View style={styles.recordsList}>
              {records.map((record) => {
                const isDeleting = deletingRecords.has(record.id);
                return (
                  <PracticeRecordCard
                    key={record.id}
                    record={record}
                    practiceType="count"
                    practiceUnit={projectInfo?.practices?.unit || '次'}
                    isDeleting={isDeleting}
                    showActions={true}
                    onEdit={() => handleEdit(record)}
                    onDelete={() => handleDelete(record)}
                  />
                );
              })}
            </View>
          )}
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
    ...ComponentTextStyles.body,
    marginTop: ConsolidatedConsolidatedDesignSystem.spacing.md,
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,
  },
  summaryCard: {
    ...ComponentTokens.card.variants.outlined,
    padding: ComponentTokens.card.padding.spacious,
  },
  summaryTitle: {
    ...ComponentTextStyles.subheading,
    textAlign: 'center',
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.md,
  },
  progressText: {
    ...ComponentTextStyles.body,
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,
  },
  progressPercentage: {
    ...ComponentTextStyles.body,
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
    color: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
  },
  progressBarContainer: {
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.md,
  },
  dailyTarget: {
    ...ComponentTextStyles.label,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    textAlign: 'center',
  },
  recordsSection: {
    // margin: ConsolidatedConsolidatedDesignSystem.spacing.lg,
    marginTop: ConsolidatedConsolidatedDesignSystem.spacing.xl,
  },
  sectionTitle: {
    ...ComponentTextStyles.subheading,
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.md,
  },
  emptyContainer: {
    ...ComponentTokens.card.variants.outlined,
    padding: ComponentTokens.card.padding.spacious,
    alignItems: 'center',
  },
  emptyText: {
    ...ComponentTextStyles.subheading,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.sm,
  },
  emptySubtext: {
    ...ComponentTextStyles.label,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
  },
  recordsList: {
    gap: ConsolidatedConsolidatedDesignSystem.spacing.md,
  },

});