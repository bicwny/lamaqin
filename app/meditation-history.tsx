import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { meditationService } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

interface MeditationRecord {
  id: string;
  record_date: string;
  duration_minutes: number;
  session_number: number;
  method: string;
  created_at: string;
}

export default function MeditationHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { projectId, practiceId, practiceName, targetPeriod } = useLocalSearchParams();
  const pageActiveRef = useRef(true);

  const [records, setRecords] = useState<MeditationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MeditationRecord | null>(null);
  const [editDuration, setEditDuration] = useState('');
  const [editSessionNumber, setEditSessionNumber] = useState(1);
  const [meditationTopics, setMeditationTopics] = useState<{topic_number: number, title: string, description: string}[]>([]);
  const [saving, setSaving] = useState(false);

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
    }
  }, [user?.id, practiceId]);

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
        .select('id, record_date, duration_minutes, session_number, method, created_at')
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
              loadRecords(); // 重新加载历史记录
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
            if (pageActiveRef.current) {
              router.back();
            } else {
              console.log('⚠️ Page not active, preventing navigation');
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
                <View key={record.id} style={{
                  backgroundColor: '#fff',
                  padding: 16,
                  marginHorizontal: 16,
                  marginVertical: 6,
                  borderRadius: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 8 }}>
                        {formatDate(record.record_date)}
                      </Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontSize: 14, color: '#7f8c8d' }}>时长：</Text>
                        <Text style={{ fontSize: 14, color: '#2c3e50', fontWeight: '500' }}>
                          {record.duration_minutes} 分钟
                        </Text>
                      </View>

                      {record.session_number && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={{ fontSize: 14, color: '#7f8c8d' }}>座数：</Text>
                          <Text style={{ fontSize: 14, color: '#2c3e50', fontWeight: '500' }}>
                            第 {record.session_number} 座
                          </Text>
                        </View>
                      )}

                      {/* 显示观修方法 */}
                      {topicTitle && (
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                          <Text style={{ fontSize: 14, color: '#7f8c8d' }}>方法：</Text>
                          <Text style={{ fontSize: 14, color: '#27ae60', fontWeight: '500', flex: 1 }}>
                            {topicTitle}
                          </Text>
                        </View>
                      )}

                      {/* 🆕 显示观后感 */}
                      {record.reflection && (
                        <View style={{ marginTop: 8 }}>
                          <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>观后感：</Text>
                          <View style={{
                            backgroundColor: '#f8f9fa',
                            padding: 10,
                            borderRadius: 6,
                            borderLeftWidth: 3,
                            borderLeftColor: '#f39c12'
                          }}>
                            <Text style={{ fontSize: 13, color: '#2c3e50', lineHeight: 18 }}>
                              {record.reflection.length > 100
                                ? `${record.reflection.substring(0, 100)}...`
                                : record.reflection
                              }
                            </Text>
                            {record.reflection_created_at && (
                              <Text style={{ fontSize: 11, color: '#95a5a6', marginTop: 4 }}>
                                记录于 {formatDate(record.reflection_created_at.split('T')[0])}
                              </Text>
                            )}
                          </View>
                        </View>
                      )}
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8, marginLeft: 12 }}>
                      <TouchableOpacity
                        onPress={() => handleEdit(record)}
                        style={{
                          backgroundColor: '#3498db',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 6
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>编辑</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDelete(record)}
                        style={{
                          backgroundColor: '#e74c3c',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 6
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>删除</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
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

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🧘 编辑观修记录</Text>
            <Text style={styles.modalSubtitle}>请修改您本次观修的信息：</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>观修时长（分钟）</Text>
              <TextInput
                style={styles.input}
                value={editDuration}
                onChangeText={setEditDuration}
                keyboardType="numeric"
                placeholder="如：30"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>选择观修内容</Text>
              {meditationTopics.length > 0 ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={editSessionNumber}
                    onValueChange={(value) => setEditSessionNumber(value)}
                    style={styles.topicPicker}
                  >
                    {meditationTopics.map((topic) => (
                      <Picker.Item 
                        key={topic.topic_number} 
                        label={`第${topic.topic_number}座 - ${topic.title}`} 
                        value={topic.topic_number} 
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={editSessionNumber.toString()}
                  onChangeText={(value) => setEditSessionNumber(parseInt(value) || 1)}
                  keyboardType="numeric"
                  placeholder="座数编号"
                />
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.confirmButton, saving && styles.confirmButtonDisabled]}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>更新记录</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sessionNumber: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  recordContent: {
    marginBottom: 12,
  },
  duration: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  method: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 6,
    overflow: 'hidden',
  },
  topicPicker: {
    backgroundColor: '#fff',
    height: 40,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});