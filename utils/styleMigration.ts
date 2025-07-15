
/**
 * Style Migration Utilities
 * Comprehensive mapping functions to migrate from hardcoded styles to DesignSystem tokens
 */

import { DesignSystem } from '@/constants/DesignSystem';
import { colorMigrationMap } from './colorMigration';
import { spacingMigrationMap } from './spacingMigration';
import { Typography } from './typography';

// Main style mapping function that handles all style properties
export function migrateStyleObject(styles: any): any {
  if (!styles || typeof styles !== 'object') return styles;

  const migratedStyles: any = {};

  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === 'object' && value !== null) {
      // Recursively migrate nested style objects
      migratedStyles[key] = migrateStyleObject(value);
    } else {
      // Migrate individual style properties
      migratedStyles[key] = migrateStyleProperty(key, value);
    }
  }

  return migratedStyles;
}

// Migrate individual style properties based on their type
export function migrateStyleProperty(property: string, value: any): any {
  switch (property) {
    // Color properties
    case 'color':
    case 'backgroundColor':
    case 'borderColor':
    case 'borderTopColor':
    case 'borderBottomColor':
    case 'borderLeftColor':
    case 'borderRightColor':
    case 'shadowColor':
    case 'tintColor':
      return migrateColor(value);
    
    // Typography properties
    case 'fontSize':
      return migrateFontSize(value);
    case 'fontWeight':
      return migrateFontWeight(value);
    case 'lineHeight':
      return migrateLineHeight(value);
    case 'letterSpacing':
      return migrateLetterSpacing(value);
    
    // Spacing properties
    case 'padding':
    case 'paddingTop':
    case 'paddingBottom':
    case 'paddingLeft':
    case 'paddingRight':
    case 'paddingHorizontal':
    case 'paddingVertical':
    case 'margin':
    case 'marginTop':
    case 'marginBottom':
    case 'marginLeft':
    case 'marginRight':
    case 'marginHorizontal':
    case 'marginVertical':
    case 'gap':
    case 'rowGap':
    case 'columnGap':
    case 'top':
    case 'bottom':
    case 'left':
    case 'right':
    case 'width':
    case 'height':
    case 'maxWidth':
    case 'maxHeight':
    case 'minWidth':
    case 'minHeight':
      return migrateSpacing(value);
    
    // Border radius properties
    case 'borderRadius':
    case 'borderTopLeftRadius':
    case 'borderTopRightRadius':
    case 'borderBottomLeftRadius':
    case 'borderBottomRightRadius':
      return migrateBorderRadius(value);
    
    // Shadow properties - handle shadowOffset specially
    case 'shadowOffset':
      return migrateShadowOffset(value);
    case 'shadowOpacity':
    case 'shadowRadius':
    case 'elevation':
      return value; // Keep as-is for now
    
    default:
      return value;
  }
}

// Color migration functions
export function migrateColor(color: any): any {
  if (typeof color !== 'string') return color;
  
  // Check direct mapping first
  const mappedColor = colorMigrationMap[color.toLowerCase()];
  if (mappedColor) return mappedColor;
  
  // Check for rgba patterns
  if (color.includes('rgba(0, 0, 0,') || color.includes('rgba(0,0,0,')) {
    return DesignSystem.colors.overlayDark;
  }
  
  // Return original if no mapping found
  return color;
}

// Typography migration functions
export function migrateFontSize(size: any): number {
  if (typeof size !== 'number') return size;
  
  const mapping = Typography.migrationMap.fontSize[size];
  return mapping || size;
}

export function migrateFontWeight(weight: any): string {
  if (typeof weight === 'number') {
    weight = weight.toString();
  }
  if (typeof weight !== 'string') return weight;
  
  const mapping = Typography.migrationMap.fontWeight[weight];
  return mapping || weight;
}

export function migrateLineHeight(height: any): number {
  if (typeof height !== 'number') return height;
  
  // Check if it's a multiplier (1.2, 1.5, etc.)
  if (height < 10) {
    const mapping = Typography.migrationMap.lineHeight[height.toString()];
    return mapping || height;
  }
  
  // Check if it's a pixel value that maps to a multiplier
  const stringHeight = height.toString();
  const mapping = Typography.migrationMap.lineHeight[stringHeight];
  return mapping || height;
}

