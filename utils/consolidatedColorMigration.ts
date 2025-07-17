
/**
 * Consolidated Color Migration Utilities
 * Provides seamless migration from old design system to consolidated 15-token system
 */

import ConsolidatedDesignSystem, { migrationMap, buddhistSemantics, colorUtils } from '@/constants/ConsolidatedDesignSystem';

// AUTOMATED MIGRATION FUNCTIONS
export const ConsolidatedMigration = {
  // Migrate any old color token to new system
  migrateColor: (oldToken: string): string => {
    // Direct mapping
    if (migrationMap[oldToken as keyof typeof migrationMap]) {
      const mapped = migrationMap[oldToken as keyof typeof migrationMap];
      return typeof mapped === 'function' ? mapped() : mapped;
    }
    
    // Fallback to primary if not found
    console.warn(`Color token '${oldToken}' not found in migration map, using primary`);
    return ConsolidatedDesignSystem.colors.primary;
  },
  
  // Migrate component styles automatically
  migrateComponentStyle: (oldStyle: any): any => {
    const newStyle = { ...oldStyle };
    
    // Migrate color properties
    const colorProperties = [
      'backgroundColor', 'color', 'borderColor', 'shadowColor',
      'borderLeftColor', 'borderRightColor', 'borderTopColor', 'borderBottomColor'
    ];
    
    colorProperties.forEach(prop => {
      if (newStyle[prop]) {
        newStyle[prop] = ConsolidatedMigration.migrateColor(newStyle[prop]);
      }
    });
    
    return newStyle;
  },
  
  // Migrate Buddhist semantic usage
  migrateBuddhistColor: (semanticType: string, context?: string): string => {
    switch (semanticType) {
      case 'dharma':
      case 'practice':
        return buddhistSemantics.getPracticeColor('dharma');
      case 'meditation':
      case 'mindfulness':
        return buddhistSemantics.getPracticeColor('meditation');
      case 'wisdom':
      case 'study':
        return buddhistSemantics.getPracticeColor('wisdom');
      case 'compassion':
        return buddhistSemantics.getPracticeColor('compassion');
      default:
        return ConsolidatedDesignSystem.colors.primary;
    }
  },
};

// COMPONENT-SPECIFIC MIGRATION HELPERS
export const ComponentMigration = {
  // Button migration
  migrateButton: (variant: 'primary' | 'secondary' | 'small' | 'text' | 'dharma' = 'primary') => {
    const baseButton = {
      borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
      paddingVertical: ConsolidatedDesignSystem.spacing.lg,
      paddingHorizontal: ConsolidatedDesignSystem.spacing.xl,
      minHeight: 48,
      fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
      fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,
    };
    
    switch (variant) {
      case 'primary':
      case 'dharma':
        return {
          ...baseButton,
          backgroundColor: ConsolidatedDesignSystem.colors.primary,
          color: ConsolidatedDesignSystem.colors['text-inverse'],
          borderWidth: 0,
        };
      case 'secondary':
        return {
          ...baseButton,
          backgroundColor: ConsolidatedDesignSystem.colors['surface-primary'],
          color: ConsolidatedDesignSystem.colors.primary,
          borderWidth: 1.5,
          borderColor: ConsolidatedDesignSystem.colors.primary,
        };
      case 'small':
        return {
          ...baseButton,
          backgroundColor: ConsolidatedDesignSystem.colors['surface-secondary'],
          color: ConsolidatedDesignSystem.colors['text-secondary'],
          borderWidth: 1,
          borderColor: ConsolidatedDesignSystem.colors['border-default'],
          paddingVertical: ConsolidatedDesignSystem.spacing.base,
          paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
          minHeight: 36,
          fontSize: ConsolidatedDesignSystem.typography.fontSize.sm,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          color: ConsolidatedDesignSystem.colors.primary,
          paddingVertical: ConsolidatedDesignSystem.spacing.sm,
          paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
          fontSize: ConsolidatedDesignSystem.typography.fontSize.sm,
          fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
        };
      default:
        return baseButton;
    }
  },
  
  // Card migration
  migrateCard: (variant: 'standard' | 'practice' | 'course' | 'status' = 'standard') => {
    const baseCard = {
      backgroundColor: ConsolidatedDesignSystem.colors['surface-primary'],
      borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
      padding: ConsolidatedDesignSystem.spacing.xl,
      marginHorizontal: ConsolidatedDesignSystem.spacing.lg,
      marginVertical: ConsolidatedDesignSystem.spacing.sm,
    };
    
    switch (variant) {
      case 'standard':
        return {
          ...baseCard,
          ...ConsolidatedDesignSystem.shadow.md,
          borderWidth: 0.5,
          borderColor: colorUtils.withOpacity(ConsolidatedDesignSystem.utility.shadow, 0.04),
        };
      case 'practice':
        return {
          ...baseCard,
          ...ConsolidatedDesignSystem.shadow.sm,
          borderWidth: 1,
          borderColor: ConsolidatedDesignSystem.colors['border-default'],
          padding: ConsolidatedDesignSystem.spacing.lg,
          marginVertical: ConsolidatedDesignSystem.spacing.xxs,
        };
      case 'course':
        return {
          ...baseCard,
          ...ConsolidatedDesignSystem.shadow.lg,
          borderRadius: ConsolidatedDesignSystem.borderRadius.xl,
          borderWidth: 1,
          borderColor: ConsolidatedDesignSystem.colors['surface-secondary'],
        };
      case 'status':
        return {
          backgroundColor: colorUtils.withOpacity(ConsolidatedDesignSystem.status.success, 0.1),
          borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
          padding: ConsolidatedDesignSystem.spacing.md,
          marginHorizontal: ConsolidatedDesignSystem.spacing.lg,
          marginVertical: ConsolidatedDesignSystem.spacing.xs,
          borderWidth: 1,
          borderColor: ConsolidatedDesignSystem.status.success,
        };
      default:
        return baseCard;
    }
  },
  
  // Text migration
  migrateText: (variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary') => {
    switch (variant) {
      case 'primary':
        return { color: ConsolidatedDesignSystem.colors['text-primary'] };
      case 'secondary':
      case 'tertiary':
        return { color: ConsolidatedDesignSystem.colors['text-secondary'] };
      case 'inverse':
        return { color: ConsolidatedDesignSystem.colors['text-inverse'] };
      default:
        return { color: ConsolidatedDesignSystem.colors['text-primary'] };
    }
  },
  
  // Progress bar migration
  migrateProgress: (variant: 'bar' | 'course' | 'practice' = 'bar') => {
    const baseContainer = {
      backgroundColor: ConsolidatedDesignSystem.colors['border-default'],
      borderRadius: ConsolidatedDesignSystem.borderRadius.sm,
      overflow: 'hidden' as const,
    };
    
    const baseFill = {
      height: '100%',
      borderRadius: ConsolidatedDesignSystem.borderRadius.sm,
    };
    
    switch (variant) {
      case 'bar':
        return {
          container: {
            ...baseContainer,
            height: ConsolidatedDesignSystem.spacing.sm, // 8px
          },
          fill: {
            ...baseFill,
            backgroundColor: ConsolidatedDesignSystem.colors.primary,
          },
        };
      case 'course':
        return {
          container: {
            ...baseContainer,
            height: ConsolidatedDesignSystem.spacing.md, // 12px
          },
          fill: {
            ...baseFill,
            backgroundColor: ConsolidatedDesignSystem.accent['accent-secondary'],
          },
        };
      case 'practice':
        return {
          container: {
            ...baseContainer,
            height: ConsolidatedDesignSystem.spacing.base, // 10px
            borderWidth: 1,
            borderColor: ConsolidatedDesignSystem.colors['border-default'],
          },
          fill: {
            ...baseFill,
            backgroundColor: ConsolidatedDesignSystem.accent['accent-primary'],
          },
        };
      default:
        return {
          container: baseContainer,
          fill: baseFill,
        };
    }
  },
};

