import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function MindfulnessScreen() {
  const { user } = useAuth();
  const [currentMood, setCurrentMood] = useState<string | null>(null);

  const moods = [
    { emoji: '😊', label: '喜悦', value: 'joyful' },
    { emoji: '😌', label: '平静', value: 'peaceful' },
    { emoji: '🤔', label: '思考', value: 'contemplative' },
    { emoji: '😔', label: '忧愁', value: 'sad' },
    { emoji: '😤', label: '烦躁', value: 'frustrated' },
    { emoji: '😴', label: '疲惫', value: 'tired' },
  ];

  const mindfulnessActivities = [
    {
      id: 1,
      title: '观呼吸冥想',
      duration: '10分钟',
      description: '专注于呼吸，让心平静下来',
      icon: '🫁',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: '慈心禅修',
      duration: '15分钟',
      description: '培养对自己和他人的慈爱',
      icon: '💖',
      color: 'bg-pink-500'
    },
    {
      id: 3,
      title: '行禅',
      duration: '20分钟',
      description: '在行走中保持正念',
      icon: '🚶',
      color: 'bg-green-500'
    },
    {
      id: 4,
      title: '身体扫描',
      duration: '25分钟',
      description: '觉察身体各部位的感受',
      icon: '🧘',
      color: 'bg-purple-500'
    }
  ];

  const quotes = [
    "心如明镜台，时时勤拂拭",
    "一念清净，莲花处处开",
    "当下即是，无处不在",
    "观照内心，自然安住",
    "放下执著，心得自在"
  ];

  const todayQuote = quotes[new Date().getDate() % quotes.length];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-pink-500 rounded-b-3xl mx-4 mt-4 px-6 py-8">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-2xl font-bold">心性觉察</Text>
              <Text className="text-white opacity-80 text-base mt-1">觉知当下，安住内心</Text>
            </View>
            <View className="bg-white opacity-20 rounded-full p-3">
              <Text className="text-white text-xl">💝</Text>
            </View>
          </View>
        </View>

        {/* Current Mood */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">此刻心境</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-gray-600 mb-3">您现在的感受如何？</Text>
            <View className="flex-row flex-wrap justify-between">
              {moods.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  className={`rounded-xl p-3 mb-2 items-center w-1/3 ${
                    currentMood === mood.value ? 'bg-pink-100 border-2 border-pink-500' : 'bg-gray-50'
                  }`}
                  onPress={() => setCurrentMood(mood.value)}
                >
                  <Text className="text-2xl mb-1">{mood.emoji}</Text>
                  <Text className="text-xs text-gray-600">{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Mindfulness Activities */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">正念练习</Text>
          {mindfulnessActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
              onPress={() => {
                router.push('/modals/meditation-record');
              }}
            >
              <View className="flex-row items-center">
                <View className={`${activity.color} rounded-full w-12 h-12 items-center justify-center mr-4`}>
                  <Text className="text-xl">{activity.icon}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center">
                    <Text className="font-semibold text-gray-800">{activity.title}</Text>
                    <Text className="text-sm text-gray-500">{activity.duration}</Text>
                  </View>
                  <Text className="text-gray-600 text-sm mt-1">{activity.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Reflection */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">今日省思</Text>
          <TouchableOpacity 
            className="bg-white rounded-xl p-4 shadow-sm"
            onPress={() => {
              // Navigate to reflection journal
              console.log('Open reflection journal');
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-semibold text-gray-800 mb-1">记录内心感悟</Text>
                <Text className="text-gray-600 text-sm">写下今天的体验和感受</Text>
              </View>
              <View className="bg-pink-100 rounded-full p-3">
                <Text className="text-xl">📝</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Mindfulness Quote */}
        <View className="px-4 mt-6 mb-8">
          <View className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-600">
            <Text className="text-sm font-medium text-yellow-600 mb-1">正念箴言</Text>
            <Text className="text-gray-700 italic text-center text-lg">
              {todayQuote}
            </Text>
            <Text className="text-xs text-gray-500 mt-3 text-center">
              今日第 {new Date().getDate()} 天的修行提醒
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}