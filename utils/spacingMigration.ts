
/**
 * Spacing Migration Utilities
 * Provides systematic mapping from hardcoded values to DesignSystem spacing tokens
 */

import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';

// Migration map for hardcoded spacing values found in audit
export const spacingMigrationMap = {
  // Direct pixel values to spacing tokens
  4: ConsolidatedConsolidatedDesignSystem.spacing.xs,
  6: ConsolidatedConsolidatedDesignSystem.spacing.xxs,    // NEW: Small borders, icon gaps
  8: ConsolidatedConsolidatedDesignSystem.spacing.sm,
  10: ConsolidatedConsolidatedDesignSystem.spacing.base,  // NEW: Button padding, small margins
  12: ConsolidatedConsolidatedDesignSystem.spacing.md,
  16: ConsolidatedConsolidatedDesignSystem.spacing.lg,
  20: ConsolidatedConsolidatedDesignSystem.spacing.xl,
  24: ConsolidatedConsolidatedDesignSystem.spacing['2xl'],
  32: ConsolidatedConsolidatedDesignSystem.spacing['3xl'],
  40: ConsolidatedConsolidatedDesignSystem.spacing['4xl'],
  48: ConsolidatedConsolidatedDesignSystem.spacing['5xl'],
};

// Common spacing patterns found in practice-detail and other files
export const spacingPatterns = {
  // Card spacing patterns
  card: {
    padding: ConsolidatedConsolidatedDesignSystem.spacing.xl,           // 20px -> xl
    marginHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.lg,  // 16px -> lg  
    marginVertical: ConsolidatedConsolidatedDesignSystem.spacing.sm,    // 8px -> sm
  },
  
  // Button spacing patterns
  button: {
    paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.md,     // 12px -> md
    paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.lg,   // 16px -> lg
    gap: ConsolidatedConsolidatedDesignSystem.spacing.sm,                 // 8px -> sm
  },
  
  // Primary button (larger)
  buttonPrimary: {
    paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.lg,     // 16px -> lg
    paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.xl,   // 20px -> xl
    gap: ConsolidatedConsolidatedDesignSystem.spacing.sm,                 // 8px -> sm
  },
  
  // Section spacing patterns
  section: {
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.lg,        // 16px -> lg
    marginTop: ConsolidatedConsolidatedDesignSystem.spacing.lg,           // 16px -> lg
    paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing.xl,     // 20px -> xl
  },
  
  // Form element patterns
  form: {
    inputPadding: ConsolidatedConsolidatedDesignSystem.spacing.md,        // 12px -> md
    labelMargin: ConsolidatedConsolidatedDesignSystem.spacing.sm,         // 8px -> sm
    fieldGap: ConsolidatedConsolidatedDesignSystem.spacing.lg,            // 16px -> lg
  },
  
  // Icon spacing patterns
  icon: {
    smallGap: ConsolidatedConsolidatedDesignSystem.spacing.xxs,           // 6px -> xxs (NEW)
    normalGap: ConsolidatedConsolidatedDesignSystem.spacing.sm,           // 8px -> sm
    padding: ConsolidatedConsolidatedDesignSystem.spacing.base,           // 10px -> base (NEW)
  },
  
  // Container patterns
  container: {
    pageHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.lg,      // 16px -> lg
    pagePadding: ConsolidatedConsolidatedDesignSystem.spacing.xl,         // 20px -> xl
    innerSpacing: ConsolidatedConsolidatedDesignSystem.spacing.md,        // 12px -> md
  },
  
  // Progress and status patterns
  progress: {
    barHeight: ConsolidatedConsolidatedDesignSystem.spacing.sm,           // 8px -> sm
    containerGap: ConsolidatedConsolidatedDesignSystem.spacing.md,        // 12px -> md
    statusPadding: ConsolidatedConsolidatedDesignSystem.spacing.base,     // 10px -> base (NEW)
  },
};

