
import Toast from 'react-native-toast-message';
import { Colors } from '@/constants/Colors';

export interface ToastConfig {
  title: string;
  message?: string;
  duration?: number;
  onPress?: () => void;
}

// Custom toast configurations for Buddhist app theme
const toastConfig = {
  success: {
    style: {
      borderLeftColor: '#28a745',
      borderLeftWidth: 5,
    },
    text1Style: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1d4e20',
    },
    text2Style: {
      fontSize: 14,
      color: '#495057',
    },
  },
  error: {
    style: {
      borderLeftColor: '#dc3545',
      borderLeftWidth: 5,
    },
    text1Style: {
      fontSize: 16,
      fontWeight: '600',
      color: '#721c24',
    },
    text2Style: {
      fontSize: 14,
      color: '#495057',
    },
  },
  info: {
    style: {
      borderLeftColor: '#17a2b8',
      borderLeftWidth: 5,
    },
    text1Style: {
      fontSize: 16,
      fontWeight: '600',
      color: '#0c5460',
    },
    text2Style: {
      fontSize: 14,
      color: '#495057',
    },
  },
};

class ToastService {
  // Success toasts (practice completions, saves, etc.)
  success(config: ToastConfig) {
    Toast.show({
      type: 'success',
      text1: config.title,
      text2: config.message,
      visibilityTime: config.duration || 2000,
      onPress: config.onPress,
    });
  }

  // Error toasts (network failures, validation errors, etc.)
  error(config: ToastConfig) {
    Toast.show({
      type: 'error',
      text1: config.title,
      text2: config.message,
      visibilityTime: config.duration || 5000,
      onPress: config.onPress,
    });
  }

  // Info toasts (background sync, general information)
  info(config: ToastConfig) {
    Toast.show({
      type: 'info',
      text1: config.title,
      text2: config.message,
      visibilityTime: config.duration || 3000,
      onPress: config.onPress,
    });
  }

  // Achievement toasts (course completions, milestones)
  achievement(config: ToastConfig) {
    Toast.show({
      type: 'success',
      text1: `🎉 ${config.title}`,
      text2: config.message,
      visibilityTime: config.duration || 4000,
      onPress: config.onPress,
    });
  }

  // Hide current toast
  hide() {
    Toast.hide();
  }
}

export const toastService = new ToastService();
