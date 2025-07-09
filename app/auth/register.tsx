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
import { ErrorHandler, ErrorType } from '@/utils/errorHandler';
import { NetworkUtils } from '@/utils/network';
import { OTPTimer } from '@/components/OTPTimer';

export default function RegisterScreen() {
  const [dharmaName, setDharmaName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleRegister = async () => {
    if (!email) {
      Alert.alert('提示', '请填写邮箱地址');
      return;
    }

    if (!otpSent) {
      // Send OTP for registration
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: true,
            data: {
              dharma_name: dharmaName.trim() || null
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

  const handleResendCode = async () => {
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          data: {
            dharma_name: dharmaName.trim() || null
          }
        }
      });

      if (error) {
        Alert.alert('发送失败', error.message);
      } else {
        Alert.alert('验证码已重新发送', '请检查您的邮箱');
      }
    } catch (error) {
      Alert.alert('发送失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
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
              style={[styles.input, otpSent && styles.inputDisabled]}
              placeholder="如：多吉、白玛等"
              value={dharmaName}
              onChangeText={setDharmaName}
              autoCapitalize="words"
              editable={!otpSent}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📧 邮箱地址 *</Text>
            <TextInput
              style={[styles.input, otpSent && styles.inputDisabled]}
              placeholder="请输入您的邮箱"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!otpSent}
            />
          </View>

          {otpSent && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>🔢 验证码</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入邮箱验证码"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoFocus
              />
            </View>
          )}

          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.registerButtonText}>
                {otpSent ? '验证注册' : '发送验证码'}
              </Text>
            )}
          </TouchableOpacity>

          {otpSent && (
            <TouchableOpacity 
              style={styles.resendButton} 
              onPress={handleResendCode}
              disabled={loading}
            >
              <Text style={styles.resendButtonText}>重新发送验证码</Text>
            </TouchableOpacity>
          )}

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
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: Colors.textSecondary,
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
  resendButton: {
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
  },
  resendButtonText: {
    color: Colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
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
});