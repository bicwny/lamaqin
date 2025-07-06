import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

interface Practice {
  id: string;
  name: string;
  type: string;
  unit: string;
  description: string;
}

export default function AddPracticeScreen() {
  const { user } = useAuth();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadPractices();
  }, []);

  const loadPractices = async () => {
    try {
      console.log('🔄 Loading available practices...');

      // Get all practices that user doesn't already have
      const { data: allPractices, error: practicesError } = await supabase
        .from('practices')
        .select('*')
        .order('name');

      if (practicesError) throw practicesError;

      // Get user's existing practice projects
      const { data: userProjects, error: projectsError } = await supabase
        .from('user_practice_projects')
        .select('practice_id')
        .eq('user_id', user?.id);

      if (projectsError) throw projectsError;

      // Filter out practices user already has
      const existingPracticeIds = new Set(userProjects?.map(p => p.practice_id) || []);
      const availablePractices = allPractices?.filter(p => !existingPracticeIds.has(p.id)) || [];

      console.log('📋 Available practices:', availablePractices.length);
      console.log('🔍 Available practice names:', availablePractices.map(p => p.name));
      console.log('🚫 Existing practice IDs:', Array.from(existingPracticeIds));
      setPractices(availablePractices);
    } catch (error) {
      console.error('Error loading practices:', error);
      Alert.alert('错误', '加载修行项目失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeSelect = (practice: Practice) => {
    // Navigate to configuration page with practice details
    router.push({
      pathname: '/practice-config',
      params: {
        practiceId: practice.id,
        practiceName: practice.name,
        practiceType: practice.type,
        practiceUnit: practice.unit,
      },
    });
  };

  const renderPracticeSelector = () => (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 mb-3">选择修行项目</Text>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {practices.map((practice) => (
          <TouchableOpacity
            key={practice.id}
            className="bg-white rounded-xl p-4 mb-3 border border-gray-200 shadow-sm"
            onPress={() => handlePracticeSelect(practice)}
          >
            <Text className="text-base font-semibold text-gray-800 mb-1">
              {practice.name}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">
              {practice.type === 'count' ? '计数类' : '计时类'} • {practice.unit}
            </Text>
            {practice.description && (
              <Text className="text-xs text-gray-500">{practice.description}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Stack.Screen options={{ title: '添加修法', headerShown: true }} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-4 text-base text-gray-600">加载修行项目中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (practices.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Stack.Screen options={{ title: '添加修法', headerShown: true }} />
        <View className="flex-1 justify-center items-center p-8">
          <Text className="text-2xl font-semibold text-gray-800 mb-4 text-center">😊 您已添加所有修行项目</Text>
          <Text className="text-base text-gray-600 mb-8 text-center">
            目前没有新的修行项目可以添加
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white text-base font-semibold">返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: '添加修法', headerShown: true }} />

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {renderPracticeSelector()}
      </ScrollView>
    </SafeAreaView>
  );
}