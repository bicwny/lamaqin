
/**
 * Updated Color Migration Utilities
 * Now uses the consolidated 15-token system
 */

import ConsolidatedDesignSystem, { migrationMap, buddhistSemantics, colorUtils } from '@/constants/ConsolidatedDesignSystem';

// Migration map for hardcoded hex values found in audit
export const colorMigrationMap = {
  // Text colors
  '#1a1a1a': ConsolidatedDesignSystem.colors['text-primary'],
  '#1A1A1A': ConsolidatedDesignSystem.colors['text-primary'],
  '#FFFFFF': ConsolidatedDesignSystem.colors['text-inverse'],
  '#ffffff': ConsolidatedDesignSystem.colors['text-inverse'],
  '#666666': ConsolidatedDesignSystem.colors['text-secondary'],
  '#999999': ConsolidatedDesignSystem.colors['text-secondary'],
  
  // Background colors
  '#f8f9fa': ConsolidatedDesignSystem.colors['surface-secondary'],
  '#F8F9FA': ConsolidatedDesignSystem.colors['surface-secondary'],
  '#ffffff': ConsolidatedDesignSystem.colors['surface-primary'],
  '#FFFFFF': ConsolidatedDesignSystem.colors['surface-primary'],
  '#f0f0f0': ConsolidatedDesignSystem.colors['surface-primary'],
  '#F0F0F0': ConsolidatedDesignSystem.colors['surface-primary'],
  
  // Border colors
  '#e9ecef': ConsolidatedDesignSystem.colors['border-default'],
  '#E9ECEF': ConsolidatedDesignSystem.colors['border-default'],
  '#dee2e6': ConsolidatedDesignSystem.colors['border-default'],
  '#DEE2E6': ConsolidatedDesignSystem.colors['border-default'],
  
  // Status colors
  '#2e7d32': ConsolidatedDesignSystem.status.success,
  '#2E7D32': ConsolidatedDesignSystem.status.success,
  '#e8f5e8': colorUtils.withOpacity(ConsolidatedDesignSystem.status.success, 0.1),
  '#E8F5E8': colorUtils.withOpacity(ConsolidatedDesignSystem.status.success, 0.1),
  
  // Primary colors
  '#da4347': ConsolidatedConsolidatedDesignSystem.colors.primary,
  '#DA4347': ConsolidatedConsolidatedDesignSystem.colors.primary,
  '#b8393d': colorUtils.darken(ConsolidatedConsolidatedDesignSystem.colors.primary),
  '#e66a6d': colorUtils.lighten(ConsolidatedConsolidatedDesignSystem.colors.primary),
  
  // Shadow and overlay
  '#000': ConsolidatedDesignSystem.utility.shadow,
  '#000000': ConsolidatedDesignSystem.utility.shadow,
  'rgba(0, 0, 0, 0.5)': ConsolidatedDesignSystem.utility.overlay,
  'rgba(0,0,0,0.5)': ConsolidatedDesignSystem.utility.overlay,
};

// Buddhist semantic color helpers - updated for consolidated system
export const buddhistColors = {
  // Practice type colors
  getPracticeTypeColor: (type: 'count' | 'time') => {
    return type === 'time' 
      ? ConsolidatedDesignSystem.accent['accent-secondary'] 
      : ConsolidatedDesignSystem.accent['accent-primary'];
  },
  
  // Status colors with Buddhist meaning
  getPracticeStatusColor: (status: 'active' | 'completed' | 'inactive') => {
    switch (status) {
      case 'active': return ConsolidatedDesignSystem.accent['accent-primary'];
      case 'completed': return ConsolidatedDesignSystem.status.success;
      case 'inactive': return ConsolidatedDesignSystem.colors['text-secondary'];
      default: return ConsolidatedDesignSystem.colors['text-secondary'];
    }
  },
  
  // Feature area colors
  getFeatureColor: (feature: 'practice' | 'study' | 'mindfulness' | 'stats') => {
    switch (feature) {
      case 'practice': return ConsolidatedDesignSystem.accent['accent-primary'];
      case 'study': return ConsolidatedDesignSystem.accent['accent-secondary'];
      case 'mindfulness': return ConsolidatedDesignSystem.accent['accent-primary'];
      case 'stats': return ConsolidatedDesignSystem.status.success;
      default: return ConsolidatedConsolidatedDesignSystem.colors.primary;
    }
  },
  
  // Achievement colors
  getAchievementColor: (type: 'completion' | 'progress' | 'milestone') => {
    switch (type) {
      case 'completion': return ConsolidatedDesignSystem.status.success;
      case 'progress': return ConsolidatedDesignSystem.accent['accent-secondary'];
      case 'milestone': return colorUtils.adjustHue?.(ConsolidatedDesignSystem.accent['accent-primary'], 45) || '#D4AF37';
      default: return ConsolidatedDesignSystem.status.success;
    }
  },
};

// Color contrast utilities - updated for consolidated system
export const colorUtilsUpdated = {
  // Get appropriate text color for background
  getContrastText: (backgroundColor: string): string => {
    const lightBackgrounds = [
      ConsolidatedDesignSystem.colors['surface-primary'],
      ConsolidatedDesignSystem.colors['surface-secondary'],
      colorUtils.withOpacity(ConsolidatedDesignSystem.status.success, 0.1),
      colorUtils.withOpacity(ConsolidatedDesignSystem.status.warning, 0.1),
      colorUtils.withOpacity(ConsolidatedDesignSystem.status.error, 0.1),
      '#ffffff',
      '#f8f9fa',
      '#f0f0f0',
    ];
    
    return lightBackgrounds.includes(backgroundColor) 
      ? ConsolidatedDesignSystem.colors['text-primary']
      : ConsolidatedDesignSystem.colors['text-inverse'];
  },
  
  // Get hover state color
  getHoverColor: (baseColor: string): string => {
    if (baseColor === ConsolidatedConsolidatedDesignSystem.colors.primary) {
      return colorUtils.lighten(ConsolidatedConsolidatedDesignSystem.colors.primary);
    }
    if (baseColor === ConsolidatedDesignSystem.accent['accent-primary']) {
      return colorUtils.lighten(ConsolidatedConsolidatedDesignSystem.colors.primary);
    }
    return baseColor;
  },
  
  // Get pressed state color
  getPressedColor: (baseColor: string): string => {
    if (baseColor === ConsolidatedConsolidatedDesignSystem.colors.primary) {
      return colorUtils.darken(ConsolidatedConsolidatedDesignSystem.colors.primary);
    }
    if (baseColor === ConsolidatedDesignSystem.accent['accent-primary']) {
      return colorUtils.darken(ConsolidatedConsolidatedDesignSystem.colors.primary);
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
