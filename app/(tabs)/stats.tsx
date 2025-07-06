import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StatsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-2xl font-bold text-gray-800 mb-4">
          📊 修行统计
        </Text>
        <Text className="text-gray-600 text-center">
          Start building your stats screen here
        </Text>
      </View>
    </SafeAreaView>
  );
}