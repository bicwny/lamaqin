import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalSearchParams, router } from 'expo-router';
import { meditationService } from '@/lib/database';
import { recordTopicSession, getTopicProgress } from '@/lib/topic-progress';

export default function MeditationRecord() {
  const { user } = useAuth();
  const { practiceId, projectId } = useLocalSearchParams<{
    practiceId: string;
    projectId: string;
  }>();

  const [duration, setDuration] = useState('');
  const [sessionNumber, setSessionNumber] = useState('');
  const [reflection, setReflection] = useState('');
  const [selectedTopicNumber, setSelectedTopicNumber] = useState<number | null>(null);
  const [availableTopics, setAvailableTopics] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(true);

  useEffect(() => {
    loadAvailableTopics();
  }, [user, projectId]);

  const loadAvailableTopics = async () => {
    if (!user || !projectId) return;

    try {
      const topicProgress = await getTopicProgress(user.id, projectId);
      setAvailableTopics(topicProgress);
    } catch (error) {
      console.error('Error loading topic progress:', error);
    } finally {
      setLoadingTopics(false);
    }
  };

  const saveMeditationRecord = async () => {
    if (!user || !practiceId || !duration) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    setSaving(true);
    try {
      const durationMinutes = parseInt(duration, 10);

      if (isNaN(durationMinutes) || durationMinutes <= 0) {
        Alert.alert('错误', '请输入有效的冥想时长');
        return;
      }

      const record = {
        user_id: user.id,
        practice_id: practiceId,
        record_date: new Date().toISOString().split('T')[0],
        duration_minutes: durationMinutes,
        session_number: sessionNumber ? parseInt(sessionNumber) : undefined,
        reflection: reflection.trim() || undefined,
        topic_number: selectedTopicNumber,
      };

      await meditationService.recordMeditationWithReflection(record);

      // If topic is selected, also update topic progress
      if (selectedTopicNumber && projectId) {
        await recordTopicSession(
          user.id,
          projectId,
          practiceId,
          selectedTopicNumber,
          durationMinutes,
          reflection.trim() || undefined
        );
      }

      Alert.alert('成功', '观修记录已保存！', [
        { text: '确定', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('保存观修记录失败:', error);
      Alert.alert('错误', '保存记录失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="p-4">
        <Text className="text-2xl font-semibold mb-4">记录观修</Text>

        <View className="mb-4">
          <Text className="text-lg font-medium text-gray-800 mb-2">
            观修时长 (分钟)
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-base"
            placeholder="例如：30"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>

        <View className="mb-4">
          <Text className="text-lg font-medium text-gray-800 mb-2">座数 (可选)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-base"
            placeholder="例如：第1座"
            value={sessionNumber}
            onChangeText={setSessionNumber}
            keyboardType="numeric"
          />
        </View>

        {/* Topic Selection */}
        {availableTopics.length > 0 && (
          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              选择观修方法 (可选)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => setSelectedTopicNumber(null)}
                  className={`px-4 py-2 rounded-full ${
                    selectedTopicNumber === null
                      ? 'bg-gray-500'
                      : 'bg-gray-200'
                  }`}
                >
                  <Text className={`font-medium ${
                    selectedTopicNumber === null
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}>
                    不选择
                  </Text>
                </TouchableOpacity>
                {availableTopics.map(topic => (
                  <TouchableOpacity
                    key={topic.topic_number}
                    onPress={() => setSelectedTopicNumber(topic.topic_number)}
                    className={`px-4 py-2 rounded-full ${
                      selectedTopicNumber === topic.topic_number
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                    }`}
                  >
                    <Text className={`font-medium ${
                      selectedTopicNumber === topic.topic_number
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}>
                      第{topic.topic_number}法
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            {selectedTopicNumber && (
              <View className="mt-2 p-3 bg-blue-50 rounded-lg">
                <Text className="text-sm text-blue-800">
                  本周进度: {availableTopics.find(t => t.topic_number === selectedTopicNumber)?.current_week_sessions || 0}/
                  {availableTopics.find(t => t.topic_number === selectedTopicNumber)?.weekly_target_sessions || 0} 座
                </Text>
              </View>
            )}
          </View>
        )}

        {loadingTopics && (
          <View className="mb-4 p-4 bg-gray-50 rounded-lg">
            <Text className="text-center text-gray-600">加载观修方法...</Text>
          </View>
        )}

        <View className="mb-4">
          <Text className="text-lg font-medium text-gray-800 mb-2">
            心得体会 (可选)
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-base h-24"
            placeholder="分享您的观修体验..."
            value={reflection}
            onChangeText={setReflection}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          className={`bg-blue-500 rounded-lg py-3 px-6 ${saving ? 'opacity-50' : ''}`}
          onPress={saveMeditationRecord}
          disabled={saving}
        >
          <Text className="text-white text-lg font-semibold text-center">
            {saving ? '保存中...' : '保存记录'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}