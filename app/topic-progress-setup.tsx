
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { meditationService } from '@/lib/database';

interface MeditationTopic {
  id: string;
  topic_number: number;
  title: string;
  description?: string;
}

export default function TopicProgressSetup() {
  const { user } = useAuth();
  const { projectId, practiceId } = useLocalSearchParams<{
    projectId: string;
    practiceId: string;
  }>();
  
  const [topics, setTopics] = useState<MeditationTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Set<number>>(new Set());
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTopics();
  }, [practiceId]);

  const loadTopics = async () => {
    try {
      const topicsData = await meditationService.getMeditationTopics(practiceId);
      setTopics(topicsData);
    } catch (error) {
      console.error('Error loading topics:', error);
      Alert.alert('错误', '加载观修方法失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicNumber: number) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topicNumber)) {
      newSelected.delete(topicNumber);
    } else {
      newSelected.add(topicNumber);
    }
    setSelectedTopics(newSelected);
  };

  const saveTopicProgress = async () => {
    if (!user || selectedTopics.size === 0) {
      Alert.alert('提示', '请选择至少一个观修方法');
      return;
    }

    setSaving(true);
    try {
      const topicProgressData = Array.from(selectedTopics).map(topicNumber => ({
        user_id: user.id,
        practice_project_id: projectId,
        topic_number: topicNumber,
        weekly_target_sessions: weeklyTarget,
        current_week_sessions: 0,
        current_week_start_date: new Date().toISOString().split('T')[0],
        total_completed_weeks: 0,
        is_current_week_complete: false,
        last_session_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('user_practice_topic_progress')
        .insert(topicProgressData);

      if (error) throw error;

      Alert.alert('成功', '观修方法进度设置完成！', [
        { text: '确定', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving topic progress:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-gray-600">加载观修方法...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            设置观修方法进度
          </Text>
          <Text className="text-gray-600">
            选择要跟踪的观修方法，设定每周目标座数
          </Text>
        </View>

        <View className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            每周目标座数
          </Text>
          <View className="flex-row justify-around">
            {[1, 2, 3, 4, 5].map(num => (
              <TouchableOpacity
                key={num}
                onPress={() => setWeeklyTarget(num)}
                className={`px-4 py-2 rounded-full ${
                  weeklyTarget === num 
                    ? 'bg-blue-500' 
                    : 'bg-gray-200'
                }`}
              >
                <Text className={`font-medium ${
                  weeklyTarget === num 
                    ? 'text-white' 
                    : 'text-gray-700'
                }`}>
                  {num}座
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            选择观修方法 ({selectedTopics.size}/{topics.length})
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity
              onPress={() => {
                if (selectedTopics.size === topics.length) {
                  setSelectedTopics(new Set());
                } else {
                  setSelectedTopics(new Set(topics.map(t => t.topic_number)));
                }
              }}
              className="mb-4 px-4 py-2 bg-blue-100 rounded-lg"
            >
              <Text className="text-blue-600 font-medium">
                {selectedTopics.size === topics.length ? '全部取消' : '全部选择'}
              </Text>
            </TouchableOpacity>
          </View>

          {topics.map(topic => (
            <TouchableOpacity
              key={topic.id}
              onPress={() => toggleTopic(topic.topic_number)}
              className={`mb-3 p-4 rounded-lg border-2 ${
                selectedTopics.has(topic.topic_number)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="font-medium text-gray-800">
                    第{topic.topic_number}法：{topic.title}
                  </Text>
                  {topic.description && (
                    <Text className="text-sm text-gray-600 mt-1">
                      {topic.description}
                    </Text>
                  )}
                </View>
                <View className={`w-6 h-6 rounded-full border-2 ml-3 ${
                  selectedTopics.has(topic.topic_number)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedTopics.has(topic.topic_number) && (
                    <Text className="text-white text-center text-xs font-bold">✓</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={saveTopicProgress}
          disabled={saving || selectedTopics.size === 0}
          className={`p-4 rounded-lg mb-8 ${
            saving || selectedTopics.size === 0
              ? 'bg-gray-300'
              : 'bg-blue-500'
          }`}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {saving ? '保存中...' : '保存设置'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
