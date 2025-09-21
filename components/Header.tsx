
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type HeaderContext = 'page' | 'modal' | 'section';

interface HeaderProps {
  title: string;
  subtitle?: string;
  context?: HeaderContext;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    text?: string;
    component?: React.ReactNode;
    onPress: () => void;
  };
  leftAction?: {
    text?: string;
    component?: React.ReactNode;
    onPress: () => void;
  };
}

export default function Header({
  title,
  subtitle,
  context = 'page',
  showBackButton = false,
  onBackPress,
  rightAction,
  leftAction,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  const getContextClasses = () => {
    switch (context) {
      case 'page':
        return {
          container: 'bg-white border-b-2 border-white',
          header: 'flex-row justify-between items-center px-4 py-3 min-h-[60px] border-b border-gray-100',
          title: 'text-xl font-bold text-center text-gray-900',
        };
      case 'modal':
        return {
          container: 'bg-white border-b-2 border-blue-500',
          header: 'flex-row justify-between items-center px-4 py-3 min-h-[56px] border-b border-gray-200',
          title: 'text-lg font-semibold text-center text-gray-900',
        };
      case 'section':
        return {
          container: 'bg-transparent',
          header: 'flex-row justify-between items-center py-2 mb-4 border-b border-gray-100',
          title: 'text-lg font-semibold text-center text-gray-900',
        };
    }
  };

  const contextClasses = getContextClasses();

  return (
    <View 
      className={contextClasses.container}
      style={context === 'page' ? { paddingTop: insets.top } : undefined}
    >
      <View className={contextClasses.header}>
        {/* Left side */}
        {showBackButton ? (
          <TouchableOpacity 
            onPress={onBackPress} 
            className="min-w-[44px] h-11 justify-center items-center rounded-lg bg-transparent"
          >
            <Ionicons name="arrow-back" size={24} color="#ef4444" />
          </TouchableOpacity>
        ) : leftAction ? (
          <TouchableOpacity 
            onPress={leftAction.onPress} 
            className="min-w-[44px] h-11 justify-center items-center rounded-lg bg-transparent"
          >
            {leftAction.component || (
              <Text className="text-sm font-semibold text-red-500">{leftAction.text}</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View className="min-w-[44px]" />
        )}

        {/* Title section */}
        <View className="flex-1 items-center">
          <Text className={contextClasses.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text className="text-sm font-medium text-gray-600 text-center mt-1" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right side */}
        {rightAction ? (
          <TouchableOpacity 
            onPress={rightAction.onPress} 
            className="min-w-[44px] h-11 justify-center items-center rounded-lg bg-transparent"
          >
            {rightAction.component || (
              <Text className="text-sm font-semibold text-red-500">{rightAction.text}</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View className="min-w-[44px]" />
        )}
      </View>
    </View>
  );
}

