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
import { Colors } from '@/constants/Colors';
import PageTemplate from '@/components/PageTemplate';
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
  reflection?: string;
  created_at: string;
}

export default function MeditationDetailScreen() {
  const { user } = useAuth();
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>();

  const [project, setProject] = useState<PracticeProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && practiceId) {
      loadData();
    }
  }, [user, practiceId]);

  useFocusEffect(
    React.useCallback(() => {
      if (user && practiceId) {
        loadData();
      }
    }, [user, practiceId])
  );

  const loadData = async () => {
    if (!user || !practiceId) return;

    try {
      setLoading(true);

      // Load practice project
      const { data: projectData, error: projectError } = await supabase
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

      if (projectError) throw projectError;

      if (!projectData || projectData.practices.type !== 'time') {
        toastService.error({ title: '❌ 错误', message: '无效的观修项目' });
        router.back();
        return;
      }

      setProject(projectData);

    } catch (error) {
      console.error('Error loading meditation data:', error);
      toastService.error({ title: '❌ 加载失败', message: '观修数据加载失败，请重试' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const calculateProgress = (project: PracticeProject) => {
    const percentage = Math.min((project.current_count / project.target_count) * 100, 100);
    return {
      current: project.current_count,
      target: project.target_count,
      percentage: percentage,
      isCompleted: project.current_count >= project.target_count,
    };
  };

  const handleRecordMeditation = () => {
    if (!project) return;

    router.push({
      pathname: '/modals/meditation-record',
      params: {
        projectId: project.id,
        practiceId: project.practice_id,
        practiceName: project.practices.name,
      },
    });
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
    return project.project_name || '默认项目';
  };

  if (loading) {
    return (
      <PageTemplate
        title="观修详情"
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={Colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </PageTemplate>
    );
  }

  if (!project) {
    return (
      <PageTemplate
        title="观修详情"
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={Colors.background}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>未找到观修项目</Text>
        </View>
      </PageTemplate>
    );
  }

  const progress = calculateProgress(project);
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
      backgroundColor={Colors.background}
      padding={0}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Combined Practice Info and Details Card */}
        <View style={styles.infoCard}>
          <View style={styles.practiceTypeContainer}>
            <Text style={styles.practiceType}>
              计时类
              {project.target_period === 'weekly' && ' (周)'}
            </Text>
            {progress.isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✅ 已完成</Text>
              </View>
            )}
          </View>

          <Text style={styles.practiceTitle}>
            {project.practices.name}
            {` (${practiceDisplayType})`}
            {totalWeeks && ` - ${totalWeeks}周`}
          </Text>

          {project.practices.description && (
            <Text style={styles.practiceDescription}>
              {project.practices.description}
            </Text>
          )}

          {/* Project Details Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.detailsSectionTitle}>项目详情</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>开始日期：</Text>
              <Text style={styles.detailValue}>{project.start_date}</Text>
            </View>

            {project.target_end_date && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>目标结束日期：</Text>
                <Text style={styles.detailValue}>{project.target_end_date}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>项目状态：</Text>
              <Text style={[
                styles.detailValue,
                progress.isCompleted ? styles.statusCompleted : styles.statusActive
              ]}>
                {progress.isCompleted ? '已完成' : '进行中'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleEditPractice}
            >
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
              <Text style={styles.secondaryButtonText}>编辑项目</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRecordMeditation}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>记录观修</Text>
            </TouchableOpacity>
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
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  practiceTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  practiceType: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  practiceTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  practiceDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  detailsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusCompleted: {
    color: '#2e7d32',
  },
  statusActive: {
    color: Colors.primary,
  },
});