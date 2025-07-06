import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPracticeProjects, getUserMeditationRecords } from '@/lib/database';

interface StatsData {
  totalProjects: number;
  activeProjects: number;
  totalSessions: number;
  totalTime: number;
  streak: number;
  weeklyProgress: number[];
}

export default function StatsScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    totalProjects: 0,
    activeProjects: 0,
    totalSessions: 0,
    totalTime: 0,
    streak: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0]
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadStats();
  }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [projects, records] = await Promise.all([
        getUserPracticeProjects(user.id),
        getUserMeditationRecords(user.id)
      ]);

      console.log('📅 Loaded records:', records?.length || 0);

      const totalSessions = records?.length || 0;
      const totalTime = records?.reduce((sum, record) => sum + (record.duration || 0), 0) || 0;

      setStats({
        totalProjects: projects?.length || 0,
        activeProjects: projects?.filter(p => p.status === 'active').length || 0,
        totalSessions,
        totalTime,
        streak: calculateStreak(records || []),
        weeklyProgress: calculateWeeklyProgress(records || [])
      });
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (records: any[]) => {
    if (!records || records.length === 0) return 0;

    const sortedRecords = records
      .map(r => new Date(r.created_at).toDateString())
      .sort()
      .filter((date, index, arr) => arr.indexOf(date) === index);

    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (sortedRecords.includes(today) || sortedRecords.includes(yesterday)) {
      streak = 1;
      // Calculate consecutive days
      for (let i = sortedRecords.length - 2; i >= 0; i--) {
        const currentDate = new Date(sortedRecords[i + 1]);
        const prevDate = new Date(sortedRecords[i]);
        const diffTime = currentDate.getTime() - prevDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    return streak;
  };

  const calculateWeeklyProgress = (records: any[]) => {
    const weekData = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    records?.forEach(record => {
      const recordDate = new Date(record.created_at);
      if (recordDate >= oneWeekAgo) {
        const dayOfWeek = recordDate.getDay();
        weekData[dayOfWeek] += record.duration || 0;
      }
    });

    return weekData;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  };

  const statCards = [
    {
      title: '修行项目',
      value: stats.activeProjects,
      total: stats.totalProjects,
      icon: '📿',
      color: 'bg-practice',
      suffix: '个'
    },
    {
      title: '修行时长',
      value: stats.totalTime,
      icon: '⏱️',
      color: 'bg-mindfulness',
      formatter: formatTime
    },
    {
      title: '修行次数',
      value: stats.totalSessions,
      icon: '🔢',
      color: 'bg-study',
      suffix: '次'
    },
    {
      title: '连续天数',
      value: stats.streak,
      icon: '🔥',
      color: 'bg-stats',
      suffix: '天'
    }
  ];

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-green-500 rounded-b-3xl mx-4 mt-4 px-6 py-8">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-2xl font-bold">修行统计</Text>
              <Text className="text-white/80 text-base mt-1">记录您的修行历程</Text>
            </View>
            <View className="bg-white/20 rounded-full p-3">
              <Text className="text-white text-xl">📊</Text>
            </View>
          </View>
        </View>

        {/* Period Selector */}
        <View className="px-4 mt-6">
          <View className="bg-white rounded-xl p-2 shadow-sm flex-row">
            {(['week', 'month', 'year'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                className={`flex-1 py-2 rounded-lg ${
                  selectedPeriod === period ? 'bg-green-500' : 'bg-transparent'
                }`}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text className={`text-center font-medium ${
                  selectedPeriod === period ? 'text-white' : 'text-gray-600'
                }`}>
                  {period === 'week' ? '本周' : period === 'month' ? '本月' : '今年'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Cards */}
        <View className="px-4 mt-4">
          <View className="flex-row flex-wrap justify-between">
            {statCards.map((card, index) => (
              <View key={index} className="w-[48%] bg-white rounded-xl p-4 mb-4 shadow-sm">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 text-sm">{card.title}</Text>
                  <View className={`${card.color} rounded-full w-8 h-8 items-center justify-center`}>
                    <Text className="text-white text-sm">{card.icon}</Text>
                  </View>
                </View>
                <Text className="text-2xl font-bold text-gray-800">
                  {card.formatter ? card.formatter(card.value) : `${card.value}${card.suffix || ''}`}
                </Text>
                {card.total !== undefined && (
                  <Text className="text-xs text-gray-500 mt-1">
                    总共 {card.total} 个
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Progress Chart */}
        <View className="px-4 mt-2">
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="font-semibold text-gray-800 mb-4">本周修行时长</Text>
            <View className="flex-row items-end justify-between h-32">
              {stats.weeklyProgress.map((minutes, index) => {
                const maxHeight = Math.max(...stats.weeklyProgress);
                const height = maxHeight > 0 ? (minutes / maxHeight) * 80 : 0;

                return (
                  <View key={index} className="items-center flex-1">
                    <View className="flex-1 justify-end items-center">
                      <View
                        className="bg-green-500 rounded-t w-6"
                        style={{ height: Math.max(height, 2) }}
                      />
                    </View>
                    <Text className="text-xs text-gray-600 mt-2">{weekDays[index]}</Text>
                    <Text className="text-xs text-gray-400">{minutes}分</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Achievement */}
        <View className="px-4 mt-6 mb-8">
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-semibold text-gray-800 mb-1">修行成就</Text>
                <Text className="text-gray-600 text-sm">
                  {stats.streak > 0 
                    ? `连续修行 ${stats.streak} 天，功德无量！` 
                    : '开始您的修行之旅吧！'
                  }
                </Text>
              </View>
              <View className="bg-yellow-100 rounded-full p-3">
                <Text className="text-2xl">🏆</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}