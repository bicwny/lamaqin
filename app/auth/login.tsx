
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import PageTemplate from '@/components/PageTemplate';
import { Colors } from '@/constants/Colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { signInWithOTP, verifyOTP, signUpWithOTP } = useAuth();

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('错误', '请输入邮箱');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithOTP(email.trim());
      
      if (result.error) {
        Alert.alert('发送失败', result.error);
        return;
      }

      setOtpSent(true);
      setCountdown(60);
      Alert.alert('验证码已发送', '请检查您的邮箱并输入验证码');
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert('发送失败', '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!email || !otp) {
      Alert.alert('错误', '请输入邮箱和验证码');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(email.trim(), otp.trim());
      
      if (result.error) {
        Alert.alert('验证失败', result.error);
        return;
      }

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Verify OTP error:', error);
      Alert.alert('验证失败', '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email) {
      Alert.alert('错误', '请输入邮箱');
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithOTP(email.trim());
      
      if (result.error) {
        Alert.alert('注册失败', result.error);
        return;
      }

      setOtpSent(true);
      setCountdown(60);
      Alert.alert('验证码已发送', '请检查您的邮箱并输入验证码');
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('注册失败', '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    await handleSendOTP();
  };

  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtp('');
    setCountdown(0);
  };

  return (
    <PageTemplate 
      title="佛教修行追踪"
      variant="auth"
      scrollable={false}
      showBackButton={otpSent}
      onBackPress={otpSent ? handleBackToEmail : undefined}
    >
      <View style={styles.container}>
        <View style={styles.form}>
          {!otpSent ? (
            <>
              <Text style={styles.title}>欢迎回来</Text>
              <Text style={styles.subtitle}>请输入邮箱获取验证码</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>邮箱</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="请输入邮箱"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleSendOTP}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? '发送中...' : '发送验证码'}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>新用户?</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]} 
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  {loading ? '创建中...' : '创建新账户'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>输入验证码</Text>
              <Text style={styles.subtitle}>
                我们已向 {email} 发送验证码
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>验证码</Text>
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="请输入6位验证码"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? '验证中...' : '验证并登录'}
                </Text>
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>没有收到验证码？</Text>
                <TouchableOpacity 
                  onPress={handleResendOTP}
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
            </>
          )}
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
  form: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
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
});
