
export const DesignSystem = {
  // Opacity scale for consistent transparency
  opacity: {
    5: 0.05,    // Subtle overlays
    10: 0.1,    // Light backgrounds
    20: 0.2,    // Card shadows
    50: 0.5,    // Modal overlays
    80: 0.8,    // Active states
    90: 0.9,    // Pressed states
  },

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
    
    // Buddhist semantic colors - The Five Taras
    redTara: '#da4347',             // The Red Tara - Primary practice energy
    orangeTara: '#FF6B35',          // The Orange Tara - Mindfulness and compassion
    yellowTara: '#D4AF37',          // The Yellow Tara - Study achievements and wisdom
    blueTara: '#4A90E2',            // The Blue Tara - Deep contemplation
    enlightenmentWhite: '#ffffff',  // Purity and clarity
    
    // Practice status colors with Buddhist meaning
    greenTara: '#2e7d32',           // The Green Tara - Completed practice and growth
    practiceActive: '#da4347',      // Active practice (Red Tara)
    practiceInactive: '#999999',    // Inactive practice
    studyProgress: '#4A90E2',       // Learning progress (Blue Tara)
    mindfulnessAlert: '#f59e0b',    // Mindful attention needed
    mindfulnessCalm: '#4A90E2',     // Calm meditation state (Blue Tara)
    
    // Extended Buddhist contextual colors - Tara variations
    redTaraLight: '#e66a6d',        // Light Red Tara for hover states
    redTaraDark: '#b8393d',         // Dark Red Tara for pressed states
    orangeTaraLight: '#FF8C5A',     // Light Orange Tara for gentle states
    yellowTaraLight: '#E6C757',     // Light Yellow Tara for progress indicators
    blueTaraLight: '#6BA3F0',       // Light Blue Tara for calm states
    
    // Success state variations - Green Tara
    successBackground: '#e8f5e8',   // Light Green Tara background
    successBorder: '#2e7d32',       // Green Tara border
    
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
  
  // Component-specific design tokens
  components: {
    // Button component tokens
    button: {
      // Primary buttons (main actions)
      primary: {
        backgroundColor: '#da4347',  // Will reference colors.primary
        paddingVertical: 16,         // Will reference spacing.lg
        paddingHorizontal: 20,       // Will reference spacing.xl
        borderRadius: 12,            // Will reference borderRadius.lg
        minHeight: 48,
        fontSize: 16,                // Will reference typography.fontSize.base
        fontWeight: '700',           // Will reference typography.fontWeight.bold
        color: '#ffffff',            // Will reference colors.textInverse
        letterSpacing: -0.2,         // Will reference typography.letterSpacing.tighter
      },
      
      // Secondary buttons (outline style)
      secondary: {
        backgroundColor: '#ffffff',  // Will reference colors.backgroundSecondary
        paddingVertical: 16,         // Will reference spacing.lg
        paddingHorizontal: 20,       // Will reference spacing.xl
        borderRadius: 12,            // Will reference borderRadius.lg
        borderWidth: 1.5,
        borderColor: '#da4347',      // Will reference colors.primary
        minHeight: 48,
        fontSize: 14,                // Will reference typography.fontSize.sm
        fontWeight: '600',           // Will reference typography.fontWeight.semibold
        color: '#da4347',            // Will reference colors.primary
        letterSpacing: -0.1,         // Will reference typography.letterSpacing.normal
      },
      
      // Small action buttons (secondary actions)
      small: {
        backgroundColor: '#f8f9fa',  // Will reference colors.background
        paddingVertical: 10,         // Will reference spacing.base
        paddingHorizontal: 12,       // Will reference spacing.md
        borderRadius: 8,             // Will reference borderRadius.md
        borderWidth: 1,
        borderColor: '#e9ecef',      // Will reference colors.border
        minHeight: 36,
        fontSize: 14,                // Will reference typography.fontSize.sm
        fontWeight: '500',           // Will reference typography.fontWeight.medium
        color: '#666666',            // Will reference colors.textSecondary
      },
      
      // Text-only buttons (links, minimal actions)
      text: {
        backgroundColor: 'transparent',
        paddingVertical: 8,          // Will reference spacing.sm
        paddingHorizontal: 12,       // Will reference spacing.md
        borderRadius: 6,             // Will reference spacing.xxs
        fontSize: 14,                // Will reference typography.fontSize.sm
        fontWeight: '600',           // Will reference typography.fontWeight.semibold
        color: '#da4347',            // Will reference colors.primary
      },
      
      // Buddhist practice specific buttons
      dharma: {
        backgroundColor: '#da4347',  // dharmaRed
        paddingVertical: 16,         // Will reference spacing.lg
        paddingHorizontal: 24,       // Will reference spacing.2xl
        borderRadius: 12,            // Will reference borderRadius.lg
        minHeight: 48,
        fontSize: 16,                // Will reference typography.fontSize.base
        fontWeight: '700',           // Will reference typography.fontWeight.bold
        color: '#ffffff',            // Will reference colors.textInverse
        letterSpacing: -0.2,         // Will reference typography.letterSpacing.tighter
      },
    },

    // Card component tokens
    card: {
      // Standard content cards
      standard: {
        backgroundColor: '#ffffff',  // Will reference colors.backgroundSecondary
        borderRadius: 12,            // Will reference borderRadius.lg
        padding: 20,                 // Will reference spacing.xl
        marginHorizontal: 16,        // Will reference spacing.lg
        marginVertical: 8,           // Will reference spacing.sm
        shadowColor: '#000',         // Will reference colors.cardShadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.04)',
      },
      
      // Practice project cards
      practice: {
        backgroundColor: '#ffffff',  // Will reference colors.backgroundSecondary
        borderRadius: 12,            // Will reference borderRadius.lg
        padding: 16,                 // Will reference spacing.lg
        marginHorizontal: 16,        // Will reference spacing.lg
        marginVertical: 6,           // Will reference spacing.xxs
        shadowColor: '#000',         // Will reference colors.cardShadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',      // Will reference colors.borderLight
      },
      
      // Course cards
      course: {
        backgroundColor: '#ffffff',  // Will reference colors.backgroundSecondary
        borderRadius: 16,            // Will reference borderRadius.xl
        padding: 20,                 // Will reference spacing.xl
        marginHorizontal: 16,        // Will reference spacing.lg
        marginVertical: 8,           // Will reference spacing.sm
        shadowColor: '#000',         // Will reference colors.cardShadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#f8f9fa',      // Will reference colors.background
      },
      
      // Status/completion cards
      status: {
        backgroundColor: '#e8f5e8',  // Will reference colors.successBackground
        borderRadius: 12,            // Will reference borderRadius.lg
        padding: 12,                 // Will reference spacing.md
        marginHorizontal: 16,        // Will reference spacing.lg
        marginVertical: 4,           // Will reference spacing.xs
        borderWidth: 1,
        borderColor: '#2e7d32',      // Will reference colors.practiceComplete
      },
    },

    // Input component tokens
    input: {
      // Standard text inputs
      standard: {
        borderWidth: 1,
        borderColor: '#e9ecef',      // Will reference colors.border
        borderRadius: 8,             // Will reference borderRadius.md
        paddingHorizontal: 12,       // Will reference spacing.md
        paddingVertical: 12,         // Will reference spacing.md
        fontSize: 16,                // Will reference typography.fontSize.base
        fontWeight: '400',           // Will reference typography.fontWeight.normal
        color: '#1a1a1a',            // Will reference colors.textPrimary
        backgroundColor: '#ffffff',  // Will reference colors.backgroundSecondary
        minHeight: 48,
        lineHeight: 24,              // Will reference typography.lineHeight.normal * fontSize
      },
      
      // Search inputs
      search: {
        borderWidth: 1,
        borderColor: '#f0f0f0',      // Will reference colors.borderLight
        borderRadius: 12,            // Will reference borderRadius.lg
        paddingHorizontal: 16,       // Will reference spacing.lg
        paddingVertical: 10,         // Will reference spacing.base
        fontSize: 16,                // Will reference typography.fontSize.base
        fontWeight: '400',           // Will reference typography.fontWeight.normal
        color: '#1a1a1a',            // Will reference colors.textPrimary
        backgroundColor: '#f8f9fa',  // Will reference colors.background
        minHeight: 44,
      },
      
      // Multiline text areas
      textarea: {
        borderWidth: 1,
        borderColor: '#e9ecef',      // Will reference colors.border
        borderRadius: 8,             // Will reference borderRadius.md
        paddingHorizontal: 12,       // Will reference spacing.md
        paddingVertical: 12,         // Will reference spacing.md
        fontSize: 16,                // Will reference typography.fontSize.base
        fontWeight: '400',           // Will reference typography.fontWeight.normal
        color: '#1a1a1a',            // Will reference colors.textPrimary
        backgroundColor: '#ffffff',  // Will reference colors.backgroundSecondary
        minHeight: 80,
        lineHeight: 24,              // Will reference typography.lineHeight.normal * fontSize
        textAlignVertical: 'top',
      },
    },

    // Progress component tokens
    progress: {
      // Standard progress bars
      bar: {
        container: {
          height: 8,                 // Will reference spacing.sm
          backgroundColor: '#e9ecef', // Will reference colors.border
          borderRadius: 4,           // Will reference borderRadius.sm
          overflow: 'hidden',
        },
        fill: {
          height: '100%',
          backgroundColor: '#da4347', // Will reference colors.primary
          borderRadius: 4,           // Will reference borderRadius.sm
        },
      },
      
      // Course progress (thicker)
      course: {
        container: {
          height: 12,                // Will reference spacing.md
          backgroundColor: '#f0f0f0', // Will reference colors.borderLight
          borderRadius: 6,           // Will reference spacing.xxs
          overflow: 'hidden',
        },
        fill: {
          height: '100%',
          backgroundColor: '#4A90E2', // Will reference colors.studyProgress
          borderRadius: 6,           // Will reference spacing.xxs
        },
      },
      
      // Buddhist practice progress (special styling)
      practice: {
        container: {
          height: 10,                // Will reference spacing.base
          backgroundColor: '#f8f9fa', // Will reference colors.background
          borderRadius: 5,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#e9ecef',    // Will reference colors.border
        },
        fill: {
          height: '100%',
          backgroundColor: '#da4347', // Will reference colors.dharmaRed
          borderRadius: 4,           // Will reference borderRadius.sm
        },
      },
    },

    // Modal component tokens - Consolidated
    modal: {
      // Dialog modals (replaces standard + alert)
      dialog: {
        backgroundColor: '#ffffff',  // Will reference colors.backgroundSecondary
        borderRadius: 12,            // Will reference borderRadius.lg
        shadowColor: '#000',         // Will reference colors.cardShadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        // Size-based spacing handled by component
      },
      
      // Full-screen modals
      fullscreen: {
        backgroundColor: '#f8f9fa',  // Will reference colors.background
        borderRadius: 0,
        padding: 0,
      },
    },

    // Modal overlay utility (separated from modal variants)
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Will reference colors.overlayDark
    },

    // Header component tokens
    header: {
      // Page headers
      page: {
        backgroundColor: '#ffffff',  // Will reference colors.backgroundSecondary
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0', // Will reference colors.borderLight
        paddingHorizontal: 16,       // Will reference spacing.lg
        paddingVertical: 12,         // Will reference spacing.md
        minHeight: 60,
      },
      
      // Modal headers
      modal: {
        backgroundColor: '#ffffff',  // Will reference colors.backgroundSecondary
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef', // Will reference colors.border
        paddingHorizontal: 16,       // Will reference spacing.lg
        paddingVertical: 12,         // Will reference spacing.md
        minHeight: 56,
      },
      
      // Section headers
      section: {
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        paddingVertical: 8,          // Will reference spacing.sm
        marginBottom: 16,            // Will reference spacing.lg
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0', // Will reference colors.borderLight
      },
    },

    // Buddhist-specific component tokens
    buddhist: {
      // Red Tara practice cards
      redTaraCard: {
        backgroundColor: '#ffffff',  // Will reference colors.backgroundSecondary
        borderRadius: 12,            // Will reference borderRadius.lg
        padding: 20,                 // Will reference spacing.xl
        marginHorizontal: 16,        // Will reference spacing.lg
        marginVertical: 8,           // Will reference spacing.sm
        borderLeftWidth: 4,
        borderLeftColor: '#da4347',  // Will reference colors.redTara
        shadowColor: '#000',         // Will reference colors.cardShadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      },
      
      // Blue Tara meditation session cards
      blueTaraCard: {
        backgroundColor: '#ffffff',  // Will reference colors.backgroundSecondary
        borderRadius: 16,            // Will reference borderRadius.xl
        padding: 20,                 // Will reference spacing.xl
        marginHorizontal: 16,        // Will reference spacing.lg
        marginVertical: 8,           // Will reference spacing.sm
        borderWidth: 2,
        borderColor: '#4A90E2',      // Will reference colors.blueTara
        shadowColor: '#4A90E2',      // Will reference colors.blueTara
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
      
      // Yellow Tara wisdom achievement badges
      yellowTaraBadge: {
        backgroundColor: '#D4AF37',  // Will reference colors.yellowTara
        borderRadius: 20,            // Will reference spacing.xl
        paddingHorizontal: 12,       // Will reference spacing.md
        paddingVertical: 4,          // Will reference spacing.xs
        shadowColor: '#D4AF37',      // Will reference colors.yellowTara
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
      },
      
      // Green Tara completion status indicators
      greenTaraBadge: {
        backgroundColor: '#e8f5e8',  // Will reference colors.successBackground
        borderRadius: 12,            // Will reference borderRadius.lg
        paddingHorizontal: 12,       // Will reference spacing.md
        paddingVertical: 4,          // Will reference spacing.xs
        borderWidth: 1,
        borderColor: '#2e7d32',      // Will reference colors.greenTara
      },

      // Green Tara completed practice badge (top-right indicator)
      completedBadge: {
        backgroundColor: '#e8f5e8',  // Will reference colors.successBackground
        borderRadius: 8,             // Will reference borderRadius.md
        paddingHorizontal: 8,        // Will reference spacing.sm
        paddingVertical: 4,          // Will reference spacing.xs
        borderWidth: 1,
        borderColor: '#2e7d32',      // Will reference colors.greenTara
        alignSelf: 'flex-start',
      },
    },
  },
};

// Color-with-opacity utility functions
export const colorWithOpacity = {
  // Background color with opacity
  backgroundWithOpacity: (color: string, opacity: keyof typeof DesignSystem.opacity): string => {
    const opacityValue = DesignSystem.opacity[opacity];
    const alpha = Math.round(opacityValue * 255).toString(16).padStart(2, '0');
    return `${color}${alpha}`;
  },

  // Text color with opacity  
  textWithOpacity: (color: string, opacity: keyof typeof DesignSystem.opacity): string => {
    const opacityValue = DesignSystem.opacity[opacity];
    const alpha = Math.round(opacityValue * 255).toString(16).padStart(2, '0');
    return `${color}${alpha}`;
  },

  // Overlay color with opacity
  overlayWithOpacity: (color: string, opacity: keyof typeof DesignSystem.opacity): string => {
    const opacityValue = DesignSystem.opacity[opacity];
    const alpha = Math.round(opacityValue * 255).toString(16).padStart(2, '0');
    return `${color}${alpha}`;
  },

  // Border color with opacity
  borderWithOpacity: (color: string, opacity: keyof typeof DesignSystem.opacity): string => {
    const opacityValue = DesignSystem.opacity[opacity];
    const alpha = Math.round(opacityValue * 255).toString(16).padStart(2, '0');
    return `${color}${alpha}`;
  },

  // Buddhist semantic colors with opacity variants - The Five Taras
  buddhist: {
    redTaraWithOpacity: (opacity: keyof typeof DesignSystem.opacity): string => {
      return colorWithOpacity.backgroundWithOpacity(DesignSystem.colors.redTara, opacity);
    },
    
    orangeTaraWithOpacity: (opacity: keyof typeof DesignSystem.opacity): string => {
      return colorWithOpacity.backgroundWithOpacity(DesignSystem.colors.orangeTara, opacity);
    },
    
    yellowTaraWithOpacity: (opacity: keyof typeof DesignSystem.opacity): string => {
      return colorWithOpacity.backgroundWithOpacity(DesignSystem.colors.yellowTara, opacity);
    },
    
    blueTaraWithOpacity: (opacity: keyof typeof DesignSystem.opacity): string => {
      return colorWithOpacity.backgroundWithOpacity(DesignSystem.colors.blueTara, opacity);
    },

    greenTaraWithOpacity: (opacity: keyof typeof DesignSystem.opacity): string => {
      return colorWithOpacity.backgroundWithOpacity(DesignSystem.colors.greenTara, opacity);
    },

    practiceActiveOverlay: (opacity: keyof typeof DesignSystem.opacity): string => {
      return colorWithOpacity.overlayWithOpacity(DesignSystem.colors.practiceActive, opacity);
    },

    practiceCompleteBackground: (opacity: keyof typeof DesignSystem.opacity): string => {
      return colorWithOpacity.backgroundWithOpacity(DesignSystem.colors.greenTara, opacity);
    },
  },
};

// Helper functions for consistent styling with automatic line heights
export const createStyles = {
  // Text styles with automatic line height calculations
  heading: (size: keyof typeof DesignSystem.typography.fontSize = 'xl') => ({
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.textPrimary,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
    lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.tight,
  }),
  
  subheading: (size: keyof typeof DesignSystem.typography.fontSize = 'lg') => ({
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
    lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.snug,
  }),
  
  body: (size: keyof typeof DesignSystem.typography.fontSize = 'base') => ({
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight.normal,
    color: DesignSystem.colors.textSecondary,
    lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.normal,
  }),
  
  label: (size: keyof typeof DesignSystem.typography.fontSize = 'sm') => ({
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.textSecondary,
    lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.snug,
  }),
  
  caption: () => ({
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.normal,
    color: DesignSystem.colors.textTertiary,
    lineHeight: DesignSystem.typography.fontSize.xs * DesignSystem.typography.lineHeight.tight,
  }),
  
  // Buddhist semantic text styles with automatic line heights
  redTaraTitle: (size: keyof typeof DesignSystem.typography.fontSize = '2xl') => ({
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.textPrimary,
    letterSpacing: DesignSystem.typography.letterSpacing.tight,
    lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.tight,
  }),
  
  practiceText: (size: keyof typeof DesignSystem.typography.fontSize = 'base') => ({
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.textPrimary,
    lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.relaxed,
  }),
  
  // Interactive text styles with automatic line heights
  buttonText: (variant: 'primary' | 'secondary' = 'primary') => ({
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    letterSpacing: DesignSystem.typography.letterSpacing.tighter,
    color: variant === 'primary' ? DesignSystem.colors.textInverse : DesignSystem.colors.primary,
    lineHeight: DesignSystem.typography.fontSize.base * DesignSystem.typography.lineHeight.tight,
  }),
  
  linkText: (size: keyof typeof DesignSystem.typography.fontSize = 'base') => ({
    fontSize: DesignSystem.typography.fontSize[size],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.primary,
    letterSpacing: DesignSystem.typography.letterSpacing.normal,
    lineHeight: DesignSystem.typography.fontSize[size] * DesignSystem.typography.lineHeight.tight,
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
