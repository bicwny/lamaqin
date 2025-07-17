
/**
 * Consolidated Design System - 70% Reduction (50+ → 15 tokens)
 * Aggressive consolidation while preserving Buddhist semantic meaning
 */

export const ConsolidatedDesignSystem = {
  // CORE COLORS (7 tokens)
  colors: {
    // Primary brand color
    primary: '#da4347',
    
    // Text colors (3 tokens)
    'text-primary': '#1a1a1a',      // Merged: textPrimary + textOnLight
    'text-secondary': '#666666',     // Kept: textSecondary + textTertiary semantics
    'text-inverse': '#ffffff',       // Merged: textInverse + textOnDark + enlightenmentWhite
    
    // Surface colors (2 tokens)
    'surface-primary': '#ffffff',    // Merged: background + backgroundTertiary + cardBackground + modalBackground
    'surface-secondary': '#f8f9fa',  // Kept: backgroundSecondary
    
    // Border color (1 token)
    'border-default': '#e9ecef',     // Merged: border + borderLight + borderDark
  },
  
  // STATUS COLORS (4 tokens)
  status: {
    success: '#2e7d32',
    warning: '#f59e0b',
    error: '#dc3545',
    info: '#3b82f6',
  },
  
  // ACCENT COLORS (2 tokens) - Buddhist semantic preservation
  accent: {
    'accent-primary': '#da4347',     // Merged: dharmaRed + practiceActive + compassionOrange
    'accent-secondary': '#4A90E2',   // Merged: meditationBlue + studyProgress
  },
  
  // UTILITY COLORS (2 tokens)
  utility: {
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Typography - keeping existing scale
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 32,
      '5xl': 36,
    },
    
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    
    letterSpacing: {
      tighter: -0.2,
      tight: -0.3,
      normal: 0,
      wide: 0.1,
      wider: 0.15,
    },
  },
  
  // Spacing - keeping existing scale
  spacing: {
    xxs: 6,
    xs: 4,
    sm: 8,
    base: 10,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },
  
  // Border radius - keeping existing scale
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Shadows - keeping existing scale
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

// UTILITY FUNCTIONS - Replace variations with generated colors
export const colorUtils = {
  // Generate opacity variants
  withOpacity: (color: string, opacity: number): string => {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `${color}${alpha}`;
  },
  
  // Generate light variants (for hover states)
  lighten: (color: string, amount: number = 0.1): string => {
    // Simple lightening - in production you might want more sophisticated color manipulation
    if (color === ConsolidatedDesignSystem.colors.primary) {
      return ConsolidatedDesignSystem.colorUtils.withOpacity(color, 0.8);
    }
    return color;
  },
  
  // Generate dark variants (for pressed states)
  darken: (color: string, amount: number = 0.2): string => {
    if (color === ConsolidatedDesignSystem.colors.primary) {
      return '#b8393d'; // Keep one dark variant for primary
    }
    return color;
  },
  
  // Generate background variations with opacity
  withBackground: (color: string, opacity: number = 0.1): string => {
    return ConsolidatedDesignSystem.colorUtils.withOpacity(color, opacity);
  },
};

// BUDDHIST SEMANTIC PRESERVATION - Maps Buddhist meanings to consolidated colors
export const buddhistSemantics = {
  // Practice type colors
  getPracticeColor: (type: 'dharma' | 'meditation' | 'wisdom' | 'compassion') => {
    switch (type) {
      case 'dharma': return ConsolidatedDesignSystem.accent['accent-primary'];
      case 'meditation': return ConsolidatedDesignSystem.accent['accent-secondary'];
      case 'wisdom': return ConsolidatedDesignSystem.colorUtils.adjustHue(ConsolidatedDesignSystem.accent['accent-primary'], 45); // Generate gold
      case 'compassion': return ConsolidatedDesignSystem.accent['accent-primary'];
      default: return ConsolidatedDesignSystem.colors.primary;
    }
  },
  
  // Status with Buddhist meaning
  getPracticeStatus: (status: 'active' | 'completed' | 'inactive') => {
    switch (status) {
      case 'active': return ConsolidatedDesignSystem.accent['accent-primary'];
      case 'completed': return ConsolidatedDesignSystem.status.success;
      case 'inactive': return ConsolidatedDesignSystem.colors['text-secondary'];
      default: return ConsolidatedDesignSystem.colors['text-secondary'];
    }
  },
  
  // Feature area mapping
  getFeatureColor: (feature: 'practice' | 'study' | 'mindfulness' | 'stats') => {
    switch (feature) {
      case 'practice': return ConsolidatedDesignSystem.accent['accent-primary'];
      case 'study': return ConsolidatedDesignSystem.accent['accent-secondary'];
      case 'mindfulness': return ConsolidatedDesignSystem.accent['accent-primary'];
      case 'stats': return ConsolidatedDesignSystem.status.success;
      default: return ConsolidatedDesignSystem.colors.primary;
    }
  },
};

