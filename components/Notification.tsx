
import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { componentHelpers, ComponentTextStyles } from '@/utils/componentTokens';

interface NotificationProps {
  title?: string;
  message: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  style?: ViewStyle;
}

/**
 * Notification component
 * Replaces: status cards and other notification patterns
 * 
 * @param variant - 'success', 'warning', 'error', 'info'
 */
export default function Notification({ 
  title, 
  message, 
  variant = 'info', 
  style 
}: NotificationProps) {
  const notificationStyle = componentHelpers.getNotificationStyle(variant);
  
  return (
    <View style={[notificationStyle, style]}>
      {title && (
        <Text style={ComponentTextStyles.notification.title}>
          {title}
        </Text>
      )}
      <Text style={ComponentTextStyles.notification.message}>
        {message}
      </Text>
    </View>
  );
}
