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

export default function RegisterScreen() {
  const [dharmaName, setDharmaName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [useOTP, setUseOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleRegister = async () => {
    if (useOTP) {
      if (!email) {
        Alert.alert('提示', '请填写邮箱地址');
        return;
      }
      await handleOTPRegister();
    } else {
      if (!email || !password || !confirmPassword) {
        Alert.alert('提示', '请填写必填项目');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('提示', '两次输入的密码不一致');
        return;
      }

      if (password.length < 6) {
        Alert.alert('提示', '密码至少需要6位字符');
        return;
      }
      await handlePasswordRegister();
    }
  };

  const handlePasswordRegister = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            dharma_name: dharmaName.trim() || null,
          },
        },
      });

      if (error) {
        Alert.alert('注册失败', error.message);
      } else {
        // Redirect to email verification page instead of login
        router.push({
          pathname: '/auth/email-verification',
          params: { email }
        });
      }
    } catch (error) {
      Alert.alert('注册失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPRegister = async () => {
    if (!otpSent) {
      // Send OTP for registration
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
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
      // Verify OTP and complete registration
      if (!otp) {
        Alert.alert('提示', '请输入验证码');
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otp,
          type: 'email',
        });

        if (error) {
          Alert.alert('验证失败', error.message);
        } else if (data.user) {
          // Update user metadata with dharma name if provided
          if (dharmaName.trim()) {
            await supabase.auth.updateUser({
              data: { dharma_name: dharmaName.trim() }
            });
          }
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
          <Text style={styles.logo}>🌸</Text>
          <Text style={styles.title}>开始修行</Text>
          <Text style={styles.subtitle}>注册账户，开启您的修行之旅</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>👤 法名（可选）</Text>
            <TextInput
              style={styles.input}
              placeholder="如：多吉、白玛等"
              value={dharmaName}
              onChangeText={setDharmaName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📧 邮箱地址 *</Text>
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

          {/* Registration Method Toggle */}
          <View style={styles.authToggle}>
            <TouchableOpacity 
              style={[styles.toggleButton, !useOTP && styles.toggleButtonActive]}
              onPress={() => {
                setUseOTP(false);
                setOtpSent(false);
                setOtp('');
              }}
            >
              <Text style={[styles.toggleText, !useOTP && styles.toggleTextActive]}>密码注册</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, useOTP && styles.toggleButtonActive]}
              onPress={() => {
                setUseOTP(true);
                setPassword('');
                setConfirmPassword('');
              }}
            >
              <Text style={[styles.toggleText, useOTP && styles.toggleTextActive]}>验证码注册</Text>
            </TouchableOpacity>
          </View>

          {!useOTP ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🔒 密码 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="至少6位密码"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🔒 确认密码 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请再次输入密码"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </>
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
            style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.registerButtonText}>
                {useOTP ? (otpSent ? '验证注册' : '发送验证码') : '注册'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>已有账户？</Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>立即登录</Text>
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
  registerButton: {
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
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  loginPromptText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginRight: 5,
  },
  loginLink: {
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
});