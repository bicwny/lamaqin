
/**
 * File Migration Helpers
 * Provides systematic migration assistance for specific files
 */

import { MigrationTemplates, MigrationUtils, FileMigrationTemplates, ImportReplacements } from './migrationTemplates';

// Practice detail migration helper
export const PracticeDetailMigration = {
  // Import transformations
  imports: {
    old: [
      "import { Colors } from '@/constants/Colors';",
      "import Colors from '@/constants/Colors';",
    ],
    new: [
      "import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';",
      "import { ComponentTokens, ComponentTextStyles, componentHelpers } from '@/utils/componentTokens';",
      "import { Typography } from '@/utils/typography';",
    ],
  },
  
  // Style transformations
  styles: {
    // Page container
    container: {
      old: `
        container: {
          flex: 1,
          backgroundColor: '#f8f9fa',
          padding: 20,
        },
      `,
      new: `
        container: {
          flex: 1,
          backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
          padding: ConsolidatedConsolidatedDesignSystem.spacing.xl,
        },
      `,
    },
    
    // Practice card
    practiceCard: {
      old: `
        practiceCard: {
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
      `,
      new: `
        practiceCard: ComponentTokens.card.practice,
      `,
    },
    
    // Primary button
    primaryButton: {
      old: `
        primaryButton: {
          backgroundColor: '#da4347',
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderRadius: 12,
          alignItems: 'center',
        },
      `,
      new: `
        primaryButton: ComponentTokens.button.primary,
      `,
    },
    
    // Button text
    buttonText: {
      old: `
        buttonText: {
          fontSize: 16,
          fontWeight: '700',
          color: '#ffffff',
        },
      `,
      new: `
        buttonText: ComponentTextStyles.button.primary,
      `,
    },
    
    // Section title
    sectionTitle: {
      old: `
        sectionTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#1a1a1a',
          marginBottom: 12,
        },
      `,
      new: `
        sectionTitle: {
          ...Typography.styles.subheading('lg'),
          marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.md,
        },
      `,
    },
    
    // Label text
    labelText: {
      old: `
        labelText: {
          fontSize: 14,
          fontWeight: '500',
          color: '#666666',
          marginBottom: 8,
        },
      `,
      new: `
        labelText: {
          ...Typography.styles.label('sm'),
          marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.sm,
        },
      `,
    },
    
    // Value text
    valueText: {
      old: `
        valueText: {
          fontSize: 16,
          fontWeight: '400',
          color: '#1a1a1a',
        },
      `,
      new: `
        valueText: Typography.styles.body('base'),
      `,
    },
  },
  
  // Color reference replacements
  colorReplacements: {
    "'#f8f9fa'": 'ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"]',
    "'#ffffff'": 'ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary',
    "'#1a1a1a'": 'ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"]',
    "'#666666'": 'ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"]',
    "'#da4347'": 'ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary',
    "'#e9ecef'": 'ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"]',
    "'#f0f0f0'": 'ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"]Light',
    "'#2e7d32'": 'ConsolidatedConsolidatedConsolidatedDesignSystem.status.success',
    "'#000'": 'ConsolidatedConsolidatedConsolidatedDesignSystem.utility.shadow',
    "'rgba(0, 0, 0, 0.5)'": 'ConsolidatedConsolidatedConsolidatedDesignSystem.utility.overlay',
  },
  
  // Spacing replacements
  spacingReplacements: {
    'padding: 20': 'padding: ConsolidatedConsolidatedDesignSystem.spacing.xl',
    'paddingVertical: 16': 'paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.lg',
    'paddingHorizontal: 20': 'paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.xl',
    'marginBottom: 16': 'marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.lg',
    'marginBottom: 12': 'marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.md',
    'marginBottom: 8': 'marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.sm',
    'borderRadius: 12': 'borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg',
    'borderRadius: 8': 'borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.md',
    'fontSize: 16': 'fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.base',
    'fontSize: 18': 'fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.lg',
    'fontSize: 14': 'fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm',
    'fontSize: 24': 'fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize["2xl"]',
  },
};

