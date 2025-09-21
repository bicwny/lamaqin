import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function EmailVerificationScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Auto-check verification status every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email_confirmed_at) {
          console.log('✅ Email verified, redirecting to app');
          router.replace('/');
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    const timer = setInterval(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    // Auto-check verification status every 5 seconds
    const verificationCheck = setInterval(() => {
      checkVerificationStatus();
    }, 5000);

    return () => clearInterval(verificationCheck);
  }, []);

  const handleResendVerification = async () => {
    if (!email) {
      Alert.alert('错误', '邮箱地址丢失');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        Alert.alert('发送失败', error.message);
      } else {
        setCountdown(60);
        Alert.alert('发送成功', '已重新发送验证邮件');
      }
    } catch (error) {
      Alert.alert('发送失败', '网络错误，请稍后重试');
    }
    setIsResending(false);
  };

  const checkVerificationStatus = async () => {
    setCheckingStatus(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email_confirmed_at) {
        router.replace('/');
      } else {
        Alert.alert('未验证', '邮箱尚未验证，请检查邮箱');
      }
    } catch (error) {
      Alert.alert('检查失败', '无法检查验证状态');
    }
    setCheckingStatus(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📧 验证邮箱</Text>
      <Text style={styles.subtitle}>
        我们已向 {email} 发送验证邮件
      </Text>

      <View style={styles.steps}>
        <Text style={styles.stepTitle}>📝 验证步骤：</Text>
        <Text style={styles.step}>1. 检查邮箱(包括垃圾邮件文件夹)</Text>
        <Text style={styles.step}>2. 点击邮件中的【验证邮箱】链接</Text>
        <Text style={styles.step}>3. 验证成功后会自动跳转</Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, (countdown > 0 || isResending) && styles.buttonDisabled]}
        disabled={countdown > 0 || isResending}
        onPress={handleResendVerification}
      >
        <Text style={styles.buttonText}>
          {countdown > 0 ? `重新发送验证邮件 (${countdown}s)` : "重新发送验证邮件"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.outlineButton]}
        onPress={checkVerificationStatus}
        disabled={checkingStatus}
      >
        <Text style={[styles.buttonText, styles.outlineButtonText]}>
          {checkingStatus ? '检查中...' : '手动检查验证状态'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.textButton]}
        onPress={() => router.push('/auth/login')}
      >
        <Text style={[styles.buttonText, styles.textButtonText]}>返回登录</Text>
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
  steps: {
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
  textButton: {
    backgroundColor: 'transparent',
  },
  textButtonText: {
    color: '#007AFF',
  },
});