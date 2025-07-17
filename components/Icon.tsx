
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/constants/DesignSystem';

// Enhanced Icon design tokens with comprehensive Tara Buddhist system
export const IconTokens = {
  sizes: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
  },
  
  // Core color system with Tara Buddhist semantic colors
  colors: {
    // Primary system colors
    primary: DesignSystem.colors.primary,
    secondary: DesignSystem.colors.textSecondary,
    tertiary: DesignSystem.colors.textTertiary,
    inverse: DesignSystem.colors.textInverse,
    
    // Status colors
    success: DesignSystem.colors.practiceComplete,
    warning: DesignSystem.colors.warning,
    error: DesignSystem.colors.error,
    info: DesignSystem.colors.info,
    neutral: DesignSystem.colors.textSecondary,
    
    // Five Taras Buddhist semantic colors - The complete system
    redTara: DesignSystem.colors.redTara,           // Practice energy & determination
    orangeTara: DesignSystem.colors.orangeTara,     // Mindfulness & compassion
    yellowTara: DesignSystem.colors.yellowTara,     // Wisdom & achievement
    blueTara: DesignSystem.colors.blueTara,         // Contemplation & deep practice
    greenTara: DesignSystem.colors.greenTara,       // Growth & completion
    blackTara: DesignSystem.colors.blackTara,       // Protection & fierce compassion
    whiteTara: DesignSystem.colors.whiteTara,       // Purity & healing
    
    // Tara variations for different states
    redTaraLight: DesignSystem.colors.redTaraLight,
    redTaraDark: DesignSystem.colors.redTaraDark,
    orangeTaraLight: DesignSystem.colors.orangeTaraLight,
    yellowTaraLight: DesignSystem.colors.yellowTaraLight,
    blueTaraLight: DesignSystem.colors.blueTaraLight,
    blackTaraLight: DesignSystem.colors.blackTaraLight,
    whiteTaraLight: DesignSystem.colors.whiteTaraLight,
  },
  
  // Enhanced semantic icon sets with Tara Buddhist meanings
  semantic: {
    // Success and completion with Green Tara energy
    success: {
      name: 'checkmark-circle' as const,
      size: 16,
      color: DesignSystem.colors.greenTara, // Green Tara for completion
    },
    
    completion: {
      name: 'checkmark-circle' as const,
      size: 20,
      color: DesignSystem.colors.greenTara, // Green Tara for achievement
    },
    
    // Status indicators with appropriate Tara colors
    warning: {
      name: 'warning' as const,
      size: 16,
      color: DesignSystem.colors.warning,
    },
    
    error: {
      name: 'close-circle' as const,
      size: 16,
      color: DesignSystem.colors.error,
    },
    
    info: {
      name: 'information-circle' as const,
      size: 16,
      color: DesignSystem.colors.blueTara, // Blue Tara for contemplative information
    },
    
    // Navigation with Red Tara energy
    navigation: {
      name: 'chevron-forward' as const,
      size: 16,
      color: DesignSystem.colors.redTara, // Red Tara for forward action
    },
    
    navigationBack: {
      name: 'chevron-back' as const,
      size: 20,
      color: DesignSystem.colors.redTara, // Red Tara for navigation energy
    },
    
    // Practice-related icons with Red Tara energy
    practice: {
      name: 'flower' as const,
      size: 20,
      color: DesignSystem.colors.redTara, // Red Tara for practice energy
    },
    
    practiceActive: {
      name: 'radio-button-on' as const,
      size: 16,
      color: DesignSystem.colors.redTara, // Active practice energy
    },
    
    practiceComplete: {
      name: 'checkmark-done-circle' as const,
      size: 20,
      color: DesignSystem.colors.greenTara, // Green Tara for completion
    },
    
    // Meditation with Blue Tara contemplation
    meditation: {
      name: 'leaf' as const,
      size: 20,
      color: DesignSystem.colors.blueTara, // Blue Tara for contemplation
    },
    
    mindfulness: {
      name: 'eye' as const,
      size: 18,
      color: DesignSystem.colors.orangeTara, // Orange Tara for mindful awareness
    },
    
    // Study and wisdom with Yellow Tara
    study: {
      name: 'book' as const,
      size: 20,
      color: DesignSystem.colors.yellowTara, // Yellow Tara for wisdom
    },
    
    wisdom: {
      name: 'school' as const,
      size: 18,
      color: DesignSystem.colors.yellowTara, // Yellow Tara for learning
    },
    
    achievement: {
      name: 'trophy' as const,
      size: 20,
      color: DesignSystem.colors.yellowTara, // Yellow Tara for accomplishment
    },
    
    // User interface with appropriate Tara colors
    add: {
      name: 'add-circle' as const,
      size: 24,
      color: DesignSystem.colors.redTara, // Red Tara for creative action
    },
    
    edit: {
      name: 'create' as const,
      size: 20,
      color: DesignSystem.colors.blueTara, // Blue Tara for thoughtful editing
    },
    
    delete: {
      name: 'trash' as const,
      size: 18,
      color: DesignSystem.colors.blackTara, // Black Tara for protective deletion
    },
    
    settings: {
      name: 'settings' as const,
      size: 20,
      color: DesignSystem.colors.textSecondary,
    },
    
    // Time and scheduling
    time: {
      name: 'time' as const,
      size: 18,
      color: DesignSystem.colors.blueTara, // Blue Tara for contemplative time
    },
    
    calendar: {
      name: 'calendar' as const,
      size: 20,
      color: DesignSystem.colors.yellowTara, // Yellow Tara for planning wisdom
    },
    
    // Emotional and spiritual states
    peaceful: {
      name: 'heart' as const,
      size: 18,
      color: DesignSystem.colors.orangeTara, // Orange Tara for compassion
    },
    
    focused: {
      name: 'radio-button-on' as const,
      size: 16,
      color: DesignSystem.colors.blueTara, // Blue Tara for concentration
    },
    
    growth: {
      name: 'trending-up' as const,
      size: 20,
      color: DesignSystem.colors.greenTara, // Green Tara for progress
    },
    
    protection: {
      name: 'shield' as const,
      size: 20,
      color: DesignSystem.colors.blackTara, // Black Tara for protection
    },
    
    healing: {
      name: 'medical' as const,
      size: 18,
      color: DesignSystem.colors.whiteTara, // White Tara for healing
    },
    
    // Tab navigation with Tara semantic colors
    practiceTab: {
      name: 'flower' as const,
      size: 24,
      color: DesignSystem.colors.redTara, // Red Tara for practice tab
    },
    
    studyTab: {
      name: 'book' as const,
      size: 24,
      color: DesignSystem.colors.yellowTara, // Yellow Tara for study tab
    },
    
    mindfulnessTab: {
      name: 'leaf' as const,
      size: 24,
      color: DesignSystem.colors.orangeTara, // Orange Tara for mindfulness tab
    },
    
    statsTab: {
      name: 'stats-chart' as const,
      size: 24,
      color: DesignSystem.colors.greenTara, // Green Tara for progress stats
    },
    
    profileTab: {
      name: 'person' as const,
      size: 24,
      color: DesignSystem.colors.blueTara, // Blue Tara for contemplative profile
    },
  },
  
  // Context-based icon sets for different app areas
  contexts: {
    // Practice context icons
    practice: {
      primary: DesignSystem.colors.redTara,
      secondary: DesignSystem.colors.redTaraLight,
      accent: DesignSystem.colors.greenTara, // For completion states
    },
    
    // Study/wisdom context icons
    study: {
      primary: DesignSystem.colors.yellowTara,
      secondary: DesignSystem.colors.yellowTaraLight,
      accent: DesignSystem.colors.blueTara, // For contemplative learning
    },
    
    // Mindfulness context icons
    mindfulness: {
      primary: DesignSystem.colors.orangeTara,
      secondary: DesignSystem.colors.orangeTaraLight,
      accent: DesignSystem.colors.blueTara, // For deep awareness
    },
    
    // Meditation context icons
    meditation: {
      primary: DesignSystem.colors.blueTara,
      secondary: DesignSystem.colors.blueTaraLight,
      accent: DesignSystem.colors.orangeTara, // For compassionate meditation
    },
    
    // Progress/stats context icons
    progress: {
      primary: DesignSystem.colors.greenTara,
      secondary: DesignSystem.colors.successBackground,
      accent: DesignSystem.colors.yellowTara, // For achievement highlights
    },
  },
};

