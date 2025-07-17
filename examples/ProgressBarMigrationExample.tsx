
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressBar from '@/components/ProgressBar';
import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';

/**
 * Example showing how to migrate from old progress patterns to new ProgressBar component
 */

export default function ProgressBarMigrationExample() {
  const progress = 65; // Example progress value

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress Bar Migration Examples</Text>
      
      {/* OLD WAY - before consolidation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❌ Old Pattern (DON'T USE)</Text>
        <Text style={styles.code}>
          {`// Old ComponentTokens.progress.bar pattern
<View style={ComponentTokens.progress.bar.container}>
  <View style={[ComponentTokens.progress.bar.fill, { width: '65%' }]} />
</View>`}
        </Text>
      </View>

      {/* NEW WAY - after consolidation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ New Pattern (USE THIS)</Text>
        
        {/* Thin progress bar (replaces progress.bar) */}
        <View style={styles.example}>
          <Text style={styles.label}>Thin Progress (replaces progress.bar):</Text>
          <ProgressBar progress={progress} size="thin" />
        </View>

        {/* Medium progress bar (replaces progress.course) */}
        <View style={styles.example}>
          <Text style={styles.label}>Medium Progress (replaces progress.course):</Text>
          <ProgressBar progress={progress} size="medium" />
        </View>

        {/* Thick progress bar (replaces progress.practice) */}
        <View style={styles.example}>
          <Text style={styles.label}>Thick Progress (replaces progress.practice):</Text>
          <ProgressBar progress={progress} size="thick" />
        </View>

        {/* Custom styling example */}
        <View style={styles.example}>
          <Text style={styles.label}>Custom Colors:</Text>
          <ProgressBar 
            progress={progress} 
            size="medium"
            fillColor="#10B981"
            backgroundColor="#F3F4F6"
          />
        </View>
      </View>

      {/* Migration Code Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Migration Code Examples</Text>
        
        <Text style={styles.code}>
          {`// BEFORE:
import { ComponentTokens } from '@/utils/componentTokens';

<View style={ComponentTokens.progress.practice.container}>
  <View style={[ComponentTokens.progress.practice.fill, { width: \`\${progress}%\` }]} />
</View>

// AFTER:
import ProgressBar from '@/components/ProgressBar';

<ProgressBar progress={progress} size="thick" />`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: ConsolidatedDesignSystem.spacing.lg,
    backgroundColor: ConsolidatedDesignSystem.colors["surface-primary"],
  },
  title: {
    fontSize: ConsolidatedDesignSystem.typography.fontSize['2xl'],
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,
    marginBottom: ConsolidatedDesignSystem.spacing.xl,
    color: ConsolidatedDesignSystem.colors["text-primary"],
  },
  section: {
    marginBottom: ConsolidatedDesignSystem.spacing['2xl'],
  },
  sectionTitle: {
    fontSize: ConsolidatedDesignSystem.typography.fontSize.lg,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
    marginBottom: ConsolidatedDesignSystem.spacing.lg,
    color: ConsolidatedDesignSystem.colors["text-primary"],
  },
  example: {
    marginBottom: ConsolidatedDesignSystem.spacing.lg,
  },
  label: {
    fontSize: ConsolidatedDesignSystem.typography.fontSize.sm,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.medium,
    marginBottom: ConsolidatedDesignSystem.spacing.sm,
    color: ConsolidatedDesignSystem.colors["text-secondary"],
  },
  code: {
    fontFamily: 'monospace',
    fontSize: ConsolidatedDesignSystem.typography.fontSize.sm,
    backgroundColor: ConsolidatedDesignSystem.colorsConsolidatedDesignSystem.colors["surface-secondary"],
    padding: ConsolidatedDesignSystem.spacing.md,
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    color: ConsolidatedDesignSystem.colors["text-primary"],
    lineHeight: ConsolidatedDesignSystem.typography.lineHeight.relaxed * ConsolidatedDesignSystem.typography.fontSize.sm,
  },
});
