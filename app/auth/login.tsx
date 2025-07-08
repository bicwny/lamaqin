import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [useOTP, setUseOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  

  const handleLogin = async () => {
    if (useOTP) {
      if (!email) {
        Alert.alert('提示', '请填写邮箱地址');
        return;
      }
      await handleOTPLogin();
    } else {
      if (!email || !password) {
        Alert.alert('提示', '请填写邮箱和密码');
        return;
      }
      await handlePasswordLogin();
    }
  };

  const handlePasswordLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('登录失败', error.message);
      } else {
        router.replace('/(tabs)/index');
      }
    } catch (error) {
      Alert.alert('登录失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async () => {
    if (!otpSent) {
      // Send OTP code
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: false,
            data: { 
              verification_type: 'code' 
            }
          }
        });

        if (error) {
          Alert.alert('发送失败', error.message);
        } else {
          setOtpSent(true);
          Alert.alert('验证码已发送', '请检查您的邮箱并输入验证码');
        }
      } catch (error) {
        Alert.alert('发送失败', '网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    } else {
      // Verify OTP
      if (!otp) {
        Alert.alert('提示', '请输入验证码');
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otp,
          type: 'email',
        });

        if (error) {
          Alert.alert('验证失败', error.message);
        } else {
          router.replace('/(tabs)/index');
        }
      } catch (error) {
        Alert.alert('验证失败', '网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>🙏</Text>
          <Text style={styles.title}>修行追踪</Text>
          <Text style={styles.subtitle}>欢迎回来，继续您的修行之路</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📧 邮箱地址</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入您的邮箱"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Auth Method Toggle */}
          <View style={styles.authToggle}>
            <TouchableOpacity 
              style={[styles.toggleButton, !useOTP && styles.toggleButtonActive]}
              onPress={() => {
                setUseOTP(false);
                setOtpSent(false);
                setOtp('');
              }}
            >
              <Text style={[styles.toggleText, !useOTP && styles.toggleTextActive]}>密码登录</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, useOTP && styles.toggleButtonActive]}
              onPress={() => {
                setUseOTP(true);
                setPassword('');
              }}
            >
              <Text style={[styles.toggleText, useOTP && styles.toggleTextActive]}>验证码登录</Text>
            </TouchableOpacity>
          </View>

          {!useOTP ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>🔒 密码</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入密码"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          ) : otpSent ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>🔢 验证码</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入邮箱验证码"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
            </View>
          ) : null}

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.loginButtonText}>
                {useOTP ? (otpSent ? '验证登录' : '发送验证码') : '登录'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/auth/forgot-password')}>
            <Text style={styles.forgotPasswordText}>忘记密码？</Text>
          </TouchableOpacity>

          <View style={styles.registerPrompt}>
            <Text style={styles.registerPromptText}>还没有账户？</Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>立即注册</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: Colors.surface,
    color: Colors.text,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 16,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  registerPromptText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginRight: 5,
  },
  registerLink: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
  magicLinkText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    padding: 15,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  codeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 2,
  },
  codeToggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  codeToggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  codeToggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  codeToggleTextActive: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
});