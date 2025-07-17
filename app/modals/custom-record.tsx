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
import { Colors } from '@/constants/Colors';
import { DesignSystem, createStyles } from '@/constants/ConsolidatedDesignSystem';
import { ComponentTokens, ComponentTextStyles } from '@/utils/componentTokens';
import { Typography } from '@/utils/typography';
import { toastService } from '@/lib/toast';

export default function CustomRecordScreen() {
  const { user } = useAuth();
  const { 
    projectId, 
    practiceName,
    practiceType,
    editRecordId 
  } = useLocalSearchParams<{
    projectId: string;
    practiceName: string;
    practiceType: string;
    editRecordId?: string;
  }>();

  const [count, setCount] = useState('');
  const [notes, setNotes] = useState('');
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
        user_id: user.id,
        practice_project_id: projectId,
        record_date: new Date().toISOString().split('T')[0],
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
      .eq('user_id', user.id)
      .single();

    if (currentError) throw currentError;

    // Update the record
    const { error: updateRecordError } = await supabase
      .from('daily_records')
      .update({
        count: countNum,
        notes: notes.trim() || null
      })
      .eq('id', editRecordId)
      .eq('user_id', user.id);

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
                <ActivityIndicator size="small" color={ConsolidatedConsolidatedDesignSystem.colors.primary} />
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
              <ActivityIndicator size="large" color={ConsolidatedConsolidatedDesignSystem.colors.primary} />
              <Text style={styles.loadingText}>正在加载记录...</Text>
            </View>
          ) : (
            <View style={styles.content}>
              <Text style={styles.practiceTitle}>📿 {practiceName}</Text>

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
    backgroundColor: ConsolidatedDesignSystem.colors["surface-primary"],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ConsolidatedDesignSystem.spacing.lg,
    paddingVertical: ConsolidatedDesignSystem.spacing.md,
    backgroundColor: ConsolidatedDesignSystem.colors["surface-primary"],
    borderBottomWidth: 1,
    borderBottomColor: ConsolidatedDesignSystem.colors["border-default"],
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
    paddingVertical: ConsolidatedDesignSystem.spacing.sm,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: ConsolidatedDesignSystem.spacing.lg,
  },
  practiceTitle: {
    ...createStyles.dharmaTitle('xl'),
    textAlign: 'center',
    marginBottom: ConsolidatedDesignSystem.spacing['2xl'],
    paddingBottom: ConsolidatedDesignSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: ConsolidatedDesignSystem.colors["border-default"],
  },
  inputSection: {
    marginBottom: ConsolidatedDesignSystem.spacing['2xl'],
  },
  inputLabel: {
    ...createStyles.subheading('base'),
    marginBottom: ConsolidatedDesignSystem.spacing.xs,
  },
  inputHint: {
    ...createStyles.body('sm'),
    color: ConsolidatedDesignSystem.colors["text-secondary"],
    marginBottom: ConsolidatedDesignSystem.spacing.sm,
  },
  textInput: {
    ...ComponentTokens.input.standard,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: ConsolidatedDesignSystem.spacing.md,
    paddingBottom: ConsolidatedDesignSystem.spacing.md,
  },
  characterCount: {
    ...createStyles.caption(),
    textAlign: 'right',
    marginTop: ConsolidatedDesignSystem.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ConsolidatedDesignSystem.spacing['4xl'],
    minHeight: 200,
  },
  loadingText: {
    marginTop: ConsolidatedDesignSystem.spacing.md,
    ...Typography.styles.body('base'),
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.medium,
  },
  saveHeaderButton: {
    paddingVertical: ConsolidatedDesignSystem.spacing.sm,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
    borderRadius: ConsolidatedDesignSystem.borderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveHeaderButtonDisabled: {
    opacity: 0.6,
  },
  saveHeaderButtonText: {
    ...createStyles.buttonText('primary'),
    color: ConsolidatedDesignSystem.colors["text-inverse"],
    fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
  },
});