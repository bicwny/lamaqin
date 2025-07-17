
import { DesignSystem, createStyles } from '@/constants/ConsolidatedDesignSystem';

// Typography migration utilities
export const Typography = {
  // Quick access to font sizes
  fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize,
  fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight,
  lineHeight: ConsolidatedConsolidatedDesignSystem.typography.lineHeight,
  letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing,

  // Enhanced pre-built text styles with automatic line heights
  styles: {
    // Headings with tight line height for impact
    heading: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize = 'xl') => ({
      fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
      fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,
      color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
      letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
      lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
    }),
    
    // Subheadings with snug line height for hierarchy
    subheading: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize = 'lg') => ({
      fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
      fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
      color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
      letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
      lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.snug,
    }),
    
    // Body text with normal line height for reading comfort
    body: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize = 'base') => ({
      fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
      fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
      color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
      lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.normal,
    }),
    
    // Labels with snug line height for compact UI
    label: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize = 'sm') => ({
      fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
      fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,
      color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
      lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.snug,
    }),
    
    // Captions with tight line height for small text
    caption: () => ({
      fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs,
      fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
      color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
      lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
    }),
    
    // Buddhist semantic text styles with optimized line heights
    dharmaTitle: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize = '2xl') => ({
      fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
      fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,
      color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
      letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
      lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
    }),
    
    // Practice text with relaxed line height for better readability
    practiceText: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize = 'base') => ({
      fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
      fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,
      color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
      lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.relaxed,
    }),
    
    // Interactive text styles with tight line height for UI precision
    buttonText: (variant: 'primary' | 'secondary' = 'primary') => ({
      fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
      fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,
      letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tighter,
      color: variant === 'primary' ? ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-inverse"] : ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
      lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
    }),
    
    // Link text with tight line height for inline usage
    linkText: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize = 'base') => ({
      fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
      fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
      color: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
      letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.normal,
      lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
    }),
  },

  // Migration helpers - map old hardcoded values to new tokens
  migrationMap: {
    fontSize: {
      12: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs,
      14: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm,
      16: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
      18: ConsolidatedConsolidatedDesignSystem.typography.fontSize.lg,
      20: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xl,
      24: ConsolidatedConsolidatedDesignSystem.typography.fontSize['2xl'],
      30: ConsolidatedConsolidatedDesignSystem.typography.fontSize['3xl'],
      32: ConsolidatedConsolidatedDesignSystem.typography.fontSize['4xl'],
      36: ConsolidatedConsolidatedDesignSystem.typography.fontSize['5xl'],
    },
    fontWeight: {
      '300': ConsolidatedConsolidatedDesignSystem.typography.fontWeight.light,
      '400': ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
      '500': ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,
      '600': ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
      '700': ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,
      'bold': ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,
      '800': ConsolidatedConsolidatedDesignSystem.typography.fontWeight.extrabold,
    },
    letterSpacing: {
      '-0.3': ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
      '-0.2': ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tighter,
      '-0.1': ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.normal,
      '0': ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.normal,
      '0.1': ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.wide,
      '0.15': ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.wider,
    },
    lineHeight: {
      '1': ConsolidatedConsolidatedDesignSystem.typography.lineHeight.none,
      '1.25': ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      '1.375': ConsolidatedConsolidatedDesignSystem.typography.lineHeight.snug,
      '1.5': ConsolidatedConsolidatedDesignSystem.typography.lineHeight.normal,
      '1.625': ConsolidatedConsolidatedDesignSystem.typography.lineHeight.relaxed,
      '2': ConsolidatedConsolidatedDesignSystem.typography.lineHeight.loose,
      '20': ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight, // For 14px font
      '24': ConsolidatedConsolidatedDesignSystem.typography.lineHeight.normal, // For 16px font
    },
  },

  // Component-specific typography patterns with automatic line heights
  components: {
    // Practice detail screen patterns
    practiceDetail: {
      title: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize['2xl'],
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
        letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize['2xl'] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },
      subtitle: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.lg,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
        letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.lg * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.snug,
      },
      description: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.relaxed,
      },
      sectionTitle: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.lg,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
        letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.lg * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.snug,
      },
      label: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.snug,
      },
      value: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.normal,
      },
      metadata: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },
      button: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,
        letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tighter,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },
      secondaryButton: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,
        letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tighter,
        color: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },
    },

    // Card patterns with automatic line heights
    card: {
      title: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.lg,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
        letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.lg * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.snug,
      },
      subtitle: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.snug,
      },
      content: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.normal,
      },
      caption: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },
    },

    // Modal patterns with automatic line heights
    modal: {
      title: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xl,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
        letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xl * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },
      subtitle: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.normal,
      },
      content: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.normal,
      },
      button: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,
        letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tighter,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },
    },

    // Form patterns with automatic line heights
    form: {
      label: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.snug,
      },
      input: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.normal,
      },
      helper: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },
      error: {
        fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs,
        fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
        color: ConsolidatedConsolidatedConsolidatedDesignSystem.status.error,
        lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
      },
    },
  },
};

// Type helpers for better TypeScript support
export type FontSizeKey = keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize;
export type FontWeightKey = keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontWeight;
export type LineHeightKey = keyof typeof ConsolidatedConsolidatedDesignSystem.typography.lineHeight;
export type LetterSpacingKey = keyof typeof ConsolidatedConsolidatedDesignSystem.typography.letterSpacing;

// Enhanced utility function with automatic line height calculation
export function getTextStyle(
  size: FontSizeKey = 'base',
  weight: FontWeightKey = 'normal',
  color: string = ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
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
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight[weight],
    color,
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight[options?.lineHeight || defaultLineHeight],
    ...(options?.letterSpacing && {
      letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing[options.letterSpacing],
    }),
  };
}

export default Typography;
