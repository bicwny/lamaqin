
/**
 * Button Migration Utility
 * Helps migrate from old 5-variant system to new 3-variant + size system
 */

import { ComponentTokens, ComponentTextStyles, componentHelpers } from './componentTokens';

// Button variant mapping from old system to new system
export const ButtonMigrationMap = {
  // Old → New mapping
  primary: { variant: 'primary' as const, size: 'medium' as const },
  secondary: { variant: 'secondary' as const, size: 'medium' as const },
  small: { variant: 'secondary' as const, size: 'small' as const },
  text: { variant: 'ghost' as const, size: 'medium' as const },
  dharma: { variant: 'primary' as const, size: 'large' as const },
} as const;

// Helper functions for button migration
export const ButtonMigration = {
  // Convert old button style to new system
  migrateButtonStyle: (oldVariant: keyof typeof ButtonMigrationMap) => {
    const { variant, size } = ButtonMigrationMap[oldVariant];
    return componentHelpers.getButtonStyle(variant, size);
  },
  
  // Convert old button text style to new system
  migrateButtonTextStyle: (oldVariant: keyof typeof ButtonMigrationMap) => {
    const { variant, size } = ButtonMigrationMap[oldVariant];
    return componentHelpers.getButtonTextStyle(variant, size);
  },
  
  // Get style replacement patterns for code migration
  getStyleReplacements: () => {
    const replacements: Record<string, string> = {};
    
    Object.entries(ButtonMigrationMap).forEach(([oldVariant, { variant, size }]) => {
      // Style replacements
      replacements[`ComponentTokens.button.${oldVariant}`] = 
        `componentHelpers.getButtonStyle('${variant}', '${size}')`;
      
      // Text style replacements
      replacements[`ComponentTextStyles.button.${oldVariant}`] = 
        `componentHelpers.getButtonTextStyle('${variant}', '${size}')`;
      
      // Legacy helper replacements
      replacements[`componentHelpers.getButtonStyle('${oldVariant}')`] = 
        `componentHelpers.getButtonStyle('${variant}', '${size}')`;
      
      replacements[`componentHelpers.getButtonTextStyle('${oldVariant}')`] = 
        `componentHelpers.getButtonTextStyle('${variant}', '${size}')`;
    });
    
    return replacements;
  },
  
  // Get import statement replacements
  getImportReplacements: () => ({
    // No import changes needed - all functions remain the same
    // Only usage patterns change
  }),
  
  // Generate migration report
  generateMigrationReport: (content: string) => {
    const buttonUsages = [
      ...content.matchAll(/ComponentTokens\.button\.(\w+)/g),
      ...content.matchAll(/ComponentTextStyles\.button\.(\w+)/g),
      ...content.matchAll(/componentHelpers\.getButtonStyle\('(\w+)'\)/g),
      ...content.matchAll(/componentHelpers\.getButtonTextStyle\('(\w+)'\)/g),
    ];
    
    const usageCounts: Record<string, number> = {};
    
    buttonUsages.forEach(match => {
      const variant = match[1];
      if (variant in ButtonMigrationMap) {
        usageCounts[variant] = (usageCounts[variant] || 0) + 1;
      }
    });
    
    return {
      totalUsages: buttonUsages.length,
      variantCounts: usageCounts,
      migrationMap: ButtonMigrationMap,
      estimatedReduction: Object.keys(usageCounts).length * 50, // Estimated lines saved
    };
  },
  
  // Apply automatic migration to file content
  migrateFileContent: (content: string): string => {
    let migratedContent = content;
    const replacements = ButtonMigration.getStyleReplacements();
    
    // Apply all replacements
    Object.entries(replacements).forEach(([oldPattern, newPattern]) => {
      const regex = new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      migratedContent = migratedContent.replace(regex, newPattern);
    });
    
    return migratedContent;
  },
};

// Export types for TypeScript support
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';
export type LegacyButtonVariant = keyof typeof ButtonMigrationMap;

// Export consolidated button utilities
export const ConsolidatedButton = {
  // Get style with new API
  getStyle: (variant: ButtonVariant, size: ButtonSize = 'medium') => 
    componentHelpers.getButtonStyle(variant, size),
  
  // Get text style with new API
  getTextStyle: (variant: ButtonVariant, size: ButtonSize = 'medium') => 
    componentHelpers.getButtonTextStyle(variant, size),
  
  // Quick access to common combinations
  styles: {
    primaryMedium: componentHelpers.getButtonStyle('primary', 'medium'),
    primaryLarge: componentHelpers.getButtonStyle('primary', 'large'),
    secondaryMedium: componentHelpers.getButtonStyle('secondary', 'medium'),
    secondarySmall: componentHelpers.getButtonStyle('secondary', 'small'),
    ghostMedium: componentHelpers.getButtonStyle('ghost', 'medium'),
    ghostSmall: componentHelpers.getButtonStyle('ghost', 'small'),
  },
  
  textStyles: {
    primaryMedium: componentHelpers.getButtonTextStyle('primary', 'medium'),
    primaryLarge: componentHelpers.getButtonTextStyle('primary', 'large'),
    secondaryMedium: componentHelpers.getButtonTextStyle('secondary', 'medium'),
    secondarySmall: componentHelpers.getButtonTextStyle('secondary', 'small'),
    ghostMedium: componentHelpers.getButtonTextStyle('ghost', 'medium'),
    ghostSmall: componentHelpers.getButtonTextStyle('ghost', 'small'),
  },
};

export default ButtonMigration;
