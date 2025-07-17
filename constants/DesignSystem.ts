
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
      // Dharma practice cards
      dharmaCard: {
        backgroundColor: '#ffffff',  // Will reference colors.backgroundSecondary
        borderRadius: 12,            // Will reference borderRadius.lg
        padding: 20,                 // Will reference spacing.xl
        marginHorizontal: 16,        // Will reference spacing.lg
        marginVertical: 8,           // Will reference spacing.sm
        borderLeftWidth: 4,
        borderLeftColor: '#da4347',  // Will reference colors.dharmaRed
        shadowColor: '#000',         // Will reference colors.cardShadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      },
      
      // Meditation session cards
      meditationCard: {
        backgroundColor: '#ffffff',  // Will reference colors.backgroundSecondary
        borderRadius: 16,            // Will reference borderRadius.xl
        padding: 20,                 // Will reference spacing.xl
        marginHorizontal: 16,        // Will reference spacing.lg
        marginVertical: 8,           // Will reference spacing.sm
        borderWidth: 2,
        borderColor: '#4A90E2',      // Will reference colors.meditationBlue
        shadowColor: '#4A90E2',      // Will reference colors.meditationBlue
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
      
      // Wisdom achievement badges
      wisdomBadge: {
        backgroundColor: '#D4AF37',  // Will reference colors.wisdomGold
        borderRadius: 20,            // Will reference spacing.xl
        paddingHorizontal: 12,       // Will reference spacing.md
        paddingVertical: 4,          // Will reference spacing.xs
        shadowColor: '#D4AF37',      // Will reference colors.wisdomGold
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
      },
      
      // Completion status indicators
      completionBadge: {
        backgroundColor: '#e8f5e8',  // Will reference colors.successBackground
        borderRadius: 12,            // Will reference borderRadius.lg
        paddingHorizontal: 12,       // Will reference spacing.md
        paddingVertical: 4,          // Will reference spacing.xs
        borderWidth: 1,
        borderColor: '#2e7d32',      // Will reference colors.practiceComplete
      },

      // Completed practice badge (top-right indicator)
      completedBadge: {
        backgroundColor: '#e8f5e8',  // Will reference colors.successBackground
        borderRadius: 8,             // Will reference borderRadius.md
        paddingHorizontal: 8,        // Will reference spacing.sm
        paddingVertical: 4,          // Will reference spacing.xs
        borderWidth: 1,
        borderColor: '#2e7d32',      // Will reference colors.practiceComplete
        alignSelf: 'flex-start',
      },
    },
  },
};

// Helper functions for consistent styling with automatic line heights
export const createStyles = {
  // Text styles with automatic line height calculations
  heading: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize = 'xl') => ({
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
  }),
  
  subheading: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize = 'lg') => ({
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.snug,
  }),
  
  body: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize = 'base') => ({
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.normal,
  }),
  
  label: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize = 'sm') => ({
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.snug,
  }),
  
  caption: () => ({
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs,
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.normal,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.xs * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
  }),
  
  // Buddhist semantic text styles with automatic line heights
  dharmaTitle: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize = '2xl') => ({
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tight,
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
  }),
  
  practiceText: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize = 'base') => ({
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.relaxed,
  }),
  
  // Interactive text styles with automatic line heights
  buttonText: (variant: 'primary' | 'secondary' = 'primary') => ({
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base,
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,
    letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.tighter,
    color: variant === 'primary' ? ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-inverse"] : ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
  }),
  
  linkText: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.typography.fontSize = 'base') => ({
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size],
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
    color: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
    letterSpacing: ConsolidatedConsolidatedDesignSystem.typography.letterSpacing.normal,
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.fontSize[size] * ConsolidatedConsolidatedDesignSystem.typography.lineHeight.tight,
  }),
  
  // Layout styles
  container: (padding: keyof typeof ConsolidatedConsolidatedDesignSystem.spacing = 'lg') => ({
    flex: 1,
    padding: ConsolidatedConsolidatedDesignSystem.spacing[padding],
    backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
  }),
  
  card: (padding: keyof typeof ConsolidatedConsolidatedDesignSystem.spacing = 'lg') => ({
    ...ConsolidatedConsolidatedDesignSystem.components.card,
    padding: ConsolidatedConsolidatedDesignSystem.spacing[padding],
  }),
  
  // Button styles
  primaryButton: () => ({
    ...ConsolidatedConsolidatedDesignSystem.components.button.primary,
    ...ConsolidatedConsolidatedDesignSystem.shadow.md,
  }),
  
  secondaryButton: () => ({
    ...ConsolidatedConsolidatedDesignSystem.components.button.secondary,
    ...ConsolidatedConsolidatedDesignSystem.shadow.sm,
  }),
};
