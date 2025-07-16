
/**
 * Component Migration Templates
 * Provides systematic templates for migrating components to use DesignSystem tokens
 */

import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTokens, ComponentTextStyles, componentHelpers } from '@/utils/componentTokens';
import { Typography } from '@/utils/typography';
import { colorMigrationMap } from '@/utils/colorMigration';
import { spacingMigrationMap, spacingHelpers } from '@/utils/spacingMigration';

// Migration templates for common component patterns
export const MigrationTemplates = {
  // Button migration templates - Updated for consolidated system
  button: {
    // Primary button template (medium size)
    primary: {
      // Old pattern (what to replace)
      oldPattern: {
        backgroundColor: '#da4347',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
      },
      // New pattern (what to replace with)
      newPattern: {
        ...componentHelpers.getButtonStyle('primary', 'medium'),
      },
      // Helper function
      apply: () => componentHelpers.getButtonStyle('primary', 'medium'),
      textStyle: () => componentHelpers.getButtonTextStyle('primary', 'medium'),
    },
    
    // Secondary button template (medium size)
    secondary: {
      oldPattern: {
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#da4347',
        fontSize: 16,
        fontWeight: '600',
        color: '#da4347',
      },
      newPattern: {
        ...componentHelpers.getButtonStyle('secondary', 'medium'),
      },
      apply: () => componentHelpers.getButtonStyle('secondary', 'medium'),
      textStyle: () => componentHelpers.getButtonTextStyle('secondary', 'medium'),
    },
    
    // Small button template (migrates to secondary + small size)
    small: {
      oldPattern: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
        fontSize: 14,
        fontWeight: '500',
      },
      newPattern: {
        ...componentHelpers.getButtonStyle('secondary', 'small'),
      },
      apply: () => componentHelpers.getButtonStyle('secondary', 'small'),
      textStyle: () => componentHelpers.getButtonTextStyle('secondary', 'small'),
    },
    
    // Text button template (migrates to ghost + medium size)
    text: {
      oldPattern: {
        backgroundColor: 'transparent',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        fontSize: 14,
        fontWeight: '600',
        color: '#da4347',
      },
      newPattern: {
        ...componentHelpers.getButtonStyle('ghost', 'medium'),
      },
      apply: () => componentHelpers.getButtonStyle('ghost', 'medium'),
      textStyle: () => componentHelpers.getButtonTextStyle('ghost', 'medium'),
    },
    
    // Dharma button template (migrates to primary + large size)
    dharma: {
      oldPattern: {
        backgroundColor: '#da4347',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
      },
      newPattern: {
        ...componentHelpers.getButtonStyle('primary', 'large'),
      },
      apply: () => componentHelpers.getButtonStyle('primary', 'large'),
      textStyle: () => componentHelpers.getButtonTextStyle('primary', 'large'),
    },
    
    // New consolidated system templates
    consolidated: {
      primarySmall: {
        apply: () => componentHelpers.getButtonStyle('primary', 'small'),
        textStyle: () => componentHelpers.getButtonTextStyle('primary', 'small'),
      },
      primaryMedium: {
        apply: () => componentHelpers.getButtonStyle('primary', 'medium'),
        textStyle: () => componentHelpers.getButtonTextStyle('primary', 'medium'),
      },
      primaryLarge: {
        apply: () => componentHelpers.getButtonStyle('primary', 'large'),
        textStyle: () => componentHelpers.getButtonTextStyle('primary', 'large'),
      },
      secondarySmall: {
        apply: () => componentHelpers.getButtonStyle('secondary', 'small'),
        textStyle: () => componentHelpers.getButtonTextStyle('secondary', 'small'),
      },
      secondaryMedium: {
        apply: () => componentHelpers.getButtonStyle('secondary', 'medium'),
        textStyle: () => componentHelpers.getButtonTextStyle('secondary', 'medium'),
      },
      secondaryLarge: {
        apply: () => componentHelpers.getButtonStyle('secondary', 'large'),
        textStyle: () => componentHelpers.getButtonTextStyle('secondary', 'large'),
      },
      ghostSmall: {
        apply: () => componentHelpers.getButtonStyle('ghost', 'small'),
        textStyle: () => componentHelpers.getButtonTextStyle('ghost', 'small'),
      },
      ghostMedium: {
        apply: () => componentHelpers.getButtonStyle('ghost', 'medium'),
        textStyle: () => componentHelpers.getButtonTextStyle('ghost', 'medium'),
      },
      ghostLarge: {
        apply: () => componentHelpers.getButtonStyle('ghost', 'large'),
        textStyle: () => componentHelpers.getButtonTextStyle('ghost', 'large'),
      },
    },
        color: '#666666',
      },
      newPattern: {
        ...ComponentTokens.button.small,
        ...ComponentTextStyles.button.small,
      },
      apply: () => componentHelpers.getButtonStyle('small'),
    },
  },

  // Card migration templates
  card: {
    // Standard card template
    standard: {
      oldPattern: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      },
      newPattern: ComponentTokens.card.standard,
      apply: () => componentHelpers.getCardStyle('standard'),
    },
    
    // Practice card template
    practice: {
      oldPattern: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      },
      newPattern: ComponentTokens.card.practice,
      apply: () => componentHelpers.getCardStyle('practice'),
    },
  },

  // Input migration templates
  input: {
    // Standard input template
    standard: {
      oldPattern: {
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        fontWeight: '400',
        color: '#1a1a1a',
        backgroundColor: '#ffffff',
      },
      newPattern: ComponentTokens.input.standard,
      apply: () => ComponentTokens.input.standard,
    },
    
    // Search input template
    search: {
      oldPattern: {
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#f8f9fa',
      },
      newPattern: ComponentTokens.input.search,
      apply: () => ComponentTokens.input.search,
    },
  },

  // Text style migration templates
  text: {
    // Page title template
    pageTitle: {
      oldPattern: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 16,
      },
      newPattern: {
        ...Typography.components.practiceDetail.title,
        marginBottom: DesignSystem.spacing.lg,
      },
      apply: () => Typography.styles.heading('2xl'),
    },
    
    // Section title template
    sectionTitle: {
      oldPattern: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
      },
      newPattern: {
        ...Typography.components.practiceDetail.sectionTitle,
        marginBottom: DesignSystem.spacing.md,
      },
      apply: () => Typography.styles.subheading('lg'),
    },
    
    // Body text template
    bodyText: {
      oldPattern: {
        fontSize: 16,
        fontWeight: '400',
        color: '#666666',
        lineHeight: 24,
      },
      newPattern: Typography.components.practiceDetail.description,
      apply: () => Typography.styles.body('base'),
    },
    
    // Label template
    label: {
      oldPattern: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666666',
        marginBottom: 8,
      },
      newPattern: {
        ...Typography.components.practiceDetail.label,
        marginBottom: DesignSystem.spacing.sm,
      },
      apply: () => Typography.styles.label('sm'),
    },
  },

  // Layout migration templates
  layout: {
    // Page container template
    pageContainer: {
      oldPattern: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
      },
      newPattern: {
        flex: 1,
        backgroundColor: DesignSystem.colors.background,
        padding: DesignSystem.spacing.xl,
      },
      apply: () => Typography.styles.container('xl'),
    },
    
    // Section container template
    sectionContainer: {
      oldPattern: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      },
      newPattern: {
        backgroundColor: DesignSystem.colors.backgroundSecondary,
        borderRadius: DesignSystem.borderRadius.lg,
        padding: DesignSystem.spacing.lg,
        marginBottom: DesignSystem.spacing.lg,
      },
      apply: () => ({
        backgroundColor: DesignSystem.colors.backgroundSecondary,
        borderRadius: DesignSystem.borderRadius.lg,
        padding: DesignSystem.spacing.lg,
        marginBottom: DesignSystem.spacing.lg,
      }),
    },
  },

  // Progress bar migration templates
  progress: {
    // Standard progress bar template
    bar: {
      oldPattern: {
        height: 8,
        backgroundColor: '#e9ecef',
        borderRadius: 4,
        overflow: 'hidden',
      },
      newPattern: ComponentTokens.progress.bar.container,
      apply: () => componentHelpers.getProgressStyle('bar'),
    },
    
    // Progress fill template
    fill: {
      oldPattern: {
        height: '100%',
        backgroundColor: '#da4347',
        borderRadius: 4,
      },
      newPattern: ComponentTokens.progress.bar.fill,
      apply: () => ComponentTokens.progress.bar.fill,
    },
  },

  // Modal migration templates
  modal: {
    // Standard modal template
    standard: {
      oldPattern: {
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
      newPattern: ComponentTokens.modal.standard,
      apply: () => componentHelpers.getModalStyle('standard'),
    },
    
    // Modal overlay template
    overlay: {
      oldPattern: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      newPattern: ComponentTokens.modal.overlay,
      apply: () => ComponentTokens.modal.overlay,
    },
  },
};

