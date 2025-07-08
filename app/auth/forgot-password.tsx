
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert('请输入邮箱', '请输入您的邮箱地址');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('邮箱格式错误', '请输入正确的邮箱地址');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `https://88214788-b967-45f6-92f8-6b3fba08318e-00-355385dlz9km1.picard.replit.dev/auth/reset-password`,
      });

      if (error) {
        Alert.alert('发送失败', error.message);
      } else {
        // Navigate to sent confirmation page
        router.push({
          pathname: '/auth/forgot-password-sent',
          params: { email }
        });
      }
    } catch (error) {
      Alert.alert('发送失败', '网络错误，请稍后重试');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 忘记密码</Text>
      <Text style={styles.subtitle}>
        输入您的邮箱地址，我们将发送密码重置链接
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>邮箱地址</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="请输入邮箱地址"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, (!email || loading) && styles.buttonDisabled]}
        onPress={handleSendResetEmail}
        disabled={!email || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '发送中...' : '发送重置邮件'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.outlineButton]}
        onPress={() => router.back()}
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
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