// Enhanced Icon component props
export interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: keyof typeof IconTokens.sizes | number;
  color?: keyof typeof IconTokens.colors | string;
  semantic?: keyof typeof IconTokens.semantic;
  context?: keyof typeof IconTokens.contexts;
  variant?: 'primary' | 'secondary' | 'accent';
}

export function Icon({ 
  name, 
  size = 'md', 
  color = 'neutral', 
  semantic, 
  context,
  variant = 'primary'
}: IconProps) {
  // If semantic is provided, use semantic token values (highest priority)
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
  
  // If context is provided, use context-based coloring
  if (context && IconTokens.contexts[context]) {
    const contextColors = IconTokens.contexts[context];
    const iconSize = typeof size === 'number' ? size : IconTokens.sizes[size];
    const iconColor = contextColors[variant];
    
    return (
      <Ionicons
        name={name}
        size={iconSize}
        color={iconColor}
      />
    );
  }
  
  // Otherwise, use individual props
  const iconSize = typeof size === 'number' ? size : IconTokens.sizes[size];
  const iconColor = typeof color === 'string' && color.startsWith('#') 
    ? color 
    : IconTokens.colors[color as keyof typeof IconTokens.colors];
  
  return (
    <Ionicons
      name={name}
      size={iconSize}
      color={iconColor}
    />
  );
}

