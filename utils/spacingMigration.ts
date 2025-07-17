
/**
 * Spacing Migration Utilities
 * Provides systematic mapping from hardcoded values to DesignSystem spacing tokens
 */

import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';

// Migration map for hardcoded spacing values found in audit
export const spacingMigrationMap = {
  // Direct pixel values to spacing tokens
  4: ConsolidatedDesignSystem.spacing.xs,
  6: ConsolidatedDesignSystem.spacing.xxs,    // NEW: Small borders, icon gaps
  8: ConsolidatedDesignSystem.spacing.sm,
  10: ConsolidatedDesignSystem.spacing.base,  // NEW: Button padding, small margins
  12: ConsolidatedDesignSystem.spacing.md,
  16: ConsolidatedDesignSystem.spacing.lg,
  20: ConsolidatedDesignSystem.spacing.xl,
  24: ConsolidatedDesignSystem.spacing['2xl'],
  32: ConsolidatedDesignSystem.spacing['3xl'],
  40: ConsolidatedDesignSystem.spacing['4xl'],
  48: ConsolidatedDesignSystem.spacing['5xl'],
};

// Common spacing patterns found in practice-detail and other files
export const spacingPatterns = {
  // Card spacing patterns
  card: {
    padding: ConsolidatedDesignSystem.spacing.xl,           // 20px -> xl
    marginHorizontal: ConsolidatedDesignSystem.spacing.lg,  // 16px -> lg  
    marginVertical: ConsolidatedDesignSystem.spacing.sm,    // 8px -> sm
  },
  
  // Button spacing patterns
  button: {
    paddingVertical: ConsolidatedDesignSystem.spacing.md,     // 12px -> md
    paddingHorizontal: ConsolidatedDesignSystem.spacing.lg,   // 16px -> lg
    gap: ConsolidatedDesignSystem.spacing.sm,                 // 8px -> sm
  },
  
  // Primary button (larger)
  buttonPrimary: {
    paddingVertical: ConsolidatedDesignSystem.spacing.lg,     // 16px -> lg
    paddingHorizontal: ConsolidatedDesignSystem.spacing.xl,   // 20px -> xl
    gap: ConsolidatedDesignSystem.spacing.sm,                 // 8px -> sm
  },
  
  // Section spacing patterns
  section: {
    marginBottom: ConsolidatedDesignSystem.spacing.lg,        // 16px -> lg
    marginTop: ConsolidatedDesignSystem.spacing.lg,           // 16px -> lg
    paddingVertical: ConsolidatedDesignSystem.spacing.xl,     // 20px -> xl
  },
  
  // Form element patterns
  form: {
    inputPadding: ConsolidatedDesignSystem.spacing.md,        // 12px -> md
    labelMargin: ConsolidatedDesignSystem.spacing.sm,         // 8px -> sm
    fieldGap: ConsolidatedDesignSystem.spacing.lg,            // 16px -> lg
  },
  
  // Icon spacing patterns
  icon: {
    smallGap: ConsolidatedDesignSystem.spacing.xxs,           // 6px -> xxs (NEW)
    normalGap: ConsolidatedDesignSystem.spacing.sm,           // 8px -> sm
    padding: ConsolidatedDesignSystem.spacing.base,           // 10px -> base (NEW)
  },
  
  // Container patterns
  container: {
    pageHorizontal: ConsolidatedDesignSystem.spacing.lg,      // 16px -> lg
    pagePadding: ConsolidatedDesignSystem.spacing.xl,         // 20px -> xl
    innerSpacing: ConsolidatedDesignSystem.spacing.md,        // 12px -> md
  },
  
  // Progress and status patterns
  progress: {
    barHeight: ConsolidatedDesignSystem.spacing.sm,           // 8px -> sm
    containerGap: ConsolidatedDesignSystem.spacing.md,        // 12px -> md
    statusPadding: ConsolidatedDesignSystem.spacing.base,     // 10px -> base (NEW)
  },
};

