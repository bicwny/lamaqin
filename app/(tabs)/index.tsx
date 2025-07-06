import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Platform, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  console.log('🏠 TabLayout rendering at:', new Date().toISOString());

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-gradient-to-r from-primary to-secondary px-6 py-8 rounded-b-3xl mx-4 mt-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-2xl font-bold">佛法修行</Text>
              <Text className="text-white/80 text-base mt-1">愿一切众生离苦得乐</Text>
            </View>
            <View className="bg-white/20 rounded-full p-3">
              <Text className="text-white text-xl">🙏</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">快速开始</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="bg-white rounded-xl p-4 flex-1 mr-2 shadow-sm"
              onPress={() => router.push('/add-practice')}
            >
              <View className="bg-practice/10 rounded-full w-12 h-12 items-center justify-center mb-2">
                <Text className="text-xl">📿</Text>
              </View>
              <Text className="font-semibold text-gray-800">新修行</Text>
              <Text className="text-sm text-gray-600 mt-1">添加修行项目</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-xl p-4 flex-1 ml-2 shadow-sm"
              onPress={() => router.push('/modals/meditation-record')}
            >
              <View className="bg-mindfulness/10 rounded-full w-12 h-12 items-center justify-center mb-2">
                <Text className="text-xl">🧘</Text>
              </View>
              <Text className="font-semibold text-gray-800">快速记录</Text>
              <Text className="text-sm text-gray-600 mt-1">记录今日修行</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Progress */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">今日进展</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-semibold text-gray-800">修行完成度</Text>
              <Text className="text-sm text-gray-600">0 / 3 项目</Text>
            </View>
            <View className="bg-gray-100 rounded-full h-2 mb-2">
              <View className="bg-primary rounded-full h-2" style={{ width: '0%' }} />
            </View>
            <Text className="text-xs text-gray-500">今日还未开始修行，愿您法喜充满 🙏</Text>
          </View>
        </View>

        {/* Motivation */}
        <View className="px-4 mt-6 mb-8">
          <View className="bg-buddhist-golden/10 rounded-xl p-4 border-l-4 border-buddhist-golden">
            <Text className="text-sm font-medium text-buddhist-golden mb-1">每日法语</Text>
            <Text className="text-gray-700 italic">
              "心如工画师，能画诸世间。五蕴悉从生，无法而不造。"
            </Text>
            <Text className="text-xs text-gray-500 mt-2">— 《华严经》</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}