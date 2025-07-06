import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  ToastAndroid,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { meditationService } from '@/lib/database';
import { Colors } from '@/constants/Colors';

export default function MeditationRecordScreen() {
  const { user } = useAuth();
  const { 
    practiceId, 
    practiceProjectId, 
    practiceName,
    editRecordId 
  } = useLocalSearchParams<{
    practiceId: string;
    practiceProjectId: string;
    practiceName: string;
    editRecordId?: string;
  }>();

  const [duration, setDuration] = useState('');
  const [sessionNumber, setSessionNumber] = useState('1');
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [meditationTopics, setMeditationTopics] = useState<Array<{
    topic_number: number;
    title: string;
    description?: string;
  }>>([]);

  const isEditing = !!editRecordId;

  // Toast function for cross-platform support
  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('提示', message);
    }
  };

  useEffect(() => {
    loadMeditationTopics();
    if (isEditing) {
      loadExistingRecord();
    }
  }, []);

  const loadMeditationTopics = async () => {
    try {
      console.log('🔄 Loading meditation topics for practice:', practiceId);
      const topics = await meditationService.getMeditationTopics(practiceId);
      setMeditationTopics(topics);
      console.log('📚 Loaded meditation topics:', topics.length);
    } catch (error) {
      console.error('❌ Error loading meditation topics:', error);
    } finally {
      setLoadingTopics(false);
    }
  };

  const loadExistingRecord = async () => {
    if (!user || !editRecordId) return;

    try {
      const record = await meditationService.getMeditationRecordWithReflection(editRecordId, user.id);
      if (record) {
        setDuration(record.duration_minutes.toString());
        setSessionNumber(record.session_number?.toString() || '1');
        setReflection(record.reflection || '');
      }
    } catch (error) {
      console.error('❌ Error loading existing record:', error);
      Alert.alert('错误', '加载记录失败');
    }
  };

  const validateForm = () => {
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert('提示', '请输入有效的观修时长（大于0分钟）');
      return false;
    }

    const sessionNum = parseInt(sessionNumber);
    if (isNaN(sessionNum) || sessionNum < 1) {
      Alert.alert('提示', '请选择有效的观修内容');
      return false;
    }

    console.log('✅ Form validation passed:', { duration: durationNum, sessionNumber: sessionNum });
    return true;
  };

  const handleSave = async () => {
    if (!user || !validateForm()) return;

    setLoading(true);
    try {
      const recordData = {
        user_id: user.id,
        practice_id: practiceId,
        record_date: new Date().toISOString().split('T')[0],
        duration_minutes: parseInt(duration),
        session_number: parseInt(sessionNumber),
        reflection: reflection.trim() || undefined
      };

      if (isEditing) {
        await meditationService.updateMeditationRecord(editRecordId, user.id, {
          duration_minutes: recordData.duration_minutes,
          session_number: recordData.session_number,
          reflection: recordData.reflection
        });
        console.log('✅ Meditation record updated successfully');
        showToast('观修记录已更新');
        // Navigate back with a small delay to ensure toast shows
        setTimeout(() => {
          router.back();
        }, 500);
      } else {
        const savedRecord = await meditationService.recordMeditationWithReflection(recordData);
        console.log('✅ Record saved successfully');

        // Show success toast
        showToast('观修记录已保存成功');

        // Navigate back to practice page
        router.back();
      }
    } catch (error) {
      console.error('❌ Error saving meditation record:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const selectedTopic = meditationTopics.find(t => t.topic_number === parseInt(sessionNumber));

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200 shadow-sm">
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/practice');
            }
          }} 
          className="py-2 mb-2"
        >
          <Text className="text-primary text-base font-medium">← 返回</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-800 text-center mb-1">
          📝 {isEditing ? '编辑观修记录' : '记录新的观修'}
        </Text>
      </View>

      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <View className="bg-white rounded-xl p-5 mb-5 shadow-sm">
            <Text className="text-2xl font-semibold text-gray-800 text-center mb-6 pb-4 border-b border-gray-200">
              📿 {practiceName}
            </Text>

            {/* Duration Input */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-800 mb-1.5">观修时长（分钟）</Text>
              <Text className="text-sm text-gray-600 mb-2 leading-5">请输入观修时长，如：30</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-white text-gray-800"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                placeholder="30"
              />
            </View>

            {/* Topic Selection - only show if there are topics or still loading */}
            {(loadingTopics || meditationTopics.length > 0) && (
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-800 mb-1.5">选择观修内容</Text>
                {loadingTopics ? (
                  <ActivityIndicator className="p-5" />
                ) : meditationTopics.length > 0 ? (
                  <View className={`border border-gray-300 rounded-lg bg-white overflow-hidden ${Platform.OS === 'ios' ? 'min-h-[200px] px-0' : ''}`}>
                    <Picker
                      selectedValue={parseInt(sessionNumber)}
                      onValueChange={(value) => setSessionNumber(value.toString())}
                      className={`h-12 text-gray-800 ${Platform.OS === 'android' ? 'bg-white' : ''}`}
                    >
                      {meditationTopics.map((topic) => (
                        <Picker.Item 
                          key={topic.topic_number} 
                          label={`第${topic.topic_number}座 - ${topic.title}`} 
                          value={topic.topic_number} 
                        />
                      ))}
                    </Picker>
                  </View>
                ) : null}
              </View>
            )}

            {/* Topic Description - only show if topics exist and there's a selected topic */}
            {meditationTopics.length > 0 && selectedTopic?.description && (
              <View className="bg-yellow-50 rounded-lg p-4 mb-4 border-l-4 border-yellow-400">
                <Text className="text-sm font-semibold text-yellow-800 mb-1.5">观修要点：</Text>
                <Text className="text-sm text-yellow-800 leading-5">
                  {selectedTopic.description}
                </Text>
              </View>
            )}

            {/* Reflection Input */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-800 mb-1.5">观后感（可选）</Text>
              <Text className="text-sm text-gray-600 mb-2 leading-5">
                记录您在这次观修中的体验、感悟和思考...
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base bg-white text-gray-800 h-30 pt-3 pb-3"
                value={reflection}
                onChangeText={setReflection}
                multiline
                numberOfLines={6}
                placeholder="例如：今日观修思维闲暇之本体，深感人身难得..."
                textAlignVertical="top"
              />
              <Text className="text-xs text-gray-600 text-right mt-1">
                {reflection.length} 字
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              className={`bg-yellow-400 rounded-lg py-4 items-center mt-6 mb-8 shadow-sm ${loading ? 'opacity-60' : ''}`}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-gray-800 text-lg font-semibold">💾 保存记录</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}