
import { StyleSheet, Text, type TextProps } from 'react-native';
import { DesignSystem, colorWithOpacity } from '@/constants/DesignSystem';

export type ThemedTextProps = TextProps & {
  variant?: 'heading' | 'subheading' | 'body' | 'label' | 'caption' | 'button' | 'link' | 'dharma' | 'practice' | 'success' | 'warning' | 'error';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  color?: keyof typeof DesignSystem.colors;
  opacity?: keyof typeof DesignSystem.opacity;
  weight?: keyof typeof DesignSystem.typography.fontWeight;
  // Legacy support - will be removed in future versions
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  lightColor?: string;
  darkColor?: string;
};

export function ThemedText({
  style,
  variant = 'body',
  size,
  color,
  opacity,
  weight,
  // Legacy props for backward compatibility
  type,
  lightColor,
  darkColor,
  ...rest
}: ThemedTextProps) {
  // Handle legacy type prop mapping
  const getVariantFromLegacyType = (legacyType?: string): typeof variant => {
    switch (legacyType) {
      case 'title':
        return 'heading';
      case 'subtitle':
        return 'subheading';
      case 'defaultSemiBold':
        return 'label';
      case 'link':
        return 'link';
      case 'default':
      default:
        return 'body';
    }
  };

  // Determine which variant to use (new system takes precedence)
  const effectiveVariant = variant || getVariantFromLegacyType(type);
  
  // Get base text styles with proper semantic colors
  const getTextStyle = () => {
    const styles = {
      heading: {
        fontSize: DesignSystem.typography.fontSize['2xl'],
        fontWeight: DesignSystem.typography.fontWeight.bold,
        color: DesignSystem.colors.textPrimary,
        letterSpacing: DesignSystem.typography.letterSpacing.tight,
        lineHeight: DesignSystem.typography.fontSize['2xl'] * DesignSystem.typography.lineHeight.tight,
      },
      subheading: {
        fontSize: DesignSystem.typography.fontSize.xl,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
        color: DesignSystem.colors.textPrimary,
        letterSpacing: DesignSystem.typography.letterSpacing.tight,
        lineHeight: DesignSystem.typography.fontSize.xl * DesignSystem.typography.lineHeight.snug,
      },
      body: {
        fontSize: DesignSystem.typography.fontSize.base,
        fontWeight: DesignSystem.typography.fontWeight.normal,
        color: DesignSystem.colors.textSecondary,
        lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.normal,
      },
      label: {
        fontSize: DesignSystem.typography.fontSize.sm,
        fontWeight: DesignSystem.typography.fontWeight.medium,
        color: DesignSystem.colors.textSecondary,
        lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.snug,
      },
      caption: {
        fontSize: DesignSystem.typography.fontSize.xs,
        fontWeight: DesignSystem.typography.fontWeight.normal,
        color: DesignSystem.colors.textTertiary,
        lineHeight: DesignSystem.typography.fontSize.xs * DesignSystem.typography.lineHeight.tight,
      },
      button: {
        fontSize: DesignSystem.typography.fontSize.base,
        fontWeight: DesignSystem.typography.fontWeight.bold,
        color: DesignSystem.colors.textInverse,
        letterSpacing: DesignSystem.typography.letterSpacing.tighter,
        lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.tight,
      },
      link: {
        fontSize: DesignSystem.typography.fontSize.base,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
        color: DesignSystem.colors.primary,
        letterSpacing: DesignSystem.typography.letterSpacing.normal,
        lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.tight,
      },
      // Buddhist semantic variants
      dharma: {
        fontSize: DesignSystem.typography.fontSize.lg,
        fontWeight: DesignSystem.typography.fontWeight.bold,
        color: DesignSystem.colors.redTara,
        letterSpacing: DesignSystem.typography.letterSpacing.tight,
        lineHeight: DesignSystem.typography.fontSize.lg * DesignSystem.typography.lineHeight.tight,
      },
      practice: {
        fontSize: DesignSystem.typography.fontSize.base,
        fontWeight: DesignSystem.typography.fontWeight.medium,
        color: DesignSystem.colors.practiceActive,
        lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.relaxed,
      },
      // Status variants with semantic colors
      success: {
        fontSize: DesignSystem.typography.fontSize.sm,
        fontWeight: DesignSystem.typography.fontWeight.medium,
        color: DesignSystem.colors.greenTara,
        lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.snug,
      },
      warning: {
        fontSize: DesignSystem.typography.fontSize.sm,
        fontWeight: DesignSystem.typography.fontWeight.medium,
        color: DesignSystem.colors.warning,
        lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.snug,
      },
      error: {
        fontSize: DesignSystem.typography.fontSize.sm,
        fontWeight: DesignSystem.typography.fontWeight.medium,
        color: DesignSystem.colors.error,
        lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.snug,
      },
    };
    
    return styles[effectiveVariant] || styles.body;
  };

  const baseTextStyle = getTextStyle();

  // Build final style with overrides
  const finalStyle = {
    ...baseTextStyle,
    // Size override
    ...(size && { 
      fontSize: DesignSystem.typography.fontSize[size],
      lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.normal,
    }),
    // Weight override
    ...(weight && { fontWeight: DesignSystem.typography.fontWeight[weight] }),
    // Color override with semantic color support
    ...(color && { 
      color: typeof color === 'string' && color.startsWith('#') 
        ? color 
        : DesignSystem.colors[color as keyof typeof DesignSystem.colors] || baseTextStyle.color 
    }),
  };

  // Apply opacity if specified
  if (opacity) {
    finalStyle.color = colorWithOpacity.textWithOpacity(finalStyle.color, opacity);
  }

  // Legacy color override for backward compatibility
  if (lightColor || darkColor) {
    console.warn('ThemedText: lightColor and darkColor props are deprecated. Use the color prop with DesignSystem colors instead.');
    // For now, use lightColor as fallback
    if (lightColor && !color) {
      finalStyle.color = lightColor;
    }
  }

  return (
    <Text
      style={[finalStyle, style]}
      {...rest}
    />
  );
}

