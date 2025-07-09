
import { Alert } from 'react-native';
import { NetworkUtils } from './network';

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  OTP_EXPIRED = 'OTP_EXPIRED',
  OTP_INVALID = 'OTP_INVALID',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ErrorInfo {
  type: ErrorType;
  title: string;
  message: string;
  isRetryable: boolean;
  suggestedAction: string;
  retryDelay?: number;
}

export class ErrorHandler {
  static classify(error: any): ErrorInfo {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    // Network errors
    if (NetworkUtils.isNetworkError(error)) {
      return {
        type: ErrorType.NETWORK_ERROR,
        title: '网络连接问题',
        message: '请检查您的网络连接并重试',
        isRetryable: true,
        suggestedAction: '检查网络连接',
        retryDelay: 3000
      };
    }

    // OTP specific errors
    if (errorMessage.includes('expired') || errorMessage.includes('过期')) {
      return {
        type: ErrorType.OTP_EXPIRED,
        title: '验证码已过期',
        message: '验证码已过期，请重新获取',
        isRetryable: true,
        suggestedAction: '重新发送验证码'
      };
    }

    if (errorMessage.includes('invalid') || errorMessage.includes('无效') || 
        errorMessage.includes('incorrect') || errorMessage.includes('错误')) {
      return {
        type: ErrorType.OTP_INVALID,
        title: '验证码错误',
        message: '请检查验证码是否输入正确',
        isRetryable: true,
        suggestedAction: '重新输入验证码'
      };
    }

    // Rate limiting
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests') || 
        errorMessage.includes('频繁')) {
      return {
        type: ErrorType.RATE_LIMITED,
        title: '请求过于频繁',
        message: '请稍等片刻后再试',
        isRetryable: true,
        suggestedAction: '稍后重试',
        retryDelay: 60000
      };
    }

    // Server errors
    if (errorMessage.includes('server') || errorMessage.includes('internal') || 
        errorMessage.includes('服务器')) {
      return {
        type: ErrorType.SERVER_ERROR,
        title: '服务器暂时不可用',
        message: '服务器遇到问题，请稍后重试',
        isRetryable: true,
        suggestedAction: '稍后重试',
        retryDelay: 5000
      };
    }

    // Validation errors
    if (errorMessage.includes('validation') || errorMessage.includes('required') || 
        errorMessage.includes('format')) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        title: '输入格式错误',
        message: '请检查您的输入格式',
        isRetryable: false,
        suggestedAction: '检查输入内容'
      };
    }

    // Default case
    return {
      type: ErrorType.UNKNOWN_ERROR,
      title: '操作失败',
      message: '发生未知错误，请重试',
      isRetryable: true,
      suggestedAction: '重试操作',
      retryDelay: 3000
    };
  }

  static async handleError(
    error: any, 
    onRetry?: () => Promise<void>,
    showAlert: boolean = true
  ): Promise<ErrorInfo> {
    const errorInfo = this.classify(error);
    
    if (showAlert) {
      if (errorInfo.isRetryable && onRetry) {
        Alert.alert(
          errorInfo.title,
          errorInfo.message,
          [
            { text: '取消', style: 'cancel' },
            { 
              text: errorInfo.suggestedAction, 
              onPress: async () => {
                if (errorInfo.retryDelay) {
                  setTimeout(() => onRetry(), errorInfo.retryDelay);
                } else {
                  await onRetry();
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(errorInfo.title, errorInfo.message);
      }
    }
    
    return errorInfo;
  }

  static async handleWithNetworkCheck(
    operation: () => Promise<any>,
    onRetry?: () => Promise<void>
  ): Promise<any> {
    try {
      // Check network first
      const networkState = await NetworkUtils.checkNetworkState();
      if (!networkState.isConnected) {
        throw new Error('No internet connection available');
      }

      return await operation();
    } catch (error) {
      await this.handleError(error, onRetry);
      throw error;
    }
  }
}
