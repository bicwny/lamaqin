/**
 * Buddhist Practice Tracking App - Unified Color System
 * Primary: #da4347 (Red) - Energy, passion, determination
 */

// Core brand colors
const BRAND_COLORS = {
  primary: '#da4347',      // Main red
  primaryLight: '#e66a6d',  // Lighter red for hover states
  primaryDark: '#b8353a',   // Darker red for pressed states

  // Supporting colors
  secondary: '#2F4F4F',     // Dark slate gray - stability
  accent: '#FF6B35',        // Orange - energy/compassion

  // Neutral colors
  background: '#FFFFFF',
  surface: '#F8F9FA',       // Light gray for cards/surfaces
  border: '#E5E7EB',        // Light border color

  // Text colors
  textPrimary: '#1F2937',   // Almost black
  textSecondary: '#6B7280', // Medium gray
  textTertiary: '#9CA3AF',  // Light gray

  // Status colors
  success: '#10B981',       // Green
  warning: '#F59E0B',       // Amber
  error: '#EF4444',         // Red (different from primary)
  info: '#3B82F6',          // Blue

  // Buddhist theme colors (using primary red as base)
  practice: '#da4347',      // Primary red
  study: '#da4347',         // Use primary instead of blue
  mindfulness: '#da4347',   // Use primary instead of pink
  stats: '#32CD32',         // Keep green for growth
  profile: '#da4347',       // Use primary instead of purple
};

// Light and dark theme configurations
const LIGHT_THEME = {
  // Background colors
  background: BRAND_COLORS.background,
  surface: BRAND_COLORS.surface,

  // Text colors
  text: BRAND_COLORS.textPrimary,
  textSecondary: BRAND_COLORS.textSecondary,

  // Interactive colors
  tint: BRAND_COLORS.primary,
  primary: BRAND_COLORS.primary,
  secondary: BRAND_COLORS.secondary,

  // Tab colors
  tabIconDefault: BRAND_COLORS.textTertiary,
  tabIconSelected: BRAND_COLORS.primary,

  // Icon colors
  icon: BRAND_COLORS.textSecondary,

  // Feature colors (all using primary for consistency)
  practice: BRAND_COLORS.practice,
  study: BRAND_COLORS.study,
  mindfulness: BRAND_COLORS.mindfulness,
  stats: BRAND_COLORS.stats,
  profile: BRAND_COLORS.profile,

  // Status colors
  success: BRAND_COLORS.success,
  warning: BRAND_COLORS.warning,
  error: BRAND_COLORS.error,
  info: BRAND_COLORS.info,

  // Border colors
  border: BRAND_COLORS.border,
};

const DARK_THEME = {
  // Background colors
  background: '#111827',    // Very dark gray
  surface: '#1F2937',       // Dark gray

  // Text colors
  text: '#F9FAFB',          // Almost white
  textSecondary: '#D1D5DB', // Light gray

  // Interactive colors
  tint: BRAND_COLORS.primaryLight,
  primary: BRAND_COLORS.primaryLight,
  secondary: '#9CA3AF',

  // Tab colors
  tabIconDefault: '#6B7280',
  tabIconSelected: BRAND_COLORS.primaryLight,

  // Icon colors
  icon: '#D1D5DB',

  // Feature colors (using lighter primary for dark mode)
  practice: BRAND_COLORS.primaryLight,
  study: BRAND_COLORS.primaryLight,
  mindfulness: BRAND_COLORS.primaryLight,
  stats: '#34D399', // Lighter green for dark mode
  profile: BRAND_COLORS.primaryLight,

  // Status colors (adjusted for dark mode)
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',

  // Border colors
  border: '#374151',
};

// Semantic color aliases for specific use cases
const SEMANTIC_COLORS = {
  // Interactive elements
  buttonPrimary: BRAND_COLORS.primary,
  buttonSecondary: BRAND_COLORS.surface,
  buttonDanger: BRAND_COLORS.error,

  // Status indicators
  statusActive: BRAND_COLORS.success,
  statusPending: BRAND_COLORS.warning,
  statusInactive: BRAND_COLORS.textTertiary,

  // Buddhist practice specific
  wisdomGold: '#D4AF37',                // Optional accent for special elements
  compassionOrange: BRAND_COLORS.accent, // Secondary accent
};

// Export unified color system
import ConsolidatedDesignSystem from './DesignSystem';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  // Brand colors for direct access
  ...BRAND_COLORS,

  // Semantic colors
  ...SEMANTIC_COLORS,

  // Theme-specific colors
  light: LIGHT_THEME,
  dark: DARK_THEME,

  light2: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark2: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  // App-specific colors - now using design system
  primary: ConsolidatedConsolidatedDesignSystem.colors.primary,
  secondary: ConsolidatedDesignSystem.colors["surface-primary"],
  text: ConsolidatedDesignSystem.colors["text-primary"],
  textSecondary: ConsolidatedDesignSystem.colors["text-secondary"],
  textPrimary: ConsolidatedDesignSystem.colors["text-primary"],
  background: ConsolidatedDesignSystem.colors["surface-primary"],
  surface: ConsolidatedDesignSystem.colorsConsolidatedDesignSystem.colors["surface-secondary"],
  border: ConsolidatedDesignSystem.colors["border-default"],
  success: ConsolidatedDesignSystem.status.success,
  warning: ConsolidatedDesignSystem.status.warning,
  error: ConsolidatedDesignSystem.status.error,
  info: ConsolidatedDesignSystem.status.info,

  // Utility functions
  opacity: (color: string, opacity: number) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
};

// Type definitions for better TypeScript support
export type ColorName = keyof typeof BRAND_COLORS;
export type ThemeColorName = keyof typeof LIGHT_THEME;