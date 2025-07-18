
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

      // Get total sessions count
      const { data: allRecords, error: allError } = await supabase
        .from('meditation_records')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('practice_id', projectData.practice_id);

      if (allError) throw allError;
      setTotalSessions(allRecords?.length || 0);

      setTodayRecords(todayData || []);

    } catch (error) {
      console.error('Error loading meditation records:', error);
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

        {/* Full Meditation History */}
        <MeditationHistorySection 
          practiceId={project.practice_id}
          projectId={project.id}
          user={user}
        />

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

// Meditation History Component
function MeditationHistorySection({ 
  practiceId, 
  projectId, 
  user 
}: { 
  practiceId: string; 
  projectId: string; 
  user: any; 
}) {
  const [allRecords, setAllRecords] = useState<MeditationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && practiceId) {
      loadAllRecords();
    }
  }, [user, practiceId]);

  const loadAllRecords = async () => {
    if (!user?.id || !practiceId) return;

    try {
      setLoading(true);

      const { data: records, error } = await supabase
        .from('meditation_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('practice_id', practiceId)
        .order('record_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllRecords(records || []);

    } catch (error) {
      console.error('Error loading meditation records:', error);
      toastService.error({ title: '❌ 错误', message: '观修记录加载失败' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAllRecords();
  };

  if (loading) {
    return (
      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>观修历史</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  if (allRecords.length === 0) {
    return (
      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>观修历史</Text>
        <View style={styles.emptyHistoryContainer}>
          <Ionicons name="time-outline" size={48} color="#ccc" />
          <Text style={styles.emptyHistoryText}>还没有观修记录</Text>
          <Text style={styles.emptyHistorySubtext}>开始你的第一次观修吧</Text>
        </View>
      </View>
    );
  }

  // Group records by date
  const groupedRecords = allRecords.reduce((groups, record) => {
    const date = record.record_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as Record<string, MeditationRecord[]>);

  const sortedDates = Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a));

  return (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>观修历史</Text>
        <Text style={styles.historyCount}>共 {allRecords.length} 次</Text>
      </View>

      <ScrollView 
        style={styles.historyScrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        nestedScrollEnabled={true}
      >
        {sortedDates.map((date) => {
          const dayRecords = groupedRecords[date];
          const totalDuration = dayRecords.reduce((sum, record) => sum + record.duration_minutes, 0);
          
          return (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateTitle}>
                  {new Date(date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </Text>
                <Text style={styles.dateSummary}>
                  {dayRecords.length}座 · {totalDuration}分钟
                </Text>
              </View>
              
              {dayRecords
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((record, index) => (
                  <TouchableOpacity
                    key={record.id}
                    style={styles.recordItem}
                    onPress={() => router.push({
                      pathname: '/meditation-record-detail/[recordId]',
                      params: { recordId: record.id }
                    })}
                  >
                    <View style={styles.recordContent}>
                      <View style={styles.recordMainInfo}>
                        <Text style={styles.recordSession}>
                          第{record.session_number || (index + 1)}座
                        </Text>
                        <Text style={styles.recordDuration}>
                          {record.duration_minutes}分钟
                        </Text>
                      </View>
                      
                      <Text style={styles.recordTime}>
                        {new Date(record.created_at).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                    
                    {record.reflection && (
                      <Text style={styles.recordReflection} numberOfLines={2}>
                        {record.reflection}
                      </Text>
                    )}
                    
                    <Ionicons name="chevron-forward" size={16} color="#ccc" style={styles.recordChevron} />
                  </TouchableOpacity>
                ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
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
    margin: 16,
    marginTop: 0,
  },
  primaryButton: {
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
  historyCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  historyScrollView: {
    maxHeight: 400,
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 8,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateSummary: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  recordContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recordSession: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recordReflection: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 4,
  },
  recordChevron: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
});
