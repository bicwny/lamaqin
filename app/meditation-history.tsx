import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getMeditationRecords } from '@/lib/database';

interface MeditationRecord {
  id: string;
  record_date: string;
  session_number: number;
  duration_minutes: number;
  reflection?: string;
  meditation_topics?: {
    title: string;
    topic_number: number;
  };
}

export default function MeditationHistoryScreen() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MeditationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeditationHistory();
  }, []);

  const loadMeditationHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getMeditationRecords(user.id);
      setRecords(data || []);
    } catch (error) {
      console.error('❌ Error loading meditation history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600">加载中...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="py-2"
          >
            <Text className="text-buddhist-golden font-medium">← 返回</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">禅修历史</Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {records.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center">
            <Text className="text-6xl mb-4">🧘‍♂️</Text>
            <Text className="text-gray-600 text-center">
              暂无禅修记录
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              开始您的第一次观修吧！
            </Text>
          </View>
        ) : (
          records.map((record) => (
            <View key={record.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-semibold text-gray-800">
                  第{record.session_number}座
                </Text>
                <Text className="text-sm text-gray-500">
                  {new Date(record.record_date).toLocaleDateString()}
                </Text>
              </View>

              {record.meditation_topics && (
                <Text className="text-gray-700 mb-2">
                  {record.meditation_topics.topic_number}. {record.meditation_topics.title}
                </Text>
              )}

              <Text className="text-buddhist-golden font-medium mb-2">
                时长: {record.duration_minutes} 分钟
              </Text>

              {record.reflection && (
                <View className="bg-gray-50 rounded-lg p-3 mt-2">
                  <Text className="text-sm text-gray-600">观后感:</Text>
                  <Text className="text-gray-700 mt-1">{record.reflection}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}