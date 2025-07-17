
import { DesignSystem, createStyles } from '@/constants/ConsolidatedDesignSystem';

// Typography migration utilities
export const Typography = {
  // Quick access to font sizes
  fontSize: ConsolidatedDesignSystem.typography.fontSize,
  fontWeight: ConsolidatedDesignSystem.typography.fontWeight,
  lineHeight: ConsolidatedDesignSystem.typography.lineHeight,
  letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing,

  // Enhanced pre-built text styles with automatic line heights
  styles: {
    // Headings with tight line height for impact
    heading: (size: keyof typeof ConsolidatedDesignSystem.typography.fontSize = 'xl') => ({
      fontSize: ConsolidatedDesignSystem.typography.fontSize[size],
      fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,
      color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
      letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tight,
      lineHeight: ConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedDesignSystem.typography.lineHeight.tight,
    }),
    
    // Subheadings with snug line height for hierarchy
    subheading: (size: keyof typeof ConsolidatedDesignSystem.typography.fontSize = 'lg') => ({
      fontSize: ConsolidatedDesignSystem.typography.fontSize[size],
      fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
      color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
      letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tight,
      lineHeight: ConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedDesignSystem.typography.lineHeight.snug,
    }),
    
    // Body text with normal line height for reading comfort
    body: (size: keyof typeof ConsolidatedDesignSystem.typography.fontSize = 'base') => ({
      fontSize: ConsolidatedDesignSystem.typography.fontSize[size],
      fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
      color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
      lineHeight: ConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedDesignSystem.typography.lineHeight.normal,
    }),
    
    // Labels with snug line height for compact UI
    label: (size: keyof typeof ConsolidatedDesignSystem.typography.fontSize = 'sm') => ({
      fontSize: ConsolidatedDesignSystem.typography.fontSize[size],
      fontWeight: ConsolidatedDesignSystem.typography.fontWeight.medium,
      color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
      lineHeight: ConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedDesignSystem.typography.lineHeight.snug,
    }),
    
    // Captions with tight line height for small text
    caption: () => ({
      fontSize: ConsolidatedDesignSystem.typography.fontSize.xs,
      fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
      color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
      lineHeight: ConsolidatedDesignSystem.typography.fontSize.xs * ConsolidatedDesignSystem.typography.lineHeight.tight,
    }),
    
    // Buddhist semantic text styles with optimized line heights
    dharmaTitle: (size: keyof typeof ConsolidatedDesignSystem.typography.fontSize = '2xl') => ({
      fontSize: ConsolidatedDesignSystem.typography.fontSize[size],
      fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,
      color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
      letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tight,
      lineHeight: ConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedDesignSystem.typography.lineHeight.tight,
    }),
    
    // Practice text with relaxed line height for better readability
    practiceText: (size: keyof typeof ConsolidatedDesignSystem.typography.fontSize = 'base') => ({
      fontSize: ConsolidatedDesignSystem.typography.fontSize[size],
      fontWeight: ConsolidatedDesignSystem.typography.fontWeight.medium,
      color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
      lineHeight: ConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedDesignSystem.typography.lineHeight.relaxed,
    }),
    
    // Interactive text styles with tight line height for UI precision
    buttonText: (variant: 'primary' | 'secondary' = 'primary') => ({
      fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
      fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,
      letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tighter,
      color: variant === 'primary' ? ConsolidatedConsolidatedDesignSystem.colors["text-inverse"] : ConsolidatedConsolidatedDesignSystem.colors.primary,
      lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.tight,
    }),
    
    // Link text with tight line height for inline usage
    linkText: (size: keyof typeof ConsolidatedDesignSystem.typography.fontSize = 'base') => ({
      fontSize: ConsolidatedDesignSystem.typography.fontSize[size],
      fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
      color: ConsolidatedConsolidatedDesignSystem.colors.primary,
      letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.normal,
      lineHeight: ConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedDesignSystem.typography.lineHeight.tight,
    }),
  },

  // Migration helpers - map old hardcoded values to new tokens
  migrationMap: {
    fontSize: {
      12: ConsolidatedDesignSystem.typography.fontSize.xs,
      14: ConsolidatedDesignSystem.typography.fontSize.sm,
      16: ConsolidatedDesignSystem.typography.fontSize.base,
      18: ConsolidatedDesignSystem.typography.fontSize.lg,
      20: ConsolidatedDesignSystem.typography.fontSize.xl,
      24: ConsolidatedDesignSystem.typography.fontSize['2xl'],
      30: ConsolidatedDesignSystem.typography.fontSize['3xl'],
      32: ConsolidatedDesignSystem.typography.fontSize['4xl'],
      36: ConsolidatedDesignSystem.typography.fontSize['5xl'],
    },
    fontWeight: {
      '300': ConsolidatedDesignSystem.typography.fontWeight.light,
      '400': ConsolidatedDesignSystem.typography.fontWeight.normal,
      '500': ConsolidatedDesignSystem.typography.fontWeight.medium,
      '600': ConsolidatedDesignSystem.typography.fontWeight.semibold,
      '700': ConsolidatedDesignSystem.typography.fontWeight.bold,
      'bold': ConsolidatedDesignSystem.typography.fontWeight.bold,
      '800': ConsolidatedDesignSystem.typography.fontWeight.extrabold,
    },
    letterSpacing: {
      '-0.3': ConsolidatedDesignSystem.typography.letterSpacing.tight,
      '-0.2': ConsolidatedDesignSystem.typography.letterSpacing.tighter,
      '-0.1': ConsolidatedDesignSystem.typography.letterSpacing.normal,
      '0': ConsolidatedDesignSystem.typography.letterSpacing.normal,
      '0.1': ConsolidatedDesignSystem.typography.letterSpacing.wide,
      '0.15': ConsolidatedDesignSystem.typography.letterSpacing.wider,
    },
    lineHeight: {
      '1': ConsolidatedDesignSystem.typography.lineHeight.none,
      '1.25': ConsolidatedDesignSystem.typography.lineHeight.tight,
      '1.375': ConsolidatedDesignSystem.typography.lineHeight.snug,
      '1.5': ConsolidatedDesignSystem.typography.lineHeight.normal,
      '1.625': ConsolidatedDesignSystem.typography.lineHeight.relaxed,
      '2': ConsolidatedDesignSystem.typography.lineHeight.loose,
      '20': ConsolidatedDesignSystem.typography.lineHeight.tight, // For 14px font
      '24': ConsolidatedDesignSystem.typography.lineHeight.normal, // For 16px font
    },
  },

  // Component-specific typography patterns with automatic line heights
  components: {
    // Practice detail screen patterns
    practiceDetail: {
      title: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize['2xl'],
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
        letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tight,
        lineHeight: ConsolidatedDesignSystem.typography.fontSize['2xl'] * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },
      subtitle: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.lg,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
        letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tight,
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.lg * ConsolidatedDesignSystem.typography.lineHeight.snug,
      },
      description: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.relaxed,
      },
      sectionTitle: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.lg,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
        letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tight,
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.lg * ConsolidatedDesignSystem.typography.lineHeight.snug,
      },
      label: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.sm,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.medium,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.sm * ConsolidatedDesignSystem.typography.lineHeight.snug,
      },
      value: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.normal,
      },
      metadata: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.xs,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.xs * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },
      button: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,
        letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tighter,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },
      secondaryButton: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,
        letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tighter,
        color: ConsolidatedConsolidatedDesignSystem.colors.primary,
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },
    },

    // Card patterns with automatic line heights
    card: {
      title: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.lg,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
        letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tight,
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.lg * ConsolidatedDesignSystem.typography.lineHeight.snug,
      },
      subtitle: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.sm,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.medium,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.sm * ConsolidatedDesignSystem.typography.lineHeight.snug,
      },
      content: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.normal,
      },
      caption: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.xs,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.xs * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },
    },

    // Modal patterns with automatic line heights
    modal: {
      title: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.xl,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
        letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tight,
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.xl * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },
      subtitle: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.normal,
      },
      content: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.normal,
      },
      button: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,
        letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing.tighter,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },
    },

    // Form patterns with automatic line heights
    form: {
      label: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.medium,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.snug,
      },
      input: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedDesignSystem.typography.lineHeight.normal,
      },
      helper: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.xs,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.xs * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },
      error: {
        fontSize: ConsolidatedDesignSystem.typography.fontSize.xs,
        fontWeight: ConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedDesignSystem.status.error,
        lineHeight: ConsolidatedDesignSystem.typography.fontSize.xs * ConsolidatedDesignSystem.typography.lineHeight.tight,
      },
    },
  },
};

// Type helpers for better TypeScript support
export type FontSizeKey = keyof typeof ConsolidatedDesignSystem.typography.fontSize;
export type FontWeightKey = keyof typeof ConsolidatedDesignSystem.typography.fontWeight;
export type LineHeightKey = keyof typeof ConsolidatedDesignSystem.typography.lineHeight;
export type LetterSpacingKey = keyof typeof ConsolidatedDesignSystem.typography.letterSpacing;

// Enhanced utility function with automatic line height calculation
export function getTextStyle(
  size: FontSizeKey = 'base',
  weight: FontWeightKey = 'normal',
  color: string = ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
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
    fontSize: ConsolidatedDesignSystem.typography.fontSize[size],
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight[weight],
    color,
    lineHeight: ConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedDesignSystem.typography.lineHeight[options?.lineHeight || defaultLineHeight],
    ...(options?.letterSpacing && {
      letterSpacing: ConsolidatedDesignSystem.typography.letterSpacing[options.letterSpacing],
    }),
  };
}

export default Typography;
