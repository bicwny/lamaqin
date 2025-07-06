import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

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
  created_at: string;
}

export default function PracticeScreen() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PracticeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPracticeData = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 Loading practice data for user:', user.id);

      const { data: practiceProjects, error } = await supabase
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📋 User practice projects:', practiceProjects);
      console.log('📋 Loaded practice projects:', practiceProjects?.length || 0);

      setProjects(practiceProjects || []);
    } catch (error) {
      console.error('Error loading practice data:', error);
      Alert.alert('错误', '加载修行数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadPracticeData();
    }
  }, [user, loadPracticeData]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadPracticeData();
      }
    }, [user, loadPracticeData])
  );



  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadPracticeData();
  }, [loadPracticeData]);

  const calculateProgress = React.useCallback((project: PracticeProject) => {
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
  }, []);

  const handleAddPractice = React.useCallback(() => {
    router.push('/add-practice');
  }, []);

  const handleCustomRecord = async (projectId: string, practiceName: string) => {
    console.log('🔄 handleCustomRecord called with project:', projectId, practiceName);

    const project = projects.find(p => p.id === projectId);
    if (!project) {
      Alert.alert('错误', '未找到修行项目');
      return;
    }

    if (project.practices.type === 'time') {
      // For meditation practices, navigate to the meditation record modal
      router.push({
        pathname: '/modals/meditation-record',
        params: {
          projectId: projectId,
          practiceId: project.practice_id,
          practiceName: practiceName,
        },
      });
    } else {
      // For count-based practices, show simple input
      router.push({
        pathname: '/modals/custom-record',
        params: {
          projectId: projectId,
          practiceName: practiceName,
          practiceType: project.practices.type,
        },
      });
    }
  };

  const handleViewDetails = (projectId: string, practiceName: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (project.practices.type === 'time') {
      // For meditation practices, show meditation history
      router.push({
        pathname: '/meditation-history',
        params: {
          practiceId: project.practice_id,
          practiceName: practiceName,
        },
      });
    } else {
      // For count-based practices, show regular history
      router.push({
        pathname: '/practice-history',
        params: {
          projectId: projectId,
          practiceName: practiceName,
        },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-2xl font-semibold text-gray-800 mb-4">🧘 修行</Text>
          <Text className="text-base text-gray-600">加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (projects.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-row justify-between items-center p-4 bg-white">
            <View>
              <Text className="text-2xl font-semibold text-gray-800">🧘 修行</Text>
              <Text className="text-base text-gray-600 text-center mt-2">记录你的修行历程</Text>
            </View>
          </View>

          <View className="flex-1 justify-center items-center p-10" style={{ minHeight: 500 }}>
            <View className="mb-6">
              <Ionicons name="flower-outline" size={80} color="#9CA3AF" />
            </View>

            <Text className="text-2xl font-semibold text-gray-700 mb-3 text-center">开始你的修行之旅</Text>
            <Text className="text-base text-gray-600 text-center leading-6 mb-8 max-w-xs">
              添加你的第一个修行项目，开始记录你的精神成长历程
            </Text>

            <TouchableOpacity 
              className="flex-row items-center bg-blue-500 px-6 py-3 rounded-3xl"
              onPress={handleAddPractice}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
              <Text className="text-white text-base font-semibold ml-2">添加修行项目</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView 
        className="flex-1"
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row justify-between items-center p-4 bg-white" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white' }}>
          <Text className="text-2xl font-semibold text-gray-800" style={{ fontSize: 24, fontWeight: '600', color: '#1f2937' }}>🧘 修行</Text>
          <TouchableOpacity onPress={handleAddPractice}>
            <Text className="text-blue-500 text-base font-medium" style={{ color: '#3b82f6', fontSize: 16, fontWeight: '500' }}>添加</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-semibold text-gray-800 mx-4 mt-4 mb-2" style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginHorizontal: 16, marginTop: 16, marginBottom: 8 }}>我的修行项目：</Text>

        {projects.map((project) => {
          const progress = calculateProgress(project);
          const isTimeBasedWeekly = project.practices.type === 'time' && project.target_period === 'weekly';

          // Unified display logic based on target_end_date
          const practiceDisplayType = project.target_end_date ? '固定时长' : '持续进行';
          const totalWeeks = project.target_end_date 
            ? Math.ceil((new Date(project.target_end_date).getTime() - new Date(project.start_date).getTime()) / (7 * 24 * 60 * 60 * 1000))
            : null;

          return (
            <View key={project.id} className="bg-white rounded-xl p-4 mx-4 my-2 shadow-sm" style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginHorizontal: 16, marginVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 }}>
              <View className="mb-2">
                <Text className="text-sm text-gray-600 mb-2">
                  {project.practices.type === 'count' ? '计数类' : '计时类'}
                  {project.practices.type === 'time' && project.target_period === 'weekly' && ' (周)'}
                </Text>
              </View>

              <Text className="text-lg font-semibold text-gray-800 mb-2">
                {project.practices.name}
                {project.practices.type === 'time' && ` (${practiceDisplayType})`}
                {project.practices.type === 'time' && totalWeeks && ` - ${totalWeeks}周`}
              </Text>

              <View className="mb-4">
                {project.practices.type === 'count' ? (
                  <View>
                    <Text className="text-sm text-gray-600 mb-1">
                      {progress.current.toLocaleString()}/{progress.target.toLocaleString()} {project.practices.unit}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      每日目标：{project.daily_target.toLocaleString()} {project.practices.unit}
                    </Text>
                  </View>
                ) : (
                  <View>
                    {project.target_period === 'weekly' ? (
                      <Text className="text-sm text-gray-600">
                        本周目标：{project.daily_target}座 (每周{project.daily_target}座)
                      </Text>
                    ) : (
                      <Text className="text-sm text-gray-600">
                        总进度：{progress.current}/{progress.target}天
                      </Text>
                    )}

                    <WeeklyProgressDisplay
                      project={project}
                      user={user}
                    />
                  </View>
                )}
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 p-3 rounded-lg items-center"
                  onPress={() => handleViewDetails(project.id, project.practices.name)}
                >
                  <Text className="text-blue-500 font-semibold">查看详情</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-blue-500 p-3 rounded-lg items-center"
                  onPress={() => handleCustomRecord(project.id, project.practices.name)}
                >
                  <Text className="text-white font-semibold">
                    {project.practices.type === 'time' ? '记录观修' : '记录'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="mt-2 flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => router.push({
                    pathname: '/meditation-history',
                    params: { practiceId: project.practice_id }
                  })}
                  className="flex-1 bg-blue-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">
                    查看记录
                  </Text>
                </TouchableOpacity>
                {project.goal_type === 'topic_progress' && (
                  <TouchableOpacity
                    onPress={() => router.push({
                      pathname: '/topic-progress-dashboard',
                      params: { projectId: project.id }
                    })}
                    className="flex-1 bg-green-500 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-semibold text-center">
                      方法进度
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// Component to display weekly progress for time-based practices
const WeeklyProgressDisplay = React.memo(function WeeklyProgressDisplay({ project, user }: { project: PracticeProject; user: any }) {
  const [todayRecords, setTodayRecords] = useState<MeditationRecord[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<MeditationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, [project.id, user?.id]);

  const loadRecords = async () => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get today's records
      const { data: todayData, error: todayError } = await supabase
        .from('meditation_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('practice_id', project.practice_id)
        .eq('record_date', today)
        .order('created_at', { ascending: true });

      if (todayError) throw todayError;

      // Get this week's records for weekly projects
      if (project.target_period === 'weekly') {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const { data: weeklyData, error: weeklyError } = await supabase
          .from('meditation_records')
          .select('*')
          .eq('user_id', user.id)
          .eq('practice_id', project.practice_id)
          .gte('record_date', startOfWeek.toISOString().split('T')[0])
          .lte('record_date', endOfWeek.toISOString().split('T')[0])
          .order('created_at', { ascending: true });

        if (weeklyError) throw weeklyError;
        setWeeklyRecords(weeklyData || []);
      }

      setTodayRecords(todayData || []);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="mt-2">
        <Text className="text-sm text-gray-800 mb-1">加载中...</Text>
      </View>
    );
  }

  const isWeekly = project.target_period === 'weekly';
  const todayCount = todayRecords.length;
  const target = project.daily_target;

  // Format session details for today
  const todayDetails = todayRecords.map((record, index) =>
    `第${index + 1}座${record.duration_minutes}分钟`
  ).join('；');

  if (isWeekly) {
    const weeklyCount = weeklyRecords.length;
    const weeklyTarget = project.daily_target; // Use daily_target which represents weekly sessions for weekly projects

    return (
      <View className="mt-2">
        <Text className="text-sm text-gray-800 mb-1">
          本周进度：{weeklyCount}/{weeklyTarget}座{weeklyCount >= weeklyTarget ? ' ✅' : ''}
        </Text>
        {todayCount > 0 && todayDetails && (
          <Text className="text-xs text-gray-600">
            今日：{todayDetails}
          </Text>
        )}
      </View>
    );
  } else {
    return (
      <View className="mt-2">
        <Text className="text-sm text-gray-800 mb-1">
          今日进度：{todayCount}/{target}座{todayCount >= target ? ' ✅' : ''}
        </Text>
        {todayCount > 0 && todayDetails && (
          <Text className="text-xs text-gray-600">
            {todayDetails}
          </Text>
        )}
      </View>
    );
  }
});

// New component to display total sessions
const TotalSessionsDisplay = React.memo(function TotalSessionsDisplay({ practiceId, userId }: { practiceId: string; userId: string }) {
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalSessions = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('meditation_records')
          .select('*, topic_number', { count: 'exact' })
          .eq('user_id', userId)
          .eq('practice_id', practiceId);

        if (error) {
          throw error;
        }

        setTotalSessions(data ? data.length : 0);
      } catch (error) {
        console.error('Error fetching total sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalSessions();
  }, [practiceId, userId]);

  if (loading) {
    return <Text className="text-sm text-blue-500 font-medium mb-3">总数: 加载中...</Text>;
  }

  return <Text className="text-sm text-blue-500 font-medium mb-3">🧘 {totalSessions} 次观修</Text>;
});