// Helper functions for migration
export const spacingHelpers = {
  // Get spacing value by key
  get: (key: keyof typeof ConsolidatedConsolidatedDesignSystem.spacing) => ConsolidatedConsolidatedDesignSystem.spacing[key],
  
  // Convert hardcoded value to spacing token
  migrate: (value: number) => spacingMigrationMap[value] || value,
  
  // Get complete margin/padding object
  padding: (
    vertical: keyof typeof ConsolidatedConsolidatedDesignSystem.spacing,
    horizontal: keyof typeof ConsolidatedConsolidatedDesignSystem.spacing
  ) => ({
    paddingVertical: ConsolidatedConsolidatedDesignSystem.spacing[vertical],
    paddingHorizontal: ConsolidatedConsolidatedDesignSystem.spacing[horizontal],
  }),
  
  margin: (
    vertical: keyof typeof ConsolidatedConsolidatedDesignSystem.spacing,
    horizontal: keyof typeof ConsolidatedConsolidatedDesignSystem.spacing
  ) => ({
    marginVertical: ConsolidatedConsolidatedDesignSystem.spacing[vertical],
    marginHorizontal: ConsolidatedConsolidatedDesignSystem.spacing[horizontal],
  }),
  
  // Get single margin value by variant name
  getMargin: (variant: 'none' | 'tight' | 'compact' | 'comfortable' | 'spacious' | 'loose' | 'extraLoose') => {
    const marginMap = {
      none: 0,
      tight: ConsolidatedConsolidatedDesignSystem.spacing.xs,
      compact: ConsolidatedConsolidatedDesignSystem.spacing.sm,
      comfortable: ConsolidatedConsolidatedDesignSystem.spacing.md,
      spacious: ConsolidatedConsolidatedDesignSystem.spacing.lg,
      loose: ConsolidatedConsolidatedDesignSystem.spacing.xl,
      extraLoose: ConsolidatedConsolidatedDesignSystem.spacing['2xl'],
    };
    return marginMap[variant];
  },
  
  // Get consistent gap for flex layouts
  gap: (size: keyof typeof ConsolidatedConsolidatedDesignSystem.spacing) => ({
    gap: ConsolidatedConsolidatedDesignSystem.spacing[size],
  }),
};

// Type helpers for better TypeScript support
export type SpacingKey = keyof typeof ConsolidatedConsolidatedDesignSystem.spacing;
export type SpacingValue = typeof ConsolidatedConsolidatedDesignSystem.spacing[SpacingKey];

// Quick access to commonly used spacing patterns for practice-detail migration
export const practiceDetailSpacing = {
  // Main card container
  infoCard: {
    backgroundColor: 'white',
    borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,
    padding: ConsolidatedConsolidatedDesignSystem.spacing.xl,              // 20px
    marginHorizontal: ConsolidatedConsolidatedDesignSystem.spacing.lg,     // 16px
    marginVertical: ConsolidatedConsolidatedDesignSystem.spacing.sm,       // 8px
  },
  
  // Button container
  actionButtons: {
    flexDirection: 'row' as const,
    gap: ConsolidatedConsolidatedDesignSystem.spacing.md,                  // 12px
    marginTop: ConsolidatedConsolidatedDesignSystem.spacing.xl,            // 20px
  },
  
  // Primary button
  primaryButton: {
    flex: 2,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
    padding: ConsolidatedConsolidatedDesignSystem.spacing.lg,              // 16px
    borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,
    gap: ConsolidatedConsolidatedDesignSystem.spacing.sm,                  // 8px
  },
  
  // Secondary button
  secondaryButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'white',
    padding: ConsolidatedConsolidatedDesignSystem.spacing.lg,              // 16px
    borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.lg,
    gap: ConsolidatedConsolidatedDesignSystem.spacing.xxs,                 // 6px (NEW)
    borderWidth: 1.5,
    borderColor: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
  },
  
  // Progress section
  progressContainer: {
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.lg,         // 16px
  },
  
  // Details section
  detailsSection: {
    marginTop: ConsolidatedConsolidatedDesignSystem.spacing.xl,            // 20px
    paddingTop: ConsolidatedConsolidatedDesignSystem.spacing.xl,           // 20px
    borderTopWidth: 1,
    borderTopColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"]Light,
  },
  
  // Record items
  recordItem: {
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.lg,         // 16px
    paddingBottom: ConsolidatedConsolidatedDesignSystem.spacing.lg,        // 16px
    borderBottomWidth: 1,
    borderBottomColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["border-default"]Light,
  },
  
  // Record header
  recordHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.sm,         // 8px
  },
  
  // Notes section
  recordNotes: {
    backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Tertiary,
    padding: ConsolidatedConsolidatedDesignSystem.spacing.md,              // 12px
    borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.sm,
    marginTop: ConsolidatedConsolidatedDesignSystem.spacing.sm,            // 8px
    borderLeftWidth: 3,
    borderLeftColor: ConsolidatedConsolidatedConsolidatedConsolidatedDesignSystem.colors.primary,
  },
};

export default spacingHelpers;