// MIGRATION MAPPING - Maps old tokens to new consolidated system
export const migrationMap = {
  // Text colors
  textPrimary: ConsolidatedDesignSystem.colors['text-primary'],
  textOnLight: ConsolidatedDesignSystem.colors['text-primary'],
  textSecondary: ConsolidatedDesignSystem.colors['text-secondary'],
  textTertiary: ConsolidatedDesignSystem.colors['text-secondary'],
  textInverse: ConsolidatedDesignSystem.colors['text-inverse'],
  textOnDark: ConsolidatedDesignSystem.colors['text-inverse'],
  enlightenmentWhite: ConsolidatedDesignSystem.colors['text-inverse'],
  
  // Background colors
  background: ConsolidatedDesignSystem.colors['surface-primary'],
  backgroundTertiary: ConsolidatedDesignSystem.colors['surface-primary'],
  cardBackground: ConsolidatedDesignSystem.colors['surface-primary'],
  modalBackground: ConsolidatedDesignSystem.colors['surface-primary'],
  backgroundSecondary: ConsolidatedDesignSystem.colors['surface-secondary'],
  
  // Border colors
  border: ConsolidatedDesignSystem.colors['border-default'],
  borderLight: ConsolidatedDesignSystem.colors['border-default'],
  borderDark: ConsolidatedDesignSystem.colors['border-default'],
  
  // Primary variations - generate with utilities
  primary: ConsolidatedDesignSystem.colors.primary,
  primaryDark: () => ConsolidatedDesignSystem.colorUtils.darken(ConsolidatedDesignSystem.colors.primary),
  primaryLight: () => ConsolidatedDesignSystem.colorUtils.lighten(ConsolidatedDesignSystem.colors.primary),
  
  // Buddhist colors
  dharmaRed: ConsolidatedDesignSystem.accent['accent-primary'],
  practiceActive: ConsolidatedDesignSystem.accent['accent-primary'],
  compassionOrange: ConsolidatedDesignSystem.accent['accent-primary'],
  meditationBlue: ConsolidatedDesignSystem.accent['accent-secondary'],
  studyProgress: ConsolidatedDesignSystem.accent['accent-secondary'],
  wisdomGold: () => ConsolidatedDesignSystem.colorUtils.adjustHue?.(ConsolidatedDesignSystem.accent['accent-primary'], 45) || '#D4AF37',
  
  // Status colors - keep as is
  success: ConsolidatedDesignSystem.status.success,
  warning: ConsolidatedDesignSystem.status.warning,
  error: ConsolidatedDesignSystem.status.error,
  info: ConsolidatedDesignSystem.status.info,
  
  // Practice status
  practiceComplete: ConsolidatedDesignSystem.status.success,
  practiceInactive: ConsolidatedDesignSystem.colors['text-secondary'],
  mindfulnessAlert: ConsolidatedDesignSystem.status.warning,
  
  // Background variations - generate with utilities
  successBackground: () => ConsolidatedDesignSystem.colorUtils.withOpacity(ConsolidatedDesignSystem.status.success, 0.1),
  warningBackground: () => ConsolidatedDesignSystem.colorUtils.withOpacity(ConsolidatedDesignSystem.status.warning, 0.1),
  errorBackground: () => ConsolidatedDesignSystem.colorUtils.withOpacity(ConsolidatedDesignSystem.status.error, 0.1),
  
  // Border variations - use base colors
  successBorder: ConsolidatedDesignSystem.status.success,
  warningBorder: ConsolidatedDesignSystem.status.warning,
  errorBorder: ConsolidatedDesignSystem.status.error,
  
  // Utility colors
  cardShadow: ConsolidatedDesignSystem.utility.shadow,
  overlayDark: ConsolidatedDesignSystem.utility.overlay,
  overlayBackground: ConsolidatedDesignSystem.utility.overlay,
};

// Add adjustHue utility for wisdom gold generation
ConsolidatedDesignSystem.colorUtils.adjustHue = (color: string, degrees: number): string => {
  // Simple hue adjustment - returns gold for wisdom
  if (color === ConsolidatedDesignSystem.accent['accent-primary'] && degrees === 45) {
    return '#D4AF37'; // Wisdom gold
  }
  return color;
};

export default ConsolidatedDesignSystem;
