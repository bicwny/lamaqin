
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  features?: Array<{
    icon: string;
    text: string;
    color: string;
  }>;
}

export function EmptyState({ icon, title, description, actionText, onAction, features }: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center items-center p-10" style={{ minHeight: 500 }}>
      <View className="mb-6">
        <Ionicons name={icon as any} size={80} color="#9CA3AF" />
      </View>

      <Text className="text-2xl font-semibold text-gray-700 mb-3 text-center">{title}</Text>
      <Text className="text-base text-gray-600 text-center leading-6 mb-8 max-w-xs">
        {description}
      </Text>

      {onAction && actionText && (
        <TouchableOpacity 
          className="flex-row items-center bg-blue-500 px-6 py-3 rounded-3xl mb-8"
          onPress={onAction}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <Text className="text-white text-base font-semibold ml-2">{actionText}</Text>
        </TouchableOpacity>
      )}

      {features && (
        <View className="items-center">
          <Text className="text-base font-medium text-gray-700 mb-5">功能特点：</Text>
          <View className="items-stretch">
            {features.map((feature, index) => (
              <View key={index} className="flex-row items-center bg-gray-50 p-3 rounded-lg mb-2 min-w-[200px]">
                <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                <Text className="text-sm text-gray-700 ml-3 font-medium">{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
