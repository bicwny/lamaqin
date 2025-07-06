
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalSearchParams, router } from 'expo-router';
import { getTopicProgressSummary, getTopicProgress } from '@/lib/topic-progress';

export default function TopicProgressDashboard() {
  const { user } = useAuth();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  
  const [summary, setSummary] = useState<any>(null);
  const [topicProgress, setTopicProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [user, projectId]);

  const loadData = async () => {
    if (!user || !projectId) return;
    
    try {
      const [summaryData, progressData] = await Promise.all([
        getTopicProgressSummary(user.id, projectId),
        getTopicProgress(user.id, projectId)
      ]);
      
      setSummary(summaryData);
      setTopicProgress(progressData);
    } catch (error) {
      console.error('Error loading topic progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            观修方法进度
          </Text>
          <Text className="text-gray-600">
            跟踪每个观修方法的周进度
          </Text>
        </View>

        {summary && (
          <View className="mb-6 p-4 bg-white rounded-lg shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              本周总结
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">已完成方法</Text>
                <Text className="font-semibold text-green-600">
                  {summary.completedTopicsThisWeek} 个
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">进行中方法</Text>
                <Text className="font-semibold text-orange-600">
                  {summary.inProgressTopics} 个
                </Text>
              </View>
              {summary.nextIncompleteTopicNumber && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">下个要完成</Text>
                  <Text className="font-semibold text-blue-600">
                    第{summary.nextIncompleteTopicNumber}法
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            详细进度
          </Text>
          {topicProgress.map(topic => (
            <View key={topic.id} className="mb-4 p-4 bg-white rounded-lg shadow-sm">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="font-semibold text-gray-800">
                  第{topic.topic_number}法
                </Text>
                <View className={`px-3 py-1 rounded-full ${
                  topic.is_current_week_complete
                    ? 'bg-green-100'
                    : topic.current_week_sessions > 0
                    ? 'bg-orange-100'
                    : 'bg-gray-100'
                }`}>
                  <Text className={`text-xs font-medium ${
                    topic.is_current_week_complete
                      ? 'text-green-800'
                      : topic.current_week_sessions > 0
                      ? 'text-orange-800'
                      : 'text-gray-600'
                  }`}>
                    {topic.is_current_week_complete ? '已完成' : 
                     topic.current_week_sessions > 0 ? '进行中' : '未开始'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">
                  本周进度: {topic.current_week_sessions}/{topic.weekly_target_sessions} 座
                </Text>
                <View className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View 
                    className={`h-full ${
                      topic.is_current_week_complete ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (topic.current_week_sessions / topic.weekly_target_sessions) * 100)}%` 
                    }}
                  />
                </View>
              </View>
              
              {topic.total_completed_weeks > 0 && (
                <Text className="text-sm text-gray-500 mt-2">
                  已完成 {topic.total_completed_weeks} 周
                </Text>
              )}
            </View>
          ))}
        </View>

        {topicProgress.length === 0 && (
          <View className="p-8 bg-white rounded-lg text-center">
            <Text className="text-gray-600 mb-4">
              还没有设置观修方法进度跟踪
            </Text>
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/topic-progress-setup',
                params: { projectId }
              })}
              className="bg-blue-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold text-center">
                设置观修方法
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
