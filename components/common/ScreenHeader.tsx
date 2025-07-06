
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: {
    icon?: string;
    text?: string;
    onPress: () => void;
  };
  leftAction?: {
    icon: string;
    onPress: () => void;
  };
}

export function ScreenHeader({ title, subtitle, rightAction, leftAction }: ScreenHeaderProps) {
  return (
    <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-100">
      {leftAction ? (
        <TouchableOpacity onPress={leftAction.onPress} className="mr-3">
          <Ionicons name={leftAction.icon as any} size={24} color="#6B7280" />
        </TouchableOpacity>
      ) : (
        <View />
      )}
      
      <View className="flex-1">
        <Text className="text-2xl font-semibold text-gray-800">{title}</Text>
        {subtitle && (
          <Text className="text-base text-gray-600 mt-1">{subtitle}</Text>
        )}
      </View>
      
      {rightAction && (
        <TouchableOpacity onPress={rightAction.onPress}>
          {rightAction.icon ? (
            <Ionicons name={rightAction.icon as any} size={24} color="#3B82F6" />
          ) : (
            <Text className="text-blue-500 text-base font-medium">{rightAction.text}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