// Helper functions for migration
export const spacingHelpers = {
  // Get spacing value by key
  get: (key: keyof typeof ConsolidatedDesignSystem.spacing) => ConsolidatedDesignSystem.spacing[key],
  
  // Convert hardcoded value to spacing token
  migrate: (value: number) => spacingMigrationMap[value] || value,
  
  // Get complete margin/padding object
  padding: (
    vertical: keyof typeof ConsolidatedDesignSystem.spacing,
    horizontal: keyof typeof ConsolidatedDesignSystem.spacing
  ) => ({
    paddingVertical: ConsolidatedDesignSystem.spacing[vertical],
    paddingHorizontal: ConsolidatedDesignSystem.spacing[horizontal],
  }),
  
  margin: (
    vertical: keyof typeof ConsolidatedDesignSystem.spacing,
    horizontal: keyof typeof ConsolidatedDesignSystem.spacing
  ) => ({
    marginVertical: ConsolidatedDesignSystem.spacing[vertical],
    marginHorizontal: ConsolidatedDesignSystem.spacing[horizontal],
  }),
  
  // Get single margin value by variant name
  getMargin: (variant: 'none' | 'tight' | 'compact' | 'comfortable' | 'spacious' | 'loose' | 'extraLoose') => {
    const marginMap = {
      none: 0,
      tight: ConsolidatedDesignSystem.spacing.xs,
      compact: ConsolidatedDesignSystem.spacing.sm,
      comfortable: ConsolidatedDesignSystem.spacing.md,
      spacious: ConsolidatedDesignSystem.spacing.lg,
      loose: ConsolidatedDesignSystem.spacing.xl,
      extraLoose: ConsolidatedDesignSystem.spacing['2xl'],
    };
    return marginMap[variant];
  },
  
  // Get consistent gap for flex layouts
  gap: (size: keyof typeof ConsolidatedDesignSystem.spacing) => ({
    gap: ConsolidatedDesignSystem.spacing[size],
  }),
};

// Type helpers for better TypeScript support
export type SpacingKey = keyof typeof ConsolidatedDesignSystem.spacing;
export type SpacingValue = typeof ConsolidatedDesignSystem.spacing[SpacingKey];

// Quick access to commonly used spacing patterns for practice-detail migration
export const practiceDetailSpacing = {
  // Main card container
  infoCard: {
    backgroundColor: 'white',
    borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
    padding: ConsolidatedDesignSystem.spacing.xl,              // 20px
    marginHorizontal: ConsolidatedDesignSystem.spacing.lg,     // 16px
    marginVertical: ConsolidatedDesignSystem.spacing.sm,       // 8px
  },
  
  // Button container
  actionButtons: {
    flexDirection: 'row' as const,
    gap: ConsolidatedDesignSystem.spacing.md,                  // 12px
    marginTop: ConsolidatedDesignSystem.spacing.xl,            // 20px
  },
  
  // Primary button
  primaryButton: {
    flex: 2,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
    padding: ConsolidatedDesignSystem.spacing.lg,              // 16px
    borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
    gap: ConsolidatedDesignSystem.spacing.sm,                  // 8px
  },
  
  // Secondary button
  secondaryButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'white',
    padding: ConsolidatedDesignSystem.spacing.lg,              // 16px
    borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
    gap: ConsolidatedDesignSystem.spacing.xxs,                 // 6px (NEW)
    borderWidth: 1.5,
    borderColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
  },
  
  // Progress section
  progressContainer: {
    marginBottom: ConsolidatedDesignSystem.spacing.lg,         // 16px
  },
  
  // Details section
  detailsSection: {
    marginTop: ConsolidatedDesignSystem.spacing.xl,            // 20px
    paddingTop: ConsolidatedDesignSystem.spacing.xl,           // 20px
    borderTopWidth: 1,
    borderTopColor: ConsolidatedDesignSystem.colors["border-default"]Light,
  },
  
  // Record items
  recordItem: {
    marginBottom: ConsolidatedDesignSystem.spacing.lg,         // 16px
    paddingBottom: ConsolidatedDesignSystem.spacing.lg,        // 16px
    borderBottomWidth: 1,
    borderBottomColor: ConsolidatedDesignSystem.colors["border-default"]Light,
  },
  
  // Record header
  recordHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: ConsolidatedDesignSystem.spacing.sm,         // 8px
  },
  
  // Notes section
  recordNotes: {
    backgroundColor: ConsolidatedDesignSystem.colors["surface-primary"]Tertiary,
    padding: ConsolidatedDesignSystem.spacing.md,              // 12px
    borderRadius: ConsolidatedDesignSystem.borderRadius.sm,
    marginTop: ConsolidatedDesignSystem.spacing.sm,            // 8px
    borderLeftWidth: 3,
    borderLeftColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
  },
};

export default spacingHelpers;
