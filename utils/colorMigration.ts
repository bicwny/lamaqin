
/**
 * Updated Color Migration Utilities
 * Now uses the consolidated 15-token system
 */

import ConsolidatedDesignSystem, { migrationMap, buddhistSemantics, colorUtils } from '@/constants/ConsolidatedDesignSystem';

// Migration map for hardcoded hex values found in audit
export const colorMigrationMap = {
  // Text colors
  '#1a1a1a': ConsolidatedConsolidatedDesignSystem.colors['text-primary'],
  '#1A1A1A': ConsolidatedConsolidatedDesignSystem.colors['text-primary'],
  '#FFFFFF': ConsolidatedConsolidatedDesignSystem.colors['text-inverse'],
  '#ffffff': ConsolidatedConsolidatedDesignSystem.colors['text-inverse'],
  '#666666': ConsolidatedConsolidatedDesignSystem.colors['text-secondary'],
  '#999999': ConsolidatedConsolidatedDesignSystem.colors['text-secondary'],
  
  // Background colors
  '#f8f9fa': ConsolidatedConsolidatedDesignSystem.colors['surface-secondary'],
  '#F8F9FA': ConsolidatedConsolidatedDesignSystem.colors['surface-secondary'],
  '#ffffff': ConsolidatedConsolidatedDesignSystem.colors['surface-primary'],
  '#FFFFFF': ConsolidatedConsolidatedDesignSystem.colors['surface-primary'],
  '#f0f0f0': ConsolidatedConsolidatedDesignSystem.colors['surface-primary'],
  '#F0F0F0': ConsolidatedConsolidatedDesignSystem.colors['surface-primary'],
  
  // Border colors
  '#e9ecef': ConsolidatedConsolidatedDesignSystem.colors['border-default'],
  '#E9ECEF': ConsolidatedConsolidatedDesignSystem.colors['border-default'],
  '#dee2e6': ConsolidatedConsolidatedDesignSystem.colors['border-default'],
  '#DEE2E6': ConsolidatedConsolidatedDesignSystem.colors['border-default'],
  
  // Status colors
  '#2e7d32': ConsolidatedConsolidatedDesignSystem.status.success,
  '#2E7D32': ConsolidatedConsolidatedDesignSystem.status.success,
  '#e8f5e8': colorUtils.withOpacity(ConsolidatedConsolidatedDesignSystem.status.success, 0.1),
  '#E8F5E8': colorUtils.withOpacity(ConsolidatedConsolidatedDesignSystem.status.success, 0.1),
  
  // Primary colors
  '#da4347': ConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
  '#DA4347': ConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
  '#b8393d': colorUtils.darken(ConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary),
  '#e66a6d': colorUtils.lighten(ConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary),
  
  // Shadow and overlay
  '#000': ConsolidatedConsolidatedDesignSystem.utility.shadow,
  '#000000': ConsolidatedConsolidatedDesignSystem.utility.shadow,
  'rgba(0, 0, 0, 0.5)': ConsolidatedConsolidatedDesignSystem.utility.overlay,
  'rgba(0,0,0,0.5)': ConsolidatedConsolidatedDesignSystem.utility.overlay,
};

// Buddhist semantic color helpers - updated for consolidated system
export const buddhistColors = {
  // Practice type colors
  getPracticeTypeColor: (type: 'count' | 'time') => {
    return type === 'time' 
      ? ConsolidatedConsolidatedDesignSystem.accent['accent-secondary'] 
      : ConsolidatedConsolidatedDesignSystem.accent['accent-primary'];
  },
  
  // Status colors with Buddhist meaning
  getPracticeStatusColor: (status: 'active' | 'completed' | 'inactive') => {
    switch (status) {
      case 'active': return ConsolidatedConsolidatedDesignSystem.accent['accent-primary'];
      case 'completed': return ConsolidatedConsolidatedDesignSystem.status.success;
      case 'inactive': return ConsolidatedConsolidatedDesignSystem.colors['text-secondary'];
      default: return ConsolidatedConsolidatedDesignSystem.colors['text-secondary'];
    }
  },
  
  // Feature area colors
  getFeatureColor: (feature: 'practice' | 'study' | 'mindfulness' | 'stats') => {
    switch (feature) {
      case 'practice': return ConsolidatedConsolidatedDesignSystem.accent['accent-primary'];
      case 'study': return ConsolidatedConsolidatedDesignSystem.accent['accent-secondary'];
      case 'mindfulness': return ConsolidatedConsolidatedDesignSystem.accent['accent-primary'];
      case 'stats': return ConsolidatedConsolidatedDesignSystem.status.success;
      default: return ConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary;
    }
  },
  
  // Achievement colors
  getAchievementColor: (type: 'completion' | 'progress' | 'milestone') => {
    switch (type) {
      case 'completion': return ConsolidatedConsolidatedDesignSystem.status.success;
      case 'progress': return ConsolidatedConsolidatedDesignSystem.accent['accent-secondary'];
      case 'milestone': return colorUtils.adjustHue?.(ConsolidatedConsolidatedDesignSystem.accent['accent-primary'], 45) || '#D4AF37';
      default: return ConsolidatedConsolidatedDesignSystem.status.success;
    }
  },
};

// Color contrast utilities - updated for consolidated system
export const colorUtilsUpdated = {
  // Get appropriate text color for background
  getContrastText: (backgroundColor: string): string => {
    const lightBackgrounds = [
      ConsolidatedConsolidatedDesignSystem.colors['surface-primary'],
      ConsolidatedConsolidatedDesignSystem.colors['surface-secondary'],
      colorUtils.withOpacity(ConsolidatedConsolidatedDesignSystem.status.success, 0.1),
      colorUtils.withOpacity(ConsolidatedConsolidatedDesignSystem.status.warning, 0.1),
      colorUtils.withOpacity(ConsolidatedConsolidatedDesignSystem.status.error, 0.1),
      '#ffffff',
      '#f8f9fa',
      '#f0f0f0',
    ];
    
    return lightBackgrounds.includes(backgroundColor) 
      ? ConsolidatedConsolidatedDesignSystem.colors['text-primary']
      : ConsolidatedConsolidatedDesignSystem.colors['text-inverse'];
  },
  
  // Get hover state color
  getHoverColor: (baseColor: string): string => {
    if (baseColor === ConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary) {
      return colorUtils.lighten(ConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary);
    }
    if (baseColor === ConsolidatedConsolidatedDesignSystem.accent['accent-primary']) {
      return colorUtils.lighten(ConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary);
    }
    return baseColor;
  },
  
  // Get pressed state color
  getPressedColor: (baseColor: string): string => {
    if (baseColor === ConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary) {
      return colorUtils.darken(ConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary);
    }
    if (baseColor === ConsolidatedConsolidatedDesignSystem.accent['accent-primary']) {
      return colorUtils.darken(ConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary);
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
