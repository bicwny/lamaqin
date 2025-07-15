
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
    return DesignSystem.colors[colorName];
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
