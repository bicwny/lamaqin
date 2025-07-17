
/**
 * Updated Color Migration Utilities
 * Now uses the consolidated 15-token system
 */

import ConsolidatedDesignSystem, { migrationMap, buddhistSemantics, colorUtils } from '@/constants/ConsolidatedDesignSystem';

// Migration map for hardcoded hex values found in audit
export const colorMigrationMap = {
  // Text colors
  '#1a1a1a': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['text-primary'],
  '#1A1A1A': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['text-primary'],
  '#FFFFFF': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['text-inverse'],
  '#ffffff': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['text-inverse'],
  '#666666': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['text-secondary'],
  '#999999': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['text-secondary'],
  
  // Background colors
  '#f8f9fa': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['surface-secondary'],
  '#F8F9FA': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['surface-secondary'],
  '#ffffff': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['surface-primary'],
  '#FFFFFF': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['surface-primary'],
  '#f0f0f0': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['surface-primary'],
  '#F0F0F0': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['surface-primary'],
  
  // Border colors
  '#e9ecef': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['border-default'],
  '#E9ECEF': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['border-default'],
  '#dee2e6': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['border-default'],
  '#DEE2E6': ConsolidatedConsolidatedConsolidatedDesignSystem.colors['border-default'],
  
  // Status colors
  '#2e7d32': ConsolidatedConsolidatedConsolidatedDesignSystem.status.success,
  '#2E7D32': ConsolidatedConsolidatedConsolidatedDesignSystem.status.success,
  '#e8f5e8': colorUtils.withOpacity(ConsolidatedConsolidatedConsolidatedDesignSystem.status.success, 0.1),
  '#E8F5E8': colorUtils.withOpacity(ConsolidatedConsolidatedConsolidatedDesignSystem.status.success, 0.1),
  
  // Primary colors
  '#da4347': ConsolidatedConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
  '#DA4347': ConsolidatedConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
  '#b8393d': colorUtils.darken(ConsolidatedConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary),
  '#e66a6d': colorUtils.lighten(ConsolidatedConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary),
  
  // Shadow and overlay
  '#000': ConsolidatedConsolidatedConsolidatedDesignSystem.utility.shadow,
  '#000000': ConsolidatedConsolidatedConsolidatedDesignSystem.utility.shadow,
  'rgba(0, 0, 0, 0.5)': ConsolidatedConsolidatedConsolidatedDesignSystem.utility.overlay,
  'rgba(0,0,0,0.5)': ConsolidatedConsolidatedConsolidatedDesignSystem.utility.overlay,
};

// Buddhist semantic color helpers - updated for consolidated system
export const buddhistColors = {
  // Practice type colors
  getPracticeTypeColor: (type: 'count' | 'time') => {
    return type === 'time' 
      ? ConsolidatedConsolidatedConsolidatedDesignSystem.accent['accent-secondary'] 
      : ConsolidatedConsolidatedConsolidatedDesignSystem.accent['accent-primary'];
  },
  
  // Status colors with Buddhist meaning
  getPracticeStatusColor: (status: 'active' | 'completed' | 'inactive') => {
    switch (status) {
      case 'active': return ConsolidatedConsolidatedConsolidatedDesignSystem.accent['accent-primary'];
      case 'completed': return ConsolidatedConsolidatedConsolidatedDesignSystem.status.success;
      case 'inactive': return ConsolidatedConsolidatedConsolidatedDesignSystem.colors['text-secondary'];
      default: return ConsolidatedConsolidatedConsolidatedDesignSystem.colors['text-secondary'];
    }
  },
  
  // Feature area colors
  getFeatureColor: (feature: 'practice' | 'study' | 'mindfulness' | 'stats') => {
    switch (feature) {
      case 'practice': return ConsolidatedConsolidatedConsolidatedDesignSystem.accent['accent-primary'];
      case 'study': return ConsolidatedConsolidatedConsolidatedDesignSystem.accent['accent-secondary'];
      case 'mindfulness': return ConsolidatedConsolidatedConsolidatedDesignSystem.accent['accent-primary'];
      case 'stats': return ConsolidatedConsolidatedConsolidatedDesignSystem.status.success;
      default: return ConsolidatedConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary;
    }
  },
  
  // Achievement colors
  getAchievementColor: (type: 'completion' | 'progress' | 'milestone') => {
    switch (type) {
      case 'completion': return ConsolidatedConsolidatedConsolidatedDesignSystem.status.success;
      case 'progress': return ConsolidatedConsolidatedConsolidatedDesignSystem.accent['accent-secondary'];
      case 'milestone': return colorUtils.adjustHue?.(ConsolidatedConsolidatedConsolidatedDesignSystem.accent['accent-primary'], 45) || '#D4AF37';
      default: return ConsolidatedConsolidatedConsolidatedDesignSystem.status.success;
    }
  },
};

// Color contrast utilities - updated for consolidated system
export const colorUtilsUpdated = {
  // Get appropriate text color for background
  getContrastText: (backgroundColor: string): string => {
    const lightBackgrounds = [
      ConsolidatedConsolidatedConsolidatedDesignSystem.colors['surface-primary'],
      ConsolidatedConsolidatedConsolidatedDesignSystem.colors['surface-secondary'],
      colorUtils.withOpacity(ConsolidatedConsolidatedConsolidatedDesignSystem.status.success, 0.1),
      colorUtils.withOpacity(ConsolidatedConsolidatedConsolidatedDesignSystem.status.warning, 0.1),
      colorUtils.withOpacity(ConsolidatedConsolidatedConsolidatedDesignSystem.status.error, 0.1),
      '#ffffff',
      '#f8f9fa',
      '#f0f0f0',
    ];
    
    return lightBackgrounds.includes(backgroundColor) 
      ? ConsolidatedConsolidatedConsolidatedDesignSystem.colors['text-primary']
      : ConsolidatedConsolidatedConsolidatedDesignSystem.colors['text-inverse'];
  },
  
  // Get hover state color
  getHoverColor: (baseColor: string): string => {
    if (baseColor === ConsolidatedConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary) {
      return colorUtils.lighten(ConsolidatedConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary);
    }
    if (baseColor === ConsolidatedConsolidatedConsolidatedDesignSystem.accent['accent-primary']) {
      return colorUtils.lighten(ConsolidatedConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary);
    }
    return baseColor;
  },
  
  // Get pressed state color
  getPressedColor: (baseColor: string): string => {
    if (baseColor === ConsolidatedConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary) {
      return colorUtils.darken(ConsolidatedConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary);
    }
    if (baseColor === ConsolidatedConsolidatedConsolidatedDesignSystem.accent['accent-primary']) {
      return colorUtils.darken(ConsolidatedConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary);
    }
    return baseColor;
  },
  
  // Add opacity to color
  withOpacity: (color: string, opacity: number): string => {
    return colorUtils.withOpacity(color, opacity);
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
  
  // Check if using old design system tokens
  hasOldTokens: (styleObject: any): boolean => {
    const oldTokenPatterns = [
      /DesignSystem\.colors\./,
      /textPrimary/,
      /backgroundSecondary/,
      /dharmaRed/,
      /successBackground/,
    ];
    
    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        return oldTokenPatterns.some(pattern => pattern.test(value));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(checkValue);
      }
      return false;
    };
    
    return checkValue(styleObject);
  },
};

// Export all utilities with consolidated system
export {
  colorMigrationMap,
  buddhistColors,
  colorUtilsUpdated as colorUtils,
  validateColors,
  ConsolidatedDesignSystem,
  buddhistSemantics,
  migrationMap,
};
