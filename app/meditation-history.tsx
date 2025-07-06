import React, { useState, useEffect, useRef } from 'react';
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
import { router, useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { meditationService } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

export default function MeditationHistoryScreen() {
  const { user } = useAuth();
  const {
    practiceId,
    practiceProjectId,
    practiceName
  } = useLocalSearchParams<{
    practiceId: string;
    practiceProjectId: string;
    practiceName: string;
  }>();

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<'chronological' | 'by_topic'>('chronological');
  const [topicStats, setTopicStats] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const RECORDS_PER_PAGE = 12;

  useEffect(() => {
    if (user && practiceId) {
      loadData(true);
    }
  }, [user, practiceId]);

  useFocusEffect(
    React.useCallback(() => {
      if (user && practiceId) {
        loadData(true);
      }
    }, [user, practiceId])
  );

  const loadData = async (reset = false) => {
    if (!user || !practiceId) return;

    try {
      if (reset) {
        setLoading(true);
        setPage(0);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      // Load meditation records
      const allRecords = await meditationService.getMeditationRecords(user.id, practiceId);
      const startIndex = reset ? 0 : (page + 1) * RECORDS_PER_PAGE;
      const endIndex = startIndex + RECORDS_PER_PAGE;
      const pageRecords = allRecords.slice(startIndex, endIndex);

      if (reset) {
        setRecords(pageRecords);

        // Load topics and calculate stats
        await loadTopicsAndStats(allRecords);
      } else {
        setRecords(prev => [...prev, ...pageRecords]);
      }

      setHasMore(endIndex < allRecords.length);
      if (!reset) {
        setPage(prev => prev + 1);
      }

      console.log('📅 Loaded records:', pageRecords.length);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      Alert.alert('错误', '加载数据失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const loadTopicsAndStats = async (allRecords: any[]) => {
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

  const loadRecords = loadData;

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && viewMode === 'chronological') {
      loadData(false);
    }
  };

  const handleEdit = (record: any) => {
    router.push({
      pathname: '/modals/meditation-record',
      params: {
        practiceId,
        practiceProjectId,
        practiceName,
        editRecordId: record.id
      }
    });
  };

  const [deletingRecords, setDeletingRecords] = useState<Set<string>>(new Set());

  const handleDelete = async (record: any) => {
    console.warn('🎯 DELETE BUTTON CLICKED - Record ID:', record.id);
    console.warn('🎯 Delete button onPress triggered');

    const executeDelete = async () => {
      console.warn('🗑️ DELETE OPERATION START - Record ID:', record.id);
      console.warn('🗑️ User ID:', user?.id);
      console.warn('🗑️ Record Details:', {
        id: record.id,
        date: record.record_date,
        duration: record.duration_minutes
      });

      if (!user?.id) {
        console.error('❌ DELETE FAILED - No user ID available');
        if (Platform.OS === 'web') {
          alert('用户认证失败，请重新登录');
        } else {
          Alert.alert('错误', '用户认证失败，请重新登录');
        }
        return;
      }

      // Step 1: Optimistic update - mark record as deleting
      setDeletingRecords(prev => new Set(prev).add(record.id));
      console.warn('🔄 OPTIMISTIC UPDATE - Marking record as deleting');

      try {
        console.warn('🗑️ CALLING DATABASE DELETE - recordId:', record.id, 'userId:', user.id);

        // Step 2: Send delete request to database
        await meditationService.deleteMeditationRecord(record.id, user.id);

        console.warn('✅ DATABASE DELETE SUCCESS - Record removed from database');

        // Step 3a: Remove from UI immediately (optimistic)
        setRecords(prev => prev.filter(r => r.id !== record.id));
        console.warn('✅ UI UPDATE SUCCESS - Record removed from list');

        // Step 4a: Show success toast
        if (Platform.OS === 'android') {
          ToastAndroid.show('✅ 记录已删除', ToastAndroid.SHORT);
          console.warn('📱 ANDROID TOAST SHOWN - Delete success');
        } else if (Platform.OS === 'web') {
          console.warn('📱 WEB SUCCESS - Record deleted');
          // For web, we could use a simple alert or just console log
        } else {
          Alert.alert('成功', '记录已删除');
          console.warn('📱 IOS ALERT SHOWN - Delete success');
        }

      } catch (error) {
        console.error('❌ DELETE OPERATION FAILED:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details
        });

        // Step 3b & 4b: Revert optimistic update and show error
        setDeletingRecords(prev => {
          const newSet = new Set(prev);
          newSet.delete(record.id);
          return newSet;
        });
        console.warn('🔄 REVERTED OPTIMISTIC UPDATE - Record restored to list');

        if (Platform.OS === 'android') {
          ToastAndroid.show('❌ 删除失败，请重试', ToastAndroid.LONG);
          console.warn('📱 ANDROID TOAST SHOWN - Delete error');
        } else if (Platform.OS === 'web') {
          alert(`删除失败: ${error.message || '请重试'}`);
          console.warn('📱 WEB ALERT SHOWN - Delete error');
        } else {
          Alert.alert('错误', `删除失败: ${error.message || '请重试'}`);
          console.warn('📱 IOS ALERT SHOWN - Delete error');
        }
      } finally {
        // Clean up deleting state
        setDeletingRecords(prev => {
          const newSet = new Set(prev);
          newSet.delete(record.id);
          return newSet;
        });
        console.warn('🧹 CLEANUP COMPLETE - Deleting state cleared');
      }
    };

    // Direct delete without modal
    console.warn('✅ DIRECT DELETE - No confirmation modal');
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-3 text-base text-gray-600">正在加载记录...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="py-2 mb-2">
          <Text className="text-primary text-base font-medium">← 返回</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800 text-center">📿 {practiceName} - 历史记录</Text>

        {/* View Mode Toggle - only show if there are records with topics */}
        {topicStats.some(topic => topic.count > 0) && (
          <View className="flex-row bg-gray-100 rounded-lg p-0.5 mt-3">
            <TouchableOpacity
              className={`flex-1 py-2 px-4 rounded-md items-center ${
                viewMode === 'chronological' ? 'bg-primary' : ''
              }`}
              onPress={() => setViewMode('chronological')}
            >
              <Text className={`text-sm font-medium ${
                viewMode === 'chronological' ? 'text-white' : 'text-gray-600'
              }`}>时间</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 px-4 rounded-md items-center ${
                viewMode === 'by_topic' ? 'bg-primary' : ''
              }`}
              onPress={() => setViewMode('by_topic')}
            >
              <Text className={`text-sm font-medium ${
                viewMode === 'by_topic' ? 'text-white' : 'text-gray-600'
              }`}>主题</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Records List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {viewMode === 'chronological' ? (
          // Chronological View
          records.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-lg text-gray-600 mb-2">📭 暂无观修记录</Text>
              <Text className="text-sm text-gray-400">开始您的第一次观修吧！</Text>
            </View>
          ) : (
            <View className="p-4">
              {records.map((record) => {
                const isDeleting = deletingRecords.has(record.id);
                return (
                  <View 
                    key={record.id} 
                    className={`bg-white rounded-xl p-4 mb-3 shadow-sm ${
                      isDeleting ? 'opacity-60 relative' : ''
                    }`}
                  >
                    {isDeleting && (
                      <View className="absolute inset-0 bg-white/80 z-10 justify-center items-center rounded-xl flex-row gap-2">
                        <ActivityIndicator color="#dc3545" size="small" />
                        <Text className="text-red-600 text-sm font-medium">删除中...</Text>
                      </View>
                    )}

                    <View className={`flex-row justify-between items-center mb-3 pb-2 border-b border-gray-200 ${
                      isDeleting ? 'opacity-50' : ''
                    }`}>
                      <Text className="text-base font-semibold text-gray-800">
                        {formatDate(record.record_date)}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {formatTime(record.created_at)}
                      </Text>
                    </View>

                    <View className={`mb-3 ${isDeleting ? 'opacity-50' : ''}`}>
                      <Text className="text-base font-medium text-gray-800 mb-1">
                        时长: {record.duration_minutes} 分钟
                      </Text>

                      {record.session_number && (
                        <Text className="text-sm text-gray-600 mb-1">
                          第 {record.session_number} 座
                        </Text>
                      )}

                      {record.method && (
                        <Text className="text-sm text-gray-600 mb-2">
                          方法: {record.method}
                        </Text>
                      )}

                      {record.reflection && (
                        <View className="mt-2 p-3 bg-gray-50 rounded-lg border-l-3 border-primary">
                          <Text className="text-sm font-semibold text-gray-800 mb-1">观后感:</Text>
                          <Text className="text-sm text-gray-600 leading-5" numberOfLines={3}>
                            {record.reflection}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-row justify-end gap-3">
                      <TouchableOpacity
                        className={`bg-blue-500 px-4 py-2 rounded-md ${
                          isDeleting ? 'opacity-30' : ''
                        }`}
                        onPress={() => handleEdit(record)}
                        disabled={isDeleting}
                      >
                        <Text className={`text-white text-sm font-medium ${
                          isDeleting ? 'opacity-50' : ''
                        }`}>
                          编辑
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className={`bg-red-500 px-4 py-2 rounded-md ${
                          isDeleting ? 'opacity-30' : ''
                        }`}
                        onPress={() => {
                          console.warn('🔴 DELETE BUTTON PHYSICAL PRESS DETECTED - Record:', record.id);
                          handleDelete(record);
                        }}
                        disabled={isDeleting}
                      >
                        <Text className={`text-white text-sm font-medium ${
                          isDeleting ? 'opacity-50' : ''
                        }`}>
                          删除
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              {hasMore && (
                <TouchableOpacity
                  className="bg-white py-3 rounded-lg items-center mt-2 shadow-sm"
                  onPress={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <ActivityIndicator color={Colors.primary} />
                  ) : (
                    <Text className="text-primary text-base font-medium">加载更多</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )
        ) : (
          // By Topic View
          topicStats.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-lg text-gray-600 mb-2">📚 暂无主题记录</Text>
              <Text className="text-sm text-gray-400">开始选择观修主题吧！</Text>
            </View>
          ) : (
            <View className="p-4">
              {/* Topic Coverage Summary */}
              <View className="bg-gray-50 p-3 rounded-lg mb-4 border-l-3 border-primary">
                <Text className="text-sm font-semibold text-gray-800 mb-1">
                  📊 已观修 {topicStats.filter(t => t.count > 0).length} / {topicStats.length} 个主题
                </Text>
                <Text className="text-xs text-gray-600 italic">
                  * 此视图仅显示有主题标记的观修记录
                </Text>
              </View>

              {topicStats.map((topic) => (
                <View key={topic.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-base font-semibold text-gray-800 flex-1 mr-2">{topic.title}</Text>
                    <Text className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      第{topic.topic_number}修法
                    </Text>
                  </View>

                  <View className="flex-row flex-wrap gap-3 mb-2">
                    <Text className="text-sm text-primary font-semibold">
                      🧘 {topic.count} 次观修
                    </Text>
                    {topic.totalDuration > 0 && (
                      <Text className="text-sm text-gray-600">
                        ⏱️ 总时长: {topic.totalDuration} 分钟
                      </Text>
                    )}
                    {topic.latestRecord && (
                      <Text className="text-sm text-gray-600">
                        📅 最近: {formatDate(topic.latestRecord.record_date)}
                      </Text>
                    )}
                  </View>

                  {topic.description && (
                    <Text className="text-sm text-gray-500 leading-5 mt-1" numberOfLines={2}>
                      {topic.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}