// Enhanced helper functions for easy access with Tara Buddhist theming
export const iconHelpers = {
  // Get semantic icon props
  getSemanticIcon: (semantic: keyof typeof IconTokens.semantic) => IconTokens.semantic[semantic],
  
  // Get size value
  getSize: (size: keyof typeof IconTokens.sizes) => IconTokens.sizes[size],
  
  // Get color value (including all Tara colors)
  getColor: (color: keyof typeof IconTokens.colors) => IconTokens.colors[color],
  
  // Get context colors
  getContextColors: (context: keyof typeof IconTokens.contexts) => IconTokens.contexts[context],
  
  // Tara-specific icon creation helpers
  createSuccessIcon: (size: keyof typeof IconTokens.sizes = 'md') => ({ 
    semantic: 'success' as const,
    size: IconTokens.sizes[size],
  }),
  
  createCompletionIcon: (size: keyof typeof IconTokens.sizes = 'lg') => ({ 
    semantic: 'completion' as const,
    size: IconTokens.sizes[size],
  }),
  
  createNavigationIcon: (size: keyof typeof IconTokens.sizes = 'md') => ({ 
    semantic: 'navigation' as const,
    size: IconTokens.sizes[size],
  }),
  
  // Practice-related icon helpers with Red Tara
  createPracticeIcon: (active: boolean = false) => ({
    semantic: active ? 'practiceActive' as const : 'practice' as const,
  }),
  
  // Meditation icon helpers with Blue Tara
  createMeditationIcon: (type: 'meditation' | 'mindfulness' = 'meditation') => ({
    semantic: type,
  }),
  
  // Study icon helpers with Yellow Tara
  createStudyIcon: (type: 'study' | 'wisdom' | 'achievement' = 'study') => ({
    semantic: type,
  }),
  
  // Tab navigation helpers with context-appropriate Tara colors
  createTabIcon: (tab: 'practice' | 'study' | 'mindfulness' | 'stats' | 'profile') => ({
    semantic: `${tab}Tab` as const,
  }),
  
  // Context-based icon creation
  createContextIcon: (
    name: keyof typeof Ionicons.glyphMap,
    context: keyof typeof IconTokens.contexts,
    variant: 'primary' | 'secondary' | 'accent' = 'primary',
    size: keyof typeof IconTokens.sizes = 'md'
  ) => ({
    name,
    context,
    variant,
    size,
  }),
  
  // Tara-specific color applications
  applyTaraColor: (
    taraType: 'redTara' | 'orangeTara' | 'yellowTara' | 'blueTara' | 'greenTara' | 'blackTara' | 'whiteTara',
    lightVariant: boolean = false
  ) => {
    const colorKey = lightVariant ? `${taraType}Light` as keyof typeof IconTokens.colors : taraType;
    return IconTokens.colors[colorKey];
  },
  
  // Buddhist semantic validation helper
  validateBuddhistSemantic: (semantic: keyof typeof IconTokens.semantic) => {
    const icon = IconTokens.semantic[semantic];
    const taraColors = [
      DesignSystem.colors.redTara,
      DesignSystem.colors.orangeTara,
      DesignSystem.colors.yellowTara,
      DesignSystem.colors.blueTara,
      DesignSystem.colors.greenTara,
      DesignSystem.colors.blackTara,
      DesignSystem.colors.whiteTara,
    ];
    
    return {
      isValidTaraColor: taraColors.includes(icon.color),
      taraType: Object.entries(DesignSystem.colors).find(([key, value]) => 
        value === icon.color && key.includes('Tara')
      )?.[0] || 'unknown',
      semanticMeaning: semantic,
    };
  },
  
  // Legacy support helpers
  legacy: {
    // Maps old practice icon to Red Tara system
    practiceIcon: () => iconHelpers.createPracticeIcon(),
    
    // Maps old meditation icon to Blue Tara system
    meditationIcon: () => iconHelpers.createMeditationIcon(),
    
    // Maps old success icon to Green Tara system
    successIcon: () => iconHelpers.createSuccessIcon(),
    
    // Maps old navigation icon to Red Tara system
    navigationIcon: () => iconHelpers.createNavigationIcon(),
  },
};

export default Icon;
