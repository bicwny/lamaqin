import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('提示', '请输入邮箱地址');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        Alert.alert('发送失败', error.message);
      } else {
        router.push({
          pathname: '/auth/forgot-password-sent',
          params: { email }
        });
      }
    } catch (error) {
      Alert.alert('发送失败', '网络错误，请稍后重试');
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
          <Text className="text-5xl mb-4">🔒</Text>
          <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">重置密码</Text>
          <Text className="text-base text-gray-600 text-center leading-6">
            输入您的邮箱地址，我们将发送重置密码的链接给您
          </Text>
        </View>

        <View className="w-full">
          <View className="mb-6">
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
            className={`bg-primary py-4 rounded-xl items-center mb-4 shadow-lg ${loading ? 'opacity-60' : ''}`}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">发送重置链接</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-200 py-4 rounded-xl items-center"
            onPress={() => router.back()}
          >
            <Text className="text-gray-700 text-lg font-semibold">返回登录</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}