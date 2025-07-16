
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { componentHelpers } from '@/utils/componentTokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'outlined' | 'elevated';
  padding?: 'compact' | 'comfortable' | 'spacious';
  style?: ViewStyle;
}

/**
 * Consolidated Card component
 * Replaces: standard, practice, course card variants
 * 
 * @param variant - 'outlined' (low shadow) or 'elevated' (high shadow)
 * @param padding - 'compact' (12px), 'comfortable' (16px), 'spacious' (20px)
 */
export default function Card({ 
  children, 
  variant = 'outlined', 
  padding = 'comfortable', 
  style 
}: CardProps) {
  const cardStyle = componentHelpers.getCardStyle(variant, padding);
  
  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
}
