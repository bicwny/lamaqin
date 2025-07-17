
/**
 * Color Migration Utilities
 * Provides systematic mapping from hardcoded values to DesignSystem tokens
 */

import { DesignSystem } from '@/constants/DesignSystem';

// Migration map for hardcoded hex values found in audit
export const colorMigrationMap = {
  // Text colors
  '#1a1a1a': DesignSystem.colors.textPrimary,
  '#1A1A1A': DesignSystem.colors.textPrimary,
  '#FFFFFF': DesignSystem.colors.textInverse,
  '#ffffff': DesignSystem.colors.textInverse,
  '#666666': DesignSystem.colors.textSecondary,
  '#999999': DesignSystem.colors.textTertiary,
  
  // Background colors
  '#f8f9fa': DesignSystem.colors.background,
  '#F8F9FA': DesignSystem.colors.background,
  '#ffffff': DesignSystem.colors.backgroundSecondary,
  '#FFFFFF': DesignSystem.colors.backgroundSecondary,
  '#f0f0f0': DesignSystem.colors.backgroundTertiary,
  '#F0F0F0': DesignSystem.colors.backgroundTertiary,
  
  // Border colors
  '#e9ecef': DesignSystem.colors.border,
  '#E9ECEF': DesignSystem.colors.border,
  '#f0f0f0': DesignSystem.colors.borderLight,
  '#F0F0F0': DesignSystem.colors.borderLight,
  '#dee2e6': DesignSystem.colors.borderDark,
  '#DEE2E6': DesignSystem.colors.borderDark,
  
  // Status colors
  '#2e7d32': DesignSystem.colors.practiceComplete,
  '#2E7D32': DesignSystem.colors.practiceComplete,
  '#e8f5e8': DesignSystem.colors.successBackground,
  '#E8F5E8': DesignSystem.colors.successBackground,
  
  // Primary colors
  '#da4347': DesignSystem.colors.primary,
  '#DA4347': DesignSystem.colors.primary,
  '#b8393d': DesignSystem.colors.primaryDark,
  '#e66a6d': DesignSystem.colors.primaryLight,
  
  // Shadow and overlay
  '#000': DesignSystem.colors.cardShadow,
  '#000000': DesignSystem.colors.cardShadow,
  'rgba(0, 0, 0, 0.5)': DesignSystem.colors.overlayDark,
  'rgba(0,0,0,0.5)': DesignSystem.colors.overlayDark,
};

// Buddhist semantic color helpers
export const buddhistColors = {
  // Practice type colors
  getPracticeTypeColor: (type: 'count' | 'time') => {
    return type === 'time' ? DesignSystem.colors.meditationBlue : DesignSystem.colors.dharmaRed;
  },
  
  // Status colors with Buddhist meaning
  getPracticeStatusColor: (status: 'active' | 'completed' | 'inactive') => {
    switch (status) {
      case 'active': return DesignSystem.colors.practiceActive;
      case 'completed': return DesignSystem.colors.practiceComplete;
      case 'inactive': return DesignSystem.colors.practiceInactive;
      default: return DesignSystem.colors.textSecondary;
    }
  },
  
  // Feature area colors
  getFeatureColor: (feature: 'practice' | 'study' | 'mindfulness' | 'stats') => {
    switch (feature) {
      case 'practice': return DesignSystem.colors.dharmaRed;
      case 'study': return DesignSystem.colors.wisdomGold;
      case 'mindfulness': return DesignSystem.colors.compassionOrange;
      case 'stats': return DesignSystem.colors.studyProgress;
      default: return DesignSystem.colors.primary;
    }
  },
  
  // Achievement colors
  getAchievementColor: (type: 'completion' | 'progress' | 'milestone') => {
    switch (type) {
      case 'completion': return DesignSystem.colors.practiceComplete;
      case 'progress': return DesignSystem.colors.studyProgress;
      case 'milestone': return DesignSystem.colors.wisdomGold;
      default: return DesignSystem.colors.success;
    }
  },
};

// Color contrast utilities
export const colorUtils = {
  // Get appropriate text color for background
  getContrastText: (backgroundColor: string): string => {
    // Simple contrast check - in production you might want more sophisticated calculation
    const lightBackgrounds = [
      DesignSystem.colors.background,
      DesignSystem.colors.backgroundSecondary,
      DesignSystem.colors.backgroundTertiary,
      DesignSystem.colors.successBackground,
      DesignSystem.colors.warningBackground,
      DesignSystem.colors.errorBackground,
      '#ffffff',
      '#f8f9fa',
      '#f0f0f0',
    ];
    
    return lightBackgrounds.includes(backgroundColor) 
      ? DesignSystem.colors.textPrimary 
      : DesignSystem.colors.textInverse;
  },
  
  // Get hover state color
  getHoverColor: (baseColor: string): string => {
    if (baseColor === DesignSystem.colors.primary) return DesignSystem.colors.primaryLight;
    if (baseColor === DesignSystem.colors.primaryLight) return DesignSystem.colors.primary;
    if (baseColor === DesignSystem.colors.dharmaRed) return DesignSystem.colors.primaryLight;
    return baseColor;
  },
  
  // Get pressed state color
  getPressedColor: (baseColor: string): string => {
    if (baseColor === DesignSystem.colors.primary) return DesignSystem.colors.primaryDark;
    if (baseColor === DesignSystem.colors.primaryLight) return DesignSystem.colors.primary;
    if (baseColor === DesignSystem.colors.dharmaRed) return DesignSystem.colors.primaryDark;
    return baseColor;
  },
  
  // Add opacity to color
  withOpacity: (color: string, opacity: number): string => {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `${color}${alpha}`;
  },
};

// Validation utility to check for hardcoded colors
export const validateColors = {
  // Check if a style object contains hardcoded colors
  hasHardcodedColors: (styleObject: any): boolean => {
    const hardcodedPatterns = [
      /^#[0-9A-Fa-f]{3,8}$/,  // Hex colors
      /^rgba?\(/,              // RGB/RGBA colors
      /^hsla?\(/,              // HSL/HSLA colors
    ];
    
    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        return hardcodedPatterns.some(pattern => pattern.test(value));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(checkValue);
      }
      return false;
    };
    
    return checkValue(styleObject);
  },
  
  // Get suggestions for hardcoded color values
  suggestDesignSystemColor: (hardcodedColor: string): string | null => {
    const normalizedColor = hardcodedColor.toLowerCase();
    return colorMigrationMap[normalizedColor] || null;
  },
};

// Export all utilities
export {
  colorMigrationMap,
  buddhistColors,
  colorUtils,
  validateColors,
};
