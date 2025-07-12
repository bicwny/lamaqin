
import Toast from 'react-native-toast-message';
import { Colors } from '@/constants/Colors';

export interface ToastConfig {
  title: string;
  message?: string;
  duration?: number;
  onPress?: () => void;
}

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
