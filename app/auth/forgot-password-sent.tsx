
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
        redirectTo: `https://88214788-b967-45f6-92f8-6b3fba08318e-00-355385dlz9km1.picard.replit.dev/auth/reset-password`,
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
    <View style={styles.container}>
      <Text style={styles.title}>📧 重置邮件已发送</Text>
      <Text style={styles.subtitle}>
        我们已向 {email} 发送密码重置邮件
      </Text>
      
      <View style={styles.instructions}>
        <Text style={styles.stepTitle}>📝 重置步骤：</Text>
        <Text style={styles.step}>1. 检查邮箱(包括垃圾邮件)</Text>
        <Text style={styles.step}>2. 点击邮件中的【重置密码】链接</Text>
        <Text style={styles.step}>3. 设置新密码后返回登录</Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, (countdown > 0 || isResending) && styles.buttonDisabled]}
        disabled={countdown > 0 || isResending}
        onPress={handleResend}
      >
        <Text style={styles.buttonText}>
          {countdown > 0 ? `重新发送 (${countdown}s)` : "重新发送重置邮件"}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.outlineButton]}
        onPress={() => router.push('/auth/login')}
      >
        <Text style={[styles.buttonText, styles.outlineButtonText]}>返回登录</Text>
      </TouchableOpacity>
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
