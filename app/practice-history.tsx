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
  SafeAreaView,
  ToastAndroid,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { presetProjectNameService } from '@/lib/database';
import PageHeader from '@/components/PageHeader';

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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>正在加载...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progress = calculateProgress();

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader 
        title={`📿 ${practiceName} - 详情`}
        subtitle={projectInfo && (projectInfo.project_name || projectInfo.preset_project_id) ? 
          `项目：${getDisplayProjectName(projectInfo)}` : undefined}
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
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

          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(progress.percentage, 100)}%` }
              ]} 
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
                  <View 
                    key={record.id} 
                    style={[
                      styles.recordCard,
                      isDeleting && styles.recordCardDeleting
                    ]}
                  >
                    {isDeleting && (
                      <View style={styles.deletingOverlay}>
                        <ActivityIndicator color="#dc3545" size="small" />
                        <Text style={styles.deletingText}>删除中...</Text>
                      </View>
                    )}

                    <View style={[styles.recordHeader, isDeleting && styles.disabledContent]}>
                      <Text style={styles.recordDate}>
                        {formatDate(record.record_date)}
                      </Text>
                      <Text style={styles.recordTime}>
                        {formatTime(record.created_at)}
                      </Text>
                    </View>

                    <View style={[styles.recordContent, isDeleting && styles.disabledContent]}>
                      <Text style={styles.recordCount}>
                        数量: {record.count.toLocaleString()} {projectInfo?.practices?.unit || '次'}
                      </Text>

                      {record.notes && (
                        <View style={styles.notesContainer}>
                          <Text style={styles.notesLabel}>备注:</Text>
                          <Text style={styles.notesText} numberOfLines={3}>
                            {record.notes}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.recordActions}>
                      <TouchableOpacity
                        style={[styles.editButton, isDeleting && styles.disabledButton]}
                        onPress={() => handleEdit(record)}
                        disabled={isDeleting}
                      >
                        <Text style={[styles.editButtonText, isDeleting && styles.disabledButtonText]}>
                          编辑
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.deleteButton, isDeleting && styles.disabledButton]}
                        onPress={() => handleDelete(record)}
                        disabled={isDeleting}
                      >
                        <Text style={[styles.deleteButtonText, isDeleting && styles.disabledButtonText]}>
                          删除
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  dailyTarget: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  recordsSection: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emptyContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  recordsList: {
    gap: 12,
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recordTime: {
    fontSize: 14,
    color: '#666',
  },
  recordContent: {
    marginBottom: 12,
  },
  recordCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recordActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  recordCardDeleting: {
    opacity: 0.6,
    position: 'relative',
  },
  deletingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
  },
  deletingText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledContent: {
    opacity: 0.5,
  },
  disabledButton: {
    opacity: 0.3,
  },
  disabledButtonText: {
    opacity: 0.5,
  },
});