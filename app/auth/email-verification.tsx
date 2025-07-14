
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import PageTemplate from '@/components/PageTemplate';
import { Colors } from '@/constants/Colors';

export default function EmailVerificationScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { signIn } = useAuth();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!email) {
      Alert.alert('错误', '邮箱地址缺失');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        Alert.alert('发送失败', error.message);
      } else {
        Alert.alert('发送成功', '验证邮件已重新发送，请检查您的邮箱');
        setCountdown(60);
      }
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert('发送失败', '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        Alert.alert('检查失败', error.message);
        return;
      }

      if (data.session?.user) {
        await signIn(data.session.user, data.session);
        router.replace('/(tabs)');
      } else {
        Alert.alert('提示', '请先点击邮件中的验证链接');
      }
    } catch (error) {
      console.error('Check verification error:', error);
      Alert.alert('检查失败', '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/auth/login');
  };

  return (
    <PageTemplate 
      title="邮箱验证"
      variant="auth"
      scrollable={false}
      showBackButton={true}
      onBackPress={handleBackToLogin}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📧</Text>
          </View>

          <Text style={styles.title}>验证您的邮箱</Text>
          
          <Text style={styles.description}>
            我们已向 {email} 发送了一封验证邮件。
          </Text>
          
          <Text style={styles.description}>
            请点击邮件中的链接来验证您的账户。
          </Text>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleCheckVerification}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '检查中...' : '我已验证，继续'}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>没有收到邮件？</Text>
            <TouchableOpacity 
              onPress={handleResendEmail}
              disabled={loading || countdown > 0}
              style={styles.resendButton}
            >
              <Text style={[
                styles.resendButtonText,
                (loading || countdown > 0) && styles.resendButtonTextDisabled
              ]}>
                {countdown > 0 ? `重新发送 (${countdown}s)` : '重新发送'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackToLogin}
          >
            <Text style={styles.backButtonText}>返回登录</Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
    minWidth: 200,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  resendButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});
