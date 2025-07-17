
import { StyleSheet, Text, type TextProps } from 'react-native';
import { DesignSystem, colorWithOpacity } from '@/constants/DesignSystem';
import { ComponentTextStyles } from '@/utils/componentTokens';

export type ThemedTextProps = TextProps & {
  variant?: 'heading' | 'subheading' | 'body' | 'label' | 'caption' | 'input' | 'button' | 'link' | 'dharma' | 'practice' | 'success' | 'warning' | 'error';
  buttonVariant?: 'primary' | 'secondary';
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
  buttonVariant = 'primary',
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
  
  // Get consolidated text styles from ComponentTextStyles
  const getTextStyle = () => {
    switch (effectiveVariant) {
      case 'heading':
        return ComponentTextStyles.heading;
      case 'subheading':
        return ComponentTextStyles.subheading;
      case 'body':
        return ComponentTextStyles.body;
      case 'label':
        return ComponentTextStyles.label;
      case 'caption':
        return ComponentTextStyles.caption;
      case 'input':
        return ComponentTextStyles.input;
      case 'button':
        return ComponentTextStyles.button[buttonVariant];
      case 'link':
        return ComponentTextStyles.link;
      // Tara Buddhist semantic variants
      case 'dharma':
        return ComponentTextStyles.dharma;
      case 'practice':
        return ComponentTextStyles.practice;
      case 'success':
        return ComponentTextStyles.success;
      case 'warning':
        return {
          fontSize: DesignSystem.typography.fontSize.sm,
          fontWeight: DesignSystem.typography.fontWeight.medium,
          color: DesignSystem.colors.warning,
          lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.snug,
        };
      case 'error':
        return {
          fontSize: DesignSystem.typography.fontSize.sm,
          fontWeight: DesignSystem.typography.fontWeight.medium,
          color: DesignSystem.colors.error,
          lineHeight: DesignSystem.typography.fontSize.sm * DesignSystem.typography.lineHeight.snug,
        };
      default:
        return ComponentTextStyles.body;
    }
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

// Enhanced text style utility functions with Tara semantic system
export const TextStyleUtils = {
  // Quick access to consolidated text styles
  heading: () => ComponentTextStyles.heading,
  subheading: () => ComponentTextStyles.subheading,
  body: () => ComponentTextStyles.body,
  label: () => ComponentTextStyles.label,
  caption: () => ComponentTextStyles.caption,
  input: () => ComponentTextStyles.input,
  
  // Button text styles
  primaryButton: () => ComponentTextStyles.button.primary,
  secondaryButton: () => ComponentTextStyles.button.secondary,
  
  // Interactive styles
  link: () => ComponentTextStyles.link,
  
  // Tara Buddhist semantic styles
  dharma: () => ComponentTextStyles.dharma,
  practice: () => ComponentTextStyles.practice,
  success: () => ComponentTextStyles.success,
  
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
  
  // Tara Buddhist semantic text colors with opacity
  redTaraText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.redTara, opacity)
      : DesignSystem.colors.redTara,
  }),
  
  orangeTaraText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.orangeTara, opacity)
      : DesignSystem.colors.orangeTara,
  }),
  
  yellowTaraText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.yellowTara, opacity)
      : DesignSystem.colors.yellowTara,
  }),
  
  blueTaraText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.blueTara, opacity)
      : DesignSystem.colors.blueTara,
  }),
  
  greenTaraText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.greenTara, opacity)
      : DesignSystem.colors.greenTara,
  }),
  
  blackTaraText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.blackTara, opacity)
      : DesignSystem.colors.blackTara,
  }),
  
  whiteTaraText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.whiteTara, opacity)
      : DesignSystem.colors.whiteTara,
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
  
  // Text on Tara color backgrounds
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
  
  // Status text colors
  warningText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.warning, opacity)
      : DesignSystem.colors.warning,
  }),
  
  errorText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.error, opacity)
      : DesignSystem.colors.error,
  }),
  
  infoText: (opacity?: keyof typeof DesignSystem.opacity) => ({
    color: opacity 
      ? colorWithOpacity.textWithOpacity(DesignSystem.colors.info, opacity)
      : DesignSystem.colors.info,
  }),
};

// Legacy styles for backward compatibility - will be removed in future versions
const legacyStyles = StyleSheet.create({
  default: ComponentTextStyles.body,
  defaultSemiBold: ComponentTextStyles.label,
  title: ComponentTextStyles.heading,
  subtitle: ComponentTextStyles.subheading,
  link: ComponentTextStyles.link,
});
