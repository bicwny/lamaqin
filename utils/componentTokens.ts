/**
 * Component Token Utilities
 * Provides easy access to component-specific design tokens
 */

import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';

// Component token helpers that reference the main design system
export const ComponentTokens = {
  // Button tokens with DesignSystem references - Consolidated system
  button: {
    // Base button styles by variant
    variants: {
      primary: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
        borderWidth: 0,
        borderColor: 'transparent',
        ...ConsolidatedConsolidatedDesignSystem.shadow.md,
      },

      secondary: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
        borderWidth: 1.5,
        borderColor: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
        ...ConsolidatedConsolidatedDesignSystem.shadow.sm,
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
        paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.base,
        paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.md,
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.md,
        minHeight: 36,
      },

      medium: {
        paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.lg,
        paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.xl,
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,
        minHeight: 48,
      },

      large: {
        paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.xl,
        paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing['2xl'],
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,
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
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,
        shadowColor: ConsolidatedConsolidatedConsolidatedDesignSystem.utility.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"]Dark,
      },

      elevated: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.xl,
        shadowColor: ConsolidatedConsolidatedConsolidatedDesignSystem.utility.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
        borderWidth: 1,
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
      },
    },

    // Padding variations
    padding: {
      compact: ConsolidatedConsolidatedDesignSystem.spacing.md,      // 12px (was status)
      comfortable: ConsolidatedConsolidatedDesignSystem.spacing.lg,  // 16px (was practice)
      spacious: ConsolidatedConsolidatedDesignSystem.spacing.xl,     // 20px (was standard/course)
    },

    // Margin variations
    margin: {
      none: 0,                               // No margin
      tight: ConsolidatedConsolidatedDesignSystem.spacing.xs,        // 4px - minimal spacing
      compact: ConsolidatedConsolidatedDesignSystem.spacing.sm,      // 8px - close proximity
      comfortable: ConsolidatedConsolidatedDesignSystem.spacing.md,  // 12px - balanced spacing
      spacious: ConsolidatedConsolidatedDesignSystem.spacing.lg,     // 16px - generous spacing
      loose: ConsolidatedConsolidatedDesignSystem.spacing.xl,        // 20px - wide spacing
      extraLoose: ConsolidatedConsolidatedDesignSystem.spacing['2xl'], // 24px - maximum spacing
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
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.successBackground,
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,
        padding: ConsolidatedConsolidatedDesignSystem.spacing.md,
        marginHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.lg,
        marginVertical: ConsolidatedConsolidatedDesignSystem.spacing.xs,
        borderWidth: 1,
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.success,
        borderLeftWidth: 4,
        borderLeftColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.success,
      },

      warning: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.warningBackground,
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,
        padding: ConsolidatedConsolidatedDesignSystem.spacing.md,
        marginHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.lg,
        marginVertical: ConsolidatedConsolidatedDesignSystem.spacing.xs,
        borderWidth: 1,
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.warningBorder,
        borderLeftWidth: 4,
        borderLeftColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.warningBorder,
      },

      error: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.errorBackground,
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,
        padding: ConsolidatedConsolidatedDesignSystem.spacing.md,
        marginHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.lg,
        marginVertical: ConsolidatedConsolidatedDesignSystem.spacing.xs,
        borderWidth: 1,
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.errorBorder,
        borderLeftWidth: 4,
        borderLeftColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.errorBorder,
      },

      info: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,
        padding: ConsolidatedConsolidatedDesignSystem.spacing.md,
        marginHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.lg,
        marginVertical: ConsolidatedConsolidatedDesignSystem.spacing.xs,
        borderWidth: 1,
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.info,
        borderLeftWidth: 4,
        borderLeftColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.info,
      },
    },
  },

  // Input tokens with DesignSystem references
  input: {
    standard: {
      borderWidth: 1,
      borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"],
      borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.md,
      paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.md,
      paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.md,
      fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
      fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
      color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
      backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
      minHeight: 48,
      lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.normal,
    },

    search: {
      borderWidth: 1,
      borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"]Light,
      borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,
      paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.lg,
      paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.base,
      fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
      fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
      color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
      backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
      minHeight: 44,
    },

    textarea: {
      borderWidth: 1,
      borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"],
      borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.md,
      paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.md,
      paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.md,
      fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
      fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
      color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
      backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
      minHeight: 80,
      lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.normal,
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
      backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
      borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,
      shadowColor: ConsolidatedConsolidatedConsolidatedDesignSystem.utility.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },

    fullscreen: {
      backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
      borderRadius: 0,
      padding: 0,
    },

    // Size-based spacing for dialog modals
    sizes: {
      compact: {
        padding: ConsolidatedConsolidatedDesignSystem.spacing.lg,
        margin: ConsolidatedConsolidatedDesignSystem.spacing.lg,
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.md,
      },
      default: {
        padding: ConsolidatedConsolidatedDesignSystem.spacing.xl,
        margin: ConsolidatedConsolidatedDesignSystem.spacing.xl,
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,
      },
      large: {
        padding: ConsolidatedConsolidatedDesignSystem.spacing['2xl'],
        margin: ConsolidatedConsolidatedDesignSystem.spacing['2xl'],
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.xl,
      },
    },
  },

  // Separated overlay utility
  overlay: {
    backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.utility.overlay,
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
      backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"],
      marginVertical: ConsolidatedConsolidatedDesignSystem.spacing.md,
    },

    // Vertical dividers
    vertical: {
      width: 1,
      backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"],
      marginHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.md,
    },

    // Thickness variations
    thickness: {
      thin: 1,
      medium: 2,
      thick: 3,
    },

    // Color variants
    colors: {
      light: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"]Light,
      default: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"],
      dark: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"]Dark,
      primary: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
    },

    // Spacing variations
    spacing: {
      none: 0,
      tight: ConsolidatedConsolidatedDesignSystem.spacing.xs,
      normal: ConsolidatedConsolidatedDesignSystem.spacing.md,
      loose: ConsolidatedConsolidatedDesignSystem.spacing.lg,
    },
  },

  // Semantic color variants for Buddhist theming
  semantic: {
    // Semantic colors for Buddhist themes
    dharma: ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-primary"],        // For dharma-related elements
    meditation: ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-secondary"], // For meditation-related elements
    wisdom: ConsolidatedConsolidatedConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-primary"], 45),       // For wisdom/achievement elements
    success: ConsolidatedConsolidatedConsolidatedDesignSystem.status.success, // For completion/success elements
  },

  // Completed badge tokens (for practice completion indicators)
  completedBadge: {
    container: {
      backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.successBackground,
      borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.md,
      paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.sm,
      paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.xs,
      borderWidth: 1,
      borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.success,
      alignSelf: 'flex-start',
      marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 24,
    },
    icon: {
      size: 16,
      color: ConsolidatedConsolidatedConsolidatedDesignSystem.status.success,
    },
    text: {
      fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm,
      fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
      color: ConsolidatedConsolidatedConsolidatedDesignSystem.status.success,
      marginLeft: ConsolidatedConsolidatedDesignSystem.spacing.xs,
    },
  },

  // Badge component tokens - comprehensive system
  badge: {
    // Size variations
    sizes: {
      small: {
        paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.sm,     // 8px
        paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.xs,       // 4px
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.md,     // 8px
        minHeight: 20,
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs,  // 12px
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
      },

      medium: {
        paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.md,     // 12px
        paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.sm,       // 8px
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,     // 12px
        minHeight: 28,
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm,  // 14px
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
      },

      large: {
        paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.lg,     // 16px
        paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.base,     // 10px
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,     // 12px
        minHeight: 36,
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base, // 16px
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
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
        paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.md,     // 12px
        paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.xs,       // 4px
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.full,   // 9999px
        minHeight: 20,
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs,  // 12px
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
      },

      medium: {
        paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.lg,     // 16px
        paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.sm,       // 8px
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.full,   // 9999px
        minHeight: 28,
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm,  // 14px
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
      },

      large: {
        paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.xl,     // 20px
        paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.base,     // 10px
        borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.full,   // 9999px
        minHeight: 36,
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base, // 16px
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
      },
    },

    // Semantic color variants
    colors: {
      // Primary theme
      primary: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        borderColor: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
        shadowColor: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
      },

      // Success states
      success: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.success,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.success,
        shadowColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.success,
      },

      // Warning states
      warning: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.warning,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.warning,
        shadowColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.warning,
      },

      // Error states
      error: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.error,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.error,
        shadowColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.error,
      },

      // Info states
      info: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.info,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.info,
        shadowColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.info,
      },

      // Neutral/default
      neutral: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"],
        shadowColor: ConsolidatedConsolidatedConsolidatedDesignSystem.utility.shadow,
      },

      // Buddhist semantic colors
      dharma: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-primary"],
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-primary"],
        shadowColor: ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-primary"],
      },

      meditation: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-secondary"],
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-secondary"],
        shadowColor: ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-secondary"],
      },

      wisdom: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-primary"], 45),
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-primary"], 45),
        shadowColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-primary"], 45),
      },
    },

    // Soft/ghost color variants (light backgrounds)
    softColors: {
      primary: {
        backgroundColor: `${ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary}15`, // 15% opacity
        color: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
        borderColor: `${ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary}30`,
      },

      success: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.successBackground,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.status.success,
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.success,
      },

      warning: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.warningBackground,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.status.warning,
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.warningBorder,
      },

      error: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.errorBackground,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.status.error,
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.status.errorBorder,
      },

      info: {
        backgroundColor: `${ConsolidatedConsolidatedConsolidatedDesignSystem.status.info}15`,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.status.info,
        borderColor: `${ConsolidatedConsolidatedConsolidatedDesignSystem.status.info}30`,
      },

      neutral: {
        backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        borderColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"]Light,
      },

      dharma: {
        backgroundColor: `${ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-primary"]}15`,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-primary"],
        borderColor: `${ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-primary"]}30`,
      },

      meditation: {
        backgroundColor: `${ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-secondary"]}15`,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-secondary"],
        borderColor: `${ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-secondary"]}30`,
      },

      wisdom: {
        backgroundColor: `${ConsolidatedConsolidatedConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-primary"], 45)}20`,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-primary"], 45),
        borderColor: `${ConsolidatedConsolidatedConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedConsolidatedConsolidatedDesignSystem.accent["accent-primary"], 45)}40`,
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
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize['2xl'],      // 24px
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,    // 700
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize['2xl'] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
  },

  subheading: {
    // Secondary headings - consolidates subtitle, card.title
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.lg,          // 18px
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold, // 600
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.lg * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.snug,
  },

  body: {
    // Regular content text - consolidates bodyText, content, description
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,        // 16px
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,  // 400
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.normal,
  },

  label: {
    // Small labels and metadata - consolidates label, metadata, helper
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm,          // 14px
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,  // 500
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.snug,
  },

  // 2. INTERACTIVE TEXT STYLES (3 styles)
  button: {
    variants: {
      primary: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,      // 16px
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold, // 700
        color: '#ffffff',  // White text for primary buttons
        letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tighter,
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },

      secondary: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,      // 16px
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold, // 600
        color: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,  // Red text for secondary buttons
        letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.normal,
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },

      ghost: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,      // 16px
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold, // 600
        color: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
        letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.normal,
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },
    },

    sizes: {
      small: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm,       // 14px
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold, // 600
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },

      medium: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,     // 16px
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold, // 700
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },

      large: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.lg,       // 18px
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold, // 700
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.lg * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },
    },
  },

  link: {
    // Interactive links - consolidates linkText
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,        // 16px
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold, // 600
    color: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
    letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.normal,
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
  },

  // 3. SEMANTIC TEXT STYLES (3 Buddhist-specific styles)
  dharma: {
    // Buddhist practice text - consolidates dharmaTitle, practiceText
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize['2xl'],      // 24px
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,    // 700
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize['2xl'] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
  },

  practice: {
    // Practice content text - optimized for reading Buddhist content
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,        // 16px
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,  // 500
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.relaxed,
  },

  success: {
    // Completion and success states
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm,          // 14px
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold, // 600
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.status.success,
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.snug,
  },

  // 4. UTILITY TEXT STYLES (2 styles)
  caption: {
    // Smallest text for fine print - consolidates caption, error
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs,          // 12px
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,  // 400
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
  },

  input: {
    // Form input text
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,        // 16px
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,  // 400
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.normal,
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
  getCardStyle: (variant: 'elevated' | 'outlined' | 'filled' = 'outlined', spacing: 'sm' | 'md' | 'lg' = 'md') => {
    const base = ComponentTokens.card.variants[variant];
    
    // Map spacing tokens to actual padding values
    const spacingMap = {
      'sm': { padding: ConsolidatedConsolidatedDesignSystem.spacing.md },      // 12px (compact)
      'md': { padding: ConsolidatedConsolidatedDesignSystem.spacing.lg },      // 16px (comfortable)
      'lg': { padding: ConsolidatedConsolidatedDesignSystem.spacing.xl },      // 20px (spacious)
    };
    
    const spacingValues = spacingMap[spacing];

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
    padding: 'sm' | 'md' | 'lg' = 'md',
    margin: keyof typeof ComponentTokens.card.margin = 'comfortable'
  ) => {
    const spacingMap = {
      'sm': ConsolidatedConsolidatedDesignSystem.spacing.md,      // 12px (compact)
      'md': ConsolidatedConsolidatedDesignSystem.spacing.lg,      // 16px (comfortable)
      'lg': ConsolidatedConsolidatedDesignSystem.spacing.xl,      // 20px (spacious)
    };
    
    return {
      ...ComponentTokens.card.variants[variant],
      padding: spacingMap[padding],
      margin: ComponentTokens.card.margin[margin],
    };
  },

  // Get card with bottom margin only
  getCardWithBottomMargin: (
    variant: 'outlined' | 'elevated',
    padding: 'sm' | 'md' | 'lg' = 'md',
    marginBottom: keyof typeof ComponentTokens.card.margin = 'comfortable'
  ) => {
    const spacingMap = {
      'sm': ConsolidatedConsolidatedDesignSystem.spacing.md,      // 12px (compact)
      'md': ConsolidatedConsolidatedDesignSystem.spacing.lg,      // 16px (comfortable)
      'lg': ConsolidatedConsolidatedDesignSystem.spacing.xl,      // 20px (spacious)
    };
    
    return {
      ...ComponentTokens.card.variants[variant],
      padding: spacingMap[padding],
      marginBottom: ComponentTokens.card.margin[marginBottom],
    };
  },

  // Legacy card style support
  getLegacyCardStyle: (legacyVariant: 'standard' | 'practice' | 'course') => {
    const mapping = ComponentTokens.card.legacy[legacyVariant];
    if (typeof mapping === 'string') {
      throw new Error(`Legacy variant '${legacyVariant}' should use Notification component instead`);
    }
    
    // Map legacy padding to new spacing system
    const paddingMap = {
      'compact': 'sm' as const,
      'comfortable': 'md' as const,
      'spacious': 'lg' as const,
    };
    
    return componentHelpers.getCardStyle(mapping.variant, paddingMap[mapping.padding]);
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
      primary: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
      secondary: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
      success: ConsolidatedConsolidatedConsolidatedDesignSystem.status.success,
      warning: ConsolidatedConsolidatedConsolidatedDesignSystem.status.warning,
      error: ConsolidatedConsolidatedConsolidatedDesignSystem.status.error,
      info: ConsolidatedConsolidatedConsolidatedDesignSystem.status.info,
      neutral: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
      inverse: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
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