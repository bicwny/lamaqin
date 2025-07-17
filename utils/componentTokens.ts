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
        backgroundColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
        borderWidth: 0,
        borderColor: 'transparent',
        ...ConsolidatedDesignSystem.shadow.md,
      },

      secondary: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
        borderWidth: 1.5,
        borderColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
        ...ConsolidatedDesignSystem.shadow.sm,
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
        paddingVertical: ConsolidatedDesignSystem.spacing.base,
        paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
        borderRadius: ConsolidatedDesignSystem.borderRadius.md,
        minHeight: 36,
      },

      medium: {
        paddingVertical: ConsolidatedDesignSystem.spacing.lg,
        paddingHorizontal: ConsolidatedDesignSystem.spacing.xl,
        borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
        minHeight: 48,
      },

      large: {
        paddingVertical: ConsolidatedDesignSystem.spacing.xl,
        paddingHorizontal: ConsolidatedDesignSystem.spacing['2xl'],
        borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
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
        backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
        borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
        shadowColor: ConsolidatedConsolidatedDesignSystem.utility.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"]Dark,
      },

      elevated: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
        borderRadius: ConsolidatedDesignSystem.borderRadius.xl,
        shadowColor: ConsolidatedConsolidatedDesignSystem.utility.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
        borderWidth: 1,
        borderColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
      },
    },

    // Padding variations
    padding: {
      compact: ConsolidatedDesignSystem.spacing.md,      // 12px (was status)
      comfortable: ConsolidatedDesignSystem.spacing.lg,  // 16px (was practice)
      spacious: ConsolidatedDesignSystem.spacing.xl,     // 20px (was standard/course)
    },

    // Margin variations
    margin: {
      none: 0,                               // No margin
      tight: ConsolidatedDesignSystem.spacing.xs,        // 4px - minimal spacing
      compact: ConsolidatedDesignSystem.spacing.sm,      // 8px - close proximity
      comfortable: ConsolidatedDesignSystem.spacing.md,  // 12px - balanced spacing
      spacious: ConsolidatedDesignSystem.spacing.lg,     // 16px - generous spacing
      loose: ConsolidatedDesignSystem.spacing.xl,        // 20px - wide spacing
      extraLoose: ConsolidatedDesignSystem.spacing['2xl'], // 24px - maximum spacing
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
        backgroundColor: ConsolidatedConsolidatedDesignSystem.status.successBackground,
        borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
        padding: ConsolidatedDesignSystem.spacing.md,
        marginHorizontal: ConsolidatedDesignSystem.spacing.lg,
        marginVertical: ConsolidatedDesignSystem.spacing.xs,
        borderWidth: 1,
        borderColor: ConsolidatedConsolidatedDesignSystem.status.success,
        borderLeftWidth: 4,
        borderLeftColor: ConsolidatedConsolidatedDesignSystem.status.success,
      },

      warning: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.status.warningBackground,
        borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
        padding: ConsolidatedDesignSystem.spacing.md,
        marginHorizontal: ConsolidatedDesignSystem.spacing.lg,
        marginVertical: ConsolidatedDesignSystem.spacing.xs,
        borderWidth: 1,
        borderColor: ConsolidatedConsolidatedDesignSystem.status.warningBorder,
        borderLeftWidth: 4,
        borderLeftColor: ConsolidatedConsolidatedDesignSystem.status.warningBorder,
      },

      error: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.status.errorBackground,
        borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
        padding: ConsolidatedDesignSystem.spacing.md,
        marginHorizontal: ConsolidatedDesignSystem.spacing.lg,
        marginVertical: ConsolidatedDesignSystem.spacing.xs,
        borderWidth: 1,
        borderColor: ConsolidatedConsolidatedDesignSystem.status.errorBorder,
        borderLeftWidth: 4,
        borderLeftColor: ConsolidatedConsolidatedDesignSystem.status.errorBorder,
      },

      info: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
        borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
        padding: ConsolidatedDesignSystem.spacing.md,
        marginHorizontal: ConsolidatedDesignSystem.spacing.lg,
        marginVertical: ConsolidatedDesignSystem.spacing.xs,
        borderWidth: 1,
        borderColor: ConsolidatedConsolidatedDesignSystem.status.info,
        borderLeftWidth: 4,
        borderLeftColor: ConsolidatedConsolidatedDesignSystem.status.info,
      },
    },
  },

  // Input tokens with DesignSystem references
  input: {
    standard: {
      borderWidth: 1,
      borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
      borderRadius: ConsolidatedDesignSystem.borderRadius.md,
      paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
      paddingVertical: ConsolidatedDesignSystem.spacing.md,
      fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
      fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
      color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
      backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
      minHeight: 48,
      lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.normal,
    },

    search: {
      borderWidth: 1,
      borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"]Light,
      borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
      paddingHorizontal: ConsolidatedDesignSystem.spacing.lg,
      paddingVertical: ConsolidatedDesignSystem.spacing.base,
      fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
      fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
      color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
      backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
      minHeight: 44,
    },

    textarea: {
      borderWidth: 1,
      borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
      borderRadius: ConsolidatedDesignSystem.borderRadius.md,
      paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
      paddingVertical: ConsolidatedDesignSystem.spacing.md,
      fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
      fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
      color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
      backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
      minHeight: 80,
      lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.normal,
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
      backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
      borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
      shadowColor: ConsolidatedConsolidatedDesignSystem.utility.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },

    fullscreen: {
      backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
      borderRadius: 0,
      padding: 0,
    },

    // Size-based spacing for dialog modals
    sizes: {
      compact: {
        padding: ConsolidatedDesignSystem.spacing.lg,
        margin: ConsolidatedDesignSystem.spacing.lg,
        borderRadius: ConsolidatedDesignSystem.borderRadius.md,
      },
      default: {
        padding: ConsolidatedDesignSystem.spacing.xl,
        margin: ConsolidatedDesignSystem.spacing.xl,
        borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
      },
      large: {
        padding: ConsolidatedDesignSystem.spacing['2xl'],
        margin: ConsolidatedDesignSystem.spacing['2xl'],
        borderRadius: ConsolidatedDesignSystem.borderRadius.xl,
      },
    },
  },

  // Separated overlay utility
  overlay: {
    backgroundColor: ConsolidatedConsolidatedDesignSystem.utility.overlay,
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
      backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
      marginVertical: ConsolidatedDesignSystem.spacing.md,
    },

    // Vertical dividers
    vertical: {
      width: 1,
      backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
      marginHorizontal: ConsolidatedDesignSystem.spacing.md,
    },

    // Thickness variations
    thickness: {
      thin: 1,
      medium: 2,
      thick: 3,
    },

    // Color variants
    colors: {
      light: ConsolidatedConsolidatedDesignSystem.colors["border-default"]Light,
      default: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
      dark: ConsolidatedConsolidatedDesignSystem.colors["border-default"]Dark,
      primary: ConsolidatedConsolidatedDesignSystem.colors.primary,
    },

    // Spacing variations
    spacing: {
      none: 0,
      tight: ConsolidatedDesignSystem.spacing.xs,
      normal: ConsolidatedDesignSystem.spacing.md,
      loose: ConsolidatedDesignSystem.spacing.lg,
    },
  },

  // Semantic color variants for Buddhist theming
  semantic: {
    // Semantic colors for Buddhist themes
    dharma: ConsolidatedConsolidatedDesignSystem.accent["accent-primary"],        // For dharma-related elements
    meditation: ConsolidatedConsolidatedDesignSystem.accent["accent-secondary"], // For meditation-related elements
    wisdom: ConsolidatedConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedConsolidatedDesignSystem.accent["accent-primary"], 45),       // For wisdom/achievement elements
    success: ConsolidatedConsolidatedDesignSystem.status.success, // For completion/success elements
  },

  // Completed badge tokens (for practice completion indicators)
  completedBadge: {
    container: {
      backgroundColor: ConsolidatedConsolidatedDesignSystem.status.successBackground,
      borderRadius: ConsolidatedDesignSystem.borderRadius.md,
      paddingHorizontal: ConsolidatedDesignSystem.spacing.sm,
      paddingVertical: ConsolidatedDesignSystem.spacing.xs,
      borderWidth: 1,
      borderColor: ConsolidatedConsolidatedDesignSystem.status.success,
      alignSelf: 'flex-start',
      marginBottom: ConsolidatedDesignSystem.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 24,
    },
    icon: {
      size: 16,
      color: ConsolidatedConsolidatedDesignSystem.status.success,
    },
    text: {
      fontSize: ConsolidatedDesignSystem.typography.fontSize.sm,
      fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
      color: ConsolidatedConsolidatedDesignSystem.status.success,
      marginLeft: ConsolidatedDesignSystem.spacing.xs,
    },
  },

  // Badge component tokens - comprehensive system
  badge: {
    // Size variations
    sizes: {
      small: {
        paddingHorizontal: ConsolidatedDesignSystem.spacing.sm,     // 8px
        paddingVertical: ConsolidatedDesignSystem.spacing.xs,       // 4px
        borderRadius: ConsolidatedDesignSystem.borderRadius.md,     // 8px
        minHeight: 20,
        fontSize: ConsolidatedDesignSystem.typography.fontSize.xs,  // 12px
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
      },

      medium: {
        paddingHorizontal: ConsolidatedDesignSystem.spacing.md,     // 12px
        paddingVertical: ConsolidatedDesignSystem.spacing.sm,       // 8px
        borderRadius: ConsolidatedDesignSystem.borderRadius.lg,     // 12px
        minHeight: 28,
        fontSize: ConsolidatedDesignSystem.typography.fontSize.sm,  // 14px
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
      },

      large: {
        paddingHorizontal: ConsolidatedDesignSystem.spacing.lg,     // 16px
        paddingVertical: ConsolidatedDesignSystem.spacing.base,     // 10px
        borderRadius: ConsolidatedDesignSystem.borderRadius.lg,     // 12px
        minHeight: 36,
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base, // 16px
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
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
        paddingHorizontal: ConsolidatedDesignSystem.spacing.md,     // 12px
        paddingVertical: ConsolidatedDesignSystem.spacing.xs,       // 4px
        borderRadius: ConsolidatedDesignSystem.borderRadius.full,   // 9999px
        minHeight: 20,
        fontSize: ConsolidatedDesignSystem.typography.fontSize.xs,  // 12px
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
      },

      medium: {
        paddingHorizontal: ConsolidatedDesignSystem.spacing.lg,     // 16px
        paddingVertical: ConsolidatedDesignSystem.spacing.sm,       // 8px
        borderRadius: ConsolidatedDesignSystem.borderRadius.full,   // 9999px
        minHeight: 28,
        fontSize: ConsolidatedDesignSystem.typography.fontSize.sm,  // 14px
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
      },

      large: {
        paddingHorizontal: ConsolidatedDesignSystem.spacing.xl,     // 20px
        paddingVertical: ConsolidatedDesignSystem.spacing.base,     // 10px
        borderRadius: ConsolidatedDesignSystem.borderRadius.full,   // 9999px
        minHeight: 36,
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base, // 16px
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
      },
    },

    // Semantic color variants
    colors: {
      // Primary theme
      primary: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        borderColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
        shadowColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
      },

      // Success states
      success: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.status.success,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        borderColor: ConsolidatedConsolidatedDesignSystem.status.success,
        shadowColor: ConsolidatedConsolidatedDesignSystem.status.success,
      },

      // Warning states
      warning: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.status.warning,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        borderColor: ConsolidatedConsolidatedDesignSystem.status.warning,
        shadowColor: ConsolidatedConsolidatedDesignSystem.status.warning,
      },

      // Error states
      error: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.status.error,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        borderColor: ConsolidatedConsolidatedDesignSystem.status.error,
        shadowColor: ConsolidatedConsolidatedDesignSystem.status.error,
      },

      // Info states
      info: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.status.info,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        borderColor: ConsolidatedConsolidatedDesignSystem.status.info,
        shadowColor: ConsolidatedConsolidatedDesignSystem.status.info,
      },

      // Neutral/default
      neutral: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
        shadowColor: ConsolidatedConsolidatedDesignSystem.utility.shadow,
      },

      // Buddhist semantic colors
      dharma: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.accent["accent-primary"],
        color: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        borderColor: ConsolidatedConsolidatedDesignSystem.accent["accent-primary"],
        shadowColor: ConsolidatedConsolidatedDesignSystem.accent["accent-primary"],
      },

      meditation: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.accent["accent-secondary"],
        color: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        borderColor: ConsolidatedConsolidatedDesignSystem.accent["accent-secondary"],
        shadowColor: ConsolidatedConsolidatedDesignSystem.accent["accent-secondary"],
      },

      wisdom: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedConsolidatedDesignSystem.accent["accent-primary"], 45),
        color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
        borderColor: ConsolidatedConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedConsolidatedDesignSystem.accent["accent-primary"], 45),
        shadowColor: ConsolidatedConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedConsolidatedDesignSystem.accent["accent-primary"], 45),
      },
    },

    // Soft/ghost color variants (light backgrounds)
    softColors: {
      primary: {
        backgroundColor: `${ConsolidatedConsolidatedDesignSystem.colors.primary}15`, // 15% opacity
        color: ConsolidatedConsolidatedDesignSystem.colors.primary,
        borderColor: `${ConsolidatedConsolidatedDesignSystem.colors.primary}30`,
      },

      success: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.status.successBackground,
        color: ConsolidatedConsolidatedDesignSystem.status.success,
        borderColor: ConsolidatedConsolidatedDesignSystem.status.success,
      },

      warning: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.status.warningBackground,
        color: ConsolidatedConsolidatedDesignSystem.status.warning,
        borderColor: ConsolidatedConsolidatedDesignSystem.status.warningBorder,
      },

      error: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.status.errorBackground,
        color: ConsolidatedConsolidatedDesignSystem.status.error,
        borderColor: ConsolidatedConsolidatedDesignSystem.status.errorBorder,
      },

      info: {
        backgroundColor: `${ConsolidatedConsolidatedDesignSystem.status.info}15`,
        color: ConsolidatedConsolidatedDesignSystem.status.info,
        borderColor: `${ConsolidatedConsolidatedDesignSystem.status.info}30`,
      },

      neutral: {
        backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
        color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"]Light,
      },

      dharma: {
        backgroundColor: `${ConsolidatedConsolidatedDesignSystem.accent["accent-primary"]}15`,
        color: ConsolidatedConsolidatedDesignSystem.accent["accent-primary"],
        borderColor: `${ConsolidatedConsolidatedDesignSystem.accent["accent-primary"]}30`,
      },

      meditation: {
        backgroundColor: `${ConsolidatedConsolidatedDesignSystem.accent["accent-secondary"]}15`,
        color: ConsolidatedConsolidatedDesignSystem.accent["accent-secondary"],
        borderColor: `${ConsolidatedConsolidatedDesignSystem.accent["accent-secondary"]}30`,
      },

      wisdom: {
        backgroundColor: `${ConsolidatedConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedConsolidatedDesignSystem.accent["accent-primary"], 45)}20`,
        color: ConsolidatedConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedConsolidatedDesignSystem.accent["accent-primary"], 45),
        borderColor: `${ConsolidatedConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedConsolidatedDesignSystem.accent["accent-primary"], 45)}40`,
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
    fontSize: ConsolidatedDesignSystem.typography.fontSize['2xl'],      // 24px
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,    // 700
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tight,
    lineHeight: ConsolidatedDesignSystem.typography.fontSize['2xl'] * ConsolidatedDesignSystem.typography.lineHeight.tight,
  },

  subheading: {
    // Secondary headings - consolidates subtitle, card.title
    fontSize: ConsolidatedDesignSystem.typography.fontSize.lg,          // 18px
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold, // 600
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tight,
    lineHeight: ConsolidatedDesignSystem.typography.fontSize.lg * ConsolidatedDesignSystem.typography.lineHeight.snug,
  },

  body: {
    // Regular content text - consolidates bodyText, content, description
    fontSize: ConsolidatedDesignSystem.typography.fontSize.base,        // 16px
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,  // 400
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.normal,
  },

  label: {
    // Small labels and metadata - consolidates label, metadata, helper
    fontSize: ConsolidatedDesignSystem.typography.fontSize.sm,          // 14px
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.medium,  // 500
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    lineHeight: ConsolidatedDesignSystem.typography.fontSize.sm * ConsolidatedDesignSystem.typography.lineHeight.snug,
  },

  // 2. INTERACTIVE TEXT STYLES (3 styles)
  button: {
    variants: {
      primary: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base,      // 16px
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold, // 700
        color: '#ffffff',  // White text for primary buttons
        letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tighter,
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },

      secondary: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base,      // 16px
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold, // 600
        color: ConsolidatedConsolidatedDesignSystem.colors.primary,  // Red text for secondary buttons
        letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.normal,
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },

      ghost: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base,      // 16px
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold, // 600
        color: ConsolidatedConsolidatedDesignSystem.colors.primary,
        letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.normal,
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },
    },

    sizes: {
      small: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.sm,       // 14px
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold, // 600
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.sm * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },

      medium: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base,     // 16px
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold, // 700
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },

      large: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.lg,       // 18px
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold, // 700
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.lg * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },
    },
  },

  link: {
    // Interactive links - consolidates linkText
    fontSize: ConsolidatedDesignSystem.typography.fontSize.base,        // 16px
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold, // 600
    color: ConsolidatedConsolidatedDesignSystem.colors.primary,
    letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.normal,
    lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.tight,
  },

  // 3. SEMANTIC TEXT STYLES (3 Buddhist-specific styles)
  dharma: {
    // Buddhist practice text - consolidates dharmaTitle, practiceText
    fontSize: ConsolidatedDesignSystem.typography.fontSize['2xl'],      // 24px
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,    // 700
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tight,
    lineHeight: ConsolidatedDesignSystem.typography.fontSize['2xl'] * ConsolidatedDesignSystem.typography.lineHeight.tight,
  },

  practice: {
    // Practice content text - optimized for reading Buddhist content
    fontSize: ConsolidatedDesignSystem.typography.fontSize.base,        // 16px
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.medium,  // 500
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.relaxed,
  },

  success: {
    // Completion and success states
    fontSize: ConsolidatedDesignSystem.typography.fontSize.sm,          // 14px
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold, // 600
    color: ConsolidatedConsolidatedDesignSystem.status.success,
    lineHeight: ConsolidatedDesignSystem.typography.fontSize.sm * ConsolidatedDesignSystem.typography.lineHeight.snug,
  },

  // 4. UTILITY TEXT STYLES (2 styles)
  caption: {
    // Smallest text for fine print - consolidates caption, error
    fontSize: ConsolidatedDesignSystem.typography.fontSize.xs,          // 12px
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,  // 400
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    lineHeight: ConsolidatedDesignSystem.typography.fontSize.xs * ConsolidatedDesignSystem.typography.lineHeight.tight,
  },

  input: {
    // Form input text
    fontSize: ConsolidatedDesignSystem.typography.fontSize.base,        // 16px
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,  // 400
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.normal,
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
      'sm': { padding: ConsolidatedDesignSystem.spacing.md },      // 12px (compact)
      'md': { padding: ConsolidatedDesignSystem.spacing.lg },      // 16px (comfortable)
      'lg': { padding: ConsolidatedDesignSystem.spacing.xl },      // 20px (spacious)
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
      'sm': ConsolidatedDesignSystem.spacing.md,      // 12px (compact)
      'md': ConsolidatedDesignSystem.spacing.lg,      // 16px (comfortable)
      'lg': ConsolidatedDesignSystem.spacing.xl,      // 20px (spacious)
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
      'sm': ConsolidatedDesignSystem.spacing.md,      // 12px (compact)
      'md': ConsolidatedDesignSystem.spacing.lg,      // 16px (comfortable)
      'lg': ConsolidatedDesignSystem.spacing.xl,      // 20px (spacious)
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
      primary: ConsolidatedConsolidatedDesignSystem.colors.primary,
      secondary: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
      success: ConsolidatedConsolidatedDesignSystem.status.success,
      warning: ConsolidatedConsolidatedDesignSystem.status.warning,
      error: ConsolidatedConsolidatedDesignSystem.status.error,
      info: ConsolidatedConsolidatedDesignSystem.status.info,
      neutral: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
      inverse: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
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