import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function EmailVerificationScreen() {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      // Implement resend verification logic
      Alert.alert('验证邮件已发送', '请检查您的邮箱');
    } catch (error) {
      Alert.alert('发送失败', '请稍后重试');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/auth/login');
  };

  return (
    <View className="flex-1 bg-gray-50 justify-center px-6">
      <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <Text className="text-2xl font-bold text-center mb-4 text-gray-800">
          验证您的邮箱
        </Text>

        <Text className="text-gray-600 text-center mb-6">
          我们已向 {user?.email} 发送了验证邮件
        </Text>

        <Text className="text-gray-600 text-center mb-8">
          请检查您的邮箱并点击验证链接来激活您的账户
        </Text>

        <TouchableOpacity
          onPress={handleResendVerification}
          disabled={isResending}
          className="bg-buddhist-golden py-3 px-6 rounded-lg mb-4"
        >
          <Text className="text-white text-center font-semibold">
            {isResending ? '发送中...' : '重新发送验证邮件'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBackToLogin}
          className="py-3 px-6"
        >
          <Text className="text-buddhist-golden text-center font-medium">
            返回登录
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}