// Complete file migration transformer
export const FileTransformer = {
  // Transform practice detail file
  transformPracticeDetail: (fileContent: string): string => {
    let transformed = fileContent;
    
    // Replace imports
    PracticeDetailMigration.imports.old.forEach(oldImport => {
      transformed = transformed.replace(oldImport, '');
    });
    
    // Add new imports after existing imports
    const importInsertPoint = transformed.indexOf('import {') === -1 ? 0 : transformed.lastIndexOf('import ') + transformed.substring(transformed.lastIndexOf('import ')).indexOf('\n') + 1;
    const newImports = PracticeDetailMigration.imports.new.join('\n') + '\n';
    transformed = transformed.slice(0, importInsertPoint) + newImports + transformed.slice(importInsertPoint);
    
    // Replace color references
    Object.entries(PracticeDetailMigration.colorReplacements).forEach(([oldColor, newColor]) => {
      transformed = transformed.replace(new RegExp(oldColor, 'g'), newColor);
    });
    
    // Replace spacing references
    Object.entries(PracticeDetailMigration.spacingReplacements).forEach(([oldSpacing, newSpacing]) => {
      transformed = transformed.replace(new RegExp(oldSpacing, 'g'), newSpacing);
    });
    
    return transformed;
  },
  
  // Transform any file with systematic replacements
  transformFile: (fileContent: string, fileName: string): string => {
    let transformed = fileContent;
    
    // Replace old imports
    ImportReplacements.oldImports.forEach(oldImport => {
      transformed = transformed.replace(new RegExp(oldImport, 'g'), '');
    });
    
    // Add new imports
    const hasDesignSystemImport = transformed.includes("import ConsolidatedDesignSystem");
    const hasComponentTokensImport = transformed.includes("import { ComponentTokens");
    const hasTypographyImport = transformed.includes("import { Typography }");
    
    if (!hasDesignSystemImport || !hasComponentTokensImport || !hasTypographyImport) {
      const importInsertPoint = transformed.indexOf('import {') === -1 ? 0 : transformed.lastIndexOf('import ') + transformed.substring(transformed.lastIndexOf('import ')).indexOf('\n') + 1;
      
      const newImports = [];
      if (!hasDesignSystemImport) newImports.push("import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';");
      if (!hasComponentTokensImport) newImports.push("import { ComponentTokens, ComponentTextStyles } from '@/utils/componentTokens';");
      if (!hasTypographyImport) newImports.push("import { Typography } from '@/utils/typography';");
      
      transformed = transformed.slice(0, importInsertPoint) + newImports.join('\n') + '\n' + transformed.slice(importInsertPoint);
    }
    
    // Replace color references
    Object.entries(ImportReplacements.colorReplacements).forEach(([oldRef, newRef]) => {
      transformed = transformed.replace(new RegExp(oldRef, 'g'), newRef);
    });
    
    // Replace hardcoded colors
    Object.entries(PracticeDetailMigration.colorReplacements).forEach(([oldColor, newColor]) => {
      transformed = transformed.replace(new RegExp(oldColor, 'g'), newColor);
    });
    
    // Replace spacing values
    Object.entries(PracticeDetailMigration.spacingReplacements).forEach(([oldSpacing, newSpacing]) => {
      transformed = transformed.replace(new RegExp(oldSpacing, 'g'), newSpacing);
    });
    
    return transformed;
  },
  
  // Generate migration report
  generateMigrationReport: (originalContent: string, transformedContent: string, fileName: string): string => {
    const changes = [];
    
    // Count import changes
    const oldImportCount = ImportReplacements.oldImports.reduce((count, imp) => {
      return count + (originalContent.match(new RegExp(imp, 'g')) || []).length;
    }, 0);
    
    if (oldImportCount > 0) {
      changes.push(`- Updated ${oldImportCount} import statement(s)`);
    }
    
    // Count color changes
    const colorChangeCount = Object.keys(PracticeDetailMigration.colorReplacements).reduce((count, color) => {
      return count + (originalContent.match(new RegExp(color, 'g')) || []).length;
    }, 0);
    
    if (colorChangeCount > 0) {
      changes.push(`- Migrated ${colorChangeCount} hardcoded color value(s)`);
    }
    
    // Count spacing changes
    const spacingChangeCount = Object.keys(PracticeDetailMigration.spacingReplacements).reduce((count, spacing) => {
      return count + (originalContent.match(new RegExp(spacing, 'g')) || []).length;
    }, 0);
    
    if (spacingChangeCount > 0) {
      changes.push(`- Migrated ${spacingChangeCount} hardcoded spacing value(s)`);
    }
    
    return `
# Migration Report for ${fileName}

## Changes Applied:
${changes.join('\n')}

## Status: 
${changes.length > 0 ? '✅ Successfully migrated to DesignSystem tokens' : '⚠️ No changes needed'}

## Next Steps:
- Test the file to ensure all styles render correctly
- Verify color and spacing values match design specifications
- Check for any remaining hardcoded values
    `.trim();
  },
};

// Export migration helpers
export default FileTransformer;
