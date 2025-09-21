/**
 * Color constants with theme support
 * Based on the Design System but structured for theme-aware usage
 */

import { DesignSystem } from './DesignSystem';

// Extract colors from DesignSystem for easier access
const designColors = DesignSystem.colors;

export const Colors = {
  // Light theme colors
  light: {
    text: designColors.textPrimary,
    textSecondary: designColors.textSecondary,
    textTertiary: designColors.textTertiary,
    background: designColors.background,
    backgroundSecondary: designColors.backgroundSecondary,
    surface: designColors.backgroundSecondary,
    border: designColors.border,
    borderLight: designColors.borderLight,
    borderDark: designColors.borderDark,
    primary: designColors.primary,
    secondary: designColors.textSecondary,
    success: designColors.success,
    warning: designColors.warning,
    error: designColors.error,
    info: designColors.info,
    icon: designColors.icon,
  },
  
  // Dark theme colors (currently using same as light, but can be customized)
  dark: {
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#8E8E8E',
    background: '#1A1A1A',
    backgroundSecondary: '#2A2A2A',
    surface: '#2A2A2A',
    border: '#3A3A3A',
    borderLight: '#2E2E2E',
    borderDark: '#4A4A4A',
    primary: designColors.primary,
    secondary: '#B0B0B0',
    success: designColors.success,
    warning: designColors.warning,
    error: designColors.error,
    info: designColors.info,
    icon: '#B0B0B0',
  },

  // Direct color exports for backward compatibility
  primary: designColors.primary,
  primaryLight: '#ff6b6b', // Lighter variant of primary
  primaryDark: '#c23d3d',  // Darker variant of primary
  
  // Text colors
  text: designColors.textPrimary,
  textSecondary: designColors.textSecondary,
  textTertiary: designColors.textTertiary,
  textInverse: designColors.textInverse,
  
  // Background colors
  background: designColors.background,
  backgroundSecondary: designColors.backgroundSecondary,
  surface: designColors.backgroundSecondary,
  
  // Border colors
  border: designColors.border,
  borderLight: designColors.borderLight,
  borderDark: designColors.borderDark,
  
  // Status colors
  success: designColors.success,
  warning: designColors.warning,
  error: designColors.error,
  info: designColors.info,
  
  // Buddhist theme colors
  redTara: designColors.redTara,
  redTaraLight: designColors.redTaraLight,
  redTaraDark: designColors.redTaraDark,
  orangeTara: designColors.orangeTara,
  orangeTaraLight: designColors.orangeTaraLight,
  yellowTara: designColors.yellowTara,
  yellowTaraLight: designColors.yellowTaraLight,
  blueTara: designColors.blueTara,
  blueTaraLight: designColors.blueTaraLight,
  greenTara: designColors.greenTara,
  blackTara: designColors.blackTara,
  blackTaraLight: designColors.blackTaraLight,
  whiteTara: designColors.whiteTara,
  whiteTaraLight: designColors.whiteTaraLight,
  
  // Practice colors
  practiceComplete: designColors.practiceComplete,
  practiceActive: designColors.practiceActive,
  practiceInactive: designColors.practiceInactive,
  
  // Utility colors
  cardShadow: designColors.cardShadow,
  overlayDark: designColors.overlayDark,
  cardBackground: designColors.cardBackground,
  modalBackground: designColors.modalBackground,
  overlayBackground: designColors.overlayBackground,
  successBackground: designColors.successBackground,
};

export default Colors;