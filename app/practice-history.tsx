import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getPracticeRecords } from '@/lib/database';

interface PracticeRecord {
  id: string;
  record_date: string;
  count: number;
  practices: {
    name: string;
    unit: string;
  };
}

export default function PracticeHistoryScreen() {
  const { user } = useAuth();
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPracticeHistory();
  }, []);

  const loadPracticeHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getPracticeRecords(user.id);
      setRecords(data || []);
    } catch (error) {
      console.error('❌ Error loading practice history:', error);
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
          <Text className="text-xl font-bold text-gray-800">修行历史</Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        {records.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center">
            <Text className="text-6xl mb-4">📿</Text>
            <Text className="text-gray-600 text-center">
              暂无修行记录
            </Text>
            <Text className="text-gray-500 text-center mt-2">
              开始您的修行之旅吧！
            </Text>
          </View>
        ) : (
          records.map((record) => (
            <View key={record.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-lg font-semibold text-gray-800">
                    {record.practices.name}
                  </Text>
                  <Text className="text-buddhist-golden font-medium">
                    {record.count} {record.practices.unit}
                  </Text>
                </View>
                <Text className="text-sm text-gray-500">
                  {new Date(record.record_date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}