// Migration utilities
export const MigrationUtils = {
  // Check if a style object matches an old pattern
  matchesOldPattern: (styleObject: any, template: any): boolean => {
    if (!template.oldPattern) return false;
    
    const oldPattern = template.oldPattern;
    const matches = Object.keys(oldPattern).every(key => {
      return styleObject[key] === oldPattern[key];
    });
    
    return matches;
  },
  
  // Replace old pattern with new pattern
  replaceWithNewPattern: (styleObject: any, template: any): any => {
    if (!template.newPattern) return styleObject;
    
    // Remove old pattern properties
    const newStyle = { ...styleObject };
    if (template.oldPattern) {
      Object.keys(template.oldPattern).forEach(key => {
        delete newStyle[key];
      });
    }
    
    // Add new pattern properties
    return { ...newStyle, ...template.newPattern };
  },
  
  // Apply template helper function
  applyTemplate: (template: any): any => {
    if (template.apply && typeof template.apply === 'function') {
      return template.apply();
    }
    return template.newPattern || {};
  },
  
  // Migrate hardcoded colors
  migrateColors: (styleObject: any): any => {
    const migratedStyle = { ...styleObject };
    
    Object.keys(migratedStyle).forEach(key => {
      const value = migratedStyle[key];
      if (typeof value === 'string' && colorMigrationMap[value]) {
        migratedStyle[key] = colorMigrationMap[value];
      }
    });
    
    return migratedStyle;
  },
  
  // Migrate hardcoded spacing
  migrateSpacing: (styleObject: any): any => {
    const migratedStyle = { ...styleObject };
    
    Object.keys(migratedStyle).forEach(key => {
      const value = migratedStyle[key];
      if (typeof value === 'number' && spacingMigrationMap[value]) {
        migratedStyle[key] = spacingMigrationMap[value];
      }
    });
    
    return migratedStyle;
  },
  
  // Full migration - colors, spacing, and patterns
  fullMigration: (styleObject: any): any => {
    let migratedStyle = MigrationUtils.migrateColors(styleObject);
    migratedStyle = MigrationUtils.migrateSpacing(migratedStyle);
    
    // Check for pattern matches and apply templates
    Object.values(MigrationTemplates).forEach(categoryTemplates => {
      Object.values(categoryTemplates).forEach(template => {
        if (MigrationUtils.matchesOldPattern(migratedStyle, template)) {
          migratedStyle = MigrationUtils.replaceWithNewPattern(migratedStyle, template);
        }
      });
    });
    
    return migratedStyle;
  },
};

