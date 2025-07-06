import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-3 text-base text-gray-600">正在加载...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progress = calculateProgress();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="py-2 mb-2">
          <Text className="text-primary text-base font-medium">← 返回</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800 text-center">
          📿 {practiceName} - 详情
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Progress Summary */}
        <View className="bg-white m-4 mb-2 rounded-xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
            总体进度
          </Text>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-medium text-gray-800">
              {progress.current.toLocaleString()}/{progress.target.toLocaleString()} {projectInfo?.practices?.unit || '次'}
            </Text>
            <Text className="text-base font-semibold text-primary">
              {progress.percentage.toFixed(1)}%
            </Text>
          </View>

          <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
            <View 
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            />
          </View>

          {projectInfo?.daily_target && (
            <Text className="text-sm text-gray-600 text-center">
              每日目标：{projectInfo.daily_target.toLocaleString()} {projectInfo?.practices?.unit || '次'}
            </Text>
          )}
        </View>

        {/* Records List */}
        <View className="m-4 mt-2">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            修行记录
          </Text>

          {records.length === 0 ? (
            <View className="bg-white rounded-xl p-10 items-center shadow-sm">
              <Text className="text-lg text-gray-600 mb-2">📭 暂无记录</Text>
              <Text className="text-sm text-gray-500">开始您的第一次记录吧！</Text>
            </View>
          ) : (
            <View className="gap-3">
              {records.map((record) => {
                const isDeleting = deletingRecords.has(record.id);
                return (
                  <View 
                    key={record.id} 
                    className={`bg-white rounded-xl p-4 shadow-sm relative ${isDeleting ? 'opacity-60' : ''}`}
                  >
                    {isDeleting && (
                      <View className="absolute inset-0 bg-white/80 z-10 justify-center items-center rounded-xl flex-row gap-2">
                        <ActivityIndicator color="#dc3545" size="small" />
                        <Text className="text-red-600 text-sm font-medium">删除中...</Text>
                      </View>
                    )}

                    <View className={`flex-row justify-between items-center mb-3 pb-2 border-b border-gray-200 ${isDeleting ? 'opacity-50' : ''}`}>
                      <Text className="text-base font-semibold text-gray-800">
                        {formatDate(record.record_date)}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {formatTime(record.created_at)}
                      </Text>
                    </View>

                    <View className={`mb-3 ${isDeleting ? 'opacity-50' : ''}`}>
                      <Text className="text-base font-medium text-gray-800 mb-2">
                        数量: {record.count.toLocaleString()} {projectInfo?.practices?.unit || '次'}
                      </Text>

                      {record.notes && (
                        <View className="mt-2 p-3 bg-gray-50 rounded-lg border-l-3 border-primary">
                          <Text className="text-sm font-semibold text-gray-800 mb-1">备注:</Text>
                          <Text className="text-sm text-gray-600 leading-5" numberOfLines={3}>
                            {record.notes}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-row justify-end gap-3">
                      <TouchableOpacity
                        className={`bg-blue-600 px-4 py-2 rounded-md ${isDeleting ? 'opacity-30' : ''}`}
                        onPress={() => handleEdit(record)}
                        disabled={isDeleting}
                      >
                        <Text className={`text-white text-sm font-medium ${isDeleting ? 'opacity-50' : ''}`}>
                          编辑
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className={`bg-red-600 px-4 py-2 rounded-md ${isDeleting ? 'opacity-30' : ''}`}
                        onPress={() => handleDelete(record)}
                        disabled={isDeleting}
                      >
                        <Text className={`text-white text-sm font-medium ${isDeleting ? 'opacity-50' : ''}`}>
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