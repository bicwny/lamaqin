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

    // Use Alert.alert for all platforms for consistent experience
    Alert.alert(
      '确认删除',
      `确定要删除这条观修记录吗？\n\n日期: ${formatDate(record.record_date)}\n时长: ${record.duration_minutes}分钟\n\n此操作无法撤销。`,
      [
        { 
          text: '取消', 
          style: 'cancel',
          onPress: () => {
            console.warn('🚫 USER CANCELLED DELETE');
          }
        },
        { 
          text: '确认删除', 
          style: 'destructive',
          onPress: async () => {
            console.warn('✅ USER CONFIRMED DELETE');
            console.warn('🎯 Alert confirmation button pressed');
            await executeDelete();
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
                </View>
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