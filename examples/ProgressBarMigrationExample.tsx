
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
    padding: ConsolidatedConsolidatedDesignSystem.spacing.lg,
    backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
  },
  title: {
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize['2xl'],
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.bold,
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.xl,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
  },
  section: {
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing['2xl'],
  },
  sectionTitle: {
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.lg,
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.semibold,
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.lg,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
  },
  example: {
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.lg,
  },
  label: {
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm,
    fontWeight: ConsolidatedConsolidatedDesignSystem.typography.fontWeight.medium,
    marginBottom: ConsolidatedConsolidatedDesignSystem.spacing.sm,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
  },
  code: {
    fontFamily: 'monospace',
    fontSize: ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm,
    backgroundColor: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
    padding: ConsolidatedConsolidatedDesignSystem.spacing.md,
    borderRadius: ConsolidatedConsolidatedDesignSystem.borderRadius.md,
    color: ConsolidatedConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    lineHeight: ConsolidatedConsolidatedDesignSystem.typography.lineHeight.relaxed * ConsolidatedConsolidatedDesignSystem.typography.fontSize.sm,
  },
});
