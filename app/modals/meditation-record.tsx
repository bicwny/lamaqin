import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function MeditationRecordModal() {
  const { user } = useAuth();
  const { topicId, topicNumber } = useLocalSearchParams();
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user || !topicId) return;

    if (!duration || parseInt(duration) <= 0) {
      Alert.alert('错误', '请输入有效的冥想时长');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('meditation_records')
        .insert({
          user_id: user.id,
          topic_id: topicId,
          duration_minutes: parseInt(duration),
          notes: notes.trim() || null,
          meditation_date: new Date().toISOString()
        });

      if (error) throw error;

      Alert.alert(
        '记录成功',
        `第${topicNumber}个法门冥想记录已保存`,
        [
          {
            text: '确定',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error saving meditation record:', error);
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
            记录冥想 - 第{topicNumber}个法门
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
            冥想时长 (分钟)
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-base bg-white"
            placeholder="30"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>

        {/* Quick Duration Buttons */}
        <View className="mb-5">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            快速选择
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {[15, 30, 45, 60].map((minutes) => (
              <TouchableOpacity
                key={minutes}
                className={`px-4 py-2 rounded-md ${duration === minutes.toString() ? 'bg-primary' : 'bg-gray-100'}`}
                onPress={() => setDuration(minutes.toString())}
              >
                <Text className={`font-medium ${duration === minutes.toString() ? 'text-white' : 'text-gray-600'}`}>
                  {minutes}分钟
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes Input */}
        <View className="mb-8">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            冥想体验 (可选)
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-base bg-white h-24"
            placeholder="分享您的冥想体验和感悟..."
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