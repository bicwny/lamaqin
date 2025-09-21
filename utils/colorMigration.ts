
/**
 * Color Migration Utilities
 * Provides systematic mapping from hardcoded values to DesignSystem tokens
 */

import { DesignSystem } from '@/constants/DesignSystem';

// Migration map for hardcoded hex values found in audit
export const colorMigrationMap = {
  // Text colors - Phase 1.2 mappings
  '#1a1a1a': DesignSystem.colors.textPrimary,
  '#1A1A1A': DesignSystem.colors.textPrimary,
  '#FFFFFF': DesignSystem.colors.textInverse,
  '#ffffff': DesignSystem.colors.textInverse,
  '#666666': DesignSystem.colors.textSecondary,
  '#999999': DesignSystem.colors.textTertiary,
  
  // Background colors
  '#f8f9fa': DesignSystem.colors.background,
  '#F8F9FA': DesignSystem.colors.background,
  // Note: #ffffff already mapped to textInverse above, using backgroundSecondary for different context
  'white': DesignSystem.colors.backgroundSecondary,
  '#f0f0f0': DesignSystem.colors.backgroundTertiary,
  '#F0F0F0': DesignSystem.colors.backgroundTertiary,
  
  // Border colors
  '#e9ecef': DesignSystem.colors.border,
  '#E9ECEF': DesignSystem.colors.border,
  '#f1f1f1': DesignSystem.colors.borderLight,
  '#F1F1F1': DesignSystem.colors.borderLight,
  '#dee2e6': DesignSystem.colors.borderDark,
  '#DEE2E6': DesignSystem.colors.borderDark,
  
  // Status colors - Phase 1.2 Buddhist mappings
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

// Enhanced migration utilities for Phase 1.2
export const migrationHelpers = {
  // Dynamic opacity helper with Design System integration
  withOpacity: (color: string, opacity: number): string => {
    // Validate opacity range
    if (opacity < 0 || opacity > 1) {
      console.warn(`Invalid opacity value: ${opacity}. Must be between 0 and 1.`);
      opacity = Math.max(0, Math.min(1, opacity));
    }
    
    // Convert opacity to hex alpha
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    
    // Handle different color formats
    if (color.startsWith('#')) {
      return `${color}${alpha}`;
    } else if (color.startsWith('rgba')) {
      // Replace existing alpha in rgba format
      return color.replace(/,\s*[\d.]+\)$/, `, ${opacity})`);
    } else if (color.startsWith('rgb')) {
      // Convert rgb to rgba
      return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
    }
    
    // Fallback for other formats
    return `${color}${alpha}`;
  },

  // Automated hardcoded to semantic mapping
  mapHardcodedToSemantic: (styleObject: any): { updated: any; changes: string[] } => {
    const changes: string[] = [];
    const updated = { ...styleObject };
    
    // Recursively process style object
    const processValue = (obj: any, key: string, value: any): any => {
      if (typeof value === 'string') {
        // Check for direct color mapping
        const normalizedColor = value.toLowerCase().trim();
        if (colorMigrationMap[normalizedColor]) {
          const newColor = colorMigrationMap[normalizedColor];
          changes.push(`${key}: ${value} → ${newColor}`);
          return newColor;
        }
        
        // Check for rgba patterns that need mapping
        const rgbaMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (rgbaMatch) {
          const [r, g, b, a] = rgbaMatch.slice(1);
          const hexColor = `#${[r, g, b].map(n => parseInt(n).toString(16).padStart(2, '0')).join('')}`;
          
          if (colorMigrationMap[hexColor]) {
            const baseColor = colorMigrationMap[hexColor];
            const opacity = a ? parseFloat(a) : 1;
            const newColor = migrationHelpers.withOpacity(baseColor, opacity);
            changes.push(`${key}: ${value} → ${newColor} (semantic + opacity)`);
            return newColor;
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively process nested objects
        const nestedResult: any = {};
        Object.keys(value).forEach(nestedKey => {
          nestedResult[nestedKey] = processValue(value, `${key}.${nestedKey}`, value[nestedKey]);
        });
        return nestedResult;
      }
      
      return value;
    };
    
    // Process all properties in the style object
    Object.keys(updated).forEach(key => {
      updated[key] = processValue(updated, key, updated[key]);
    });
    
    return { updated, changes };
  },

  // Buddhist semantic color validation
  validateBuddhistSemantics: (colorUsage: { [key: string]: string }): {
    valid: boolean;
    violations: string[];
    suggestions: string[];
  } => {
    const violations: string[] = [];
    const suggestions: string[] = [];
    
    // Define Buddhist color appropriateness rules
    const buddhistRules = {
      // Colors that should be used for specific contexts
      practiceContexts: {
        dharmaRed: ['practice', 'dharma', 'teaching', 'action'],
        compassionOrange: ['mindfulness', 'meditation', 'compassion', 'loving-kindness'],
        wisdomGold: ['study', 'wisdom', 'achievement', 'completion'],
        meditationBlue: ['contemplation', 'deep practice', 'concentration'],
      },
      
      // Colors to avoid in Buddhist contexts
      inappropriate: {
        '#ff0000': 'Pure red may be too aggressive for spiritual practice',
        '#000000': 'Pure black may be too harsh for mindfulness interface',
        '#ffff00': 'Pure yellow may be too stimulating for meditation',
      },
      
      // Recommended alternatives
      alternatives: {
        '#ff0000': DesignSystem.colors.dharmaRed,
        '#000000': DesignSystem.colors.textPrimary,
        '#ffff00': DesignSystem.colors.wisdomGold,
      }
    };
    
    // Validate each color usage
    Object.entries(colorUsage).forEach(([context, color]) => {
      // Check for inappropriate colors
      if (buddhistRules.inappropriate[color]) {
        violations.push(`${context}: ${color} - ${buddhistRules.inappropriate[color]}`);
        if (buddhistRules.alternatives[color]) {
          suggestions.push(`${context}: Use ${buddhistRules.alternatives[color]} instead of ${color}`);
        }
      }
      
      // Check for context-appropriate usage
      const contextLower = context.toLowerCase();
      const isContextAppropriate = Object.entries(buddhistRules.practiceContexts).some(([buddhistColor, contexts]) => {
        const colorMatches = color === DesignSystem.colors[buddhistColor as keyof typeof DesignSystem.colors];
        const contextMatches = contexts.some(validContext => contextLower.includes(validContext));
        return colorMatches && contextMatches;
      });
      
      // Suggest better color choices for context
      if (!isContextAppropriate) {
        Object.entries(buddhistRules.practiceContexts).forEach(([buddhistColor, contexts]) => {
          if (contexts.some(validContext => contextLower.includes(validContext))) {
            const suggestedColor = DesignSystem.colors[buddhistColor as keyof typeof DesignSystem.colors];
            suggestions.push(`${context}: Consider ${suggestedColor} (${buddhistColor}) for ${contexts.join('/')} context`);
          }
        });
      }
    });
    
    return {
      valid: violations.length === 0,
      violations,
      suggestions
    };
  },
  
  // Complete migration workflow
  performFullMigration: (styleObject: any): {
    migrated: any;
    colorChanges: string[];
    buddhistValidation: ReturnType<typeof migrationHelpers.validateBuddhistSemantics>;
    summary: string;
  } => {
    // Step 1: Map hardcoded colors to semantic
    const { updated, changes } = migrationHelpers.mapHardcodedToSemantic(styleObject);
    
    // Step 2: Extract color usage for Buddhist validation
    const colorUsage: { [key: string]: string } = {};
    const extractColors = (obj: any, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
          colorUsage[fullKey] = value;
        } else if (typeof value === 'object' && value !== null) {
          extractColors(value, fullKey);
        }
      });
    };
    extractColors(updated);
    
    // Step 3: Validate Buddhist semantics
    const buddhistValidation = migrationHelpers.validateBuddhistSemantics(colorUsage);
    
    // Step 4: Generate summary
    const summary = [
      `Migrated ${changes.length} color values`,
      `Found ${Object.keys(colorUsage).length} color usages`,
      `Buddhist validation: ${buddhistValidation.valid ? 'PASSED' : 'NEEDS ATTENTION'}`,
      `Violations: ${buddhistValidation.violations.length}`,
      `Suggestions: ${buddhistValidation.suggestions.length}`
    ].join(', ');
    
    return {
      migrated: updated,
      colorChanges: changes,
      buddhistValidation,
      summary
    };
  }
};

// Note: All exports are already defined above with individual export statements
