
/**
 * Enhanced theme color hook with better TypeScript support
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

// New hook for getting primary color variants
export function usePrimaryColor() {
  const theme = useColorScheme() ?? 'light';
  return {
    primary: Colors[theme].primary,
    light: Colors.primaryLight,
    dark: Colors.primaryDark,
  };
}

// Hook for getting status colors
export function useStatusColors() {
  const theme = useColorScheme() ?? 'light';
  return {
    success: Colors[theme].success,
    warning: Colors[theme].warning,
    error: Colors[theme].error,
    info: Colors[theme].info,
  };
}
