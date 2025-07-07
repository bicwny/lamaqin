
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Utility functions for consistent color usage across the app
 */

// Get theme-aware color
export function getThemeColor(colorName: keyof typeof Colors.light, colorScheme: 'light' | 'dark' = 'light') {
  return Colors[colorScheme][colorName] || Colors.light[colorName];
}

// Add opacity to any color
export function withOpacity(color: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${color}${alpha}`;
}

// Get contrasting text color
export function getContrastColor(backgroundColor: string): string {
  // Simple contrast calculation (you can make this more sophisticated)
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? Colors.textPrimary : '#FFFFFF';
}

// Color variants generator
export function getColorVariants(baseColor: string) {
  return {
    base: baseColor,
    light: withOpacity(baseColor, 0.1),
    medium: withOpacity(baseColor, 0.2),
    strong: withOpacity(baseColor, 0.8),
  };
}

// Predefined color combinations
export const COLOR_COMBINATIONS = {
  primary: {
    background: Colors.primary,
    text: '#FFFFFF',
    border: Colors.primaryDark,
  },
  secondary: {
    background: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.border,
  },
  success: {
    background: Colors.success,
    text: '#FFFFFF',
    border: '#059669',
  },
  warning: {
    background: Colors.warning,
    text: '#FFFFFF',
    border: '#D97706',
  },
  error: {
    background: Colors.error,
    text: '#FFFFFF',
    border: '#DC2626',
  },
};