export function migrateLetterSpacing(spacing: any): number {
  if (typeof spacing !== 'number') return spacing;
  
  const mapping = Typography.migrationMap.letterSpacing[spacing.toString()];
  return mapping || spacing;
}

// Spacing migration functions
export function migrateSpacing(value: any): number {
  if (typeof value !== 'number') return value;
  
  const mapping = spacingMigrationMap[value];
  return mapping || value;
}

// Border radius migration
export function migrateBorderRadius(radius: any): number {
  if (typeof radius !== 'number') return radius;
  
  // Map common border radius values
  const radiusMap = {
    4: DesignSystem.borderRadius.sm,
    8: DesignSystem.borderRadius.md,
    12: DesignSystem.borderRadius.lg,
    16: DesignSystem.borderRadius.xl,
    9999: DesignSystem.borderRadius.full,
  };
  
  return radiusMap[radius] || radius;
}

// Shadow offset migration
export function migrateShadowOffset(offset: any): any {
  if (typeof offset !== 'object' || !offset) return offset;
  
  return {
    width: migrateSpacing(offset.width),
    height: migrateSpacing(offset.height),
  };
}

// Practice-detail specific migration functions
export const practiceDetailMigration = {
  // Migrate the main info card styles
  migrateInfoCard: (styles: any) => ({
    ...migrateStyleObject(styles),
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.xl,
    marginHorizontal: DesignSystem.spacing.lg,
    marginVertical: DesignSystem.spacing.sm,
    shadowColor: DesignSystem.colors.cardShadow,
    borderColor: DesignSystem.colors.borderLight,
  }),
  
  // Migrate button styles
  migratePrimaryButton: (styles: any) => ({
    ...migrateStyleObject(styles),
    backgroundColor: DesignSystem.colors.primary,
    padding: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
    gap: DesignSystem.spacing.sm,
  }),
  
  migrateSecondaryButton: (styles: any) => ({
    ...migrateStyleObject(styles),
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    padding: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
    gap: DesignSystem.spacing.xxs,
    borderColor: DesignSystem.colors.primary,
  }),
  
  // Migrate text styles
  migratePracticeTitle: (styles: any) => ({
    ...migrateStyleObject(styles),
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.textPrimary,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
  }),
  
  migrateProgressText: (styles: any) => ({
    ...migrateStyleObject(styles),
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.textPrimary,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
  }),
  
  migrateDetailLabel: (styles: any) => ({
    ...migrateStyleObject(styles),
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.textSecondary,
  }),
  
  migrateDetailValue: (styles: any) => ({
    ...migrateStyleObject(styles),
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
  }),
};

// Component-specific migration patterns
export const componentMigrations = {
  // Card migrations
  card: {
    standard: (styles: any) => ({
      ...migrateStyleObject(styles),
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      borderRadius: DesignSystem.borderRadius.lg,
      padding: DesignSystem.spacing.xl,
      marginHorizontal: DesignSystem.spacing.lg,
      marginVertical: DesignSystem.spacing.sm,
      shadowColor: DesignSystem.colors.cardShadow,
      borderColor: DesignSystem.colors.borderLight,
    }),
    
    practice: (styles: any) => ({
      ...migrateStyleObject(styles),
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      borderRadius: DesignSystem.borderRadius.lg,
      padding: DesignSystem.spacing.lg,
      marginHorizontal: DesignSystem.spacing.lg,
      marginVertical: DesignSystem.spacing.xxs,
      borderColor: DesignSystem.colors.borderLight,
    }),
  },
  
  // Button migrations
  button: {
    primary: (styles: any) => ({
      ...migrateStyleObject(styles),
      backgroundColor: DesignSystem.colors.primary,
      paddingVertical: DesignSystem.spacing.lg,
      paddingHorizontal: DesignSystem.spacing.xl,
      borderRadius: DesignSystem.borderRadius.lg,
    }),
    
    secondary: (styles: any) => ({
      ...migrateStyleObject(styles),
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      paddingVertical: DesignSystem.spacing.lg,
      paddingHorizontal: DesignSystem.spacing.xl,
      borderRadius: DesignSystem.borderRadius.lg,
      borderColor: DesignSystem.colors.primary,
    }),
  },
  
  // Text migrations
  text: {
    title: (styles: any) => ({
      ...migrateStyleObject(styles),
      fontSize: DesignSystem.typography.fontSize['2xl'],
      fontWeight: DesignSystem.typography.fontWeight.bold,
      color: DesignSystem.colors.textPrimary,
      letterSpacing: DesignSystem.typography.letterSpacing.tight,
    }),
    
    subtitle: (styles: any) => ({
      ...migrateStyleObject(styles),
      fontSize: DesignSystem.typography.fontSize.lg,
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      color: DesignSystem.colors.textPrimary,
      letterSpacing: DesignSystem.typography.letterSpacing.tight,
    }),
    
    body: (styles: any) => ({
      ...migrateStyleObject(styles),
      fontSize: DesignSystem.typography.fontSize.base,
      fontWeight: DesignSystem.typography.fontWeight.normal,
      color: DesignSystem.colors.textSecondary,
      lineHeight: DesignSystem.typography.lineHeight.relaxed,
    }),
    
    caption: (styles: any) => ({
      ...migrateStyleObject(styles),
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.medium,
      color: DesignSystem.colors.textSecondary,
    }),
  },
  
  // Progress bar migrations
  progress: {
    container: (styles: any) => ({
      ...migrateStyleObject(styles),
      height: DesignSystem.spacing.sm,
      backgroundColor: DesignSystem.colors.border,
      borderRadius: DesignSystem.borderRadius.sm,
    }),
    
    fill: (styles: any) => ({
      ...migrateStyleObject(styles),
      backgroundColor: DesignSystem.colors.primary,
      borderRadius: DesignSystem.borderRadius.sm,
    }),
  },
};

