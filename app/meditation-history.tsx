import React, { useState, useEffect, useRef } from 'react';
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

  const RECORDS_PER_PAGE = 12;

  useEffect(() => {
    if (user && practiceId) {
      loadRecords(true);
    }
  }, [user, practiceId]);

  useFocusEffect(
    React.useCallback(() => {
      if (user && practiceId) {
        loadRecords(true);
      }
    }, [user, practiceId])
  );

  const loadRecords = async (reset = false) => {
    if (!user || !practiceId) return;

    try {
      if (reset) {
        setLoading(true);
        setPage(0);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const allRecords = await meditationService.getMeditationRecords(user.id, practiceId);
      const startIndex = reset ? 0 : (page + 1) * RECORDS_PER_PAGE;
      const endIndex = startIndex + RECORDS_PER_PAGE;
      const pageRecords = allRecords.slice(startIndex, endIndex);

      if (reset) {
        setRecords(pageRecords);
      } else {
        setRecords(prev => [...prev, ...pageRecords]);
      }

      setHasMore(endIndex < allRecords.length);
      if (!reset) {
        setPage(prev => prev + 1);
      }

      console.log('📅 Loaded records:', pageRecords.length);
    } catch (error) {
      console.error('❌ Error loading records:', error);
      Alert.alert('错误', '加载记录失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecords(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      loadRecords(false);
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

  const handleDelete = async (record: any) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条观修记录吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: async () => {
            try {
              await meditationService.deleteMeditationRecord(record.id, user?.id || '');
              Alert.alert('成功', '记录已删除');
              loadRecords(true); // 重新加载历史记录
            } catch (error) {
              console.error('❌ Error deleting record:', error);
              Alert.alert('错误', '删除失败，请重试');
            }
          }
        }
      ]
    );
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>正在加载记录...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📿 {practiceName} - 历史记录</Text>
      </View>

      {/* Records List */}
      <ScrollView
        style={styles.scrollView}
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
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭 暂无观修记录</Text>
            <Text style={styles.emptySubtext}>开始您的第一次观修吧！</Text>
          </View>
        ) : (
          <View style={styles.recordsList}>
            {records.map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordDate}>
                    {formatDate(record.record_date)}
                  </Text>
                  <Text style={styles.recordTime}>
                    {formatTime(record.created_at)}
                  </Text>
                </View>

                <View style={styles.recordContent}>
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
                    style={styles.editButton}
                    onPress={() => handleEdit(record)}
                  >
                    <Text style={styles.editButtonText}>编辑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(record)}
                  >
                    <Text style={styles.deleteButtonText}>删除</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {hasMore && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <Text style={styles.loadMoreText}>加载更多</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
    padding: 16,
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  recordDuration: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  recordSession: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recordMethod: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reflectionContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  reflectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reflectionText: {
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
  loadMoreButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadMoreText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});

interface MeditationRecord {
  id: string;
  record_date: string;
  duration_minutes: number;
  session_number: number;
  method: string;
  reflection?: string;
  reflection_created_at?: string;
  created_at: string;
}

