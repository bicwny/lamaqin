import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('错误', '请填写所有字段');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('错误', '密码不匹配');
      return;
    }

    if (password.length < 6) {
      Alert.alert('错误', '密码至少需要6个字符');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        Alert.alert('错误', error.message);
      } else {
        Alert.alert(
          '密码重置成功',
          '您的密码已成功重置',
          [
            {
              text: '确定',
              onPress: () => router.replace('/auth/login')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('错误', '重置密码时出现错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        <View className="items-center mb-10">
          <Text className="text-5xl mb-2">🔑</Text>
          <Text className="text-3xl font-bold text-primary mb-2">重置密码</Text>
          <Text className="text-base text-gray-600 text-center leading-6">请设置您的新密码</Text>
        </View>

        <View className="w-full">
          <View className="mb-5">
            <Text className="text-base text-gray-800 mb-2 font-medium">🔒 新密码</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-white text-gray-800"
              placeholder="请输入新密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View className="mb-5">
            <Text className="text-base text-gray-800 mb-2 font-medium">🔒 确认新密码</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-white text-gray-800"
              placeholder="请再次输入新密码"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            className={`bg-primary rounded-xl py-4 items-center mb-4 ${loading ? 'opacity-50' : ''}`}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text className="text-white text-base font-bold">
              {loading ? '重置中...' : '重置密码'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center py-2"
            onPress={() => router.replace('/auth/login')}
          >
            <Text className="text-primary text-base font-medium">返回登录</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}