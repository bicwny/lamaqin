import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { ComponentTokens } from '@/utils/componentTokens';
import { toastService } from '@/lib/toast';
import ModalTemplate from '@/components/ModalTemplate';

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
      Alert.alert('错误', '加载记录失败');
    } finally {
      setLoadingRecord(false);
    }
  };

  const validateForm = () => {
    const countNum = parseInt(count);
    if (isNaN(countNum) || countNum <= 0) {
      Alert.alert('提示', '请输入有效的数量（大于0）');
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
        title: isEditing ? '记录已更新' : `已记录 ${countNum} 次`,
        message: isEditing ? undefined : '继续加油！'
      });
      router.back();
    } catch (error) {
      console.error('❌ Error saving count record:', error);
      Alert.alert('错误', `保存失败，请重试: ${error.message || '未知错误'}`);
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

  return (
    <ModalTemplate
      title={isEditing ? '编辑修行记录' : '记录修行数量'}
      onClose={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/practice');
        }
      }}
      scrollable={true}
      showCloseButton={true}
      variant="dialog"
      size="default"
    >
        {loadingRecord ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>正在加载记录...</Text>
          </View>
        ) : (
        <View style={styles.formContainer}>
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
              numberOfLines={4}
              placeholder="例如：今日顶礼时心境平静，体会到三宝的加持..."
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {notes.length} 字
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? '更新记录' : '保存记录'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        )}
    </ModalTemplate>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  practiceTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  inputSection: {
    marginBottom: 24
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6
  },
  inputHint: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    lineHeight: 20
  },
  textInput: {
    ...ComponentTokens.input.standard,
  },
  multilineInput: {
    ...ComponentTokens.input.textarea,
    height: 100,
  },
  characterCount: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 4
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
    marginHorizontal: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  }
});