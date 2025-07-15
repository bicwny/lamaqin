
/**
 * Component Token Utilities
 * Provides easy access to component-specific design tokens
 */

import { DesignSystem } from '@/constants/DesignSystem';

// Component token helpers that reference the main design system
export const ComponentTokens = {
  // Button tokens with DesignSystem references
  button: {
    primary: {
      backgroundColor: DesignSystem.colors.primary,
      paddingVertical: DesignSystem.spacing.lg,
      paddingHorizontal: DesignSystem.spacing.xl,
      borderRadius: DesignSystem.borderRadius.lg,
      minHeight: 48,
      ...DesignSystem.shadow.md,
    },
    
    secondary: {
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      paddingVertical: DesignSystem.spacing.lg,
      paddingHorizontal: DesignSystem.spacing.xl,
      borderRadius: DesignSystem.borderRadius.lg,
      borderWidth: 1.5,
      borderColor: DesignSystem.colors.primary,
      minHeight: 48,
      ...DesignSystem.shadow.sm,
    },
    
    small: {
      backgroundColor: DesignSystem.colors.background,
      paddingVertical: DesignSystem.spacing.base,
      paddingHorizontal: DesignSystem.spacing.md,
      borderRadius: DesignSystem.borderRadius.md,
      borderWidth: 1,
      borderColor: DesignSystem.colors.border,
      minHeight: 36,
    },
    
    text: {
      backgroundColor: 'transparent',
      paddingVertical: DesignSystem.spacing.sm,
      paddingHorizontal: DesignSystem.spacing.md,
      borderRadius: DesignSystem.spacing.xxs,
    },
    
    dharma: {
      backgroundColor: DesignSystem.colors.dharmaRed,
      paddingVertical: DesignSystem.spacing.lg,
      paddingHorizontal: DesignSystem.spacing['2xl'],
      borderRadius: DesignSystem.borderRadius.lg,
      minHeight: 48,
      ...DesignSystem.shadow.md,
    },
  },

  // Card tokens with DesignSystem references
  card: {
    standard: {
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      borderRadius: DesignSystem.borderRadius.lg,
      padding: DesignSystem.spacing.lg,
      //marginHorizontal: DesignSystem.spacing.lg,
      marginBottom: DesignSystem.spacing.lg,
      shadowColor: DesignSystem.colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: DesignSystem.colors.borderLight,
    },
    
    practice: {
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      borderRadius: DesignSystem.borderRadius.lg,
      padding: DesignSystem.spacing.lg,
      //marginHorizontal: DesignSystem.spacing.lg,
      marginBottom: DesignSystem.spacing.lg,
      shadowColor: DesignSystem.colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: DesignSystem.colors.borderLight,
    },
    
    course: {
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      borderRadius: DesignSystem.borderRadius.xl,
      padding: DesignSystem.spacing.xl,
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
    
    status: {
      backgroundColor: DesignSystem.colors.successBackground,
      borderRadius: DesignSystem.borderRadius.lg,
      padding: DesignSystem.spacing.md,
      marginHorizontal: DesignSystem.spacing.lg,
      marginVertical: DesignSystem.spacing.xs,
      borderWidth: 1,
      borderColor: DesignSystem.colors.practiceComplete,
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

  // Progress tokens with DesignSystem references
  progress: {
    bar: {
      container: {
        height: DesignSystem.spacing.sm,
        backgroundColor: DesignSystem.colors.border,
        borderRadius: DesignSystem.borderRadius.sm,
        overflow: 'hidden' as const,
      },
      fill: {
        height: '100%' as const,
        backgroundColor: DesignSystem.colors.primary,
        borderRadius: DesignSystem.borderRadius.sm,
      },
    },
    
    course: {
      container: {
        height: DesignSystem.spacing.md,
        backgroundColor: DesignSystem.colors.borderLight,
        borderRadius: DesignSystem.spacing.xxs,
        overflow: 'hidden' as const,
      },
      fill: {
        height: '100%' as const,
        backgroundColor: DesignSystem.colors.studyProgress,
        borderRadius: DesignSystem.spacing.xxs,
      },
    },
    
    practice: {
      container: {
        height: DesignSystem.spacing.base,
        backgroundColor: DesignSystem.colors.background,
        borderRadius: 5,
        overflow: 'hidden' as const,
        borderWidth: 1,
        borderColor: DesignSystem.colors.border,
      },
      fill: {
        height: '100%' as const,
        backgroundColor: DesignSystem.colors.dharmaRed,
        borderRadius: DesignSystem.borderRadius.sm,
      },
    },
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

  // Header tokens with DesignSystem references
  header: {
    page: {
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: DesignSystem.colors.borderLight,
      paddingHorizontal: DesignSystem.spacing.lg,
      paddingVertical: DesignSystem.spacing.md,
      minHeight: 60,
    },
    
    modal: {
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: DesignSystem.colors.border,
      paddingHorizontal: DesignSystem.spacing.lg,
      paddingVertical: DesignSystem.spacing.md,
      minHeight: 56,
    },
    
    section: {
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
      paddingVertical: DesignSystem.spacing.sm,
      marginBottom: DesignSystem.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: DesignSystem.colors.borderLight,
    },
  },

  // Buddhist-specific tokens with DesignSystem references
  buddhist: {
    dharmaCard: {
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      borderRadius: DesignSystem.borderRadius.lg,
      padding: DesignSystem.spacing.xl,
      marginHorizontal: DesignSystem.spacing.lg,
      marginVertical: DesignSystem.spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: DesignSystem.colors.dharmaRed,
      shadowColor: DesignSystem.colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    
    meditationCard: {
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      borderRadius: DesignSystem.borderRadius.xl,
      padding: DesignSystem.spacing.xl,
      marginHorizontal: DesignSystem.spacing.lg,
      marginVertical: DesignSystem.spacing.sm,
      borderWidth: 2,
      borderColor: DesignSystem.colors.meditationBlue,
      shadowColor: DesignSystem.colors.meditationBlue,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    
    wisdomBadge: {
      backgroundColor: DesignSystem.colors.wisdomGold,
      borderRadius: DesignSystem.spacing.xl,
      paddingHorizontal: DesignSystem.spacing.md,
      paddingVertical: DesignSystem.spacing.xs,
      shadowColor: DesignSystem.colors.wisdomGold,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    
    completionBadge: {
      backgroundColor: DesignSystem.colors.successBackground,
      borderRadius: DesignSystem.borderRadius.lg,
      paddingHorizontal: DesignSystem.spacing.md,
      paddingVertical: DesignSystem.spacing.xs,
      borderWidth: 1,
      borderColor: DesignSystem.colors.practiceComplete,
    },
  },
};

// Text styles that use component tokens
export const ComponentTextStyles = {
  button: {
    primary: {
      fontSize: DesignSystem.typography.fontSize.base,
      fontWeight: DesignSystem.typography.fontWeight.bold,
      color: DesignSystem.colors.textInverse,
      letterSpacing: DesignSystem.typography.letterSpacing.tighter,
    },
    secondary: {
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      color: DesignSystem.colors.primary,
      letterSpacing: DesignSystem.typography.letterSpacing.normal,
    },
    small: {
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.medium,
      color: DesignSystem.colors.textSecondary,
    },
    text: {
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      color: DesignSystem.colors.primary,
    },
    dharma: {
      fontSize: DesignSystem.typography.fontSize.base,
      fontWeight: DesignSystem.typography.fontWeight.bold,
      color: DesignSystem.colors.textInverse,
      letterSpacing: DesignSystem.typography.letterSpacing.tighter,
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
  
  header: {
    page: {
      fontSize: DesignSystem.typography.fontSize.xl,
      fontWeight: DesignSystem.typography.fontWeight.bold,
      color: DesignSystem.colors.textPrimary,
      letterSpacing: DesignSystem.typography.letterSpacing.tight,
    },
    section: {
      fontSize: DesignSystem.typography.fontSize.lg,
      fontWeight: DesignSystem.typography.fontWeight.bold,
      color: DesignSystem.colors.textPrimary,
      letterSpacing: DesignSystem.typography.letterSpacing.tight,
    },
  },
  
  buddhist: {
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
    completionText: {
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      color: DesignSystem.colors.practiceComplete,
    },
    wisdomText: {
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      color: DesignSystem.colors.textInverse,
    },
  },
};

// Helper functions for common patterns
export const componentHelpers = {
  // Get complete button style
  getButtonStyle: (variant: keyof typeof ComponentTokens.button) => 
    ComponentTokens.button[variant],
  
  // Get complete card style
  getCardStyle: (variant: keyof typeof ComponentTokens.card) => 
    ComponentTokens.card[variant],
  
  // Get button text style
  getButtonTextStyle: (variant: keyof typeof ComponentTextStyles.button) => 
    ComponentTextStyles.button[variant],
  
  // Get card text style
  getCardTextStyle: (variant: keyof typeof ComponentTextStyles.card) => 
    ComponentTextStyles.card[variant],
  
  // Get progress bar styles
  getProgressStyle: (variant: keyof typeof ComponentTokens.progress) => 
    ComponentTokens.progress[variant],
  
  // Get modal style
  getModalStyle: (variant: keyof typeof ComponentTokens.modal) => 
    ComponentTokens.modal[variant],
  
  // Get Buddhist-specific styles
  getBuddhistStyle: (variant: keyof typeof ComponentTokens.buddhist) => 
    ComponentTokens.buddhist[variant],
  
  // Get Buddhist text styles
  getBuddhistTextStyle: (variant: keyof typeof ComponentTextStyles.buddhist) => 
    ComponentTextStyles.buddhist[variant],
};

export default ComponentTokens;
