
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

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRecordMeditation}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>记录观修</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewHistory}
          >
            <Ionicons name="time-outline" size={24} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>观修历史</Text>
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
});
