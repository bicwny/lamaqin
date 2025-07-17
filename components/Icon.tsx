
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';

// Icon design tokens
export const IconTokens = {
  sizes: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
  },
  
  colors: {
    primary: ConsolidatedConsolidatedDesignSystem.colors.primary,
    secondary: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    success: ConsolidatedConsolidatedDesignSystem.status.success,
    warning: ConsolidatedConsolidatedDesignSystem.status.warning,
    error: ConsolidatedConsolidatedDesignSystem.status.error,
    info: ConsolidatedConsolidatedDesignSystem.status.info,
    neutral: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    inverse: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"],
  },
  
  // Semantic icon sets for common use cases
  semantic: {
    success: {
      name: 'checkmark-circle' as const,
      size: 16,
      color: ConsolidatedConsolidatedDesignSystem.status.success,
    },
    
    completion: {
      name: 'checkmark-circle' as const,
      size: 20,
      color: ConsolidatedConsolidatedDesignSystem.status.success,
    },
    
    warning: {
      name: 'warning' as const,
      size: 16,
      color: ConsolidatedConsolidatedDesignSystem.status.warning,
    },
    
    error: {
      name: 'close-circle' as const,
      size: 16,
      color: ConsolidatedConsolidatedDesignSystem.status.error,
    },
    
    info: {
      name: 'information-circle' as const,
      size: 16,
      color: ConsolidatedConsolidatedDesignSystem.status.info,
    },
    
    navigation: {
      name: 'chevron-forward' as const,
      size: 16,
      color: ConsolidatedConsolidatedDesignSystem.colors.primary,
    },
    
    practice: {
      name: 'flower' as const,
      size: 20,
      color: ConsolidatedConsolidatedDesignSystem.colors.primary,
    },
    
    meditation: {
      name: 'leaf' as const,
      size: 20,
      color: ConsolidatedConsolidatedDesignSystem.accent["accent-secondary"],
    },
  },
};

// Icon component props
export interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: keyof typeof IconTokens.sizes | number;
  color?: keyof typeof IconTokens.colors | string;
  semantic?: keyof typeof IconTokens.semantic;
}

export function Icon({ name, size = 'md', color = 'neutral', semantic }: IconProps) {
  // If semantic is provided, use semantic token values
  if (semantic) {
    const semanticIcon = IconTokens.semantic[semantic];
    return (
      <Ionicons
        name={semanticIcon.name}
        size={semanticIcon.size}
        color={semanticIcon.color}
      />
    );
  }
  
  // Otherwise, use individual props
  const iconSize = typeof size === 'number' ? size : IconTokens.sizes[size];
  const iconColor = typeof color === 'string' && color.startsWith('#') ? color : IconTokens.colors[color as keyof typeof IconTokens.colors];
  
  return (
    <Ionicons
      name={name}
      size={iconSize}
      color={iconColor}
    />
  );
}

// Helper functions for easy access
export const iconHelpers = {
  // Get semantic icon props
  getSemanticIcon: (semantic: keyof typeof IconTokens.semantic) => IconTokens.semantic[semantic],
  
  // Get size value
  getSize: (size: keyof typeof IconTokens.sizes) => IconTokens.sizes[size],
  
  // Get color value
  getColor: (color: keyof typeof IconTokens.colors) => IconTokens.colors[color],
  
  // Create consistent success icon
  successIcon: () => ({ semantic: 'success' as const }),
  
  // Create consistent completion icon
  completionIcon: () => ({ semantic: 'completion' as const }),
  
  // Create consistent navigation icon
  navigationIcon: () => ({ semantic: 'navigation' as const }),
};

export default Icon;
