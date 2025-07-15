import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/constants/DesignSystem';
import { meditationService } from '@/lib/database';
import PageTemplate from '@/components/PageTemplate';
import { toastService } from '@/lib/toast';

interface MeditationRecord {
  id: string;
  user_id: string;
  practice_id: string;
  record_date: string;
  duration_minutes: number;
  session_number?: number;
  method?: string;
  reflection?: string;
  reflection_created_at?: string;
  created_at: string;
}

interface Practice {
  id: string;
  name: string;
  type: string;
  unit: string;
  description: string;
}

export default function MeditationDetailScreen() {
  const { user } = useAuth();
  const { recordId } = useLocalSearchParams<{ recordId: string }>();

  const [record, setRecord] = useState<MeditationRecord | null>(null);
  const [practice, setPractice] = useState<Practice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReflection, setEditingReflection] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);

  useEffect(() => {
    if (user && recordId) {
      loadMeditationData();
    }
  }, [user, recordId]);

  const loadMeditationData = async () => {
    if (!user || !recordId) return;

    try {
      setLoading(true);

      // Load meditation record with practice info
      const { data: recordData, error: recordError } = await supabase
        .from('meditation_records')
        .select(`
          *,
          practice:practices(*)
        `)
        .eq('id', recordId)
        .eq('user_id', user.id)
        .single();

      if (recordError) throw recordError;

      setRecord(recordData);
      setPractice(recordData.practice);
      setEditingReflection(recordData.reflection || '');

    } catch (error) {
      console.error('Error loading meditation data:', error);
      toastService.error({ title: '❌ 加载失败', message: '观修记录加载失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReflection = async () => {
    if (!record || !user) return;

    try {
      setSavingReflection(true);

      const updatedRecord = await meditationService.updateMeditationReflection(
        record.id,
        editingReflection,
        user.id
      );

      setRecord(updatedRecord);
      setIsEditing(false);

      toastService.success({ 
        title: '✅ 保存成功', 
        message: '观后感已保存' 
      });

    } catch (error) {
      console.error('Error saving reflection:', error);
      toastService.error({ 
        title: '❌ 保存失败', 
        message: '观后感保存失败，请重试' 
      });
    } finally {
      setSavingReflection(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!record || !user) return;

    Alert.alert(
      '确认删除',
      '确定要删除这条观修记录吗？此操作无法撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await meditationService.deleteMeditationRecord(record.id, user.id);

              toastService.success({ 
                title: '✅ 删除成功', 
                message: '观修记录已删除' 
              });

              router.back();
            } catch (error) {
              console.error('Error deleting record:', error);
              toastService.error({ 
                title: '❌ 删除失败', 
                message: '删除失败，请重试' 
              });
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
      month: 'long',
      day: 'numeric',
      weekday: 'long'
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
        title="观修详情"
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={Colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </PageTemplate>
    );
  }

  if (!record || !practice) {
    return (
      <PageTemplate
        title="观修详情"
        showBackButton={true}
        onBackPress={() => router.back()}
        scrollable={false}
        backgroundColor={Colors.background}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>未找到观修记录</Text>
        </View>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="观修详情"
      showBackButton={true}
      onBackPress={() => router.back()}
      rightAction={{
        text: "删除",
        onPress: handleDeleteRecord
      }}
      backgroundColor={Colors.background}
      padding={0}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView}>
          {/* Record Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.header}>
              <Text style={styles.practiceTitle}>{practice.name}</Text>
              <View style={styles.sessionBadge}>
                <Text style={styles.sessionText}>
                  第{record.session_number || 1}座
                </Text>
              </View>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  {formatDate(record.record_date)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  {record.duration_minutes} 分钟
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="clock-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  记录时间：{formatTime(record.created_at)}
                </Text>
              </View>

              {record.method && (
                <View style={styles.detailRow}>
                  <Ionicons name="leaf-outline" size={20} color="#666" />
                  <Text style={styles.detailText}>
                    方法：{record.method}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Reflection Card */}
          <View style={styles.reflectionCard}>
            <View style={styles.reflectionHeader}>
              <Text style={styles.reflectionTitle}>观后感</Text>
              {!isEditing && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons name="pencil-outline" size={20} color={Colors.primary} />
                  <Text style={styles.editButtonText}>编辑</Text>
                </TouchableOpacity>
              )}
            </View>

            {isEditing ? (
              <View style={styles.editingContainer}>
                <TextInput
                  style={styles.reflectionInput}
                  value={editingReflection}
                  onChangeText={setEditingReflection}
                  placeholder="记录你的观修体验和感悟..."
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />

                <View style={styles.editingActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsEditing(false);
                      setEditingReflection(record.reflection || '');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>取消</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveButton, savingReflection && styles.disabledButton]}
                    onPress={handleSaveReflection}
                    disabled={savingReflection}
                  >
                    {savingReflection ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>保存</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.reflectionDisplay}>
                {record.reflection ? (
                  <>
                    <Text style={styles.reflectionText}>
                      {record.reflection}
                    </Text>
                    {record.reflection_created_at && (
                      <Text style={styles.reflectionTimestamp}>
                        记录于 {formatTime(record.reflection_created_at)}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.noReflectionText}>
                    暂无观后感，点击编辑添加你的感悟
                  </Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  practiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  sessionBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sessionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
  },
  reflectionCard: {
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
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  editingContainer: {
    gap: 16,
  },
  reflectionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    backgroundColor: Colors.background,
  },
  editingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  reflectionDisplay: {
    gap: 8,
  },
  reflectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  reflectionTimestamp: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  noReflectionText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});