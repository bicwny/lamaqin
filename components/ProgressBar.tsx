
import React from 'react';
import { View, StyleSheet } from 'react-native';
import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';

export type ProgressBarSize = 'thin' | 'medium' | 'thick';

interface ProgressBarProps {
  /** Progress value from 0 to 100 */
  progress: number;
  /** Size variant determining height */
  size?: ProgressBarSize;
  /** Custom container style */
  containerStyle?: any;
  /** Custom fill color */
  fillColor?: string;
  /** Custom background color */
  backgroundColor?: string;
}

const SIZE_CONFIG = {
  thin: {
    height: 8,
    borderRadius: ConsolidatedDesignSystem.borderRadius.sm,
  },
  medium: {
    height: 12,
    borderRadius: ConsolidatedDesignSystem.spacing.xxs,
  },
  thick: {
    height: 16,
    borderRadius: 8,
  },
} as const;

const BACKGROUND_COLORS = {
  thin: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
  medium: ConsolidatedConsolidatedDesignSystem.colors["border-default"]Light,
  thick: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
} as const;

const FILL_COLORS = {
  thin: ConsolidatedConsolidatedDesignSystem.colors.primary,
  medium: ConsolidatedConsolidatedDesignSystem.accent["accent-secondary"],
  thick: ConsolidatedConsolidatedDesignSystem.accent["accent-primary"],
} as const;

export default function ProgressBar({
  progress,
  size = 'thin',
  containerStyle,
  fillColor,
  backgroundColor,
}: ProgressBarProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const defaultBackgroundColor = backgroundColor || BACKGROUND_COLORS[size];
  const defaultFillColor = fillColor || FILL_COLORS[size];
  
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const containerStyles = [
    styles.container,
    {
      height: sizeConfig.height,
      borderRadius: sizeConfig.borderRadius,
      backgroundColor: defaultBackgroundColor,
    },
    size === 'thick' && styles.thickBorder,
    containerStyle,
  ];

  const fillStyles = [
    styles.fill,
    {
      width: `${clampedProgress}%`,
      borderRadius: sizeConfig.borderRadius,
      backgroundColor: defaultFillColor,
    },
  ];

  return (
    <View style={containerStyles}>
      <View style={fillStyles} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  thickBorder: {
    borderWidth: 1,
    borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
  },
});
