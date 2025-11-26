
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/Colors';
import { DesignSystem, createStyles } from '@/constants/DesignSystem';
import { ComponentTokens, ComponentTextStyles } from '@/utils/componentTokens';
import { Typography } from '@/utils/typography';
import { toastService } from '@/lib/toast';

export default function CustomRecordScreen() {
  const { user } = useAuth();
  const { 
    projectId, 
    practiceName,
    practiceType,
    editRecordId,
    selectedDate,
    returnTo
  } = useLocalSearchParams<{
    projectId: string;
    practiceName: string;
    practiceType: string;
    editRecordId?: string;
    selectedDate?: string;
    returnTo?: string;
  }>();

  const [count, setCount] = useState('');
  const [notes, setNotes] = useState('');
  const [recordDate, setRecordDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const isEditing = !!editRecordId;

  // Load existing record data when editing
  useEffect(() => {
    if (isEditing && editRecordId && user) {
      loadExistingRecord();
    }
  }, [isEditing, editRecordId, user]);

  const loadExistingRecord = async () => {
    if (!user || !editRecordId) return;

    setLoadingRecord(true);
    try {
      const { data: record, error } = await supabase
        .from('daily_records')
        .select('*')
        .eq('id', editRecordId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (record) {
        setCount(record.count.toString());
        setNotes(record.notes || '');
        setRecordDate(record.record_date);
      }
    } catch (error) {
      console.error('❌ Error loading existing record:', error);
      toastService.error({ title: '❌ 加载失败', message: '记录加载失败，请重试' });
    } finally {
      setLoadingRecord(false);
    }
  };

  const validateForm = () => {
    const countNum = parseInt(count);
    if (isNaN(countNum) || countNum <= 0) {
      toastService.error({ title: '⚠️ 输入错误', message: '请输入有效的数量（大于0）' });
      return false;
    }

    console.log('✅ Form validation passed:', { count: countNum });
    return true;
  };

  const handleSave = async () => {
    if (!user || !validateForm()) return;

    setLoading(true);
    try {
      const countNum = parseInt(count);

      if (isEditing && editRecordId) {
        // Edit existing record
        await handleEditRecord(countNum);
      } else {
        // Create new record
        await handleCreateRecord(countNum);
      }

      toastService.success({
        title: isEditing ? '✅ 记录已更新' : `✅ 已记录 ${countNum} 次`,
        message: isEditing ? undefined : '继续加油！'
      });
      router.back();
    } catch (error) {
      console.error('❌ Error saving count record:', error);
      toastService.error({ title: '❌ 保存失败', message: '记录保存失败，请检查网络后重试' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (countNum: number) => {
    // Get the project details
    const { data: project, error: projectError } = await supabase
      .from('user_practice_projects')
      .select('practice_id, current_count')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError) throw projectError;

    // Insert new record
    const { data: record, error: recordError } = await supabase
      .from('daily_records')
      .insert({
        user_id: user!.id,
        practice_project_id: projectId,
        record_date: recordDate,
        count: countNum,
        notes: notes.trim() || null
      })
      .select()
      .single();

    if (recordError) throw recordError;

    // Update project's current count
    const newCurrentCount = project.current_count + countNum;
    const { error: updateError } = await supabase
      .from('user_practice_projects')
      .update({ 
        current_count: newCurrentCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;
  };

  const handleEditRecord = async (countNum: number) => {
    // Get the current record to calculate difference
    const { data: currentRecord, error: currentError } = await supabase
      .from('daily_records')
      .select('count')
      .eq('id', editRecordId)
      .eq('user_id', user!.id)
      .single();

    if (currentError) throw currentError;

    // Update the record
    const { error: updateRecordError } = await supabase
      .from('daily_records')
      .update({
        count: countNum,
        notes: notes.trim() || null,
        record_date: recordDate
      })
      .eq('id', editRecordId)
      .eq('user_id', user!.id);

    if (updateRecordError) throw updateRecordError;

    // Update project's current count (adjust by difference)
    const countDifference = countNum - currentRecord.count;
    if (countDifference !== 0) {
      const { data: project, error: projectError } = await supabase
        .from('user_practice_projects')
        .select('current_count')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError) throw projectError;

      const newCurrentCount = project.current_count + countDifference;
      const { error: updateProjectError } = await supabase
        .from('user_practice_projects')
        .update({ 
          current_count: Math.max(0, newCurrentCount),
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (updateProjectError) throw updateProjectError;
    }
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/practice');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.container} edges={['left', 'right', 'top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {isEditing ? '编辑修行记录' : '记录修行数量'}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.saveHeaderButton, loading && styles.saveHeaderButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={DesignSystem.colors.primary} />
              ) : (
                <Text style={styles.saveHeaderButtonText}>保存</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {loadingRecord ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
              <Text style={styles.loadingText}>正在加载记录...</Text>
            </View>
          ) : (
            <View style={styles.content}>
              <Text style={styles.practiceTitle}>📿 {practiceName}</Text>

              {/* Date Selector */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>记录日期</Text>
                {Platform.OS === 'web' ? (
                  <View style={styles.dateSelector}>
                    <Ionicons name="calendar-outline" size={20} color={DesignSystem.colors.textSecondary} />
                    <input
                      type="date"
                      value={recordDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e: any) => setRecordDate(e.target.value)}
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        fontSize: 16,
                        color: DesignSystem.colors.textPrimary,
                        marginLeft: 12,
                        outline: 'none',
                        cursor: 'pointer',
                      } as any}
                    />
                  </View>
                ) : (
                  <>
                    <TouchableOpacity 
                      style={styles.dateSelector}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Ionicons name="calendar-outline" size={20} color={DesignSystem.colors.textSecondary} />
                      <Text style={styles.dateSelectorText}>
                        {new Date(recordDate + 'T12:00:00').toLocaleDateString('zh-CN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Text>
                      <Ionicons name="chevron-forward" size={20} color={DesignSystem.colors.textTertiary} />
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={new Date(recordDate + 'T12:00:00')}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(Platform.OS === 'ios');
                          if (selectedDate) {
                            setRecordDate(selectedDate.toISOString().split('T')[0]);
                          }
                        }}
                        maximumDate={new Date()}
                      />
                    )}
                  </>
                )}
              </View>

              {/* Count Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>本次修行数量</Text>
                <Text style={styles.inputHint}>请输入本次修行的数量，如：108</Text>
                <TextInput
                  style={styles.textInput}
                  value={count}
                  onChangeText={setCount}
                  keyboardType="numeric"
                  placeholder="108"
                />
              </View>

              {/* Notes Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>备注（可选）</Text>
                <Text style={styles.inputHint}>
                  记录您在这次修行中的体验、感悟...
                </Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={6}
                  placeholder="例如：今日顶礼时心境平静，体会到三宝的加持..."
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>
                  {notes.length} 字
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    ...createStyles.heading('lg'),
  },
  closeButton: {
    paddingVertical: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: DesignSystem.spacing.lg,
  },
  practiceTitle: {
    ...createStyles.dharmaTitle('xl'),
    textAlign: 'center',
    marginBottom: DesignSystem.spacing['2xl'],
    paddingBottom: DesignSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border,
  },
  inputSection: {
    marginBottom: DesignSystem.spacing['2xl'],
  },
  inputLabel: {
    ...createStyles.subheading('base'),
    marginBottom: DesignSystem.spacing.xs,
  },
  inputHint: {
    ...createStyles.body('sm'),
    color: DesignSystem.colors.textTertiary,
    marginBottom: DesignSystem.spacing.sm,
  },
  textInput: {
    ...ComponentTokens.input.standard,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: DesignSystem.spacing.md,
    paddingBottom: DesignSystem.spacing.md,
  },
  characterCount: {
    ...createStyles.caption(),
    textAlign: 'right',
    marginTop: DesignSystem.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing['4xl'],
    minHeight: 200,
  },
  loadingText: {
    marginTop: DesignSystem.spacing.md,
    ...Typography.styles.body('base'),
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  saveHeaderButton: {
    paddingVertical: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.primary,
    borderRadius: DesignSystem.borderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveHeaderButtonDisabled: {
    opacity: 0.6,
  },
  saveHeaderButtonText: {
    ...createStyles.buttonText('primary'),
    color: DesignSystem.colors.textInverse,
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.background,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
    gap: DesignSystem.spacing.sm,
  },
  dateSelectorText: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.textPrimary,
  },
});
