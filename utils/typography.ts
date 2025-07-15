
import { DesignSystem, createStyles } from '@/constants/DesignSystem';

// Typography migration utilities
export const Typography = {
  // Quick access to font sizes
  fontSize: DesignSystem.typography.fontSize,
  fontWeight: DesignSystem.typography.fontWeight,
  lineHeight: DesignSystem.typography.lineHeight,
  letterSpacing: DesignSystem.typography.letterSpacing,

  // Enhanced pre-built text styles with automatic line heights
  styles: {
    // Headings with tight line height for impact
    heading: (size: keyof typeof DesignSystem.typography.fontSize = 'xl') => ({
      fontSize: DesignSystem.typography.fontSize[size],
      fontWeight: DesignSystem.typography.fontWeight.bold,
      color: DesignSystem.colors.textPrimary,
      letterSpacing: DesignSystem.typography.letterSpacing.tight,
      lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.tight,
    }),
    
    // Subheadings with snug line height for hierarchy
    subheading: (size: keyof typeof DesignSystem.typography.fontSize = 'lg') => ({
      fontSize: DesignSystem.typography.fontSize[size],
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      color: DesignSystem.colors.textPrimary,
      letterSpacing: DesignSystem.typography.letterSpacing.tight,
      lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.snug,
    }),
    
    // Body text with normal line height for reading comfort
    body: (size: keyof typeof DesignSystem.typography.fontSize = 'base') => ({
      fontSize: DesignSystem.typography.fontSize[size],
      fontWeight: DesignSystem.typography.fontWeight.normal,
      color: DesignSystem.colors.textSecondary,
      lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.normal,
    }),
    
    // Labels with snug line height for compact UI
    label: (size: keyof typeof DesignSystem.typography.fontSize = 'sm') => ({
      fontSize: DesignSystem.typography.fontSize[size],
      fontWeight: DesignSystem.typography.fontWeight.medium,
      color: DesignSystem.colors.textSecondary,
      lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.snug,
    }),
    
    // Captions with tight line height for small text
    caption: () => ({
      fontSize: DesignSystem.typography.fontSize.xs,
      fontWeight: DesignSystem.typography.fontWeight.normal,
      color: DesignSystem.colors.textTertiary,
      lineHeight: DesignSystem.typography.fontSize.xs * DesignSystem.typography.lineHeight.tight,
    }),
    
    // Buddhist semantic text styles with optimized line heights
    dharmaTitle: (size: keyof typeof DesignSystem.typography.fontSize = '2xl') => ({
      fontSize: DesignSystem.typography.fontSize[size],
      fontWeight: DesignSystem.typography.fontWeight.bold,
      color: DesignSystem.colors.textPrimary,
      letterSpacing: DesignSystem.typography.letterSpacing.tight,
      lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.tight,
    }),
    
    // Practice text with relaxed line height for better readability
    practiceText: (size: keyof typeof DesignSystem.typography.fontSize = 'base') => ({
      fontSize: DesignSystem.typography.fontSize[size],
      fontWeight: DesignSystem.typography.fontWeight.medium,
      color: DesignSystem.colors.textPrimary,
      lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.relaxed,
    }),
    
    // Interactive text styles with tight line height for UI precision
    buttonText: (variant: 'primary' | 'secondary' = 'primary') => ({
      fontSize: DesignSystem.typography.fontSize.base,
      fontWeight: DesignSystem.typography.fontWeight.bold,
      letterSpacing: DesignSystem.typography.letterSpacing.tighter,
      color: variant === 'primary' ? DesignSystem.colors.textInverse : DesignSystem.colors.primary,
      lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.tight,
    }),
    
    // Link text with tight line height for inline usage
    linkText: (size: keyof typeof DesignSystem.typography.fontSize = 'base') => ({
      fontSize: DesignSystem.typography.fontSize[size],
      fontWeight: DesignSystem.typography.fontWeight.semibold,
      color: DesignSystem.colors.primary,
      letterSpacing: DesignSystem.typography.letterSpacing.normal,
      lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.tight,
    }),
  },

  // Migration helpers - map old hardcoded values to new tokens
  migrationMap: {
    fontSize: {
      12: DesignSystem.typography.fontSize.xs,
      14: DesignSystem.typography.fontSize.sm,
      16: DesignSystem.typography.fontSize.base,
      18: DesignSystem.typography.fontSize.lg,
      20: DesignSystem.typography.fontSize.xl,
      24: DesignSystem.typography.fontSize['2xl'],
      30: DesignSystem.typography.fontSize['3xl'],
      32: DesignSystem.typography.fontSize['4xl'],
      36: DesignSystem.typography.fontSize['5xl'],
    },
    fontWeight: {
      '300': DesignSystem.typography.fontWeight.light,
      '400': DesignSystem.typography.fontWeight.normal,
      '500': DesignSystem.typography.fontWeight.medium,
      '600': DesignSystem.typography.fontWeight.semibold,
      '700': DesignSystem.typography.fontWeight.bold,
      'bold': DesignSystem.typography.fontWeight.bold,
      '800': DesignSystem.typography.fontWeight.extrabold,
    },
    letterSpacing: {
      '-0.3': DesignSystem.typography.letterSpacing.tight,
      '-0.2': DesignSystem.typography.letterSpacing.tighter,
      '-0.1': DesignSystem.typography.letterSpacing.normal,
      '0': DesignSystem.typography.letterSpacing.normal,
      '0.1': DesignSystem.typography.letterSpacing.wide,
      '0.15': DesignSystem.typography.letterSpacing.wider,
    },
    lineHeight: {
      '1': DesignSystem.typography.lineHeight.none,
      '1.25': DesignSystem.typography.lineHeight.tight,
      '1.375': DesignSystem.typography.lineHeight.snug,
      '1.5': DesignSystem.typography.lineHeight.normal,
      '1.625': DesignSystem.typography.lineHeight.relaxed,
      '2': DesignSystem.typography.lineHeight.loose,
      '20': DesignSystem.typography.lineHeight.tight, // For 14px font
      '24': DesignSystem.typography.lineHeight.normal, // For 16px font
    },
  },

  // Component-specific typography patterns with automatic line heights
  components: {
    // Practice detail screen patterns
    practiceDetail: {
      title: {
        fontSize: DesignSystem.typography.fontSize['2xl'],
        fontWeight: DesignSystem.typography.fontWeight.bold,
        color: DesignSystem.colors.textPrimary,
        letterSpacing: DesignSystem.typography.letterSpacing.tight,
        lineHeight: DesignSystem.typography.fontSize['2xl'] * DesignSystem.typography.lineHeight.tight,
      },
      subtitle: {
        fontSize: DesignSystem.typography.fontSize.lg,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
        color: DesignSystem.colors.textPrimary,
        letterSpacing: DesignSystem.typography.letterSpacing.tight,
        lineHeight: DesignSystem.typography.fontSize.lg * DesignSystem.typography.lineHeight.snug,
      },
      description: {
        fontSize: DesignSystem.typography.fontSize.base,
        fontWeight: DesignSystem.typography.fontWeight.normal,
        color: DesignSystem.colors.textSecondary,
        lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.relaxed,
      },
      sectionTitle: {
        fontSize: DesignSystem.typography.fontSize.lg,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
        color: DesignSystem.colors.textPrimary,
        letterSpacing: DesignSystem.typography.letterSpacing.tight,
        lineHeight: DesignSystem.typography.fontSize.lg * DesignSystem.typography.lineHeight.snug,
      },
      label: {
        fontSize: DesignSystem.typography.fontSize.sm,
        fontWeight: DesignSystem.typography.fontWeight.medium,
        color: DesignSystem.colors.textSecondary,
        lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.snug,
      },
      value: {
        fontSize: DesignSystem.typography.fontSize.base,
        fontWeight: DesignSystem.typography.fontWeight.normal,
        color: DesignSystem.colors.textSecondary,
        lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.normal,
      },
      metadata: {
        fontSize: DesignSystem.typography.fontSize.xs,
        fontWeight: DesignSystem.typography.fontWeight.normal,
        color: DesignSystem.colors.textTertiary,
        lineHeight: DesignSystem.typography.fontSize.xs * DesignSystem.typography.lineHeight.tight,
      },
      button: {
        fontSize: DesignSystem.typography.fontSize.base,
        fontWeight: DesignSystem.typography.fontWeight.bold,
        letterSpacing: DesignSystem.typography.letterSpacing.tighter,
        color: DesignSystem.colors.textInverse,
        lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.tight,
      },
      secondaryButton: {
        fontSize: DesignSystem.typography.fontSize.base,
        fontWeight: DesignSystem.typography.fontWeight.bold,
        letterSpacing: DesignSystem.typography.letterSpacing.tighter,
        color: DesignSystem.colors.primary,
        lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.tight,
      },
    },

    // Card patterns with automatic line heights
    card: {
      title: {
        fontSize: DesignSystem.typography.fontSize.lg,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
        color: DesignSystem.colors.textPrimary,
        letterSpacing: DesignSystem.typography.letterSpacing.tight,
        lineHeight: DesignSystem.typography.fontSize.lg * DesignSystem.typography.lineHeight.snug,
      },
      subtitle: {
        fontSize: DesignSystem.typography.fontSize.sm,
        fontWeight: DesignSystem.typography.fontWeight.medium,
        color: DesignSystem.colors.textSecondary,
        lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.snug,
      },
      content: {
        fontSize: DesignSystem.typography.fontSize.base,
        fontWeight: DesignSystem.typography.fontWeight.normal,
        color: DesignSystem.colors.textSecondary,
        lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.normal,
      },
      caption: {
        fontSize: DesignSystem.typography.fontSize.xs,
        fontWeight: DesignSystem.typography.fontWeight.normal,
        color: DesignSystem.colors.textTertiary,
        lineHeight: DesignSystem.typography.fontSize.xs * DesignSystem.typography.lineHeight.tight,
      },
    },

    // Modal patterns with automatic line heights
    modal: {
      title: {
        fontSize: DesignSystem.typography.fontSize.xl,
        fontWeight: DesignSystem.typography.fontWeight.bold,
        color: DesignSystem.colors.textPrimary,
        letterSpacing: DesignSystem.typography.letterSpacing.tight,
        lineHeight: DesignSystem.typography.fontSize.xl * DesignSystem.typography.lineHeight.tight,
      },
      subtitle: {
        fontSize: DesignSystem.typography.fontSize.base,
        fontWeight: DesignSystem.typography.fontWeight.normal,
        color: DesignSystem.colors.textSecondary,
        lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.normal,
      },
      content: {
        fontSize: DesignSystem.typography.fontSize.base,
        fontWeight: DesignSystem.typography.fontWeight.normal,
        color: DesignSystem.colors.textSecondary,
        lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.normal,
      },
      button: {
        fontSize: DesignSystem.typography.fontSize.base,
        fontWeight: DesignSystem.typography.fontWeight.bold,
        letterSpacing: DesignSystem.typography.letterSpacing.tighter,
        color: DesignSystem.colors.textInverse,
        lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.tight,
      },
    },

    // Form patterns with automatic line heights
    form: {
      label: {
        fontSize: DesignSystem.typography.fontSize.base,
        fontWeight: DesignSystem.typography.fontWeight.medium,
        color: DesignSystem.colors.textSecondary,
        lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.snug,
      },
      input: {
        fontSize: DesignSystem.typography.fontSize.base,
        fontWeight: DesignSystem.typography.fontWeight.normal,
        color: DesignSystem.colors.textSecondary,
        lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.normal,
      },
      helper: {
        fontSize: DesignSystem.typography.fontSize.xs,
        fontWeight: DesignSystem.typography.fontWeight.normal,
        color: DesignSystem.colors.textTertiary,
        lineHeight: DesignSystem.typography.fontSize.xs * DesignSystem.typography.lineHeight.tight,
      },
      error: {
        fontSize: DesignSystem.typography.fontSize.xs,
        fontWeight: DesignSystem.typography.fontWeight.normal,
        color: DesignSystem.colors.error,
        lineHeight: DesignSystem.typography.fontSize.xs * DesignSystem.typography.lineHeight.tight,
      },
    },
  },
};

