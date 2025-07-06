import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const navigateToProfile = () => {
    router.push('/(tabs)/profile');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙 夜深了，早点休息';
    if (hour < 12) return '🌅 早上好，开始今日修行';
    if (hour < 18) return '☀️ 下午好，继续精进';
    return '🌆 晚上好，回顾今日修行';
  };

  const quickActions = [
    {
      icon: 'book-outline',
      label: '学习',
      color: '#3B82F6',
      onPress: () => router.push('/(tabs)/study'),
    },
    {
      icon: 'leaf-outline',
      label: '修行',
      color: '#10B981',
      onPress: () => router.push('/(tabs)/practice'),
    },
    {
      icon: 'heart-outline',
      label: '心性',
      color: '#F59E0B',
      onPress: () => router.push('/(tabs)/mindfulness'),
    },
    {
      icon: 'bar-chart-outline',
      label: '统计',
      color: '#8B5CF6',
      onPress: () => router.push('/(tabs)/stats'),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white p-5 border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-2xl font-bold text-gray-800">🏠 首页</Text>
              <Text className="text-base text-gray-600 mt-1">{getGreeting()}</Text>
            </View>
            <TouchableOpacity onPress={navigateToProfile}>
              <Ionicons name="person-circle-outline" size={32} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Section */}
        <View className="bg-white mx-4 mt-4 p-5 rounded-xl shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            欢迎回来，{user?.email?.split('@')[0] || '修行者'}！
          </Text>
          <Text className="text-sm text-gray-600 leading-5">
            愿你的修行之路充满智慧与慈悲，每一天都有所成长。
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="mx-4 mt-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">快速操作</Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className="bg-white p-4 rounded-xl shadow-sm w-[48%] mb-3 items-center"
                onPress={action.onPress}
              >
                <Ionicons name={action.icon as any} size={32} color={action.color} />
                <Text className="text-sm font-medium text-gray-700 mt-2">{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Inspiration */}
        <View className="bg-white mx-4 mt-4 p-5 rounded-xl shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-2">📿 今日法语</Text>
          <Text className="text-sm text-gray-700 leading-6 italic">
            "一切有为法，如梦幻泡影，如露亦如电，应作如是观。"
          </Text>
          <Text className="text-xs text-gray-500 mt-2 text-right">— 《金刚经》</Text>
        </View>

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}