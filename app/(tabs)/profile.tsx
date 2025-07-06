import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
            } catch (error) {
              console.error('❌ Sign out error:', error);
              Alert.alert('错误', '退出登录失败');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      id: 1,
      title: '修行历史',
      subtitle: '查看您的修行记录',
      icon: '📿',
      color: 'bg-practice',
      onPress: () => router.push('/meditation-history')
    },
    {
      id: 2,
      title: '数据导出',
      subtitle: '导出您的修行数据',
      icon: '📊',
      color: 'bg-stats',
      onPress: () => {
        Alert.alert('功能开发中', '数据导出功能正在开发中，敬请期待！');
      }
    },
    {
      id: 3,
      title: '应用设置',
      subtitle: '个性化设置',
      icon: '⚙️',
      color: 'bg-gray-500',
      onPress: () => {
        Alert.alert('功能开发中', '设置功能正在开发中，敬请期待！');
      }
    },
    {
      id: 4,
      title: '帮助反馈',
      subtitle: '使用帮助和问题反馈',
      icon: '💬',
      color: 'bg-blue-500',
      onPress: () => {
        Alert.alert('功能开发中', '帮助反馈功能正在开发中，敬请期待！');
      }
    }
  ];

  const achievements = [
    { name: '初心者', description: '完成首次修行', earned: true, icon: '🌱' },
    { name: '坚持者', description: '连续修行7天', earned: true, icon: '🔥' },
    { name: '精进者', description: '连续修行30天', earned: false, icon: '💎' },
    { name: '觉悟者', description: '修行满100小时', earned: false, icon: '🏆' }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-profile rounded-b-3xl mx-4 mt-4 px-6 py-8">
          <View className="items-center">
            <View className="bg-white rounded-full w-20 h-20 items-center justify-center mb-4">
              <Text className="text-3xl">🧘‍♂️</Text>
            </View>
            <Text className="text-white text-xl font-bold mb-1">
              {user?.email || '修行者'}
            </Text>
            <Text className="text-white/80 text-sm">愿您法喜充满，功德无量</Text>
          </View>
        </View>

        {/* Achievements */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">修行成就</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row flex-wrap justify-between">
              {achievements.map((achievement, index) => (
                <View key={index} className="w-[22%] items-center mb-4">
                  <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
                    achievement.earned ? 'bg-buddhist-golden/20' : 'bg-gray-100'
                  }`}>
                    <Text className={`text-lg ${achievement.earned ? '' : 'opacity-30'}`}>
                      {achievement.icon}
                    </Text>
                  </View>
                  <Text className={`text-xs text-center font-medium ${
                    achievement.earned ? 'text-buddhist-golden' : 'text-gray-400'
                  }`}>
                    {achievement.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">功能菜单</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
              onPress={item.onPress}
            >
              <View className="flex-row items-center">
                <View className={`${item.color} rounded-full w-12 h-12 items-center justify-center mr-4`}>
                  <Text className="text-xl">{item.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">{item.title}</Text>
                  <Text className="text-gray-600 text-sm mt-1">{item.subtitle}</Text>
                </View>
                <Text className="text-gray-400 text-lg">›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Actions */}
        <View className="px-4 mt-6 mb-8">
          <TouchableOpacity
            className="bg-white rounded-xl p-4 shadow-sm border border-red-200"
            onPress={handleSignOut}
            disabled={loading}
          >
            <View className="flex-row items-center justify-center">
              <View className="bg-red-100 rounded-full w-12 h-12 items-center justify-center mr-4">
                <Text className="text-xl">🚪</Text>
              </View>
              <Text className="font-semibold text-red-600 flex-1">
                {loading ? '退出中...' : '退出登录'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="px-4 mb-8">
          <View className="bg-buddhist-golden/10 rounded-xl p-4 border-l-4 border-buddhist-golden">
            <Text className="text-sm font-medium text-buddhist-golden mb-1">佛法修行应用</Text>
            <Text className="text-gray-700 text-sm">
              版本 1.0.0 | 愿一切众生离苦得乐
            </Text>
            <Text className="text-xs text-gray-500 mt-2">
              "诸行无常，诸法无我，涅槃寂静" — 三法印
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}