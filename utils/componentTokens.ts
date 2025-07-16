
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
        shadowColor: DesignSystem.colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: DesignSystem.colors.borderDark,
      },

      elevated: {
        backgroundColor: DesignSystem.colors.backgroundSecondary,
        borderRadius: DesignSystem.borderRadius.xl,
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

    // Margin variations
    margin: {
      none: 0,                               // No margin
      tight: DesignSystem.spacing.xs,        // 4px - minimal spacing
      compact: DesignSystem.spacing.sm,      // 8px - close proximity
      comfortable: DesignSystem.spacing.md,  // 12px - balanced spacing
      spacious: DesignSystem.spacing.lg,     // 16px - generous spacing
      loose: DesignSystem.spacing.xl,        // 20px - wide spacing
      extraLoose: DesignSystem.spacing['2xl'], // 24px - maximum spacing
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

  // Modal tokens - Consolidated
  modal: {
    dialog: {
      backgroundColor: DesignSystem.colors.backgroundSecondary,
      borderRadius: DesignSystem.borderRadius.lg,
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

    // Size-based spacing for dialog modals
    sizes: {
      compact: {
        padding: DesignSystem.spacing.lg,
        margin: DesignSystem.spacing.lg,
        borderRadius: DesignSystem.borderRadius.md,
      },
      default: {
        padding: DesignSystem.spacing.xl,
        margin: DesignSystem.spacing.xl,
        borderRadius: DesignSystem.borderRadius.lg,
      },
      large: {
        padding: DesignSystem.spacing['2xl'],
        margin: DesignSystem.spacing['2xl'],
        borderRadius: DesignSystem.borderRadius.xl,
      },
    },
  },

  // Separated overlay utility
  overlay: {
    backgroundColor: DesignSystem.colors.overlayDark,
  },

  // Header tokens - consolidated into single Header component with context variants
  header: {
    // Legacy support - maps to new Header component contexts
    page: 'page' as const,     // Maps to Header context="page"
    modal: 'modal' as const,   // Maps to Header context="modal"
    section: 'section' as const, // Maps to Header context="section"
  },

  // Divider component tokens
  divider: {
    // Horizontal dividers (default)
    horizontal: {
      height: 1,
      backgroundColor: DesignSystem.colors.border,
      marginVertical: DesignSystem.spacing.md,
    },

    // Vertical dividers
    vertical: {
      width: 1,
      backgroundColor: DesignSystem.colors.border,
      marginHorizontal: DesignSystem.spacing.md,
    },

    // Thickness variations
    thickness: {
      thin: 1,
      medium: 2,
      thick: 3,
    },

    // Color variants
    colors: {
      light: DesignSystem.colors.borderLight,
      default: DesignSystem.colors.border,
      dark: DesignSystem.colors.borderDark,
      primary: DesignSystem.colors.primary,
    },

    // Spacing variations
    spacing: {
      none: 0,
      tight: DesignSystem.spacing.xs,
      normal: DesignSystem.spacing.md,
      loose: DesignSystem.spacing.lg,
    },
  },

  // Semantic color variants for Buddhist theming
  semantic: {
    // Semantic colors for Buddhist themes
    dharma: DesignSystem.colors.dharmaRed,        // For dharma-related elements
    meditation: DesignSystem.colors.meditationBlue, // For meditation-related elements
    wisdom: DesignSystem.colors.wisdomGold,       // For wisdom/achievement elements
    success: DesignSystem.colors.practiceComplete, // For completion/success elements
  },

  // Completed badge tokens (for practice completion indicators)
  completedBadge: {
    container: {
      backgroundColor: DesignSystem.colors.successBackground,
      borderRadius: DesignSystem.borderRadius.md,
      paddingHorizontal: DesignSystem.spacing.sm,
      paddingVertical: DesignSystem.spacing.xs,
      borderWidth: 1,
      borderColor: DesignSystem.colors.practiceComplete,
      alignSelf: 'flex-start',
      marginBottom: DesignSystem.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 24,
    },
    icon: {
      size: 16,
      color: DesignSystem.colors.practiceComplete,
    },
    text: {
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      color: DesignSystem.colors.practiceComplete,
      marginLeft: DesignSystem.spacing.xs,
    },
  },

  // Badge component tokens - comprehensive system
  badge: {
    // Size variations
    sizes: {
      small: {
        paddingHorizontal: DesignSystem.spacing.sm,     // 8px
        paddingVertical: DesignSystem.spacing.xs,       // 4px
        borderRadius: DesignSystem.borderRadius.md,     // 8px
        minHeight: 20,
        fontSize: DesignSystem.typography.fontSize.xs,  // 12px
        fontWeight: DesignSystem.typography.fontWeight.semibold,
      },

      medium: {
        paddingHorizontal: DesignSystem.spacing.md,     // 12px
        paddingVertical: DesignSystem.spacing.sm,       // 8px
        borderRadius: DesignSystem.borderRadius.lg,     // 12px
        minHeight: 28,
        fontSize: DesignSystem.typography.fontSize.sm,  // 14px
        fontWeight: DesignSystem.typography.fontWeight.semibold,
      },

      large: {
        paddingHorizontal: DesignSystem.spacing.lg,     // 16px
        paddingVertical: DesignSystem.spacing.base,     // 10px
        borderRadius: DesignSystem.borderRadius.lg,     // 12px
        minHeight: 36,
        fontSize: DesignSystem.typography.fontSize.base, // 16px
        fontWeight: DesignSystem.typography.fontWeight.semibold,
      },
    },

    // Variant styles
    variants: {
      // Standard badge with background
      filled: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 0,
      },

      // Outlined badge
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },

      // Soft/ghost badge
      soft: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        borderWidth: 0,
      },
    },

    // Pill variations (fully rounded)
    pill: {
      small: {
        paddingHorizontal: DesignSystem.spacing.md,     // 12px
        paddingVertical: DesignSystem.spacing.xs,       // 4px
        borderRadius: DesignSystem.borderRadius.full,   // 9999px
        minHeight: 20,
        fontSize: DesignSystem.typography.fontSize.xs,  // 12px
        fontWeight: DesignSystem.typography.fontWeight.semibold,
      },

      medium: {
        paddingHorizontal: DesignSystem.spacing.lg,     // 16px
        paddingVertical: DesignSystem.spacing.sm,       // 8px
        borderRadius: DesignSystem.borderRadius.full,   // 9999px
        minHeight: 28,
        fontSize: DesignSystem.typography.fontSize.sm,  // 14px
        fontWeight: DesignSystem.typography.fontWeight.semibold,
      },

      large: {
        paddingHorizontal: DesignSystem.spacing.xl,     // 20px
        paddingVertical: DesignSystem.spacing.base,     // 10px
        borderRadius: DesignSystem.borderRadius.full,   // 9999px
        minHeight: 36,
        fontSize: DesignSystem.typography.fontSize.base, // 16px
        fontWeight: DesignSystem.typography.fontWeight.semibold,
      },
    },

    // Semantic color variants
    colors: {
      // Primary theme
      primary: {
        backgroundColor: DesignSystem.colors.primary,
        color: DesignSystem.colors.textInverse,
        borderColor: DesignSystem.colors.primary,
        shadowColor: DesignSystem.colors.primary,
      },

      // Success states
      success: {
        backgroundColor: DesignSystem.colors.practiceComplete,
        color: DesignSystem.colors.textInverse,
        borderColor: DesignSystem.colors.practiceComplete,
        shadowColor: DesignSystem.colors.practiceComplete,
      },

      // Warning states
      warning: {
        backgroundColor: DesignSystem.colors.warning,
        color: DesignSystem.colors.textInverse,
        borderColor: DesignSystem.colors.warning,
        shadowColor: DesignSystem.colors.warning,
      },

      // Error states
      error: {
        backgroundColor: DesignSystem.colors.error,
        color: DesignSystem.colors.textInverse,
        borderColor: DesignSystem.colors.error,
        shadowColor: DesignSystem.colors.error,
      },

      // Info states
      info: {
        backgroundColor: DesignSystem.colors.info,
        color: DesignSystem.colors.textInverse,
        borderColor: DesignSystem.colors.info,
        shadowColor: DesignSystem.colors.info,
      },

      // Neutral/default
      neutral: {
        backgroundColor: DesignSystem.colors.backgroundSecondary,
        color: DesignSystem.colors.textSecondary,
        borderColor: DesignSystem.colors.border,
        shadowColor: DesignSystem.colors.cardShadow,
      },

      // Buddhist semantic colors
      dharma: {
        backgroundColor: DesignSystem.colors.dharmaRed,
        color: DesignSystem.colors.textInverse,
        borderColor: DesignSystem.colors.dharmaRed,
        shadowColor: DesignSystem.colors.dharmaRed,
      },

      meditation: {
        backgroundColor: DesignSystem.colors.meditationBlue,
        color: DesignSystem.colors.textInverse,
        borderColor: DesignSystem.colors.meditationBlue,
        shadowColor: DesignSystem.colors.meditationBlue,
      },

      wisdom: {
        backgroundColor: DesignSystem.colors.wisdomGold,
        color: DesignSystem.colors.textPrimary,
        borderColor: DesignSystem.colors.wisdomGold,
        shadowColor: DesignSystem.colors.wisdomGold,
      },
    },

    // Soft/ghost color variants (light backgrounds)
    softColors: {
      primary: {
        backgroundColor: `${DesignSystem.colors.primary}15`, // 15% opacity
        color: DesignSystem.colors.primary,
        borderColor: `${DesignSystem.colors.primary}30`,
      },

      success: {
        backgroundColor: DesignSystem.colors.successBackground,
        color: DesignSystem.colors.practiceComplete,
        borderColor: DesignSystem.colors.practiceComplete,
      },

      warning: {
        backgroundColor: DesignSystem.colors.warningBackground,
        color: DesignSystem.colors.warning,
        borderColor: DesignSystem.colors.warningBorder,
      },

      error: {
        backgroundColor: DesignSystem.colors.errorBackground,
        color: DesignSystem.colors.error,
        borderColor: DesignSystem.colors.errorBorder,
      },

      info: {
        backgroundColor: `${DesignSystem.colors.info}15`,
        color: DesignSystem.colors.info,
        borderColor: `${DesignSystem.colors.info}30`,
      },

      neutral: {
        backgroundColor: DesignSystem.colors.background,
        color: DesignSystem.colors.textSecondary,
        borderColor: DesignSystem.colors.borderLight,
      },

      dharma: {
        backgroundColor: `${DesignSystem.colors.dharmaRed}15`,
        color: DesignSystem.colors.dharmaRed,
        borderColor: `${DesignSystem.colors.dharmaRed}30`,
      },

      meditation: {
        backgroundColor: `${DesignSystem.colors.meditationBlue}15`,
        color: DesignSystem.colors.meditationBlue,
        borderColor: `${DesignSystem.colors.meditationBlue}30`,
      },

      wisdom: {
        backgroundColor: `${DesignSystem.colors.wisdomGold}20`,
        color: DesignSystem.colors.wisdomGold,
        borderColor: `${DesignSystem.colors.wisdomGold}40`,
      },
    },

    // Legacy support
    legacy: {
      small: { size: 'small' as const, variant: 'filled' as const, color: 'primary' as const },
      wisdomBadge: { size: 'medium' as const, variant: 'filled' as const, color: 'wisdom' as const },
      completionBadge: { size: 'medium' as const, variant: 'soft' as const, color: 'success' as const },
    },
  },
};

