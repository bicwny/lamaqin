
import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  variant?: 'outlined' | 'elevated';
  padding?: 'compact' | 'comfortable' | 'spacious';
  style?: ViewStyle;
}

/**
 * Consolidated Card component using NativeWind utility classes
 * Replaces: standard, practice, course card variants
 * 
 * @param variant - 'outlined' (light shadow) or 'elevated' (prominent shadow)
 * @param padding - 'compact' (12px), 'comfortable' (16px), 'spacious' (20px)
 */
export default function Card({ 
  children, 
  variant = 'outlined', 
  padding = 'comfortable', 
  style 
}: CardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white rounded-lg shadow-lg';
      case 'outlined':
      default:
        return 'bg-white rounded-lg border border-gray-200 shadow-sm';
    }
  };
  
  const getPaddingClasses = () => {
    switch (padding) {
      case 'compact':
        return 'p-3'; // 12px
      case 'spacious':
        return 'p-5'; // 20px
      case 'comfortable':
      default:
        return 'p-4'; // 16px
    }
  };
  
  return (
    <View 
      className={`${getVariantClasses()} ${getPaddingClasses()}`}
      style={style}
    >
      {children}
    </View>
  );
}
