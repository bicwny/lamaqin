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
import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTokens } from '@/utils/componentTokens';

// Error types for better categorization
enum ErrorType {
  NETWORK = 'network',
  EMAIL_EMPTY = 'email_empty',
  EMAIL_INVALID = 'email_invalid',
  EMAIL_FORMAT = 'email_format',
  EMAIL_DELIVERY = 'email_delivery',
  OTP_INVALID = 'otp_invalid',
  OTP_EXPIRED = 'otp_expired',
  OTP_FORMAT = 'otp_format',
  RATE_LIMITED = 'rate_limited',
  SESSION_EXPIRED = 'session_expired',
  DATABASE_ERROR = 'database_error',
  UNKNOWN = 'unknown'
}

export default function UnifiedAuthScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'loading'>('email');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastError, setLastError] = useState<ErrorType | null>(null);


  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Smart error detection function
  const detectErrorType = (error: any): ErrorType => {
    const errorMessage = error?.message?.toLowerCase() || '';

    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || 
        errorMessage.includes('timeout') || errorMessage.includes('connection')) {
      return ErrorType.NETWORK;
    }

    // Rate limiting
    if (errorMessage.includes('rate') || errorMessage.includes('too many') || 
        errorMessage.includes('limit') || errorMessage.includes('频繁')) {
      return ErrorType.RATE_LIMITED;
    }

    // Email delivery issues
    if (errorMessage.includes('invalid email') || errorMessage.includes('email not found') ||
        errorMessage.includes('delivery') || errorMessage.includes('bounce')) {
      return ErrorType.EMAIL_DELIVERY;
    }

    // OTP specific errors
    if (errorMessage.includes('expired') || errorMessage.includes('过期')) {
      return ErrorType.OTP_EXPIRED;
    }

    if (errorMessage.includes('invalid') || errorMessage.includes('wrong') || 
        errorMessage.includes('incorrect') || errorMessage.includes('无效')) {
      return ErrorType.OTP_INVALID;
    }

    // Session errors
    if (errorMessage.includes('session') || errorMessage.includes('会话')) {
      return ErrorType.SESSION_EXPIRED;
    }

    // Database errors
    if (errorMessage.includes('database') || errorMessage.includes('sql') || 
        errorMessage.includes('connection')) {
      return ErrorType.DATABASE_ERROR;
    }

    return ErrorType.UNKNOWN;
  };

  // User-friendly error messages
  const getErrorMessage = (errorType: ErrorType, context: 'email' | 'otp' = 'email'): { title: string; message: string; action?: string } => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return {
          title: '网络连接失败',
          message: '请检查您的网络连接后重试，或尝试切换到移动网络',
          action: '检查网络设置'
        };

      case ErrorType.EMAIL_EMPTY:
        return {
          title: '请输入邮箱地址',
          message: '邮箱地址不能为空，请输入您的邮箱后重试',
          action: '输入邮箱'
        };

      case ErrorType.EMAIL_INVALID:
        return {
          title: '请输入有效的邮箱地址',
          message: '您输入的内容不是邮箱格式，请输入类似 "用户名@邮箱.com" 的格式',
          action: '重新输入邮箱'
        };

      case ErrorType.EMAIL_FORMAT:
        return {
          title: '邮箱格式不正确',
          message: '请输入完整的邮箱地址，例如：张三@163.com',
          action: '修改邮箱地址'
        };

      case ErrorType.EMAIL_DELIVERY:
        return {
          title: '邮箱发送失败',
          message: '无法发送到该邮箱，请检查邮箱地址是否正确',
          action: '更换邮箱地址'
        };

      case ErrorType.OTP_INVALID:
        const remainingAttempts = Math.max(0, 3 - attemptCount);
        return {
          title: '验证码错误',
          message: remainingAttempts > 0 
            ? `验证码错误，请检查后重试 (剩余 ${remainingAttempts} 次机会)`
            : '验证码错误次数过多，请重新发送验证码',
          action: remainingAttempts > 0 ? '重新输入' : '重新发送验证码'
        };

      case ErrorType.OTP_EXPIRED:
        return {
          title: '验证码已过期',
          message: '验证码有效期为10分钟，请重新获取验证码',
          action: '重新发送验证码'
        };

      case ErrorType.OTP_FORMAT:
        return {
          title: '验证码格式错误',
          message: '验证码应为6位数字，请勿输入空格或特殊字符',
          action: '重新输入'
        };

      case ErrorType.RATE_LIMITED:
        return {
          title: '操作过于频繁',
          message: '发送过于频繁，请等待 1 分钟后重试',
          action: '稍后重试'
        };

      case ErrorType.SESSION_EXPIRED:
        return {
          title: '登录会话已过期',
          message: '请重新开始登录流程',
          action: '重新开始'
        };

      case ErrorType.DATABASE_ERROR:
        return {
          title: '数据同步失败',
          message: '服务器暂时无法处理请求，但不影响正常登录',
          action: '继续使用'
        };

      default:
        return {
          title: '操作失败',
          message: '遇到未知错误，请稍后重试或联系客服',
          action: '重试'
        };
    }
  };

  // Enhanced alert with better UX
  const showError = (errorType: ErrorType, context: 'email' | 'otp' = 'email', originalError?: any) => {
    const errorInfo = getErrorMessage(errorType, context);
    setLastError(errorType);

    Alert.alert(
      errorInfo.title,
      errorInfo.message,
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: errorInfo.action || '确定',
          onPress: () => {
            // Auto-action based on error type
            if (errorType === ErrorType.OTP_EXPIRED || 
                (errorType === ErrorType.OTP_INVALID && attemptCount >= 3)) {
              handleResendCode();
            } else if (errorType === ErrorType.SESSION_EXPIRED) {
              setStep('email');
              setOtp('');
              setAttemptCount(0);
            }
          }
        }
      ]
    );
  };

  const handleSendOTP = async () => {
    const trimmedEmail = email.trim();

    // Check if email is empty or just whitespace
    if (!trimmedEmail) {
      showError(ErrorType.EMAIL_EMPTY);
      return;
    }

    // Enhanced email validation
    // First check if it contains @ symbol at all
    if (!trimmedEmail.includes('@')) {
      showError(ErrorType.EMAIL_INVALID);
      return;
    }

    // Then check proper email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showError(ErrorType.EMAIL_FORMAT);
      return;
    }

    // Check for common email format issues
    const cleanEmail = trimmedEmail.toLowerCase();
    if (cleanEmail.includes('..') || cleanEmail.startsWith('.') || cleanEmail.endsWith('.')) {
      showError(ErrorType.EMAIL_FORMAT);
      return;
    }

    setLoading(true);
    setLastError(null);

    try {
      // Always use signInWithOtp with shouldCreateUser: true
      // This ensures consistent Magic Link template for all users
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined, // Prevent email link redirects
          data: {
            email: cleanEmail
          }
        }
      });

      if (error) {
        const errorType = detectErrorType(error);
        showError(errorType, 'email', error);
      } else {
        setStep('otp');
        setResendCountdown(60);
        setAttemptCount(0);
        Alert.alert(
          '验证码已发送 ✅',
          '请检查您的邮箱并输入6位数字验证码\n\n💡 提示：如果没有收到邮件，请检查垃圾邮件文件夹',
          [{ text: '确定' }]
        );
      }
    } catch (error) {
      const errorType = detectErrorType(error);
      showError(errorType, 'email', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      showError(ErrorType.OTP_FORMAT);
      return;
    }

    // Enhanced OTP validation
    const cleanOTP = otp.replace(/\s/g, ''); // Remove spaces
    if (cleanOTP.length !== 6) {
      showError(ErrorType.OTP_FORMAT);
      return;
    }

    if (!/^\d{6}$/.test(cleanOTP)) {
      showError(ErrorType.OTP_FORMAT);
      return;
    }

    setLoading(true);
    const currentAttempt = attemptCount + 1;
    setAttemptCount(currentAttempt);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: cleanOTP,
        type: 'email',
      });

      if (error) {
        const errorType = detectErrorType(error);
        showError(errorType, 'otp', error);

        // Auto-resend if too many failed attempts
        if (currentAttempt >= 3) {
          setTimeout(() => {
            Alert.alert(
              '尝试次数过多',
              '为了您的账户安全，请重新发送验证码',
              [
                {
                  text: '重新发送',
                  onPress: () => {
                    setOtp('');
                    setAttemptCount(0);
                    handleResendCode();
                  }
                }
              ]
            );
          }, 1000);
        }
      } else if (data.user) {
        // Now check if user exists in our database (post-verification)
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('id, dharma_name, class_name, practice_years, location')
          .eq('email', email.trim())
          .maybeSingle();

        if (userError && userError.code !== 'PGRST116') {
          console.error('Error checking user:', userError);
          // Continue anyway, will be handled by AuthContext
        }

        if (!existingUser) {
          // User doesn't exist in our database - create them and go to profile setup
          console.log('📝 Creating new user in database for:', email.trim());

          try {
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: email.trim(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (insertError) {
              console.error('Error creating user:', insertError);
              // Continue anyway, AuthContext will handle this
            }
          } catch (insertErr) {
            console.error('Database insert failed:', insertErr);
            // Continue anyway, user can still use the app
          }

          // New user - redirect to profile setup
          router.replace('/profile-setup');
        } else {
          // Existing user - check if profile is complete
          const isProfileComplete = existingUser.dharma_name && 
                                  existingUser.class_name && 
                                  existingUser.practice_years && 
                                  existingUser.location;

          if (!isProfileComplete) {
            // Profile incomplete - redirect to profile setup
            console.log('🔄 Existing user with incomplete profile, redirecting to setup');
            router.replace('/profile-setup');
          } else {
            // Existing user with complete profile - go to main app
            console.log('✅ Existing user with complete profile, redirecting to tabs');
            router.replace('/(tabs)');
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
    setLastError(null);
    setAttemptCount(0); // Reset attempt count on resend

    try {
      // Use the same consistent approach as initial send
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined,
          data: {
            email: email.trim()
          }
        }
      });

      if (error) {
        const errorType = detectErrorType(error);
        showError(errorType, 'email', error);
      } else {
        setResendCountdown(60);
        setOtp(''); // Clear previous OTP
        Alert.alert(
          '验证码已重新发送 ✅',
          '新的验证码已发送到您的邮箱\n请输入最新收到的6位数字验证码',
          [{ text: '确定' }]
        );
      }
    } catch (error) {
      const errorType = detectErrorType(error);
      showError(errorType, 'email', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    setStep('email');
    setOtp('');
    setResendCountdown(0);
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
                  <ActivityIndicator color={DesignSystem.colors.textInverse} />
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
                  <ActivityIndicator color={DesignSystem.colors.textInverse} />
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

          {/* Error status indicator */}
            {lastError && (
              <View style={styles.errorStatus}>
                <Text style={styles.errorStatusIcon}>
                  {lastError === ErrorType.NETWORK ? '📶' : 
                   lastError === ErrorType.EMAIL_EMPTY ? '📧' :
                   lastError === ErrorType.EMAIL_INVALID ? '❌' :
                   lastError === ErrorType.OTP_INVALID ? '🔢' : 
                   lastError === ErrorType.OTP_EXPIRED ? '⏰' : 
                   lastError === ErrorType.RATE_LIMITED ? '⏳' : '⚠️'}
                </Text>
                <Text style={styles.errorStatusText}>
                  {lastError === ErrorType.NETWORK ? '网络连接异常' : 
                   lastError === ErrorType.EMAIL_EMPTY ? '请输入邮箱地址' :
                   lastError === ErrorType.EMAIL_INVALID ? '邮箱格式无效' :
                   lastError === ErrorType.OTP_INVALID ? '验证码错误' : 
                   lastError === ErrorType.OTP_EXPIRED ? '验证码已过期' : 
                   lastError === ErrorType.RATE_LIMITED ? '操作过于频繁' : '遇到问题'}
                </Text>
                <TouchableOpacity 
                  onPress={() => setLastError(null)}
                  style={styles.errorStatusClose}
                >
                  <Text style={styles.errorStatusCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>💡 使用说明</Text>
              <Text style={styles.helpText}>
                • 新用户将自动创建账户{'\n'}
                • 老用户将直接登录{'\n'}
                • 所有用户都会收到6位数字验证码{'\n'}
                • 验证码有效期为10分钟{'\n'}
                • 请检查垃圾邮件文件夹{'\n'}
                • 支持复制粘贴验证码
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
    backgroundColor: DesignSystem.colors.background,
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
    color: DesignSystem.colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: DesignSystem.colors.textSecondary,
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
    color: DesignSystem.colors.textPrimary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    ...ComponentTokens.input.standard,
  },
  emailDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...ComponentTokens.input.standard,
    backgroundColor: '#F5F5F5',
  },
  emailText: {
    fontSize: 16,
    color: DesignSystem.colors.textSecondary,
    flex: 1,
  },
  changeEmailText: {
    fontSize: 16,
    color: DesignSystem.colors.primary,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: DesignSystem.colors.primary,
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
    color: DesignSystem.colors.textInverse,
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
    color: DesignSystem.colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  resendButtonTextDisabled: {
    color: DesignSystem.colors.textSecondary,
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
    color: DesignSystem.colors.textPrimary,
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: DesignSystem.colors.textSecondary,
    lineHeight: 20,
  },
  errorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  errorStatusIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  errorStatusText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
  errorStatusClose: {
    padding: 4,
  },
  errorStatusCloseText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: 'bold',
  },
});