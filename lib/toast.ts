
import Toast from 'react-native-toast-message';
import { View, Text } from 'react-native';
import { Colors } from '@/constants/Colors';

export interface ToastConfig {
  title: string;
  message?: string;
  duration?: number;
  onPress?: () => void;
}

// Custom toast configuration with consistent white text
export const toastConfig = {
  success: (props: any) => (
    <View style={{
      height: 60,
      width: '90%',
      backgroundColor: '#10B981',
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#FFFFFF',
          marginBottom: 2,
        }}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={{
            fontSize: 14,
            color: '#FFFFFF',
            opacity: 0.9,
          }}>
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  ),
  error: (props: any) => (
    <View style={{
      height: 60,
      width: '90%',
      backgroundColor: '#EF4444',
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#FFFFFF',
          marginBottom: 2,
        }}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={{
            fontSize: 14,
            color: '#FFFFFF',
            opacity: 0.9,
          }}>
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  ),
  info: (props: any) => (
    <View style={{
      height: 60,
      width: '90%',
      backgroundColor: '#3B82F6',
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#FFFFFF',
          marginBottom: 2,
        }}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={{
            fontSize: 14,
            color: '#FFFFFF',
            opacity: 0.9,
          }}>
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  ),
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
