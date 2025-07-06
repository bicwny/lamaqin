import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomRecordModal() {
  const { user } = useAuth();
  const { projectId } = useLocalSearchParams();
  const [duration, setDuration] = useState('');
  const [count, setCount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user || !projectId) return;

    if (!duration && !count) {
      Alert.alert('错误', '请输入持续时间或次数');
      return;
    }

    setLoading(true);
    try {
      const recordData: any = {
        user_id: user.id,
        practice_project_id: projectId,
        practice_date: new Date().toISOString().split('T')[0],
        notes: notes.trim() || null,
      };

      if (duration) {
        recordData.duration_minutes = parseInt(duration);
      }

      if (count) {
        recordData.repetitions = parseInt(count);
      }

      const { error } = await supabase
        .from('practice_records')
        .insert(recordData);

      if (error) throw error;

      Alert.alert(
        '记录成功',
        '修行记录已保存',
        [
          {
            text: '确定',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving record:', error);
      Alert.alert('错误', '保存记录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-bold text-gray-800">
            记录修行
          </Text>
          <TouchableOpacity
            className="p-2"
            onPress={() => router.back()}
          >
            <Text className="text-lg text-gray-600">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Duration Input */}
        <View className="mb-5">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            持续时间 (分钟)
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-base bg-white"
            placeholder="例如: 30"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>

        {/* Count Input */}
        <View className="mb-5">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            次数
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-base bg-white"
            placeholder="例如: 108"
            value={count}
            onChangeText={setCount}
            keyboardType="numeric"
          />
        </View>

        {/* Notes Input */}
        <View className="mb-8">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            修行心得 (可选)
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-base bg-white h-24"
            placeholder="分享您的修行体验..."
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className={`bg-primary rounded-lg p-4 items-center ${loading ? 'opacity-60' : ''}`}
          onPress={handleSave}
          disabled={loading}
        >
          <Text className="text-white text-base font-bold">
            {loading ? '保存中...' : '保存记录'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}