export default function MeditationHistoryScreen() {
  const { user } = useAuth();
  const navigation = useRouter();
  const { projectId, practiceId, practiceName, targetPeriod } = useLocalSearchParams();
  const pageActiveRef = useRef(true);

  const [records, setRecords] = useState<MeditationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [meditationTopics, setMeditationTopics] = useState<{topic_number: number, title: string, description: string}[]>([]);

  const PAGE_SIZE = 12;

  // Track when page is focused/unfocused
  useFocusEffect(
    React.useCallback(() => {
      console.log('🏠 Meditation history page focused');
      pageActiveRef.current = true;

      return () => {
        console.log('🚪 Meditation history page unfocused');
        pageActiveRef.current = false;
      };
    }, [])
  );

  useEffect(() => {
    console.log('🔄 MeditationHistory: Initial load, user:', user?.id, 'practiceId:', practiceId);
    if (user?.id && practiceId) {
      loadRecords(true);
      loadMeditationTopics();
    }
  }, [user?.id, practiceId]);

  const loadMeditationTopics = async () => {
    if (!practiceId) return;

    try {
      const topics = await meditationService.getMeditationTopics(practiceId as string);
      setMeditationTopics(topics);
    } catch (error) {
      console.error('❌ Error loading meditation topics:', error);
    }
  };

  const loadRecords = async (reset = false) => {
    if (!user?.id || !practiceId) {
      console.log('⚠️ MeditationHistory: Missing user or practiceId, user:', user?.id, 'practiceId:', practiceId);
      return;
    }

    // Prevent operations if page is not active
    if (!pageActiveRef.current) {
      console.log('⚠️ MeditationHistory: Page not active, skipping load');
      return;
    }

    try {
      const currentPage = reset ? 0 : page;
      const offset = currentPage * PAGE_SIZE;

      console.log('🔄 Loading meditation records:', { practiceId, offset, pageSize: PAGE_SIZE });

      const { data, error } = await supabase
        .from('meditation_records')
        .select('id, record_date, duration_minutes, session_number, method, reflection, reflection_created_at, created_at')
        .eq('user_id', user.id)
        .eq('practice_id', practiceId)
        .order('record_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        console.error('❌ Error loading records:', error);
        throw error;
      }

      console.log('📊 Loaded records:', data?.length || 0);

      if (reset) {
        setRecords(data || []);
        setPage(1);
      } else {
        setRecords(prev => [...prev, ...(data || [])]);
        setPage(prev => prev + 1);
      }

      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (error) {
      console.error('❌ Error loading meditation records:', error);
      Alert.alert('错误', '加载记录失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(0);
    loadRecords(true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadRecords(false);
    }
  };

  const handleEdit = (record: any) => {
    console.log('🔄 Edit record:', record.id);
    router.push({
      pathname: '/modals/meditation-record',
      params: {
        practiceId: projectId,
        practiceProjectId: practiceId,
        practiceName: practiceName,
        editRecordId: record.id
      }
    });
  };

  const handleDelete = async (record: any) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条观修记录吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: async () => {
            try {
              await meditationService.deleteMeditationRecord(record.id);
              Alert.alert('成功', '记录已删除');
              loadRecords(true); // 重新加载历史记录
            } catch (error) {
              console.error('❌ Error deleting record:', error);
              Alert.alert('错误', '删除失败，请重试');
            }
          }
        }
      ]
    );
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            console.log('🔙 Back button pressed from meditation history');
            if (navigation.canGoBack()) {
              navigation.back();
            } else {
              // Fallback: navigate to practice tab
              router.replace('/(tabs)/practice');
            }
          }}
        >
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{practiceName} - 历史记录</Text>
      </View>

      {/* Records List */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无观修记录</Text>
            <Text style={styles.emptySubtext}>开始您的第一次观修吧</Text>
          </View>
        ) : (
          <>
            {records.map((record) => {
              const topic = meditationTopics.find(t => t.topic_number === record.session_number);
              const topicTitle = topic ? topic.title : null;

              return (
                <View key={record.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordDate}>
                        {formatDate(record.record_date)}
                      </Text>

                      <View style={styles.recordDetails}>
                        <Text style={styles.recordDuration}>
                          时长：{record.duration_minutes} 分钟
                        </Text>

                        {record.session_number && (
                          <Text style={styles.sessionNumber}>
                            第 {record.session_number} 座
                          </Text>
                        )}

                        {topicTitle && (
                          <Text style={styles.topicTitle}>
                            方法：{topicTitle}
                          </Text>
                        )}
                      </View>

                      {/* 观后感显示 */}
                      {record.reflection ? (
                        <View style={styles.reflectionContainer}>
                          <Text style={styles.reflectionLabel}>观后感：</Text>
                          <TouchableOpacity 
                            style={styles.reflectionPreview}
                            onPress={() => {
                              Alert.alert(
                                '观后感',
                                record.reflection,
                                [{ text: '关闭', style: 'cancel' }]
                              );
                            }}
                          >
                            <Text style={styles.reflectionText}>
                              {record.reflection.length > 80
                                ? `${record.reflection.substring(0, 80)}...`
                                : record.reflection
                              }
                            </Text>
                            {record.reflection.length > 80 && (
                              <Text style={styles.viewMoreText}>
                                点击查看完整内容 →
                              </Text>
                            )}
                            {record.reflection_created_at && (
                              <Text style={styles.reflectionDate}>
                                记录于 {formatDate(record.reflection_created_at.split('T')[0])}
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addReflectionButton}
                          onPress={() => handleEdit(record)}
                        >
                          <Text style={styles.addReflectionText}>
                            + 添加观后感
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.recordActions}>
                      <TouchableOpacity
                        onPress={() => handleEdit(record)}
                        style={styles.editButton}
                      >
                        <Text style={styles.editButtonText}>编辑</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDelete(record)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteButtonText}>删除</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Load More Button */}
            {hasMore && (
              <TouchableOpacity 
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <Text style={styles.loadMoreText}>加载更多</Text>
                )}
              </TouchableOpacity>
            )}

            {!hasMore && records.length > 0 && (
              <Text style={styles.endText}>已显示全部记录</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  recordCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 0,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordInfo: {
    flex: 1,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  recordDetails: {
    marginBottom: 8,
  },
  recordDuration: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 4,
  },
  sessionNumber: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  topicTitle: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
  },
  reflectionContainer: {
    marginTop: 8,
  },
  reflectionLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  reflectionPreview: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#f39c12',
  },
  reflectionText: {
    fontSize: 13,
    color: '#2c3e50',
    lineHeight: 18,
  },
  viewMoreText: {
    fontSize: 11,
    color: '#3498db',
    marginTop: 4,
  },
  reflectionDate: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 4,
  },
  addReflectionButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  addReflectionText: {
    color: '#3498db',
    fontSize: 12,
  },
  recordActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  loadMoreButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  loadMoreText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  endText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 20,
  },
});