
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PageTemplate from '@/components/PageTemplate';
import { DesignSystem } from '@/constants/DesignSystem';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Practice {
  id: string;
  practice_name: string;
  practice_description: string;
  practice_type: string;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'completed' | 'paused';
  target_sessions: number | null;
  target_period: string | null;
  current_sessions: number;
  goal_type: 'sessions' | 'period' | null;
}

interface Record {
  id: string;
  practice_date: string;
  duration: number;
  notes: string | null;
  created_at: string;
}

export default function PracticeDetailPlaygroundScreen() {
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>();
  const { user } = useAuth();
  const [practice, setPractice] = useState<Practice | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (practiceId && user) {
      loadPracticeDetails();
      loadRecentRecords();
    }
  }, [practiceId, user]);

  const loadPracticeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('user_practices')
        .select('*')
        .eq('id', practiceId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setPractice(data);
    } catch (error) {
      console.error('Error loading practice:', error);
      Alert.alert('错误', '无法加载修行详情');
    }
  };

  const loadRecentRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('practice_records')
        .select('*')
        .eq('practice_id', practiceId)
        .eq('user_id', user?.id)
        .order('practice_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPractice = () => {
    router.push(`/practice-config?practiceId=${practiceId}&mode=edit`);
  };

  const handleAddRecord = () => {
    router.push(`/modals/custom-record?practiceId=${practiceId}`);
  };

  const handleViewAllRecords = () => {
    router.push(`/practice-history?practiceId=${practiceId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'paused': return '已暂停';
      default: return status;
    }
  };

  const getProgressPercentage = () => {
    if (!practice) return 0;
    
    if (practice.goal_type === 'sessions' && practice.target_sessions) {
      return Math.min((practice.current_sessions / practice.target_sessions) * 100, 100);
    }
    
    if (practice.goal_type === 'period' && practice.start_date && practice.end_date) {
      const start = new Date(practice.start_date);
      const end = new Date(practice.end_date);
      const now = new Date();
      const total = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      return Math.min((elapsed / total) * 100, 100);
    }
    
    return 0;
  };

  if (loading) {
    return (
      <PageTemplate title="加载中..." showBackButton={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
          <Text style={styles.loadingText}>加载修行详情...</Text>
        </View>
      </PageTemplate>
    );
  }

  if (!practice) {
    return (
      <PageTemplate title="未找到" showBackButton={true}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>未找到该修行项目</Text>
        </View>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="修行详情 (Playground)"
      showBackButton={true}
      backgroundColor={DesignSystem.colors.background}
      padding={0}
      scrollable={false}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Main Practice Card */}
        <View style={[styles.mainCard, { borderWidth: 2, borderColor: 'red', position: 'relative' }]}>
          <Text style={[styles.debugLabel, { backgroundColor: 'red' }]}>mainCard</Text>
          
          {/* Practice Header */}
          <View style={[styles.practiceHeader, { borderWidth: 2, borderColor: 'green', position: 'relative' }]}>
            <Text style={[styles.debugLabel, { backgroundColor: 'green' }]}>practiceHeader</Text>
            <Text style={styles.practiceTitle}>{practice.practice_name}</Text>
            <Text style={styles.practiceDescription}>{practice.practice_description}</Text>
            <Text style={styles.practiceType}>🧘‍♀️ {practice.practice_type}</Text>
          </View>

          {/* Progress Section */}
          <View style={[styles.progressSection, { borderWidth: 2, borderColor: 'blue', position: 'relative' }]}>
            <Text style={[styles.debugLabel, { backgroundColor: 'blue' }]}>progressSection</Text>
            <Text style={styles.progressTitle}>修行进度</Text>
            
            {practice.goal_type === 'sessions' && (
              <View style={styles.progressDetails}>
                <Text style={styles.progressText}>
                  {practice.current_sessions} / {practice.target_sessions} 次
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${getProgressPercentage()}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            )}
            
            {practice.goal_type === 'period' && (
              <View style={styles.progressDetails}>
                <Text style={styles.progressText}>
                  目标期间: {practice.target_period}
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${getProgressPercentage()}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Project Details */}
          <View style={[styles.projectDetails, { borderWidth: 2, borderColor: 'orange', position: 'relative' }]}>
            <Text style={[styles.debugLabel, { backgroundColor: 'orange' }]}>projectDetails</Text>
            <Text style={styles.projectDetailsTitle}>项目详情</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>开始日期</Text>
                <Text style={styles.detailValue}>{formatDate(practice.start_date)}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>结束日期</Text>
                <Text style={styles.detailValue}>
                  {practice.end_date ? formatDate(practice.end_date) : '无限期'}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>状态</Text>
                <Text style={[styles.detailValue, styles.statusText]}>
                  {getStatusText(practice.status)}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={[styles.actionButtons, { borderWidth: 2, borderColor: 'magenta', position: 'relative' }]}>
            <Text style={[styles.debugLabel, { backgroundColor: 'magenta' }]}>actionButtons</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleEditPractice}>
              <Text style={styles.primaryButtonText}>编辑修行</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={handleAddRecord}>
              <Text style={styles.secondaryButtonText}>记录修行</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Records Card */}
        <View style={[styles.recordsCard, { borderWidth: 2, borderColor: 'purple', position: 'relative' }]}>
          <Text style={[styles.debugLabel, { backgroundColor: 'purple' }]}>recordsCard</Text>
          
          <View style={[styles.recordsHeader, { borderWidth: 2, borderColor: 'cyan', position: 'relative' }]}>
            <Text style={[styles.debugLabel, { backgroundColor: 'cyan' }]}>recordsHeader</Text>
            <Text style={styles.recordsTitle}>最近记录</Text>
            <TouchableOpacity onPress={handleViewAllRecords}>
              <Text style={styles.viewAllLink}>查看全部</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.recordsList, { borderWidth: 2, borderColor: 'yellow', position: 'relative' }]}>
            <Text style={[styles.debugLabel, { backgroundColor: 'yellow' }]}>recordsList</Text>
            {records.length > 0 ? (
              records.map((record) => (
                <View key={record.id} style={styles.recordItem}>
                  <View style={styles.recordDate}>
                    <Text style={styles.recordDateText}>
                      {formatDate(record.practice_date)}
                    </Text>
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordDuration}>{record.duration} 分钟</Text>
                    {record.notes && (
                      <Text style={styles.recordNotes}>{record.notes}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyRecords}>
                <Text style={styles.emptyRecordsText}>暂无修行记录</Text>
                <Text style={styles.emptyRecordsSubtext}>开始记录您的修行吧</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  loadingText: {
    marginTop: DesignSystem.spacing.md,
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  errorText: {
    fontSize: DesignSystem.typography.fontSize.lg,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
  },
  mainCard: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    marginHorizontal: DesignSystem.spacing.lg,
    marginTop: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
    ...DesignSystem.shadows.medium,
  },
  practiceHeader: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
  },
  practiceTitle: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.sm,
    lineHeight: DesignSystem.typography.lineHeight.tight * DesignSystem.typography.fontSize['2xl'],
  },
  practiceDescription: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.textSecondary,
    marginBottom: DesignSystem.spacing.md,
    lineHeight: DesignSystem.typography.lineHeight.normal * DesignSystem.typography.fontSize.base,
  },
  practiceType: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.primary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  progressSection: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
  },
  progressTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.md,
  },
  progressDetails: {
    gap: DesignSystem.spacing.sm,
  },
  progressText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.textSecondary,
  },
  progressBarContainer: {
    marginTop: DesignSystem.spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: DesignSystem.colors.border,
    borderRadius: DesignSystem.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: DesignSystem.colors.primary,
    borderRadius: DesignSystem.borderRadius.full,
  },
  projectDetails: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
  },
  projectDetailsTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.md,
  },
  detailsGrid: {
    gap: DesignSystem.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.textSecondary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.textPrimary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  statusText: {
    color: DesignSystem.colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: DesignSystem.colors.primary,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textInverse,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.primary,
  },
  recordsCard: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    marginHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.lg,
    ...DesignSystem.shadows.medium,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.md,
  },
  recordsTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
  },
  viewAllLink: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.primary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  recordsList: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border,
  },
  recordDate: {
    marginRight: DesignSystem.spacing.md,
  },
  recordDateText: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.textSecondary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  recordInfo: {
    flex: 1,
  },
  recordDuration: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.textPrimary,
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  recordNotes: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.textSecondary,
    marginTop: DesignSystem.spacing.xs,
    lineHeight: DesignSystem.typography.lineHeight.normal * DesignSystem.typography.fontSize.sm,
  },
  emptyRecords: {
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.xl,
  },
  emptyRecordsText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.textSecondary,
    marginBottom: DesignSystem.spacing.xs,
  },
  emptyRecordsSubtext: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.textTertiary,
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
