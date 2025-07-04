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
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router, useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
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
  reflection?: string;
  reflection_created_at?: string;
  created_at: string;
}

export default function MeditationHistoryScreen() {
  const { user } = useAuth();
  const navigation = useRouter();
  const { projectId, practiceId, practiceName, targetPeriod, mode } = useLocalSearchParams();
  const pageActiveRef = useRef(true);

  const [records, setRecords] = useState<MeditationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [meditationTopics, setMeditationTopics] = useState<{topic_number: number, title: string, description: string}[]>([]);

  // Record mode states
  const [isRecordMode, setIsRecordMode] = useState(mode === 'record');
  const [duration, setDuration] = useState('');
  const [sessionNumber, setSessionNumber] = useState('1');
  const [reflection, setReflection] = useState('');
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

  const validateForm = () => {
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('提示', '请输入有效的观修时长（大于0分钟）');
      return false;
    }

    const sessionNum = parseInt(sessionNumber);
    if (isNaN(sessionNum) || sessionNum < 1) {
      Alert.alert('提示', '请选择有效的观修内容');
      return false;
    }

    return true;
  };

  const handleSaveRecord = async () => {
    if (!user || !validateForm()) return;

    setSaving(true);
    try {
      const recordData = {
        user_id: user.id,
        practice_id: practiceId as string,
        record_date: new Date().toISOString().split('T')[0],
        duration_minutes: parseInt(duration),
        session_number: parseInt(sessionNumber),
        reflection: reflection.trim() || undefined
      };

      await meditationService.recordMeditationWithReflection(recordData);
      Alert.alert('成功', '观修记录已保存');
      
      // Reset form and exit record mode
      setDuration('');
      setSessionNumber('1');
      setReflection('');
      setIsRecordMode(false);
      
      // Reload records
      loadRecords(true);
    } catch (error) {
      console.error('❌ Error saving meditation record:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
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
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              console.log('🔙 Back button pressed from meditation history');
              // Always go back to practice tab
              router.replace('/(tabs)/practice');
            }}
          >
            <Text style={styles.backButtonText}>← 返回</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.recordButton, isRecordMode && styles.recordButtonActive]}
            onPress={() => setIsRecordMode(!isRecordMode)}
          >
            <Text style={[styles.recordButtonText, isRecordMode && styles.recordButtonTextActive]}>
              {isRecordMode ? '取消记录' : '📝 记录观修'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.title}>{practiceName} - 历史记录</Text>
      </View>

      {/* Record Form */}
      {isRecordMode && (
        <View style={styles.recordForm}>
          <Text style={styles.formTitle}>📝 记录新的观修</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>观修时长（分钟）</Text>
            <TextInput
              style={styles.textInput}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="请输入观修时长，如：30"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>选择观修内容</Text>
            {meditationTopics.length > 0 ? (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={parseInt(sessionNumber)}
                  onValueChange={(value) => setSessionNumber(value.toString())}
                  style={styles.picker}
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
                style={styles.textInput}
                value={sessionNumber}
                onChangeText={setSessionNumber}
                keyboardType="numeric"
                placeholder="座数编号"
              />
            )}
          </View>

          {meditationTopics.find(t => t.topic_number === parseInt(sessionNumber))?.description && (
            <View style={styles.topicDescription}>
              <Text style={styles.topicDescriptionLabel}>观修要点：</Text>
              <Text style={styles.topicDescriptionText}>
                {meditationTopics.find(t => t.topic_number === parseInt(sessionNumber))?.description}
              </Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>观后感（可选）</Text>
            <Text style={styles.inputHint}>
              记录您在这次观修中的体验、感悟和思考...
            </Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={reflection}
              onChangeText={setReflection}
              multiline
              numberOfLines={4}
              placeholder="例如：今日观修思维闲暇之本体，深感人身难得..."
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveRecord}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>💾 保存记录</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  recordButton: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  recordButtonActive: {
    backgroundColor: Colors.primary,
  },
  recordButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  recordButtonTextActive: {
    color: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  recordForm: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    lineHeight: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 40,
  },
  topicDescription: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  topicDescriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  topicDescriptionText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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