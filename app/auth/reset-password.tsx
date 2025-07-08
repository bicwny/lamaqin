import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { PlatformFallback } from '@/components/PlatformFallback';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log('Reset password screen params:', params);
    
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Reset password session check:', { session: !!session, error });
        
        if (session) {
          setHasValidSession(true);
          console.log('✅ Valid session found for password reset');
        } else {
          console.log('❌ No valid session for password reset');
          // If no session, try to handle the reset code from URL
          handleResetCodeFromUrl();
        }
      } catch (error) {
        console.error('Error checking session:', error);
        handleResetCodeFromUrl();
      }
    };

    checkSession();
  }, [params]);

  const handleResetCodeFromUrl = async () => {
    // Check if we have a code in the URL parameters
    const code = params.code as string;
    if (code) {
      console.log('🔐 Found reset code in URL:', code);
      try {
        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('❌ Error exchanging code for session:', error);
          Alert.alert('链接无效', '密码重置链接已失效或无效，请重新申请重置密码', [
            { text: '确定', onPress: () => router.replace('/auth/forgot-password') }
          ]);
        } else {
          console.log('✅ Successfully exchanged code for session');
          setHasValidSession(true);
        }
      } catch (error) {
        console.error('❌ Code exchange error:', error);
        Alert.alert('重置失败', '无法处理密码重置请求，请重新尝试', [
          { text: '确定', onPress: () => router.replace('/auth/forgot-password') }
        ]);
      }
    } else {
      console.log('❌ No reset code found in URL');
      Alert.alert('链接无效', '缺少密码重置代码，请重新申请重置密码', [
        { text: '确定', onPress: () => router.replace('/auth/forgot-password') }
      ]);
    }
  };

  const handleUpdatePassword = async () => {
    if (!hasValidSession) {
      Alert.alert('会话无效', '密码重置会话已失效，请重新申请重置密码', [
        { text: '确定', onPress: () => router.replace('/auth/forgot-password') }
      ]);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('密码不匹配', '两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      Alert.alert('密码太短', '密码至少需要6位字符');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Updating password...');
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error('❌ Password update error:', error);
        Alert.alert('重置失败', error.message);
      } else {
        console.log('✅ Password updated successfully');
        
        // Check if user is now authenticated (should be auto-logged in)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('✅ Auto-login successful, redirecting to app');
          Alert.alert('重置成功', '密码已更新，正在进入应用...', [
            { text: '确定', onPress: () => router.replace('/(tabs)') }
          ]);
        } else {
          console.log('⚠️ Auto-login failed, redirecting to login');
          Alert.alert('重置成功', '密码已更新，请使用新密码登录', [
            { text: '确定', onPress: () => router.replace('/auth/login') }
          ]);
        }
      }
    } catch (error) {
      console.error('❌ Password update error:', error);
      Alert.alert('重置失败', '网络错误，请稍后重试');
    }
    setLoading(false);
  };

  // Show loading while checking session
  if (!hasValidSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🔐 验证重置链接</Text>
        <Text style={styles.subtitle}>正在验证密码重置链接...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PlatformFallback />
      <Text style={styles.title}>🔐 设置新密码</Text>
      <Text style={styles.subtitle}>请输入新的登录密码</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>新密码</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="至少6位字符"
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>确认新密码</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          placeholder="请再次输入新密码"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, (!password || !confirmPassword || loading) && styles.buttonDisabled]}
        onPress={handleUpdatePassword}
        disabled={!password || !confirmPassword || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '更新中...' : '更新密码'}
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 15,
  },
  eyeText: {
    fontSize: 18,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
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