import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordSentScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email) {
      Alert.alert('错误', '邮箱地址丢失');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.EXPO_PUBLIC_APP_DOMAIN || 'exp://localhost:8081'}/auth/reset-password`,
      });

      if (error) {
        Alert.alert('发送失败', error.message);
      } else {
        setCountdown(60);
        Alert.alert('发送成功', '已重新发送重置邮件');
      }
    } catch (error) {
      Alert.alert('发送失败', '网络错误，请稍后重试');
    }
    setIsResending(false);
  };

  return (
    <View className="flex-1 bg-gray-50 justify-center p-5">
      <View className="items-center">
        <Text className="text-5xl mb-5">📧</Text>
        <Text className="text-3xl font-bold text-primary mb-4 text-center">邮件已发送</Text>
        <Text className="text-base text-gray-600 text-center leading-6 mb-8 px-5">
          我们已向您的邮箱发送了密码重置链接。请检查您的邮箱并按照说明重置密码。
        </Text>

        <View className="bg-yellow-50 rounded-xl p-5 mb-8 border-l-4 border-yellow-500">
          <Text className="text-base font-semibold text-yellow-800 mb-3">📝 温馨提示：</Text>
          <Text className="text-sm text-yellow-800 mb-1">• 请检查垃圾邮件文件夹</Text>
          <Text className="text-sm text-yellow-800 mb-1">• 链接有效期为24小时</Text>
          <Text className="text-sm text-yellow-800">• 如未收到邮件，可返回重新发送</Text>
        </View>

        <TouchableOpacity 
          className="bg-primary rounded-xl py-4 px-8 items-center mb-4 w-full"
          onPress={() => router.replace('/auth/login')}
        >
          <Text className="text-white text-base font-bold">返回登录</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="items-center py-2"
          onPress={() => router.back()}
        >
          <Text className="text-primary text-base font-medium">重新发送</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  instructions: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  step: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  outlineButtonText: {
    color: '#007AFF',
  },
});