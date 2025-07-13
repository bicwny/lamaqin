
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { meditationService } from '@/lib/database';
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
  reflection?: string;
  created_at: string;
}

export default function MeditationDetailScreen() {
  const { user } = useAuth();
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>();
  
  const [project, setProject] = useState<PracticeProject | null>(null);
  const [todayRecords, setTodayRecords] = useState<MeditationRecord[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<MeditationRecord[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'chronological' | 'by_topic'>('chronological');
  const [allRecords, setAllRecords] = useState<MeditationRecord[]>([]);
  const [topicStats, setTopicStats] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [deletingRecords, setDeletingRecords] = useState<Set<string>>(new Set());

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
      await loadMeditationRecords(projectData);

    } catch (error) {
      console.error('Error loading meditation data:', error);
      toastService.error({ title: '❌ 加载失败', message: '观修数据加载失败，请重试' });
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
        .select('*')
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
          .select('*')
          .eq('user_id', user.id)
          .eq('practice_id', projectData.practice_id)
          .gte('record_date', startOfWeek.toISOString().split('T')[0])
          .lte('record_date', endOfWeek.toISOString().split('T')[0])
          .order('created_at', { ascending: true });

        if (weeklyError) throw weeklyError;
        setWeeklyRecords(weeklyData || []);
      }

      // Get all meditation records for history
      const allMeditationRecords = await meditationService.getMeditationRecords(user.id, projectData.practice_id);
      setAllRecords(allMeditationRecords);
      setTotalSessions(allMeditationRecords.length);

      // Load topics and calculate stats
      await loadTopicsAndStats(allMeditationRecords, projectData.practice_id);

      setTodayRecords(todayData || []);

    } catch (error) {
      console.error('Error loading meditation records:', error);
    }
  };

  const loadTopicsAndStats = async (allRecords: MeditationRecord[], practiceId: string) => {
    try {
      // Load meditation topics
      const topicsData = await meditationService.getMeditationTopics(practiceId);
      setTopics(topicsData);

      // Calculate topic statistics - only include records with valid topic_number
      const topicCounts = topicsData.map(topic => {
        const recordsForTopic = allRecords.filter(record => {
          // Only match records that have a valid topic_number
          return record.topic_number && record.topic_number === topic.topic_number;
        });

        return {
          ...topic,
          count: recordsForTopic.length,
          totalDuration: recordsForTopic.reduce((sum, record) => sum + record.duration_minutes, 0),
          latestRecord: recordsForTopic.length > 0 ? recordsForTopic[0] : null
        };
      });

      // Sort by topic_number in ascending order
      topicCounts.sort((a, b) => a.topic_number - b.topic_number);
      setTopicStats(topicCounts);

      console.log('📚 Loaded topic stats:', topicCounts.length);
    } catch (error) {
      console.error('❌ Error loading topics:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleViewHistory = () => {
    if (!project) return;
    
    router.push({
      pathname: '/meditation-history',
      params: {
        practiceId: project.practice_id,
        practiceName: project.practices.name,
      },
    });
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

  const calculateProgress = (project: PracticeProject) => {
    const percentage = Math.min((project.current_count / project.target_count) * 100, 100);
    return {
      current: project.current_count,
      target: project.target_count,
      percentage: percentage,
      isCompleted: project.current_count >= project.target_count,
    };
  };

  const handleEdit = (record: any) => {
    if (!project) return;
    router.push({
      pathname: '/modals/meditation-record',
      params: {
        practiceId: project.practice_id,
        practiceName: project.practices.name,
        editRecordId: record.id
      }
    });
  };

  const handleDelete = async (record: any) => {
    const executeDelete = async () => {
      if (!user?.id) {
        if (Platform.OS === 'web') {
          alert('用户认证失败，请重新登录');
        } else {
          Alert.alert('错误', '用户认证失败，请重新登录');
        }
        return;
      }

      setDeletingRecords(prev => new Set(prev).add(record.id));

      try {
        await meditationService.deleteMeditationRecord(record.id, user.id);
        setAllRecords(prev => prev.filter(r => r.id !== record.id));
        
        if (Platform.OS === 'android') {
          ToastAndroid.show('✅ 记录已删除', ToastAndroid.SHORT);
        } else if (Platform.OS === 'web') {
          console.log('📱 WEB SUCCESS - Record deleted');
        } else {
          Alert.alert('成功', '记录已删除');
        }

        // Refresh data after deletion
        if (project) {
          await loadMeditationRecords(project);
        }

      } catch (error) {
        console.error('❌ DELETE OPERATION FAILED:', error);
        setDeletingRecords(prev => {
          const newSet = new Set(prev);
          newSet.delete(record.id);
          return newSet;
        });

        if (Platform.OS === 'android') {
          ToastAndroid.show('❌ 删除失败，请重试', ToastAndroid.LONG);
        } else if (Platform.OS === 'web') {
          alert(`删除失败: ${error.message || '请重试'}`);
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

    await executeDelete();
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

  const MeditationHistoryComponent = ({ practiceId, practiceName, viewMode, embedded = false }) => {
    const records = allRecords.slice(0, embedded ? 10 : allRecords.length); // Show only first 10 if embedded
    
    if (viewMode === 'by_topic') {
      return (
        <View style={styles.historyContent}>
          {topicStats.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📚 暂无主题记录</Text>
              <Text style={styles.emptySubtext}>开始选择观修主题吧！</Text>
            </View>
          ) : (
            <>
              <View style={styles.topicSummary}>
                <Text style={styles.topicSummaryText}>
                  📊 已观修 {topicStats.filter(t => t.count > 0).length} / {topicStats.length} 个主题
                </Text>
                <Text style={styles.topicSummarySubtext}>
                  * 此视图仅显示有主题标记的观修记录
                </Text>
              </View>

              {topicStats.slice(0, embedded ? 5 : topicStats.length).map((topic) => (
                <View key={topic.id} style={styles.topicCard}>
                  <View style={styles.topicHeader}>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                    <Text style={styles.topicNumber}>第{topic.topic_number}修法</Text>
                  </View>

                  <View style={styles.topicStatsRow}>
                    <Text style={styles.topicCount}>🧘 {topic.count} 次观修</Text>
                    {topic.totalDuration > 0 && (
                      <Text style={styles.topicDuration}>⏱️ 总时长: {topic.totalDuration} 分钟</Text>
                    )}
                    {topic.latestRecord && (
                      <Text style={styles.topicLatest}>📅 最近: {formatDate(topic.latestRecord.record_date)}</Text>
                    )}
                  </View>

                  {topic.description && (
                    <Text style={styles.topicDescription} numberOfLines={2}>
                      {topic.description}
                    </Text>
                  )}
                </View>
              ))}
            </>
          )}
        </View>
      );
    }

    return (
      <View style={styles.historyContent}>
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭 暂无观修记录</Text>
            <Text style={styles.emptySubtext}>开始您的第一次观修吧！</Text>
          </View>
        ) : (
          <>
            {records.map((record) => {
              const isDeleting = deletingRecords.has(record.id);
              return (
                <TouchableOpacity 
                  key={record.id} 
                  style={[
                    styles.recordCard,
                    isDeleting && styles.recordCardDeleting
                  ]}
                  onPress={() => router.push({
                    pathname: '/meditation-record-detail/[recordId]',
                    params: { recordId: record.id }
                  })}
                  activeOpacity={0.7}
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
                    <Text style={styles.recordDuration}>
                      时长: {record.duration_minutes} 分钟
                    </Text>

                    {record.session_number && (
                      <Text style={styles.recordSession}>
                        第 {record.session_number} 座
                      </Text>
                    )}

                    {record.method && (
                      <Text style={styles.recordMethod}>
                        方法: {record.method}
                      </Text>
                    )}

                    {record.reflection && (
                      <View style={styles.reflectionContainer}>
                        <Text style={styles.reflectionLabel}>观后感:</Text>
                        <Text style={styles.reflectionText} numberOfLines={3}>
                          {record.reflection}
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
                </TouchableOpacity>
              );
            })}
            
            {embedded && allRecords.length > 10 && (
              <TouchableOpacity
                style={styles.viewAllHistoryButton}
                onPress={handleViewHistory}
              >
                <Text style={styles.viewAllHistoryText}>查看全部历史记录 ({allRecords.length} 条)</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader 
          title="观修详情"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader 
          title="观修详情"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>未找到观修项目</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progress = calculateProgress(project);
  const isWeekly = project.target_period === 'weekly';
  const todayCount = todayRecords.length;
  const weeklyCount = weeklyRecords.length;
  const target = project.daily_target;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <PageHeader 
        title="观修详情"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Practice Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.practiceTitle}>{project.practices.name}</Text>
          <Text style={styles.practiceType}>观修项目 · 计时类</Text>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              总进度：{progress.current}/{progress.target}天
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(progress.percentage, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressPercentage}>
              {progress.percentage.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalSessions}</Text>
              <Text style={styles.statLabel}>总观修次数</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {isWeekly ? `${weeklyCount}/${target}` : `${todayCount}/${target}`}
              </Text>
              <Text style={styles.statLabel}>
                {isWeekly ? '本周进度' : '今日进度'}
              </Text>
            </View>
          </View>
        </View>

        {/* Today's Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {isWeekly ? '本周观修' : '今日观修'}
            </Text>
            <Text style={styles.cardProgress}>
              {isWeekly ? `${weeklyCount}/${target}座` : `${todayCount}/${target}座`}
              {((isWeekly && weeklyCount >= target) || (!isWeekly && todayCount >= target)) && ' ✅'}
            </Text>
          </View>
          
          {todayRecords.length > 0 && (
            <View style={styles.todaySessionsContainer}>
              <Text style={styles.todaySessionsTitle}>今日观修记录：</Text>
              {todayRecords.map((record, index) => (
                <TouchableOpacity
                  key={record.id}
                  style={styles.sessionItem}
                  onPress={() => router.push({
                    pathname: '/meditation-record-detail/[recordId]',
                    params: { recordId: record.id }
                  })}
                >
                  <Text style={styles.sessionText}>
                    第{index + 1}座：{record.duration_minutes}分钟
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Recent Meditation History */}
        {(todayRecords.length > 0 || weeklyRecords.length > 0) && (
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>最近观修</Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={handleViewHistory}
              >
                <Text style={styles.viewAllText}>查看全部</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            
            {/* Show recent records */}
            {[...todayRecords, ...weeklyRecords]
              .filter((record, index, arr) => 
                arr.findIndex(r => r.id === record.id) === index
              )
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 5)
              .map((record) => (
                <TouchableOpacity
                  key={record.id}
                  style={styles.recordItem}
                  onPress={() => router.push({
                    pathname: '/meditation-record-detail/[recordId]',
                    params: { recordId: record.id }
                  })}
                >
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordDate}>
                      {new Date(record.record_date).toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </Text>
                    <Text style={styles.recordTime}>
                      {new Date(record.created_at).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  
                  <Text style={styles.recordDuration}>
                    {record.session_number ? `第${record.session_number}座` : '观修'}: {record.duration_minutes}分钟
                  </Text>
                  
                  {record.reflection && (
                    <Text style={styles.recordNotes} numberOfLines={2}>
                      {record.reflection}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* Meditation History Section */}
        <View style={styles.historySection}>
          <View style={styles.historySectionHeader}>
            <Text style={styles.historySectionTitle}>📿 观修历史</Text>
            <TouchableOpacity
              style={styles.viewModeToggle}
              onPress={() => setViewMode(viewMode === 'chronological' ? 'by_topic' : 'chronological')}
            >
              <Text style={styles.viewModeText}>
                {viewMode === 'chronological' ? '按主题' : '按时间'}
              </Text>
              <Ionicons name="swap-horizontal" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <MeditationHistoryComponent 
            practiceId={project.practice_id}
            practiceName={project.practices.name}
            viewMode={viewMode}
            embedded={true}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRecordMeditation}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>记录观修</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  practiceTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  practiceType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardProgress: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  todaySessionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
  },
  todaySessionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  sessionText: {
    fontSize: 14,
    color: '#333',
  },
  historyCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  recordItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recordTime: {
    fontSize: 12,
    color: '#666',
  },
  recordDuration: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  recordNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    margin: 16,
    marginTop: 0,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    gap: 8,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  historySection: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historySectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewModeText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  historyContent: {
    gap: 12,
  },
  recordCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
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
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
  },
  deletingText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  recordDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recordTime: {
    fontSize: 12,
    color: '#666',
  },
  recordContent: {
    marginBottom: 8,
  },
  recordDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  recordSession: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  recordMethod: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  reflectionContainer: {
    marginTop: 6,
    padding: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  reflectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reflectionText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  recordActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
  },
  topicCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  topicNumber: {
    fontSize: 10,
    color: '#666',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  topicStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  topicCount: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  topicDuration: {
    fontSize: 12,
    color: '#666',
  },
  topicLatest: {
    fontSize: 12,
    color: '#666',
  },
  topicDescription: {
    fontSize: 12,
    color: '#666',
    opacity: 0.8,
    lineHeight: 16,
    marginTop: 2,
  },
  topicSummary: {
    backgroundColor: '#e9ecef',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  topicSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  topicSummarySubtext: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  viewAllHistoryButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  viewAllHistoryText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
