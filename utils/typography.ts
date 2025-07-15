
import { DesignSystem, createStyles } from '@/constants/DesignSystem';

// Typography migration utilities
export const Typography = {
  // Quick access to font sizes
  fontSize: DesignSystem.typography.fontSize,
  fontWeight: DesignSystem.typography.fontWeight,
  lineHeight: DesignSystem.typography.lineHeight,
  letterSpacing: DesignSystem.typography.letterSpacing,

  // Pre-built text styles for common use cases
  styles: createStyles,

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

  // Component-specific typography patterns
  components: {
    // Practice detail screen patterns
    practiceDetail: {
      title: createStyles.dharmaTitle('2xl'),
      subtitle: createStyles.subheading('lg'),
      description: createStyles.body('base'),
      sectionTitle: createStyles.subheading('lg'),
      label: createStyles.label('sm'),
      value: createStyles.body('base'),
      metadata: createStyles.caption(),
      button: createStyles.buttonText('primary'),
      secondaryButton: createStyles.buttonText('secondary'),
    },

    // Card patterns
    card: {
      title: createStyles.subheading('lg'),
      subtitle: createStyles.label('sm'),
      content: createStyles.body('base'),
      caption: createStyles.caption(),
    },

    // Modal patterns
    modal: {
      title: createStyles.heading('xl'),
      subtitle: createStyles.body('base'),
      content: createStyles.body('base'),
      button: createStyles.buttonText('primary'),
    },

    // Form patterns
    form: {
      label: createStyles.label('base'),
      input: createStyles.body('base'),
      helper: createStyles.caption(),
      error: {
        ...createStyles.caption(),
        color: DesignSystem.colors.error,
      },
    },
  },
};

// Type helpers for better TypeScript support
export type FontSizeKey = keyof typeof DesignSystem.typography.fontSize;
export type FontWeightKey = keyof typeof DesignSystem.typography.fontWeight;
export type LineHeightKey = keyof typeof DesignSystem.typography.lineHeight;
export type LetterSpacingKey = keyof typeof DesignSystem.typography.letterSpacing;

// Utility function to quickly get a complete text style
export function getTextStyle(
  size: FontSizeKey = 'base',
  weight: FontWeightKey = 'normal',
  color: string = DesignSystem.colors.textPrimary,
  options?: {
    lineHeight?: LineHeightKey;
    letterSpacing?: LetterSpacingKey;
  }
) {
  return {
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight[weight],
    color,
    ...(options?.lineHeight && {
      lineHeight: DesignSystem.typography.lineHeight[options.lineHeight],
    }),
    ...(options?.letterSpacing && {
      letterSpacing: DesignSystem.typography.letterSpacing[options.letterSpacing],
    }),
  };
}

export default Typography;
