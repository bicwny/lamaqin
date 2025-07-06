import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('错误', '请输入您的邮箱地址');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://yourapp.com/reset-password',
      });

      if (error) {
        Alert.alert('错误', error.message);
      } else {
        router.replace('/auth/forgot-password-sent');
      }
    } catch (error) {
      Alert.alert('错误', '发送重置邮件时出现错误');
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
          <Text className="text-5xl mb-2">🔐</Text>
          <Text className="text-3xl font-bold text-primary mb-2">忘记密码</Text>
          <Text className="text-base text-gray-600 text-center leading-6">我们将发送重置链接到您的邮箱</Text>
        </View>

        <View className="w-full">
          <View className="mb-5">
            <Text className="text-base text-gray-800 mb-2 font-medium">📧 邮箱地址</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base bg-white text-gray-800"
              placeholder="请输入您的邮箱"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity 
            className={`bg-primary rounded-xl py-4 items-center mb-4 ${loading ? 'opacity-50' : ''}`}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text className="text-white text-base font-bold">
              {loading ? '发送中...' : '发送重置邮件'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center py-2"
            onPress={() => router.back()}
          >
            <Text className="text-primary text-base font-medium">返回登录</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}