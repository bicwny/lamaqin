
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { componentHelpers } from '@/utils/componentTokens';

interface CardContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'outlined' | 'elevated';
  padding?: 'compact' | 'comfortable' | 'spacious' | number;
  margin?: number;
  marginHorizontal?: number;
  marginVertical?: number;
}

/**
 * CardContainer - Updated to use new consolidated card system
 * @deprecated Consider using the new Card component directly
 */
export default function CardContainer({
  children,
  style,
  variant = 'outlined',
  padding = 'comfortable',
  margin,
  marginHorizontal,
  marginVertical,
}: CardContainerProps) {
  // Get base card style from new system
  const baseCardStyle = componentHelpers.getCardStyle(variant, typeof padding === 'string' ? padding : 'comfortable');
  
  // Override with custom spacing if provided
  const customSpacing = {
    ...(typeof padding === 'number' && { padding }),
    ...(margin !== undefined && { margin }),
    ...(marginHorizontal !== undefined && { marginHorizontal }),
    ...(marginVertical !== undefined && { marginVertical }),
  };

  return (
    <View 
      style={[
        baseCardStyle,
        customSpacing,
        style
      ]}
    >
      {children}
    </View>
  );
}