// CONSOLIDATED Text styles - reduced from 24 to 12 semantic styles
export const ComponentTextStyles = {
  // 1. PRIMARY TEXT STYLES (4 core styles)
  heading: {
    // Main headings - consolidates pageTitle, sectionTitle, dharmaTitle
    fontSize: DesignSystem.typography.fontSize['2xl'],      // 24px
    fontWeight: DesignSystem.typography.fontWeight.bold,    // 700
    color: DesignSystem.colors.textPrimary,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
    lineHeight: DesignSystem.typography.fontSize['2xl'] * DesignSystem.typography.lineHeight.tight,
  },

  subheading: {
    // Secondary headings - consolidates subtitle, card.title
    fontSize: DesignSystem.typography.fontSize.lg,          // 18px
    fontWeight: DesignSystem.typography.fontWeight.semibold, // 600
    color: DesignSystem.colors.textPrimary,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
    lineHeight: DesignSystem.typography.fontSize.lg * DesignSystem.typography.lineHeight.snug,
  },

  body: {
    // Regular content text - consolidates bodyText, content, description
    fontSize: DesignSystem.typography.fontSize.base,        // 16px
    fontWeight: DesignSystem.typography.fontWeight.normal,  // 400
    color: DesignSystem.colors.textSecondary,
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.normal,
  },

  label: {
    // Small labels and metadata - consolidates label, metadata, helper
    fontSize: DesignSystem.typography.fontSize.sm,          // 14px
    fontWeight: DesignSystem.typography.fontWeight.medium,  // 500
    color: DesignSystem.colors.textSecondary,
    lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.snug,
  },

  // 2. INTERACTIVE TEXT STYLES (3 styles)
  button: {
    primary: {
      fontSize: DesignSystem.typography.fontSize.base,      // 16px
      fontWeight: DesignSystem.typography.fontWeight.bold, // 700
      color: DesignSystem.colors.textInverse,
      letterSpacing: DesignSystem.typography.letterSpacing.tighter,
      lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.tight,
    },

    secondary: {
      fontSize: DesignSystem.typography.fontSize.base,      // 16px
      fontWeight: DesignSystem.typography.fontWeight.semibold, // 600
      color: DesignSystem.colors.primary,
      letterSpacing: DesignSystem.typography.letterSpacing.normal,
      lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.tight,
    },
  },

  link: {
    // Interactive links - consolidates linkText
    fontSize: DesignSystem.typography.fontSize.base,        // 16px
    fontWeight: DesignSystem.typography.fontWeight.semibold, // 600
    color: DesignSystem.colors.primary,
    letterSpacing: DesignSystem.typography.letterSpacing.normal,
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.tight,
  },

  // 3. SEMANTIC TEXT STYLES (3 Buddhist-specific styles)
  dharma: {
    // Buddhist practice text - consolidates dharmaTitle, practiceText
    fontSize: DesignSystem.typography.fontSize['2xl'],      // 24px
    fontWeight: DesignSystem.typography.fontWeight.bold,    // 700
    color: DesignSystem.colors.textPrimary,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
    lineHeight: DesignSystem.typography.fontSize['2xl'] * DesignSystem.typography.lineHeight.tight,
  },

  practice: {
    // Practice content text - optimized for reading Buddhist content
    fontSize: DesignSystem.typography.fontSize.base,        // 16px
    fontWeight: DesignSystem.typography.fontWeight.medium,  // 500
    color: DesignSystem.colors.textPrimary,
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.relaxed,
  },

  success: {
    // Completion and success states
    fontSize: DesignSystem.typography.fontSize.sm,          // 14px
    fontWeight: DesignSystem.typography.fontWeight.semibold, // 600
    color: DesignSystem.colors.practiceComplete,
    lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.snug,
  },

  // 4. UTILITY TEXT STYLES (2 styles)
  caption: {
    // Smallest text for fine print - consolidates caption, error
    fontSize: DesignSystem.typography.fontSize.xs,          // 12px
    fontWeight: DesignSystem.typography.fontWeight.normal,  // 400
    color: DesignSystem.colors.textTertiary,
    lineHeight: DesignSystem.typography.fontSize.xs * DesignSystem.typography.lineHeight.tight,
  },

  input: {
    // Form input text
    fontSize: DesignSystem.typography.fontSize.base,        // 16px
    fontWeight: DesignSystem.typography.fontWeight.normal,  // 400
    color: DesignSystem.colors.textPrimary,
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.normal,
  },

  // LEGACY SUPPORT - maps old styles to new consolidated ones
  legacy: {
    // Button text styles
    buttonPrimary: 'button.primary' as const,
    buttonSecondary: 'button.secondary' as const,
    buttonSmall: 'button.secondary' as const,
    buttonText: 'button.secondary' as const,
    buttonDharma: 'button.primary' as const,

    // Card text styles
    cardTitle: 'subheading' as const,
    cardSubtitle: 'label' as const,
    cardBody: 'body' as const,
    cardMetadata: 'caption' as const,

    // Header text styles
    pageHeader: 'heading' as const,
    modalHeader: 'subheading' as const,
    sectionHeader: 'subheading' as const,

    // Notification text styles
    notificationTitle: 'subheading' as const,
    notificationMessage: 'body' as const,

    // Semantic text styles
    dharmaTitle: 'dharma' as const,
    practiceText: 'practice' as const,
    successText: 'success' as const,
    accentText: 'button.primary' as const,

    // Form text styles
    formLabel: 'label' as const,
    formInput: 'input' as const,
    formHelper: 'caption' as const,
    formError: 'caption' as const,

    // Component-specific legacy mappings
    practiceDetailTitle: 'heading' as const,
    practiceDetailSubtitle: 'subheading' as const,
    practiceDetailDescription: 'body' as const,
    practiceDetailLabel: 'label' as const,
    practiceDetailValue: 'body' as const,
    practiceDetailMetadata: 'caption' as const,
    practiceDetailButton: 'button.primary' as const,
    practiceDetailSecondaryButton: 'button.secondary' as const,

    modalTitle: 'subheading' as const,
    modalSubtitle: 'body' as const,
    modalContent: 'body' as const,
    modalButton: 'button.primary' as const,
  },
};

