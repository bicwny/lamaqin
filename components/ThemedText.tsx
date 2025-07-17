
import { StyleSheet, Text, type TextProps } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTextStyles } from '@/utils/componentTokens';

export type ThemedTextProps = TextProps & {
  variant?: 'heading' | 'subheading' | 'body' | 'label' | 'caption' | 'button' | 'link' | 'dharma' | 'practice' | 'success';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  color?: string;
  // Legacy support - will be removed in future versions
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  lightColor?: string;
  darkColor?: string;
};

export function ThemedText({
  style,
  variant,
  size,
  color,
  // Legacy props for backward compatibility
  type,
  lightColor,
  darkColor,
  ...rest
}: ThemedTextProps) {
  // Handle legacy type prop mapping
  const getVariantFromLegacyType = (legacyType?: string): keyof typeof ComponentTextStyles => {
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
  
  // Get the base text style from ComponentTextStyles
  const getTextStyle = () => {
    // Handle nested variants like 'button.primary'
    if (effectiveVariant.includes('.')) {
      const [category, subVariant] = effectiveVariant.split('.');
      return ComponentTextStyles[category as keyof typeof ComponentTextStyles]?.[subVariant];
    }
    
    return ComponentTextStyles[effectiveVariant as keyof typeof ComponentTextStyles];
  };

  const baseTextStyle = getTextStyle();

  // Override color if specified
  const finalStyle = {
    ...baseTextStyle,
    ...(color && { color }),
    ...(size && { fontSize: DesignSystem.typography.fontSize[size] }),
  };

  // Legacy color override for backward compatibility
  if (lightColor || darkColor) {
    console.warn('ThemedText: lightColor and darkColor props are deprecated. Use the color prop or variant-specific colors instead.');
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
    color: DesignSystem.colors.primary, // Updated from hardcoded #0a7ea4
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
});
