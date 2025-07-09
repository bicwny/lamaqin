import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { OTPTimer } from '@/components/OTPTimer';
import { Colors } from '@/constants/Colors';
import { checkNetwork, isNetworkError } from '@/utils/network';
import { handleAuthError } from '@/utils/errorHandler';

type AuthStep = 'email' | 'otp';

export default function UnifiedAuth() {
  const { signInWithOtp } = useAuth();
  const [authStep, setAuthStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; otp?: string}>({});
  const [otpSent, setOtpSent] = useState(false);
  const otpInputRef = useRef<TextInput>(null);

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: '请输入邮箱地址' }));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: '请输入有效的邮箱地址' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: undefined }));
    return true;
  };

  const handleEmailSubmit = async () => {
    if (!validateEmail(email)) return;

    const isConnected = await checkNetwork();
    if (!isConnected) {
      Alert.alert('网络错误', '请检查您的网络连接后重试');
      return;
    }

    setLoading(true);
    try {
      console.log('📧 Sending OTP to:', email);

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          data: {
            email: email.trim().toLowerCase(),
          }
        }
      });

      if (error) {
        console.error('❌ OTP send error:', error);
        throw error;
      }

      console.log('✅ OTP sent successfully');
      setOtpSent(true);
      setAuthStep('otp');
      setErrors({});

      // Focus OTP input after a short delay
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 300);

    } catch (error: any) {
      console.error('❌ Error in handleEmailSubmit:', error);
      const errorMessage = handleAuthError(error);
      Alert.alert('发送失败', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp.trim()) {
      setErrors(prev => ({ ...prev, otp: '请输入验证码' }));
      return;
    }

    if (otp.length !== 6) {
      setErrors(prev => ({ ...prev, otp: '验证码应为6位数字' }));
      return;
    }

    const isConnected = await checkNetwork();
    if (!isConnected) {
      Alert.alert('网络错误', '请检查您的网络连接后重试');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Verifying OTP:', otp, 'for email:', email);

      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: 'email'
      });

      if (error) {
        console.error('❌ OTP verification error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('验证成功但未获取到用户信息');
      }

      console.log('✅ OTP verified successfully for user:', data.user.email);

      // Check if user exists in our database
      const { data: existingUser, error: dbError } = await supabase
        .from('users')
        .select('id, dharma_name, created_at')
        .eq('email', data.user.email)
        .single();

      if (dbError && dbError.code !== 'PGRST116') {
        console.error('❌ Database check error:', dbError);
        throw dbError;
      }

      console.log('👤 User database check:', existingUser ? 'exists' : 'new user');

      if (!existingUser) {
        // New user - redirect to onboarding
        console.log('🆕 New user detected, redirecting to onboarding');
        router.replace('/onboarding');
      } else {
        // Existing user - go to main app
        console.log('👋 Existing user, redirecting to main app');
        router.replace('/(tabs)');
      }

    } catch (error: any) {
      console.error('❌ Error in handleOtpSubmit:', error);
      const errorMessage = handleAuthError(error);

      if (error.message?.includes('Invalid login credentials') || 
          error.message?.includes('Invalid token') ||
          error.message?.includes('expired')) {
        setErrors(prev => ({ ...prev, otp: '验证码无效或已过期，请重新获取' }));
      } else {
        Alert.alert('验证失败', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtp('');
    setErrors({});
    setAuthStep('email');
    setOtpSent(false);
  };

  const handleEditEmail = () => {
    setAuthStep('email');
    setOtp('');
    setErrors({});
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>修行追踪</Text>
            <Text style={styles.subtitle}>
              {authStep === 'email' ? '请输入您的邮箱地址' : '请输入验证码'}
            </Text>

            {/* Email Step */}
            {authStep === 'email' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>邮箱地址</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="请输入邮箱地址"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: undefined }));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  editable={!loading}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleEmailSubmit}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? '发送中...' : '继续'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* OTP Step */}
            {authStep === 'otp' && (
              <View style={styles.inputContainer}>
                <View style={styles.emailDisplay}>
                  <Text style={styles.emailDisplayText}>
                    验证码已发送至: {email}
                  </Text>
                  <TouchableOpacity onPress={handleEditEmail}>
                    <Text style={styles.editEmailText}>修改</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>验证码</Text>
                <TextInput
                  ref={otpInputRef}
                  style={[styles.input, styles.otpInput, errors.otp && styles.inputError]}
                  placeholder="请输入6位验证码"
                  value={otp}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    if (numericText.length <= 6) {
                      setOtp(numericText);
                      if (errors.otp) {
                        setErrors(prev => ({ ...prev, otp: undefined }));
                      }
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  editable={!loading}
                />
                {errors.otp && (
                  <Text style={styles.errorText}>{errors.otp}</Text>
                )}

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleOtpSubmit}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? '验证中...' : '验证'}
                  </Text>
                </TouchableOpacity>

                <OTPTimer
                  onResend={handleResendOtp}
                  duration={300} // 5 minutes
                  style={styles.timer}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 350,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 6,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 16,
    marginTop: -2,
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emailDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  emailDisplayText: {
    fontSize: 14,
    color: '#1976d2',
    flex: 1,
  },
  editEmailText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  timer: {
    marginTop: 16,
  },
});