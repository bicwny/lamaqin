import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ToastAndroid,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

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

  // Toast function for cross-platform support
  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('提示', message);
    }
  };

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

      showToast(isEditing ? '记录已更新' : `已记录 ${countNum} 次`);
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200 shadow-sm">
        <TouchableOpacity onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/practice');
          }
        }} className="py-2 mb-2">
          <Text className="text-primary text-base font-medium">← 返回</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-800 text-center mb-1">
          📝 {isEditing ? '编辑修行记录' : '记录修行数量'}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {loadingRecord ? (
          <View className="flex-1 justify-center items-center p-10 min-h-[200px]">
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text className="mt-3 text-base text-gray-600">正在加载记录...</Text>
          </View>
        ) : (
        <View className="bg-white rounded-xl p-5 mb-5 shadow-sm border border-gray-100">
          <Text className="text-2xl font-semibold text-gray-800 text-center mb-6 pb-4 border-b border-gray-200">
            📿 {practiceName}
          </Text>

          {/* Count Input */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-800 mb-1.5">本次修行数量</Text>
            <Text className="text-sm text-gray-600 mb-2 leading-5">请输入本次修行的数量，如：108</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base bg-white text-gray-800"
              value={count}
              onChangeText={setCount}
              keyboardType="numeric"
              placeholder="108"
            />
          </View>

          {/* Notes Input */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-800 mb-1.5">备注（可选）</Text>
            <Text className="text-sm text-gray-600 mb-2 leading-5">
              记录您在这次修行中的体验、感悟...
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base bg-white text-gray-800 h-24"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholder="例如：今日顶礼时心境平静，体会到三宝的加持..."
              textAlignVertical="top"
            />
            <Text className="text-xs text-gray-600 text-right mt-1">
              {notes.length} 字
            </Text>
          </View>

          <TouchableOpacity 
            className={`bg-primary rounded-xl py-4 items-center mt-6 mb-8 mx-4 ${loading ? 'opacity-60' : ''}`}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                {isEditing ? '更新记录' : '保存记录'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}