export const componentHelpers = {
  // Get card style with variant and spacing
  getCardStyle: (variant: 'elevated' | 'outlined' | 'filled' = 'outlined', spacing: 'tight' | 'comfortable' | 'spacious' = 'comfortable') => {
    const base = ComponentTokens.card.variants[variant];
    const spacingValues = ComponentTokens.card.spacing[spacing];

    return {
      ...base,
      ...spacingValues,
    };
  },

  // Get modal style with variant and size
  getModalStyle: (variant: 'dialog' | 'fullscreen' = 'dialog', size: 'compact' | 'default' | 'large' = 'default') => {
    const base = ComponentTokens.modal[variant];

    if (variant === 'dialog') {
      const sizeStyles = ComponentTokens.modal.sizes[size];
      return {
        ...base,
        ...sizeStyles,
      };
    }

    return base;
  },

  // Get overlay style
  getOverlayStyle: () => ComponentTokens.overlay,

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

  // Get card with custom margin
  getCardWithMargin: (
    variant: 'outlined' | 'elevated',
    padding: 'compact' | 'comfortable' | 'spacious' = 'comfortable',
    margin: keyof typeof ComponentTokens.card.margin = 'comfortable'
  ) => ({
    ...ComponentTokens.card.variants[variant],
    padding: ComponentTokens.card.padding[padding],
    margin: ComponentTokens.card.margin[margin],
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

  // NEW: Get consolidated text style
  getTextStyle: (style: keyof typeof ComponentTextStyles) => {
    const textStyle = ComponentTextStyles[style];
    // Handle nested styles like button.primary
    if (typeof textStyle === 'object' && textStyle !== null && !('fontSize' in textStyle)) {
      return textStyle;
    }
    return textStyle;
  },

  // NEW: Get legacy text style (maps to consolidated styles)
  getLegacyTextStyle: (legacyStyle: keyof typeof ComponentTextStyles.legacy) => {
    const mapping = ComponentTextStyles.legacy[legacyStyle];
    if (mapping.includes('.')) {
      const [parent, child] = mapping.split('.');
      return ComponentTextStyles[parent as keyof typeof ComponentTextStyles][child];
    }
    return ComponentTextStyles[mapping as keyof typeof ComponentTextStyles];
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

  // Get header context (for new Header component)
  getHeaderContext: (variant: keyof typeof ComponentTokens.header) => 
    ComponentTokens.header[variant],

  // Get semantic color (replaces Buddhist-specific styles)
  getSemanticColor: (variant: keyof typeof ComponentTokens.semantic) => 
    ComponentTokens.semantic[variant],

  // Get complete badge style with new consolidated system
  getBadgeStyle: (
    size: 'small' | 'medium' | 'large',
    variant: 'filled' | 'outlined' | 'soft' = 'filled',
    color: keyof typeof ComponentTokens.badge.colors = 'primary'
  ) => {
    const sizeStyle = ComponentTokens.badge.sizes[size];
    const variantStyle = ComponentTokens.badge.variants[variant];
    const colorStyle = variant === 'soft' 
      ? ComponentTokens.badge.softColors[color] 
      : ComponentTokens.badge.colors[color];

    return {
      ...sizeStyle,
      ...variantStyle,
      ...colorStyle,
    };
  },

  // Get pill style (fully rounded badge)
  getPillStyle: (
    size: 'small' | 'medium' | 'large',
    variant: 'filled' | 'outlined' | 'soft' = 'filled',
    color: keyof typeof ComponentTokens.badge.colors = 'primary'
  ) => {
    const sizeStyle = ComponentTokens.badge.pill[size];
    const variantStyle = ComponentTokens.badge.variants[variant];
    const colorStyle = variant === 'soft' 
      ? ComponentTokens.badge.softColors[color] 
      : ComponentTokens.badge.colors[color];

    return {
      ...sizeStyle,
      ...variantStyle,
      ...colorStyle,
    };
  },

  // Get completed badge style (standardized success indicator)
  getCompletedBadgeStyle: () => ComponentTokens.completedBadge.container,
  getCompletedBadgeIconProps: () => ({
    name: 'checkmark-circle' as const,
    size: ComponentTokens.completedBadge.icon.size,
    color: ComponentTokens.completedBadge.icon.color,
  }),

  // Icon helper functions
  getIconProps: (
    name: string,
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md',
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'inverse' = 'neutral'
  ) => {
    const sizeMap = { xs: 12, sm: 16, md: 20, lg: 24, xl: 32, '2xl': 40 };
    const colorMap = {
      primary: DesignSystem.colors.primary,
      secondary: DesignSystem.colors.textSecondary,
      success: DesignSystem.colors.practiceComplete,
      warning: DesignSystem.colors.warning,
      error: DesignSystem.colors.error,
      info: DesignSystem.colors.info,
      neutral: DesignSystem.colors.textSecondary,
      inverse: DesignSystem.colors.textInverse,
    };
    
    return {
      name,
      size: sizeMap[size],
      color: colorMap[color],
    };
  },

  // Legacy badge support
  getLegacyBadgeStyle: (legacyVariant: 'small' | 'wisdomBadge' | 'completionBadge') => {
    const mapping = ComponentTokens.badge.legacy[legacyVariant];
    return componentHelpers.getBadgeStyle(mapping.size, mapping.variant, mapping.color);
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

  // Get divider style
  getDividerStyle: (
    orientation: 'horizontal' | 'vertical' = 'horizontal',
    thickness: keyof typeof ComponentTokens.divider.thickness = 'thin',
    color: keyof typeof ComponentTokens.divider.colors = 'default',
    spacing: keyof typeof ComponentTokens.divider.spacing = 'normal'
  ) => {
    const baseStyle = ComponentTokens.divider[orientation];
    const thicknessValue = ComponentTokens.divider.thickness[thickness];
    const colorValue = ComponentTokens.divider.colors[color];
    const spacingValue = ComponentTokens.divider.spacing[spacing];

    return {
      ...baseStyle,
      backgroundColor: colorValue,
      ...(orientation === 'horizontal' 
        ? { height: thicknessValue, marginVertical: spacingValue }
        : { width: thicknessValue, marginHorizontal: spacingValue }
      ),
    };
  },
};

export default ComponentTokens;