// Validation functions
export const migrationValidation = {
  // Check if a style object has been properly migrated
  isFullyMigrated: (styles: any): boolean => {
    const hardcodedPatterns = [
      /^#[0-9A-Fa-f]{3,8}$/,  // Hex colors
      /^rgba?\(/,              // RGB colors
      /^\d+px$/,               // Pixel values
    ];
    
    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        return !hardcodedPatterns.some(pattern => pattern.test(value));
      }
      if (typeof value === 'number' && value > 0 && value < 1000) {
        // Check if it's a spacing value that should be migrated
        return spacingMigrationMap[value] !== undefined;
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).every(checkValue);
      }
      return true;
    };
    
    return checkValue(styles);
  },
  
  // Get migration suggestions for a style object
  getMigrationSuggestions: (styles: any): string[] => {
    const suggestions: string[] = [];
    
    const analyzeValue = (key: string, value: any) => {
      if (typeof value === 'string') {
        if (colorMigrationMap[value.toLowerCase()]) {
          suggestions.push(`${key}: "${value}" → DesignSystem.colors.${Object.keys(DesignSystem.colors).find(k => DesignSystem.colors[k] === colorMigrationMap[value.toLowerCase()])}`);
        }
      } else if (typeof value === 'number') {
        if (spacingMigrationMap[value]) {
          suggestions.push(`${key}: ${value} → DesignSystem.spacing.${Object.keys(DesignSystem.spacing).find(k => DesignSystem.spacing[k] === spacingMigrationMap[value])}`);
        }
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          analyzeValue(`${key}.${nestedKey}`, nestedValue);
        });
      }
    };
    
    Object.entries(styles).forEach(([key, value]) => {
      analyzeValue(key, value);
    });
    
    return suggestions;
  },
};

// Export all migration utilities
export {
  migrateStyleObject,
  migrateStyleProperty,
  migrateColor,
  migrateFontSize,
  migrateFontWeight,
  migrateLineHeight,
  migrateLetterSpacing,
  migrateSpacing,
  migrateBorderRadius,
  migrateShadowOffset,
  practiceDetailMigration,
  componentMigrations,
  migrationValidation,
};

// Helper function to migrate entire StyleSheet objects
export function migrateStyleSheet(styleSheet: any): any {
  const migratedSheet: any = {};
  
  Object.entries(styleSheet).forEach(([key, styles]) => {
    migratedSheet[key] = migrateStyleObject(styles);
  });
  
  return migratedSheet;
}

export default {
  migrateStyleObject,
  migrateStyleProperty,
  practiceDetailMigration,
  componentMigrations,
  migrationValidation,
  migrateStyleSheet,
};
