import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Practice {
  id: string;
  name: string;
  description: string;
  type: 'time' | 'count';
  default_duration_minutes?: number;
}

export default function AddPractice() {
  const { user } = useAuth();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [projectName, setProjectName] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [customPracticeName, setCustomPracticeName] = useState('');

  useEffect(() => {
    loadPractices();
  }, []);

  const loadPractices = async () => {
    try {
      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .order('name');

      if (error) throw error;
      setPractices(data || []);
    } catch (error) {
      console.error('Error loading practices:', error);
      Alert.alert('错误', '加载修行方法失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!user) return;

    if (!projectName.trim()) {
      Alert.alert('错误', '请输入项目名称');
      return;
    }

    if (isCustom && !customPracticeName.trim()) {
      Alert.alert('错误', '请输入自定义修行方法名称');
      return;
    }

    if (!isCustom && !selectedPractice) {
      Alert.alert('错误', '请选择修行方法');
      return;
    }

    try {
      let practiceId = selectedPractice?.id;

      // If it's a custom practice, create it first
      if (isCustom) {
        const { data: newPractice, error: practiceError } = await supabase
          .from('practices')
          .insert({
            name: customPracticeName.trim(),
            description: '自定义修行方法',
            type: 'time',
            default_duration_minutes: 30
          })
          .select()
          .single();

        if (practiceError) throw practiceError;
        practiceId = newPractice.id;
      }

      // Create the practice project
      const { error } = await supabase
        .from('practice_projects')
        .insert({
          user_id: user.id,
          practice_id: practiceId,
          name: projectName.trim(),
          status: 'active'
        });

      if (error) throw error;

      Alert.alert(
        '成功',
        '修行项目创建成功',
        [
          {
            text: '确定',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('错误', '创建项目失败');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>加载中...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            className="p-2 mr-3"
            onPress={() => router.back()}
          >
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">
            添加修行项目
          </Text>
        </View>

        {/* Project Name Input */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            项目名称
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 text-base bg-white"
            placeholder="为您的修行项目起个名字"
            value={projectName}
            onChangeText={setProjectName}
          />
        </View>

        {/* Practice Type Toggle */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            修行方法
          </Text>
          <View className="flex-row mb-4">
            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg mr-2 ${!isCustom ? 'bg-primary' : 'bg-gray-100'}`}
              onPress={() => setIsCustom(false)}
            >
              <Text className={`text-center font-semibold ${!isCustom ? 'text-white' : 'text-gray-600'}`}>
                选择现有方法
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg ml-2 ${isCustom ? 'bg-primary' : 'bg-gray-100'}`}
              onPress={() => setIsCustom(true)}
            >
              <Text className={`text-center font-semibold ${isCustom ? 'text-white' : 'text-gray-600'}`}>
                自定义方法
              </Text>
            </TouchableOpacity>
          </View>

          {isCustom ? (
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base bg-white"
              placeholder="输入自定义修行方法名称"
              value={customPracticeName}
              onChangeText={setCustomPracticeName}
            />
          ) : (
            <View>
              {practices.map((practice) => (
                <TouchableOpacity
                  key={practice.id}
                  className={`p-4 rounded-lg mb-2 border ${selectedPractice?.id === practice.id ? 'bg-yellow-100 border-primary' : 'bg-white border-gray-200'}`}
                  onPress={() => setSelectedPractice(practice)}
                >
                  <Text className="text-base font-semibold text-gray-800 mb-1">
                    {practice.name}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {practice.description}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    类型: {practice.type === 'time' ? '时间' : '次数'}
                    {practice.default_duration_minutes && ` • 建议: ${practice.default_duration_minutes}分钟`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Create Button */}
        <TouchableOpacity
          className="bg-primary rounded-lg p-4 items-center mb-8"
          onPress={handleCreateProject}
        >
          <Text className="text-white text-base font-bold">
            创建项目
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}