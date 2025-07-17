
import { ComponentTokens } from './componentTokens';
import type { ProgressBarSize } from '@/components/ProgressBar';

/**
 * Migration helper for Progress Component Consolidation
 * Maps old progress variants to new ProgressBar size props
 */

export const progressMigrationMap = {
  // Old variant -> New size prop
  bar: 'thin' as ProgressBarSize,
  course: 'medium' as ProgressBarSize,
  practice: 'thick' as ProgressBarSize,
} as const;

/**
 * Get the appropriate size prop for the new ProgressBar component
 * @param oldVariant - The old progress variant ('bar', 'course', 'practice')
 * @returns The corresponding size prop for ProgressBar
 */
export function getProgressSize(oldVariant: keyof typeof progressMigrationMap): ProgressBarSize {
  return progressMigrationMap[oldVariant];
}

/**
 * Migration templates for common progress bar patterns
 */
export const progressMigrationTemplates = {
  // Standard progress bar (replaces progress.bar)
  standard: {
    oldPattern: `
    <View style={ComponentTokens.progress.bar.container}>
      <View style={[ComponentTokens.progress.bar.fill, { width: \`\${progress}%\` }]} />
    </View>
    `,
    newPattern: `
    <ProgressBar progress={progress} size="thin" />
    `,
  },

  // Course progress bar (replaces progress.course)
  course: {
    oldPattern: `
    <View style={ComponentTokens.progress.course.container}>
      <View style={[ComponentTokens.progress.course.fill, { width: \`\${progress}%\` }]} />
    </View>
    `,
    newPattern: `
    <ProgressBar progress={progress} size="medium" />
    `,
  },

  // Practice progress bar (replaces progress.practice)
  practice: {
    oldPattern: `
    <View style={ComponentTokens.progress.practice.container}>
      <View style={[ComponentTokens.progress.practice.fill, { width: \`\${progress}%\` }]} />
    </View>
    `,
    newPattern: `
    <ProgressBar progress={progress} size="thick" />
    `,
  },
};

/**
 * Helper function to replace old progress patterns in practice-detail screen
 */
export const practiceDetailProgressMigration = {
  // Current pattern in practice-detail
  currentStyles: `
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ConsolidatedDesignSystem.spacing.md,
    marginTop: ConsolidatedDesignSystem.spacing.sm,
  },
  progressBar: {
    ...ComponentTokens.progress.practice.container,
    flex: 1,
  },
  progressFill: {
    ...ComponentTokens.progress.practice.fill,
  },
  `,
  
  // New pattern with ProgressBar component
  newImplementation: `
  // In JSX:
  <View style={styles.progressBarContainer}>
    <ProgressBar 
      progress={progress.percentage} 
      size="thick" 
      containerStyle={{ flex: 1 }}
    />
    <Text style={styles.progressPercentage}>
      {Math.round(progress.percentage)}%
    </Text>
  </View>
  
  // Updated styles (remove progressBar and progressFill):
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ConsolidatedDesignSystem.spacing.md,
    marginTop: ConsolidatedDesignSystem.spacing.sm,
  },
  `,
};