// Text style utility functions for common use cases
export const TextStyleUtils = {
  // Quick access to common text styles with opacity support
  primaryText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.textPrimary, opacity)
      : DesignSystem.colors.textPrimary,
  }),
  
  secondaryText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.textSecondary, opacity)
      : DesignSystem.colors.textSecondary,
  }),
  
  tertiaryText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.textTertiary, opacity)
      : DesignSystem.colors.textTertiary,
  }),
  
  // Buddhist semantic text colors with opacity
  dharmaText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.redTara, opacity)
      : DesignSystem.colors.redTara,
  }),
  
  practiceText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.practiceActive, opacity)
      : DesignSystem.colors.practiceActive,
  }),
  
  successText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.greenTara, opacity)
      : DesignSystem.colors.greenTara,
  }),
  
  // Text hierarchy helpers
  emphasized: (baseColor: string, emphasis: 'high' | 'medium' | 'low' = 'medium') => {
    const opacityMap = {
      high: '90' as keyof typeof DesignSystem.opacity,
      medium: '80' as keyof typeof DesignSystem.opacity,
      low: '50' as keyof typeof DesignSystem.opacity,
    };
    return {
      color: colorWithOpacity.textWithOpacity(baseColor, opacityMap[emphasis]),
    };
  },
  
  // Text on different background helpers
  onDark: () => ({
    color: DesignSystem.colors.textInverse,
  }),
  
  onLight: () => ({
    color: DesignSystem.colors.textPrimary,
  }),
  
  onTara: (taraColor: 'red' | 'orange' | 'yellow' | 'blue' | 'green' | 'black' | 'white') => {
    const textColors = {
      red: DesignSystem.colors.textInverse,
      orange: DesignSystem.colors.textInverse,
      yellow: DesignSystem.colors.textPrimary,
      blue: DesignSystem.colors.textInverse,
      green: DesignSystem.colors.textInverse,
      black: DesignSystem.colors.textInverse,
      white: DesignSystem.colors.textPrimary,
    };
    return {
      color: textColors[taraColor],
    };
  },
};

// Legacy styles for backward compatibility - will be removed in future versions
const legacyStyles = StyleSheet.create({
  default: {
    fontSize: DesignSystem.typography.fontSize.base,
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.normal,
    color: DesignSystem.colors.textSecondary,
  },
  defaultSemiBold: {
    fontSize: DesignSystem.typography.fontSize.base,
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.normal,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
  },
  title: {
    fontSize: DesignSystem.typography.fontSize['4xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    lineHeight: DesignSystem.typography.fontSize['4xl'] * DesignSystem.typography.lineHeight.tight,
    color: DesignSystem.colors.textPrimary,
  },
  subtitle: {
    fontSize: DesignSystem.typography.fontSize.xl,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.textPrimary,
  },
  link: {
    fontSize: DesignSystem.typography.fontSize.base,
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.tight,
    color: DesignSystem.colors.primary,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
});
