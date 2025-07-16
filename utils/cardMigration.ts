
import { componentHelpers } from './componentTokens';

/**
 * Card Migration Utilities
 * Helper functions for migrating from old card patterns to new consolidated system
 */

// Legacy card variant mappings
export const cardMigrationMap = {
  // Old pattern → New pattern
  standard: { variant: 'outlined' as const, padding: 'spacious' as const },
  practice: { variant: 'outlined' as const, padding: 'comfortable' as const },
  course: { variant: 'elevated' as const, padding: 'spacious' as const },
  status: 'notification' as const, // Requires component change
} as const;

// Migration helper functions
export const cardMigration = {
  // Get new card style from legacy variant
  fromLegacy: (legacyVariant: keyof typeof cardMigrationMap) => {
    const mapping = cardMigrationMap[legacyVariant];
    
    if (typeof mapping === 'string') {
      throw new Error(
        `Legacy variant '${legacyVariant}' should use Notification component instead of Card`
      );
    }
    
    return componentHelpers.getCardStyle(mapping.variant, mapping.padding);
  },
  
  // Check if legacy variant should migrate to Notification
  requiresNotification: (legacyVariant: keyof typeof cardMigrationMap): boolean => {
    return typeof cardMigrationMap[legacyVariant] === 'string';
  },
  
  // Get notification variant for status cards
  getNotificationVariant: (statusType?: string) => {
    switch (statusType) {
      case 'success':
      case 'complete':
      case 'done':
        return 'success' as const;
      case 'warning':
      case 'attention':
        return 'warning' as const;
      case 'error':
      case 'failed':
        return 'error' as const;
      default:
        return 'info' as const;
    }
  },
};

// Component replacement patterns for automated migration
export const cardReplacementPatterns = {
  // Pattern: ComponentTokens.card.standard
  standard: {
    find: /ComponentTokens\.card\.standard/g,
    replace: "componentHelpers.getCardStyle('outlined', 'spacious')",
  },
  
  // Pattern: ComponentTokens.card.practice
  practice: {
    find: /ComponentTokens\.card\.practice/g,
    replace: "componentHelpers.getCardStyle('outlined', 'comfortable')",
  },
  
  // Pattern: ComponentTokens.card.course
  course: {
    find: /ComponentTokens\.card\.course/g,
    replace: "componentHelpers.getCardStyle('elevated', 'spacious')",
  },
  
  // Pattern: ComponentTokens.card.status (requires manual migration)
  status: {
    find: /ComponentTokens\.card\.status/g,
    replace: "/* TODO: Replace with <Notification variant=\"success\" /> component */",
  },
};

// Validation helpers
export const cardValidation = {
  // Validate that padding prop is correct
  isValidPadding: (padding: string): padding is 'compact' | 'comfortable' | 'spacious' => {
    return ['compact', 'comfortable', 'spacious'].includes(padding);
  },
  
  // Validate that variant prop is correct
  isValidVariant: (variant: string): variant is 'outlined' | 'elevated' => {
    return ['outlined', 'elevated'].includes(variant);
  },
  
  // Check if a file contains legacy card patterns
  hasLegacyCardPatterns: (fileContent: string): boolean => {
    return /ComponentTokens\.card\.(standard|practice|course|status)/.test(fileContent);
  },
  
  // Extract legacy card usages from file content
  extractLegacyUsages: (fileContent: string) => {
    const matches = fileContent.match(/ComponentTokens\.card\.(standard|practice|course|status)/g);
    return matches || [];
  },
};

// Example usage patterns for documentation
export const cardExamples = {
  // Before (legacy)
  legacy: {
    standard: `
// OLD - Don't use
<View style={ComponentTokens.card.standard}>
  <Text>Content</Text>
</View>`,
    
    practice: `
// OLD - Don't use  
<View style={ComponentTokens.card.practice}>
  <Text>Practice content</Text>
</View>`,
    
    course: `
// OLD - Don't use
<View style={ComponentTokens.card.course}>
  <Text>Course content</Text>
</View>`,
    
    status: `
// OLD - Don't use
<View style={ComponentTokens.card.status}>
  <Text>Status message</Text>
</View>`,
  },
  
  // After (new system)
  new: {
    outlined: `
// NEW - Use this
<Card variant="outlined" padding="spacious">
  <Text>Content</Text>
</Card>`,
    
    elevated: `
// NEW - Use this
<Card variant="elevated" padding="spacious">
  <Text>Course content</Text>
</Card>`,
    
    notification: `
// NEW - Use this for status
<Notification 
  variant="success" 
  title="Complete"
  message="Practice completed successfully"
/>`,
  },
};

export default cardMigration;