// Type helpers for better TypeScript support
export type FontSizeKey = keyof typeof DesignSystem.typography.fontSize;
export type FontWeightKey = keyof typeof DesignSystem.typography.fontWeight;
export type LineHeightKey = keyof typeof DesignSystem.typography.lineHeight;
export type LetterSpacingKey = keyof typeof DesignSystem.typography.letterSpacing;

// Enhanced utility function with automatic line height calculation
export function getTextStyle(
  size: FontSizeKey = 'base',
  weight: FontWeightKey = 'normal',
  color: string = DesignSystem.colors.textPrimary,
  options?: {
    lineHeight?: LineHeightKey;
    letterSpacing?: LetterSpacingKey;
  }
) {
  // Default line height based on text size for optimal readability
  const defaultLineHeight = size === 'xs' || size === 'sm' ? 'tight' : 
                           size === 'lg' || size === 'xl' ? 'snug' : 
                           size === '2xl' || size === '3xl' || size === '4xl' || size === '5xl' ? 'tight' : 
                           'normal';

  return {
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight[weight],
    color,
    lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight[options?.lineHeight || defaultLineHeight],
    ...(options?.letterSpacing && {
      letterSpacing: DesignSystem.typography.letterSpacing[options.letterSpacing],
    }),
  };
}

export default Typography;
