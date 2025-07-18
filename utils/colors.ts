
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
  primaryLight: {
    background: Colors.primaryLight,
    text: '#FFFFFF',
    border: Colors.primary,
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
  dharma: {
    background: Colors.dharmaRed,
    text: '#FFFFFF',
    border: Colors.primaryDark,
  },
};

// Color manipulation utilities
export const ColorUtils = {
  // Get appropriate text color for background
  getContrastText: (backgroundColor: string): string => {
    // Simple contrast calculation - in real app you might want a more sophisticated method
    const isLight = backgroundColor === '#FFFFFF' || backgroundColor.includes('F8F9FA');
    return isLight ? Colors.textPrimary : '#FFFFFF';
  },
  
  // Get hover state color
  getHoverColor: (baseColor: string): string => {
    if (baseColor === Colors.primary) return Colors.primaryLight;
    if (baseColor === Colors.primaryLight) return Colors.primary;
    return baseColor;
  },
  
  // Get pressed state color
  getPressedColor: (baseColor: string): string => {
    if (baseColor === Colors.primary) return Colors.primaryDark;
    if (baseColor === Colors.primaryLight) return Colors.primary;
    return baseColor;
  },
};
