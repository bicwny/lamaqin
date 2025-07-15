
export const DesignSystem = {
  // Colors - Complete color system
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
    
    // Semantic colors
    cardBackground: '#ffffff',
    modalBackground: '#ffffff',
    overlayBackground: 'rgba(0, 0, 0, 0.5)',
    
    // Tab colors
    tabIconDefault: '#999999',
    tabIconSelected: '#da4347',
    
    // Icon colors
    icon: '#666666',
    
    // Theme-aware colors
    tint: '#da4347',
    surface: '#ffffff',
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
      '3xl': 32,
    },
    
    // Font weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.6,
    },
    
    // Letter spacing
    letterSpacing: {
      tight: -0.3,
      normal: 0,
      wide: 0.1,
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
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
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        minHeight: 48,
        borderWidth: 1,
        borderColor: '#da4347',
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
  }),
  
  body: (size: keyof typeof DesignSystem.typography.fontSize = 'base') => ({
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight.normal,
    color: DesignSystem.colors.textSecondary,
    lineHeight: DesignSystem.typography.lineHeight.normal,
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
