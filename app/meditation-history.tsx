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
  ToastAndroid,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { meditationService } from '@/lib/database';
import { Colors } from '@/constants/Colors';
import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTokens } from '@/utils/componentTokens';
import PageTemplate from '@/components/PageTemplate';

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

      // Calculate topic statistics - only include records with valid session_number
      const topicCounts = topicsData.map(topic => {
        const recordsForTopic = allRecords.filter(record => {
          // Match records by session_number (which represents the topic number)
          return record.session_number && record.session_number === topic.topic_number;
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
      <PageTemplate
        title={`📿 ${practiceName} - 历史记录`}
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={Colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>正在加载记录...</Text>
        </View>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`📿 ${practiceName} - 历史记录`}
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable={true}
      backgroundColor={Colors.background}
      padding={0}
    >
      {/* View Mode Toggle */}
      <View style={styles.viewToggleContainer}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'chronological' && styles.toggleButtonActive
            ]}
            onPress={() => setViewMode('chronological')}
          >
            <Text style={[
              styles.toggleButtonText,
              viewMode === 'chronological' && styles.toggleButtonTextActive
            ]}>座数</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'by_topic' && styles.toggleButtonActive
            ]}
            onPress={() => setViewMode('by_topic')}
          >
            <Text style={[
              styles.toggleButtonText,
              viewMode === 'by_topic' && styles.toggleButtonTextActive
            ]}>主题</Text>
          </TouchableOpacity>
        </View>
      </View>
        {viewMode === 'chronological' ? (
          // Chronological View
          records.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📭 暂无观修记录</Text>
              <Text style={styles.emptySubtext}>开始您的第一次观修吧！</Text>
            </View>
          ) : (
            <View style={styles.recordsList}>
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
                        onPress={() => {
                          console.warn('🔴 DELETE BUTTON PHYSICAL PRESS DETECTED - Record:', record.id);
                          handleDelete(record);
                        }}
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
          )
        ) : (
          // By Topic View
          topicStats.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📚 暂无主题记录</Text>
              <Text style={styles.emptySubtext}>开始选择观修主题吧！</Text>
            </View>
          ) : (
            <View style={styles.recordsList}>
              {/* Topic Coverage Summary */}
              <View style={styles.topicSummary}>
                <Text style={styles.topicSummaryText}>
                  📊 已观修 {topicStats.filter(t => t.count > 0).length} / {topicStats.length} 个主题
                </Text>
                <Text style={styles.topicSummarySubtext}>
                  * 此视图仅显示有主题标记的观修记录
                </Text>
              </View>

              {topicStats.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.topicCard}
                  onPress={() => {
                    router.push({
                      pathname: '/modals/meditation-record',
                      params: {
                        practiceId,
                        practiceProjectId,
                        practiceName,
                        preselectedTopicNumber: topic.topic_number.toString()
                      }
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.topicHeader}>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                    <Text style={styles.topicNumber}>第{topic.topic_number}修法</Text>
                  </View>

                  <View style={styles.topicStats}>
                    <Text style={styles.topicCount}>
                      🧘 {topic.count} 次观修
                    </Text>
                    {topic.totalDuration > 0 && (
                      <Text style={styles.topicDuration}>
                        ⏱️ 总时长: {topic.totalDuration} 分钟
                      </Text>
                    )}
                    {topic.latestRecord && (
                      <Text style={styles.topicLatest}>
                        📅 最近: {formatDate(topic.latestRecord.record_date)}
                      </Text>
                    )}
                  </View>

                  {topic.description && (
                    <Text style={styles.topicDescription} numberOfLines={2}>
                      {topic.description}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )
        )}
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  viewToggleContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  recordsList: {
    padding: 16,
  },
  recordCard: {
    ...ComponentTokens.card.variants.outlined,
    padding: ComponentTokens.card.padding.comfortable,
    marginBottom: ComponentTokens.card.margin.comfortable,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  recordTime: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  recordContent: {
    marginBottom: 12,
  },
  recordDuration: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  recordSession: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  recordMethod: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  reflectionContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  reflectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  reflectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  recordActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  loadMoreButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  loadMoreText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
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
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 2,
    marginTop: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  toggleButtonTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  topicCard: {
    ...ComponentTokens.card.variants.outlined,
    padding: ComponentTokens.card.padding.comfortable,
    marginBottom: ComponentTokens.card.margin.comfortable,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.3,
  },
  topicNumber: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  topicCount: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  topicDuration: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  topicLatest: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  topicDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    opacity: 0.8,
    lineHeight: 20,
    marginTop: 4,
  },
  topicSummary: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  topicSummaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  topicSummarySubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});