/**
 * Enhanced theme color hook with better TypeScript support
 */

import { DesignSystem } from '@/constants/DesignSystem';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof DesignSystem.colors
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    // Map common color names to DesignSystem colors
    const colorMap: { [key: string]: string } = {
      text: DesignSystem.colors.textPrimary,
      background: DesignSystem.colors.background,
      tint: DesignSystem.colors.primary,
      tabIconDefault: DesignSystem.colors.textSecondary,
      tabIconSelected: DesignSystem.colors.primary,
    };
    return colorMap[colorName] || DesignSystem.colors.textPrimary;
  }
}

// New hook for getting primary color variants
export function usePrimaryColor() {
  return {
    primary: DesignSystem.colors.primary,
    light: DesignSystem.colors.primaryLight,
    dark: DesignSystem.colors.primaryDark,
  };
}

// Hook for getting status colors
export function useStatusColors() {
  return {
    success: DesignSystem.colors.success,
    warning: DesignSystem.colors.warning,
    error: DesignSystem.colors.error,
    info: DesignSystem.colors.info,
  };
}