
export const DesignSystem = {
  // Colors
  colors: {
    // Primary colors
    primary: '#da4347',
    primaryDark: '#b8393d',
    primaryLight: '#e66a6d',
    
    // Text colors
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textInverse: '#ffffff',
    
    // Background colors
    background: '#f8f9fa',
    backgroundSecondary: '#ffffff',
    backgroundTertiary: '#f0f0f0',
    
    // UI colors
    border: '#e9ecef',
    borderLight: '#f0f0f0',
    borderDark: '#dee2e6',
    
    // Status colors
    success: '#2e7d32',
    warning: '#f59e0b',
    error: '#dc3545',
    info: '#3b82f6',
    
    // Buddhist semantic colors
    dharmaRed: '#da4347',           // Primary practice energy
    compassionOrange: '#FF6B35',    // Mindfulness and compassion
    wisdomGold: '#D4AF37',          // Study achievements and wisdom
    meditationBlue: '#4A90E2',      // Deep contemplation
    enlightenmentWhite: '#ffffff',  // Purity and clarity
    
    // Practice status colors with Buddhist meaning
    practiceComplete: '#2e7d32',    // Completed practice (wisdom green)
    practiceActive: '#da4347',      // Active practice (dharma red)
    practiceInactive: '#999999',    // Inactive practice
    studyProgress: '#4A90E2',       // Learning progress (meditation blue)
    mindfulnessAlert: '#f59e0b',    // Mindful attention needed
    
    // Success state variations
    successBackground: '#e8f5e8',   // Light success background
    successBorder: '#2e7d32',       // Success border
    
    // Warning state variations  
    warningBackground: '#fff3cd',   // Light warning background
    warningBorder: '#f59e0b',       // Warning border
    
    // Error state variations
    errorBackground: '#f8d7da',     // Light error background
    errorBorder: '#dc3545',         // Error border
    
    // Utility colors found in code
    cardShadow: '#000000',          // Shadow color for cards
    overlayDark: 'rgba(0, 0, 0, 0.5)', // Modal overlay
    textOnDark: '#ffffff',          // Text on dark backgrounds
    textOnLight: '#1a1a1a',         // Text on light backgrounds
    
    // Semantic colors
    cardBackground: '#ffffff',
    modalBackground: '#ffffff',
    overlayBackground: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Typography
  typography: {
    // Font sizes
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
    
    // Font weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    // Line heights
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    
    // Letter spacing
    letterSpacing: {
      tighter: -0.2,
      tight: -0.3,
      normal: 0,
      wide: 0.1,
      wider: 0.15,
    },
  },
  
  // Spacing
  spacing: {
    xxs: 6,    // For small borders, icon gaps, tight spacing
    xs: 4,
    sm: 8,
    base: 10,  // For button padding, small margins, form elements
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Shadows
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
  
  // Component-specific styles
  components: {
    // Button styles
    button: {
      primary: {
        backgroundColor: '#da4347',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        minHeight: 48,
      },
      secondary: {
        backgroundColor: '#f2f2f7',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        minHeight: 48,
        borderWidth: 1,
        borderColor: '#e9ecef',
      },
      text: {
        primary: {
          fontSize: 16,
          fontWeight: '600',
          color: '#ffffff',
        },
        secondary: {
          fontSize: 16,
          fontWeight: '600',
          color: '#da4347',
        },
      },
    },
    
    // Card styles
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    
    // Input styles
    input: {
      borderWidth: 1,
      borderColor: '#e9ecef',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: '#ffffff',
      minHeight: 48,
    },
    
    // Progress bar styles
    progressBar: {
      height: 8,
      backgroundColor: '#e9ecef',
      borderRadius: 4,
      overflow: 'hidden',
    },
    
    // Modal styles
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 20,
      margin: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

// Helper functions for consistent styling
export const createStyles = {
  // Text styles
  heading: (size: keyof typeof DesignSystem.typography.fontSize = 'xl') => ({
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.textPrimary,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
    lineHeight: DesignSystem.typography.lineHeight.tight,
  }),
  
  subheading: (size: keyof typeof DesignSystem.typography.fontSize = 'lg') => ({
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
    lineHeight: DesignSystem.typography.lineHeight.snug,
  }),
  
  body: (size: keyof typeof DesignSystem.typography.fontSize = 'base') => ({
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight.normal,
    color: DesignSystem.colors.textSecondary,
    lineHeight: DesignSystem.typography.lineHeight.normal,
  }),
  
  label: (size: keyof typeof DesignSystem.typography.fontSize = 'sm') => ({
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.textSecondary,
    lineHeight: DesignSystem.typography.lineHeight.snug,
  }),
  
  caption: () => ({
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.normal,
    color: DesignSystem.colors.textTertiary,
    lineHeight: DesignSystem.typography.lineHeight.tight,
  }),
  
  // Buddhist semantic text styles
  dharmaTitle: (size: keyof typeof DesignSystem.typography.fontSize = '2xl') => ({
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.textPrimary,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
    lineHeight: DesignSystem.typography.lineHeight.tight,
  }),
  
  practiceText: () => ({
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.textPrimary,
    lineHeight: DesignSystem.typography.lineHeight.relaxed,
  }),
  
  // Interactive text styles
  buttonText: (variant: 'primary' | 'secondary' = 'primary') => ({
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    letterSpacing: DesignSystem.typography.letterSpacing.tighter,
    color: variant === 'primary' ? DesignSystem.colors.textInverse : DesignSystem.colors.primary,
  }),
  
  linkText: () => ({
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.primary,
    letterSpacing: DesignSystem.typography.letterSpacing.normal,
  }),
  
  // Layout styles
  container: (padding: keyof typeof DesignSystem.spacing = 'lg') => ({
    flex: 1,
    padding: DesignSystem.spacing[padding],
    backgroundColor: DesignSystem.colors.background,
  }),
  
  card: (padding: keyof typeof DesignSystem.spacing = 'lg') => ({
    ...DesignSystem.components.card,
    padding: DesignSystem.spacing[padding],
  }),
  
  // Button styles
  primaryButton: () => ({
    ...DesignSystem.components.button.primary,
    ...DesignSystem.shadow.md,
  }),
  
  secondaryButton: () => ({
    ...DesignSystem.components.button.secondary,
    ...DesignSystem.shadow.sm,
  }),
};
