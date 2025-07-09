
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
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { ErrorHandler, ErrorType } from '@/utils/errorHandler';
import { OTPTimer } from '@/components/OTPTimer';

export default function UnifiedAuthScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [otpExpired, setOtpExpired] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [hasEmailInteracted, setHasEmailInteracted] = useState(false);
  const maxRetries = 3;
  const otpValidityDuration = 300; // 5 minutes in seconds
  
  const emailInputRef = useRef<TextInput>(null);
  const otpInputRef = useRef<TextInput>(null);

  // Email validation helper functions
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validateEmail = (emailValue: string): string | null => {
    const trimmedEmail = emailValue.trim();
    
    if (!trimmedEmail) {
      return '请输入邮箱地址';
    }
    
    if (!isValidEmail(trimmedEmail)) {
      return '请输入有效的邮箱地址';
    }
    
    return null;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setHasEmailInteracted(true);
    
    // Real-time validation
    const error = validateEmail(text);
    setEmailError(error);
    
    // Clear general errors when user starts typing
    if (lastError) {
      setLastError(null);
    }
  };

  const handleEmailBlur = () => {
    setHasEmailInteracted(true);
    const error = validateEmail(email);
    setEmailError(error);
  };

  const handleAuth = async () => {
    // Force validation display
    setHasEmailInteracted(true);
    
    // Validate email first
    const emailValidationError = validateEmail(email);
    setEmailError(emailValidationError);
    
    if (emailValidationError) {
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
        // Always use shouldCreateUser: true for unified flow
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: true
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
        const { data, error } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otp.trim(),
          type: 'email',
        });

        if (error) {
          throw error;
        }

        // Success - now check if user exists in our database
        if (data.user) {
          await handleSuccessfulAuth(data.user);
        }
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

  const handleSuccessfulAuth = async (user: any) => {
    try {
      // Check if user exists in our users table
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, dharma_name, created_at')
        .eq('email', user.email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Error other than "not found"
        console.error('Error checking user existence:', fetchError);
        throw fetchError;
      }

      if (!existingUser) {
        // New user - redirect to onboarding
        console.log('🆕 New user detected, redirecting to onboarding');
        router.replace('/onboarding');
      } else {
        // Existing user - go to main app
        console.log('✅ Existing user, redirecting to main app');
        router.replace('/(tabs)/index');
      }
    } catch (error) {
      console.error('Error in post-auth routing:', error);
      // Fallback: assume new user and go to onboarding
      Alert.alert(
        '提示', 
        '无法确定用户状态，将跳转到个人信息设置页面',
        [
          { text: '确定', onPress: () => router.replace('/onboarding') }
        ]
      );
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
    setEmailError(null);
    setHasEmailInteracted(false);
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
          <Text style={styles.subtitle}>
            {otpSent ? '请输入验证码' : '请输入邮箱地址'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>📧 邮箱地址</Text>
            <TextInput
              ref={emailInputRef}
              style={[
                styles.input, 
                otpSent && styles.inputDisabled,
                hasEmailInteracted && emailError && styles.inputError
              ]}
              placeholder="请输入您的邮箱"
              value={email}
              onChangeText={handleEmailChange}
              onBlur={handleEmailBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!otpSent}
            />
            {hasEmailInteracted && emailError && (
              <Text style={styles.errorText}>⚠️ {emailError}</Text>
            )}
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
              <Text style={styles.generalErrorText}>❌ {lastError}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.authButton, loading && styles.authButtonDisabled]} 
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.authButtonText}>
                {otpSent ? '验证登录' : '继续'}
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

          {!otpSent && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                📱 新用户会自动创建账户{'\n'}
                🔄 已有账户会直接登录
              </Text>
            </View>
          )}
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
  inputError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  inputExpired: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  authButton: {
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
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resendButtonText: {
    color: Colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 5,
    lineHeight: 16,
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
  generalErrorText: {
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
  infoContainer: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