// STATUS MAPPING for notifications
export const StatusMapping = {
  getStatusStyle: (status: 'success' | 'warning' | 'error' | 'info') => {
    const baseStyle = {
      borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
      padding: ConsolidatedDesignSystem.spacing.md,
      marginHorizontal: ConsolidatedDesignSystem.spacing.lg,
      marginVertical: ConsolidatedDesignSystem.spacing.xs,
      borderWidth: 1,
      borderLeftWidth: 4,
    };
    
    switch (status) {
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: colorUtils.withOpacity(ConsolidatedDesignSystem.status.success, 0.1),
          borderColor: ConsolidatedDesignSystem.status.success,
          borderLeftColor: ConsolidatedDesignSystem.status.success,
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: colorUtils.withOpacity(ConsolidatedDesignSystem.status.warning, 0.1),
          borderColor: ConsolidatedDesignSystem.status.warning,
          borderLeftColor: ConsolidatedDesignSystem.status.warning,
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: colorUtils.withOpacity(ConsolidatedDesignSystem.status.error, 0.1),
          borderColor: ConsolidatedDesignSystem.status.error,
          borderLeftColor: ConsolidatedDesignSystem.status.error,
        };
      case 'info':
        return {
          ...baseStyle,
          backgroundColor: colorUtils.withOpacity(ConsolidatedDesignSystem.status.info, 0.1),
          borderColor: ConsolidatedDesignSystem.status.info,
          borderLeftColor: ConsolidatedDesignSystem.status.info,
        };
      default:
        return baseStyle;
    }
  },
};

// VALIDATION HELPERS
export const ValidationHelpers = {
  // Check if a style uses old color tokens
  hasOldTokens: (styleObject: any): boolean => {
    const oldTokens = Object.keys(migrationMap);
    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        return oldTokens.includes(value);
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(checkValue);
      }
      return false;
    };
    
    return checkValue(styleObject);
  },
  
  // Get migration suggestions
  getSuggestions: (oldToken: string): string[] => {
    const suggestions = [];
    
    if (migrationMap[oldToken as keyof typeof migrationMap]) {
      suggestions.push(`Use: ${ConsolidatedMigration.migrateColor(oldToken)}`);
    }
    
    // Buddhist semantic suggestions
    if (oldToken.includes('dharma') || oldToken.includes('practice')) {
      suggestions.push('Consider Buddhist semantic helper: buddhistSemantics.getPracticeColor("dharma")');
    }
    
    if (oldToken.includes('Background')) {
      suggestions.push('Use utility: colorUtils.withOpacity(color, 0.1)');
    }
    
    return suggestions;
  },
};

export {
  ConsolidatedDesignSystem,
  migrationMap,
  buddhistSemantics,
  colorUtils,
};
