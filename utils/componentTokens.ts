
/**
 * Component Token Utilities
 * Provides easy access to component-specific design tokens
 */

import { DesignSystem } from '@/constants/DesignSystem';

// Component token helpers that reference the main design system
export const ComponentTokens = {
  // Button tokens with DesignSystem references - Consolidated system
  button: {
    // Base button styles by variant
    variants: {
      primary: {
        backgroundColor: DesignSystem.colors.primary,
        borderWidth: 0,
        borderColor: 'transparent',
        ...DesignSystem.shadow.md,
      },
      
      secondary: {
        backgroundColor: DesignSystem.colors.backgroundSecondary,
        borderWidth: 1.5,
        borderColor: DesignSystem.colors.primary,
        ...DesignSystem.shadow.sm,
      },
      
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderColor: 'transparent',
      },
    },
    
    // Size variations
    sizes: {
      small: {
        paddingVertical: DesignSystem.spacing.base,
        paddingHorizontal: DesignSystem.spacing.md,
        borderRadius: DesignSystem.borderRadius.md,
        minHeight: 36,
      },
      
      medium: {
        paddingVertical: DesignSystem.spacing.lg,
        paddingHorizontal: DesignSystem.spacing.xl,
        borderRadius: DesignSystem.borderRadius.lg,
        minHeight: 48,
      },
      
      large: {
        paddingVertical: DesignSystem.spacing.xl,
        paddingHorizontal: DesignSystem.spacing['2xl'],
        borderRadius: DesignSystem.borderRadius.lg,
        minHeight: 56,
      },
    },
    
    // Legacy support - maps old variants to new system
    legacy: {
      primary: { variant: 'primary' as const, size: 'medium' as const },
      secondary: { variant: 'secondary' as const, size: 'medium' as const },
      small: { variant: 'secondary' as const, size: 'small' as const },
      text: { variant: 'ghost' as const, size: 'medium' as const },
      dharma: { variant: 'primary' as const, size: 'large' as const }, // dharma → primary with large size
    },
  },

  // Card tokens with DesignSystem references - Consolidated system
  card: {
    // Base card styles by variant
    variants: {
      outlined: {
        backgroundColor: DesignSystem.colors.backgroundSecondary,
        borderRadius: DesignSystem.borderRadius.lg,
        marginHorizontal: DesignSystem.spacing.lg,
        marginVertical: DesignSystem.spacing.sm,
        shadowColor: DesignSystem.colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: DesignSystem.colors.borderLight,
      },
      
      elevated: {
        backgroundColor: DesignSystem.colors.backgroundSecondary,
        borderRadius: DesignSystem.borderRadius.xl,
        marginHorizontal: DesignSystem.spacing.lg,
        marginVertical: DesignSystem.spacing.sm,
        shadowColor: DesignSystem.colors.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
        borderWidth: 1,
        borderColor: DesignSystem.colors.background,
      },
    },
    
    // Padding variations
    padding: {
      compact: DesignSystem.spacing.md,      // 12px (was status)
      comfortable: DesignSystem.spacing.lg,  // 16px (was practice)
      spacious: DesignSystem.spacing.xl,     // 20px (was standard/course)
    },
    
    // Legacy support - maps old variants to new system
    legacy: {
      standard: { variant: 'outlined' as const, padding: 'spacious' as const },
      practice: { variant: 'outlined' as const, padding: 'comfortable' as const },
      course: { variant: 'elevated' as const, padding: 'spacious' as const },
      status: 'notification' as const, // Maps to new Notification component
    },
  },

  // Notification component tokens (replaces status cards)
  notification: {
    variants: {
      success: {
        backgroundColor: DesignSystem.colors.successBackground,
        borderRadius: DesignSystem.borderRadius.lg,
        padding: DesignSystem.spacing.md,
        marginHorizontal: DesignSystem.spacing.lg,
        marginVertical: DesignSystem.spacing.xs,
        borderWidth: 1,
        borderColor: DesignSystem.colors.practiceComplete,
        borderLeftWidth: 4,
        borderLeftColor: DesignSystem.colors.practiceComplete,
      },
      
      warning: {
        backgroundColor: DesignSystem.colors.warningBackground,
        borderRadius: DesignSystem.borderRadius.lg,
        padding: DesignSystem.spacing.md,
        marginHorizontal: DesignSystem.spacing.lg,
        marginVertical: DesignSystem.spacing.xs,
        borderWidth: 1,
        borderColor: DesignSystem.colors.warningBorder,
        borderLeftWidth: 4,
        borderLeftColor: DesignSystem.colors.warningBorder,
      },
      
      error: {
        backgroundColor: DesignSystem.colors.errorBackground,
        borderRadius: DesignSystem.borderRadius.lg,
        padding: DesignSystem.spacing.md,
        marginHorizontal: DesignSystem.spacing.lg,
        marginVertical: DesignSystem.spacing.xs,
        borderWidth: 1,
        borderColor: DesignSystem.colors.errorBorder,
        borderLeftWidth: 4,
        borderLeftColor: DesignSystem.colors.errorBorder,
      },
      
      info: {
        backgroundColor: DesignSystem.colors.background,
        borderRadius: DesignSystem.borderRadius.lg,
        padding: DesignSystem.spacing.md,
        marginHorizontal: DesignSystem.spacing.lg,
        marginVertical: DesignSystem.spacing.xs,
        borderWidth: 1,
        borderColor: DesignSystem.colors.info,
        borderLeftWidth: 4,
        borderLeftColor: DesignSystem.colors.info,
      },
    },
  },

  // Input tokens with DesignSystem references
  input: {
    standard: {
      borderWidth: 1,
      borderColor: DesignSystem.colors.border,
      borderRadius: DesignSystem.borderRadius.md,
      paddingHorizontal: DesignSystem.spacing.md,
      paddingVertical: DesignSystem.spacing.md,
      fontSize: DesignSystem.typography.fontSize.base,
      fontWeight: DesignSystem.typography.fontWeight.normal,
      color: DesignSystem.colors.textPrimary,
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      minHeight: 48,
      lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.normal,
    },
    
    search: {
      borderWidth: 1,
      borderColor: DesignSystem.colors.borderLight,
      borderRadius: DesignSystem.borderRadius.lg,
      paddingHorizontal: DesignSystem.spacing.lg,
      paddingVertical: DesignSystem.spacing.base,
      fontSize: DesignSystem.typography.fontSize.base,
      fontWeight: DesignSystem.typography.fontWeight.normal,
      color: DesignSystem.colors.textPrimary,
      backgroundColor: DesignSystem.colors.background,
      minHeight: 44,
    },
    
    textarea: {
      borderWidth: 1,
      borderColor: DesignSystem.colors.border,
      borderRadius: DesignSystem.borderRadius.md,
      paddingHorizontal: DesignSystem.spacing.md,
      paddingVertical: DesignSystem.spacing.md,
      fontSize: DesignSystem.typography.fontSize.base,
      fontWeight: DesignSystem.typography.fontWeight.normal,
      color: DesignSystem.colors.textPrimary,
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      minHeight: 80,
      lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.normal,
      textAlignVertical: 'top' as const,
    },
  },

  // Progress tokens - consolidated into single component with size variants
  progress: {
    // Legacy support - maps to new ProgressBar component sizes
    thin: 'thin' as const,     // Replaces: progress.bar (height: 8px)
    medium: 'medium' as const, // Replaces: progress.course (height: 12px)
    thick: 'thick' as const,   // Replaces: progress.practice (height: 10px)
  },

  // Modal tokens with DesignSystem references
  modal: {
    standard: {
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      borderRadius: DesignSystem.borderRadius.lg,
      padding: DesignSystem.spacing.xl,
      margin: DesignSystem.spacing.xl,
      shadowColor: DesignSystem.colors.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    
    fullscreen: {
      backgroundColor: DesignSystem.colors.background,
      borderRadius: 0,
      padding: 0,
    },
    
    alert: {
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      borderRadius: DesignSystem.borderRadius.xl,
      padding: DesignSystem.spacing['2xl'],
      margin: DesignSystem.spacing['2xl'],
      shadowColor: DesignSystem.colors.cardShadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
    
    overlay: {
      backgroundColor: DesignSystem.colors.overlayDark,
    },
  },

  // Header tokens - consolidated into single Header component with context variants
  header: {
    // Legacy support - maps to new Header component contexts
    page: 'page' as const,     // Maps to Header context="page"
    modal: 'modal' as const,   // Maps to Header context="modal"
    section: 'section' as const, // Maps to Header context="section"
  },

  // Semantic color variants for Buddhist theming
  semantic: {
    // Semantic colors for Buddhist themes
    dharma: DesignSystem.colors.dharmaRed,        // For dharma-related elements
    meditation: DesignSystem.colors.meditationBlue, // For meditation-related elements
    wisdom: DesignSystem.colors.wisdomGold,       // For wisdom/achievement elements
    success: DesignSystem.colors.practiceComplete, // For completion/success elements
  },

  // Badge component tokens
  badge: {
    small: {
      borderRadius: DesignSystem.borderRadius.lg,
      paddingHorizontal: DesignSystem.spacing.md,
      paddingVertical: DesignSystem.spacing.xs,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
  },
};

// Text styles that use component tokens
export const ComponentTextStyles = {
  button: {
    // Text styles by variant
    variants: {
      primary: {
        color: DesignSystem.colors.textInverse,
        fontWeight: DesignSystem.typography.fontWeight.bold,
        letterSpacing: DesignSystem.typography.letterSpacing.tighter,
      },
      secondary: {
        color: DesignSystem.colors.primary,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
        letterSpacing: DesignSystem.typography.letterSpacing.normal,
      },
      ghost: {
        color: DesignSystem.colors.primary,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
        letterSpacing: DesignSystem.typography.letterSpacing.normal,
      },
    },
    
    // Text styles by size
    sizes: {
      small: {
        fontSize: DesignSystem.typography.fontSize.sm,
      },
      medium: {
        fontSize: DesignSystem.typography.fontSize.base,
      },
      large: {
        fontSize: DesignSystem.typography.fontSize.lg,
      },
    },
    
    // Legacy text style mappings (resolved after export)
    legacy: {
      primary: {
        color: DesignSystem.colors.textInverse,
        fontWeight: DesignSystem.typography.fontWeight.bold,
        fontSize: DesignSystem.typography.fontSize.base,
        letterSpacing: DesignSystem.typography.letterSpacing.tighter,
      },
      secondary: {
        color: DesignSystem.colors.primary,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
        fontSize: DesignSystem.typography.fontSize.base,
        letterSpacing: DesignSystem.typography.letterSpacing.normal,
      },
      small: {
        color: DesignSystem.colors.primary,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
        fontSize: DesignSystem.typography.fontSize.sm,
        letterSpacing: DesignSystem.typography.letterSpacing.normal,
      },
      text: {
        color: DesignSystem.colors.primary,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
        fontSize: DesignSystem.typography.fontSize.sm,
        letterSpacing: DesignSystem.typography.letterSpacing.normal,
      },
      dharma: {
        color: DesignSystem.colors.textInverse,
        fontWeight: DesignSystem.typography.fontWeight.bold,
        fontSize: DesignSystem.typography.fontSize.lg,
        letterSpacing: DesignSystem.typography.letterSpacing.tighter,
      },
    },
  },
  
  card: {
    title: {
      fontSize: DesignSystem.typography.fontSize['2xl'],
      fontWeight: DesignSystem.typography.fontWeight.bold,
      color: DesignSystem.colors.textPrimary,
      letterSpacing: DesignSystem.typography.letterSpacing.tight,
      lineHeight: DesignSystem.typography.lineHeight.tight,
    },
    subtitle: {
      fontSize: DesignSystem.typography.fontSize.lg,
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      color: DesignSystem.colors.textPrimary,
      letterSpacing: DesignSystem.typography.letterSpacing.tight,
    },
    body: {
      fontSize: DesignSystem.typography.fontSize.base,
      fontWeight: DesignSystem.typography.fontWeight.normal,
      color: DesignSystem.colors.textSecondary,
      lineHeight: DesignSystem.typography.lineHeight.relaxed,
    },
    metadata: {
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.medium,
      color: DesignSystem.colors.textSecondary,
    },
  },
  
  // Notification text styles (for new Notification component)
  notification: {
    title: {
      fontSize: DesignSystem.typography.fontSize.base,
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      color: DesignSystem.colors.textPrimary,
    },
    message: {
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.normal,
      color: DesignSystem.colors.textSecondary,
      lineHeight: DesignSystem.typography.lineHeight.relaxed,
    },
  },
  
  header: {
    // Legacy support - text styles are now handled by Header component internally
    page: 'page' as const,
    modal: 'modal' as const,
    section: 'section' as const,
  },
  
  // Semantic text styles (consolidated from Buddhist-specific)
  semantic: {
    dharmaTitle: {
      fontSize: DesignSystem.typography.fontSize['2xl'],
      fontWeight: DesignSystem.typography.fontWeight.bold,
      color: DesignSystem.colors.textPrimary,
      letterSpacing: DesignSystem.typography.letterSpacing.tight,
      lineHeight: DesignSystem.typography.lineHeight.tight,
    },
    practiceText: {
      fontSize: DesignSystem.typography.fontSize.base,
      fontWeight: DesignSystem.typography.fontWeight.medium,
      color: DesignSystem.colors.textPrimary,
      lineHeight: DesignSystem.typography.lineHeight.relaxed,
    },
    successText: {
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      color: DesignSystem.colors.practiceComplete,
    },
    accentText: {
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      color: DesignSystem.colors.textInverse,
    },
  },
};

// Helper functions for common patterns
export const componentHelpers = {
  // Get complete button style with new consolidated system
  getButtonStyle: (
    variant: 'primary' | 'secondary' | 'ghost', 
    size: 'small' | 'medium' | 'large' = 'medium'
  ) => ({
    ...ComponentTokens.button.variants[variant],
    ...ComponentTokens.button.sizes[size],
  }),
  
  // Legacy button style support
  getLegacyButtonStyle: (legacyVariant: 'primary' | 'secondary' | 'small' | 'text' | 'dharma') => {
    const mapping = ComponentTokens.button.legacy[legacyVariant];
    return componentHelpers.getButtonStyle(mapping.variant, mapping.size);
  },
  
  // Get complete card style with new consolidated system
  getCardStyle: (
    variant: 'outlined' | 'elevated', 
    padding: 'compact' | 'comfortable' | 'spacious' = 'comfortable'
  ) => ({
    ...ComponentTokens.card.variants[variant],
    padding: ComponentTokens.card.padding[padding],
  }),
  
  // Legacy card style support
  getLegacyCardStyle: (legacyVariant: 'standard' | 'practice' | 'course') => {
    const mapping = ComponentTokens.card.legacy[legacyVariant];
    if (typeof mapping === 'string') {
      throw new Error(`Legacy variant '${legacyVariant}' should use Notification component instead`);
    }
    return componentHelpers.getCardStyle(mapping.variant, mapping.padding);
  },
  
  // Get notification style (replaces status cards)
  getNotificationStyle: (variant: keyof typeof ComponentTokens.notification.variants) => 
    ComponentTokens.notification.variants[variant],
  
  // Get button text style with new consolidated system
  getButtonTextStyle: (
    variant: 'primary' | 'secondary' | 'ghost', 
    size: 'small' | 'medium' | 'large' = 'medium'
  ) => ({
    ...ComponentTextStyles.button.variants[variant],
    ...ComponentTextStyles.button.sizes[size],
  }),
  
  // Legacy button text style support
  getLegacyButtonTextStyle: (legacyVariant: 'primary' | 'secondary' | 'small' | 'text' | 'dharma') => {
    return ComponentTextStyles.button.legacy[legacyVariant];
  },
  
  // Get card text style
  getCardTextStyle: (variant: keyof typeof ComponentTextStyles.card) => 
    ComponentTextStyles.card[variant],
  
  // Get notification text style
  getNotificationTextStyle: (variant: keyof typeof ComponentTextStyles.notification) => 
    ComponentTextStyles.notification[variant],
  
  // Get progress bar size (for new ProgressBar component)
  getProgressSize: (variant: keyof typeof ComponentTokens.progress) => 
    ComponentTokens.progress[variant],
  
  // Get modal style
  getModalStyle: (variant: keyof typeof ComponentTokens.modal) => 
    ComponentTokens.modal[variant],
  
  // Get header context (for new Header component)
  getHeaderContext: (variant: keyof typeof ComponentTokens.header) => 
    ComponentTokens.header[variant],
  
  // Get semantic color (replaces Buddhist-specific styles)
  getSemanticColor: (variant: keyof typeof ComponentTokens.semantic) => 
    ComponentTokens.semantic[variant],
  
  // Get badge style with semantic color
  getBadgeStyle: (size: keyof typeof ComponentTokens.badge, semanticColor?: keyof typeof ComponentTokens.semantic) => {
    const baseStyle = ComponentTokens.badge[size];
    if (semanticColor) {
      return {
        ...baseStyle,
        backgroundColor: ComponentTokens.semantic[semanticColor],
        shadowColor: ComponentTokens.semantic[semanticColor],
      };
    }
    return baseStyle;
  },
  
  // Get card style with semantic accent color
  getCardWithAccent: (variant: keyof typeof ComponentTokens.card, accentColor?: keyof typeof ComponentTokens.semantic) => {
    const baseCard = ComponentTokens.card[variant];
    if (accentColor) {
      return {
        ...baseCard,
        borderLeftWidth: 4,
        borderLeftColor: ComponentTokens.semantic[accentColor],
      };
    }
    return baseCard;
  },
  
  // Get semantic text styles
  getSemanticTextStyle: (variant: keyof typeof ComponentTextStyles.semantic) => 
    ComponentTextStyles.semantic[variant],
};

export default ComponentTokens;
