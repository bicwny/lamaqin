import React, { useState, useRef } from 'react';
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [otpExpired, setOtpExpired] = useState(false);
  const maxRetries = 3;
  const otpValidityDuration = 300; // 5 minutes in seconds
  
  const emailInputRef = useRef<TextInput>(null);
  const otpInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('输入错误', '请填写邮箱地址');
      emailInputRef.current?.focus();
      return;
    }

    if (!otpSent) {
      await sendOTPWithRetry();
    } else {
      await verifyOTPWithRetry();
    }
  };

  const sendOTPWithRetry = async () => {
    if (otpExpired) {
      setOtpExpired(false);
      setOtp(''); // Clear expired OTP
    }

    setLoading(true);
    setLastError(null);

    try {
      await ErrorHandler.handleWithNetworkCheck(async () => {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: false
          }
        });

        if (error) {
          throw error;
        }

        setOtpSent(true);
        setRetryCount(0);
        setOtpExpired(false);
        Alert.alert('验证码已发送', '请检查您的邮箱并输入验证码\n验证码5分钟内有效');
        
        // Auto-focus OTP input after a short delay
        setTimeout(() => {
          otpInputRef.current?.focus();
        }, 500);
      });
    } catch (error) {
      const errorInfo = await ErrorHandler.handleError(
        error, 
        () => sendOTPWithRetry(),
        false // Don't show default alert, we'll handle it
      );
      
      setLastError(errorInfo.message);
      
      if (errorInfo.type === ErrorType.RATE_LIMITED) {
        Alert.alert(errorInfo.title, `${errorInfo.message}\n请等待后重试`);
      } else if (errorInfo.isRetryable && retryCount < maxRetries) {
        Alert.alert(
          errorInfo.title,
          `${errorInfo.message}\n\n重试次数: ${retryCount + 1}/${maxRetries}`,
          [
            { text: '取消', style: 'cancel' },
            { 
              text: '重试', 
              onPress: () => {
                setRetryCount(prev => prev + 1);
                setTimeout(() => sendOTPWithRetry(), errorInfo.retryDelay || 1000);
              }
            }
          ]
        );
      } else {
        Alert.alert(errorInfo.title, errorInfo.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPWithRetry = async () => {
    if (!otp.trim()) {
      Alert.alert('输入错误', '请输入验证码');
      otpInputRef.current?.focus();
      return;
    }

    if (otpExpired) {
      Alert.alert('验证码已过期', '请重新获取验证码');
      return;
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      Alert.alert('格式错误', '验证码应为6位数字');
      otpInputRef.current?.focus();
      return;
    }

    setLoading(true);
    setLastError(null);

    try {
      await ErrorHandler.handleWithNetworkCheck(async () => {
        const { error } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otp.trim(),
          type: 'email',
        });

        if (error) {
          throw error;
        }

        // Success
        router.replace('/(tabs)/index');
      });
    } catch (error) {
      const errorInfo = await ErrorHandler.handleError(
        error,
        () => verifyOTPWithRetry(),
        false
      );
      
      setLastError(errorInfo.message);
      
      if (errorInfo.type === ErrorType.OTP_EXPIRED) {
        setOtpExpired(true);
        setOtp('');
        Alert.alert(
          errorInfo.title,
          errorInfo.message,
          [
            { text: '重新发送', onPress: () => sendOTPWithRetry() }
          ]
        );
      } else if (errorInfo.type === ErrorType.OTP_INVALID) {
        setOtp('');
        otpInputRef.current?.focus();
        Alert.alert(errorInfo.title, `${errorInfo.message}\n请重新输入验证码`);
      } else if (errorInfo.isRetryable && retryCount < maxRetries) {
        Alert.alert(
          errorInfo.title,
          `${errorInfo.message}\n\n重试次数: ${retryCount + 1}/${maxRetries}`,
          [
            { text: '取消', style: 'cancel' },
            { 
              text: '重试', 
              onPress: () => {
                setRetryCount(prev => prev + 1);
                setTimeout(() => verifyOTPWithRetry(), errorInfo.retryDelay || 1000);
              }
            }
          ]
        );
      } else {
        Alert.alert(errorInfo.title, errorInfo.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim()) return;

    // Reset states for fresh attempt
    setOtpExpired(false);
    setOtp('');
    setRetryCount(0);
    await sendOTPWithRetry();
  };

  const handleOTPExpired = () => {
    setOtpExpired(true);
    setOtp('');
    Alert.alert(
      '⏰ 验证码已过期',
      '验证码已过期，请重新获取',
      [
        { text: '重新发送', onPress: () => handleResendCode() }
      ]
    );
  };

  const resetToEmailInput = () => {
    setOtpSent(false);
    setOtp('');
    setOtpExpired(false);
    setRetryCount(0);
    setLastError(null);
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
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
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🔢 验证码</Text>
                <TextInput
                  ref={otpInputRef}
                  style={[styles.input, otpExpired && styles.inputExpired]}
                  placeholder="请输入6位数字验证码"
                  value={otp}
                  onChangeText={(text) => {
                    // Only allow numbers and limit to 6 digits
                    const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
                    setOtp(numericText);
                    setLastError(null);
                  }}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoFocus
                  maxLength={6}
                  editable={!otpExpired}
                />
                {otpExpired && (
                  <Text style={styles.expiredText}>⚠️ 验证码已过期</Text>
                )}
              </View>

              <OTPTimer 
                duration={otpValidityDuration}
                onExpired={handleOTPExpired}
                isActive={otpSent && !otpExpired}
              />
            </>
          )}

          {lastError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ {lastError}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.loginButtonText}>
                {otpSent ? '验证登录' : '发送验证码'}
              </Text>
            )}
          </TouchableOpacity>

          {otpSent && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[styles.resendButton, loading && styles.buttonDisabled]} 
                onPress={handleResendCode}
                disabled={loading}
              >
                <Text style={styles.resendButtonText}>
                  {loading ? '发送中...' : '重新发送验证码'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.editEmailButton} 
                onPress={resetToEmailInput}
                disabled={loading}
              >
                <Text style={styles.editEmailButtonText}>修改邮箱</Text>
              </TouchableOpacity>
            </View>
          )}

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
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: Colors.textSecondary,
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
  inputExpired: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  expiredText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 5,
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  editEmailButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  editEmailButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});