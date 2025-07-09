
import React, { useState, useEffect } from 'react';
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
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

export default function UnifiedAuthScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'loading'>('email');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('提示', '请填写邮箱地址');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('提示', '请输入有效的邮箱地址');
      return;
    }

    setLoading(true);
    try {
      // First, check if user exists in our database
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error checking user:', userError);
        // Continue anyway, will fallback to creating user
      }

      const userExists = !!existingUser;
      setIsNewUser(!userExists);

      // Send OTP with appropriate configuration
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: !userExists, // Only create if user doesn't exist
          data: userExists ? undefined : {
            // Only set metadata for new users
            email: email.trim()
          }
        }
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Email not confirmed') || error.message.includes('signup')) {
          // User exists but email not confirmed - still send OTP
          const { error: retryError } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
              shouldCreateUser: true
            }
          });
          
          if (retryError) {
            Alert.alert('发送失败', retryError.message);
          } else {
            setStep('otp');
            setResendCountdown(60);
            Alert.alert('验证码已发送', '请检查您的邮箱并输入验证码');
          }
        } else {
          Alert.alert('发送失败', error.message);
        }
      } else {
        setStep('otp');
        setResendCountdown(60);
        Alert.alert('验证码已发送', '请检查您的邮箱并输入验证码');
      }
    } catch (error) {
      Alert.alert('发送失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('提示', '请输入验证码');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('提示', '验证码应为6位数字');
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
        if (error.message.includes('expired')) {
          Alert.alert('验证失败', '验证码已过期，请重新发送');
        } else if (error.message.includes('invalid')) {
          Alert.alert('验证失败', '验证码无效，请检查后重试');
        } else {
          Alert.alert('验证失败', error.message);
        }
      } else if (data.user) {
        // Check if user exists in database again (in case it was created during auth)
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('id, dharma_name, class_name, practice_years, location')
          .eq('email', email.trim())
          .maybeSingle();

        if (userError && userError.code !== 'PGRST116') {
          console.error('Error checking user:', userError);
          // Continue anyway, will be handled by AuthContext
        }

        if (!existingUser || isNewUser) {
          // New user - redirect to profile setup
          router.replace('/profile-setup');
        } else {
          // Check if profile is complete
          const isProfileComplete = existingUser.dharma_name || 
                                  existingUser.class_name || 
                                  existingUser.practice_years || 
                                  existingUser.location;
          
          if (!isProfileComplete) {
            // Profile incomplete - redirect to profile setup
            router.replace('/profile-setup');
          } else {
            // Existing user with complete profile - go to main app
            router.replace('/(tabs)/index');
          }
        }
      }
    } catch (error) {
      Alert.alert('验证失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || resendCountdown > 0) return;

    setIsResending(true);
    try {
      // Use the same logic as initial send
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: isNewUser,
          data: isNewUser ? {
            email: email.trim()
          } : undefined
        }
      });

      if (error) {
        // Try alternative approach if first fails
        const { error: retryError } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: true
          }
        });
        
        if (retryError) {
          Alert.alert('发送失败', retryError.message);
        } else {
          setResendCountdown(60);
          Alert.alert('验证码已重新发送', '请检查您的邮箱');
        }
      } else {
        setResendCountdown(60);
        Alert.alert('验证码已重新发送', '请检查您的邮箱');
      }
    } catch (error) {
      Alert.alert('发送失败', '网络错误，请稍后重试');
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    setStep('email');
    setOtp('');
    setResendCountdown(0);
    setIsNewUser(false);
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
          <Text style={styles.subtitle}>
            {step === 'email' ? '输入邮箱开始您的修行之旅' : '请输入邮箱验证码'}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 'email' ? (
            <>
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
                  autoFocus
                />
              </View>

              <TouchableOpacity 
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} 
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.surface} />
                ) : (
                  <Text style={styles.primaryButtonText}>发送验证码</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>📧 邮箱地址</Text>
                <View style={styles.emailDisplay}>
                  <Text style={styles.emailText}>{email}</Text>
                  <TouchableOpacity onPress={handleChangeEmail}>
                    <Text style={styles.changeEmailText}>更改</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🔢 验证码</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入6位验证码"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <TouchableOpacity 
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} 
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.surface} />
                ) : (
                  <Text style={styles.primaryButtonText}>验证登录</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.resendButton, 
                  (resendCountdown > 0 || isResending) && styles.resendButtonDisabled
                ]} 
                onPress={handleResendCode}
                disabled={resendCountdown > 0 || isResending}
              >
                <Text style={[
                  styles.resendButtonText,
                  (resendCountdown > 0 || isResending) && styles.resendButtonTextDisabled
                ]}>
                  {resendCountdown > 0 
                    ? `重新发送验证码 (${resendCountdown}s)` 
                    : isResending 
                      ? '发送中...' 
                      : '重新发送验证码'
                  }
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>💡 使用说明</Text>
            <Text style={styles.helpText}>
              • 新用户将自动创建账户{'\n'}
              • 老用户将直接登录{'\n'}
              • 所有用户都会收到6位数字验证码{'\n'}
              • 验证码有效期为10分钟{'\n'}
              • 请检查垃圾邮件文件夹
            </Text>
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
  emailDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#F5F5F5',
  },
  emailText: {
    fontSize: 16,
    color: Colors.textSecondary,
    flex: 1,
  },
  changeEmailText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  primaryButton: {
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
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    color: Colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  resendButtonTextDisabled: {
    color: Colors.textSecondary,
    textDecorationLine: 'none',
  },
  helpSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