// File-specific migration templates
export const FileMigrationTemplates = {
  // Practice detail screen specific templates
  practiceDetail: {
    container: {
      oldPattern: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
      },
      newPattern: {
        flex: 1,
        backgroundColor: DesignSystem.colors.background,
        padding: DesignSystem.spacing.xl,
      },
    },
    
    practiceCard: {
      oldPattern: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
      },
      newPattern: ComponentTokens.card.practice,
    },
    
    primaryButton: {
      oldPattern: {
        backgroundColor: '#da4347',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
      },
      newPattern: ComponentTokens.button.primary,
    },
    
    buttonText: {
      oldPattern: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
      },
      newPattern: ComponentTextStyles.button.primary,
    },
  },
  
  // Modal template specific templates
  modalTemplate: {
    overlay: {
      oldPattern: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      newPattern: ComponentTokens.modal.overlay,
    },
    
    container: {
      oldPattern: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        margin: 20,
      },
      newPattern: ComponentTokens.modal.standard,
    },
  },
  
  // Study screen specific templates
  studyScreen: {
    courseCard: {
      oldPattern: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
      },
      newPattern: ComponentTokens.card.course,
    },
    
    progressBar: {
      oldPattern: {
        height: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        overflow: 'hidden',
      },
      newPattern: ComponentTokens.progress.course.container,
    },
  },
};

// Import replacement templates
export const ImportReplacements = {
  // Old import patterns to replace
  oldImports: [
    "import { Colors } from '@/constants/Colors';",
    "import Colors from '@/constants/Colors';",
    "import { Colors } from '../constants/Colors';",
    "import Colors from '../constants/Colors';",
  ],
  
  // New import patterns
  newImports: [
    "import { DesignSystem } from '@/constants/DesignSystem';",
    "import { ComponentTokens, ComponentTextStyles } from '@/utils/componentTokens';",
    "import { Typography } from '@/utils/typography';",
  ],
  
  // Color reference replacements
  colorReplacements: {
    'Colors.light.text': 'DesignSystem.colors.textPrimary',
    'Colors.light.background': 'DesignSystem.colors.background',
    'Colors.light.tint': 'DesignSystem.colors.primary',
    'Colors.light.tabIconDefault': 'DesignSystem.colors.textTertiary',
    'Colors.light.tabIconSelected': 'DesignSystem.colors.primary',
    'Colors.dark.text': 'DesignSystem.colors.textInverse',
    'Colors.dark.background': 'DesignSystem.colors.backgroundSecondary',
    'Colors.primary': 'DesignSystem.colors.primary',
    'Colors.secondary': 'DesignSystem.colors.textSecondary',
    'Colors.background': 'DesignSystem.colors.background',
    'Colors.white': 'DesignSystem.colors.backgroundSecondary',
    'Colors.black': 'DesignSystem.colors.textPrimary',
  },
};

// Export all migration utilities
export default MigrationTemplates;
