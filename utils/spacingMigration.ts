
/**
 * Spacing Migration Utilities
 * Provides systematic mapping from hardcoded values to DesignSystem spacing tokens
 */

import { DesignSystem } from '@/constants/DesignSystem';

// Migration map for hardcoded spacing values found in audit
export const spacingMigrationMap = {
  // Direct pixel values to spacing tokens
  4: DesignSystem.spacing.xs,
  6: DesignSystem.spacing.xxs,    // NEW: Small borders, icon gaps
  8: DesignSystem.spacing.sm,
  10: DesignSystem.spacing.base,  // NEW: Button padding, small margins
  12: DesignSystem.spacing.md,
  16: DesignSystem.spacing.lg,
  20: DesignSystem.spacing.xl,
  24: DesignSystem.spacing['2xl'],
  32: DesignSystem.spacing['3xl'],
  40: DesignSystem.spacing['4xl'],
  48: DesignSystem.spacing['5xl'],
};

// Common spacing patterns found in practice-detail and other files
export const spacingPatterns = {
  // Card spacing patterns
  card: {
    padding: DesignSystem.spacing.xl,           // 20px -> xl
    marginHorizontal: DesignSystem.spacing.lg,  // 16px -> lg  
    marginVertical: DesignSystem.spacing.sm,    // 8px -> sm
  },
  
  // Button spacing patterns
  button: {
    paddingVertical: DesignSystem.spacing.md,     // 12px -> md
    paddingHorizontal: DesignSystem.spacing.lg,   // 16px -> lg
    gap: DesignSystem.spacing.sm,                 // 8px -> sm
  },
  
  // Primary button (larger)
  buttonPrimary: {
    paddingVertical: DesignSystem.spacing.lg,     // 16px -> lg
    paddingHorizontal: DesignSystem.spacing.xl,   // 20px -> xl
    gap: DesignSystem.spacing.sm,                 // 8px -> sm
  },
  
  // Section spacing patterns
  section: {
    marginBottom: DesignSystem.spacing.lg,        // 16px -> lg
    marginTop: DesignSystem.spacing.lg,           // 16px -> lg
    paddingVertical: DesignSystem.spacing.xl,     // 20px -> xl
  },
  
  // Form element patterns
  form: {
    inputPadding: DesignSystem.spacing.md,        // 12px -> md
    labelMargin: DesignSystem.spacing.sm,         // 8px -> sm
    fieldGap: DesignSystem.spacing.lg,            // 16px -> lg
  },
  
  // Icon spacing patterns
  icon: {
    smallGap: DesignSystem.spacing.xxs,           // 6px -> xxs (NEW)
    normalGap: DesignSystem.spacing.sm,           // 8px -> sm
    padding: DesignSystem.spacing.base,           // 10px -> base (NEW)
  },
  
  // Container patterns
  container: {
    pageHorizontal: DesignSystem.spacing.lg,      // 16px -> lg
    pagePadding: DesignSystem.spacing.xl,         // 20px -> xl
    innerSpacing: DesignSystem.spacing.md,        // 12px -> md
  },
  
  // Progress and status patterns
  progress: {
    barHeight: DesignSystem.spacing.sm,           // 8px -> sm
    containerGap: DesignSystem.spacing.md,        // 12px -> md
    statusPadding: DesignSystem.spacing.base,     // 10px -> base (NEW)
  },
};

// Helper functions for migration
export const spacingHelpers = {
  // Get spacing value by key
  get: (key: keyof typeof DesignSystem.spacing) => DesignSystem.spacing[key],
  
  // Convert hardcoded value to spacing token
  migrate: (value: number) => spacingMigrationMap[value] || value,
  
  // Get complete margin/padding object
  padding: (
    vertical: keyof typeof DesignSystem.spacing,
    horizontal: keyof typeof DesignSystem.spacing
  ) => ({
    paddingVertical: DesignSystem.spacing[vertical],
    paddingHorizontal: DesignSystem.spacing[horizontal],
  }),
  
  margin: (
    vertical: keyof typeof DesignSystem.spacing,
    horizontal: keyof typeof DesignSystem.spacing
  ) => ({
    marginVertical: DesignSystem.spacing[vertical],
    marginHorizontal: DesignSystem.spacing[horizontal],
  }),
  
  // Get single margin value by variant name
  getMargin: (variant: 'none' | 'tight' | 'compact' | 'comfortable' | 'spacious' | 'loose' | 'extraLoose') => {
    const marginMap = {
      none: 0,
      tight: DesignSystem.spacing.xs,
      compact: DesignSystem.spacing.sm,
      comfortable: DesignSystem.spacing.md,
      spacious: DesignSystem.spacing.lg,
      loose: DesignSystem.spacing.xl,
      extraLoose: DesignSystem.spacing['2xl'],
    };
    return marginMap[variant];
  },
  
  // Get consistent gap for flex layouts
  gap: (size: keyof typeof DesignSystem.spacing) => ({
    gap: DesignSystem.spacing[size],
  }),
};

// Type helpers for better TypeScript support
export type SpacingKey = keyof typeof DesignSystem.spacing;
export type SpacingValue = typeof DesignSystem.spacing[SpacingKey];

// Quick access to commonly used spacing patterns for practice-detail migration
export const practiceDetailSpacing = {
  // Main card container
  infoCard: {
    backgroundColor: 'white',
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.xl,              // 20px
    marginHorizontal: DesignSystem.spacing.lg,     // 16px
    marginVertical: DesignSystem.spacing.sm,       // 8px
  },
  
  // Button container
  actionButtons: {
    flexDirection: 'row' as const,
    gap: DesignSystem.spacing.md,                  // 12px
    marginTop: DesignSystem.spacing.xl,            // 20px
  },
  
  // Primary button
  primaryButton: {
    flex: 2,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: DesignSystem.colors.primary,
    padding: DesignSystem.spacing.lg,              // 16px
    borderRadius: DesignSystem.borderRadius.lg,
    gap: DesignSystem.spacing.sm,                  // 8px
  },
  
  // Secondary button
  secondaryButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'white',
    padding: DesignSystem.spacing.lg,              // 16px
    borderRadius: DesignSystem.borderRadius.lg,
    gap: DesignSystem.spacing.xxs,                 // 6px (NEW)
    borderWidth: 1.5,
    borderColor: DesignSystem.colors.primary,
  },
  
  // Progress section
  progressContainer: {
    marginBottom: DesignSystem.spacing.lg,         // 16px
  },
  
  // Details section
  detailsSection: {
    marginTop: DesignSystem.spacing.xl,            // 20px
    paddingTop: DesignSystem.spacing.xl,           // 20px
    borderTopWidth: 1,
    borderTopColor: DesignSystem.colors.borderLight,
  },
  
  // Record items
  recordItem: {
    marginBottom: DesignSystem.spacing.lg,         // 16px
    paddingBottom: DesignSystem.spacing.lg,        // 16px
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
  },
  
  // Record header
  recordHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: DesignSystem.spacing.sm,         // 8px
  },
  
  // Notes section
  recordNotes: {
    backgroundColor: DesignSystem.colors.backgroundTertiary,
    padding: DesignSystem.spacing.md,              // 12px
    borderRadius: DesignSystem.borderRadius.sm,
    marginTop: DesignSystem.spacing.sm,            // 8px
    borderLeftWidth: 3,
    borderLeftColor: DesignSystem.colors.primary,
  },
};

export default spacingHelpers;
