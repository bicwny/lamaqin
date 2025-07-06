import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function StatsScreen() {
  const handleStartTracking = () => {
    // TODO: Navigate to practice tab or setup
    console.log('Start tracking pressed');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="p-5 bg-white border-b border-gray-200">
          <Text className="text-3xl font-bold text-gray-800 mb-2">📊 统计分析</Text>
          <Text className="text-base text-gray-600">查看您的修行进展</Text>
        </View>

        <View className="flex-1 justify-center items-center p-10" style={{ minHeight: 500 }}>
          <View className="mb-6">
            <Ionicons name="bar-chart-outline" size={80} color="#9CA3AF" />
          </View>

          <Text className="text-2xl font-semibold text-gray-700 mb-3 text-center">还没有统计数据</Text>
          <Text className="text-base text-gray-600 text-center leading-6 mb-8 max-w-xs">
            开始记录修行和学习，就能看到详细的进展统计了
          </Text>

          <TouchableOpacity 
            className="flex-row items-center bg-purple-600 px-6 py-3 rounded-3xl mb-10"
            onPress={handleStartTracking}
          >
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text className="text-white text-base font-semibold ml-2">开始记录</Text>
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-base font-medium text-gray-700 mb-5">即将看到的统计：</Text>
            <View className="items-stretch">
              <View className="flex-row items-center bg-gray-50 p-3 rounded-lg mb-2 min-w-[200px]">
                <Ionicons name="trending-up" size={20} color="#059669" />
                <Text className="text-sm text-gray-700 ml-3 font-medium">修行进度趋势</Text>
              </View>
              <View className="flex-row items-center bg-gray-50 p-3 rounded-lg mb-2 min-w-[200px]">
                <Ionicons name="calendar" size={20} color="#3B82F6" />
                <Text className="text-sm text-gray-700 ml-3 font-medium">每日完成情况</Text>
              </View>
              <View className="flex-row items-center bg-gray-50 p-3 rounded-lg mb-2 min-w-[200px]">
                <Ionicons name="trophy" size={20} color="#F59E0B" />
                <Text className="text-sm text-gray-700 ml-3 font-medium">里程碑成就</Text>
              </View>
              <View className="flex-row items-center bg-gray-50 p-3 rounded-lg mb-2 min-w-[200px]">
                <Ionicons name="time" size={20} color="#8B5CF6" />
                <Text className="text-sm text-gray-700 ml-3 font-medium">学习时长统计</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}