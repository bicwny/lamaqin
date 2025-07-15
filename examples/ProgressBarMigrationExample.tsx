
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressBar from '@/components/ProgressBar';
import { DesignSystem } from '@/constants/DesignSystem';

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
    padding: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.background,
  },
  title: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    marginBottom: DesignSystem.spacing.xl,
    color: DesignSystem.colors.textPrimary,
  },
  section: {
    marginBottom: DesignSystem.spacing['2xl'],
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    marginBottom: DesignSystem.spacing.lg,
    color: DesignSystem.colors.textPrimary,
  },
  example: {
    marginBottom: DesignSystem.spacing.lg,
  },
  label: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    marginBottom: DesignSystem.spacing.sm,
    color: DesignSystem.colors.textSecondary,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: DesignSystem.typography.fontSize.sm,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    padding: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    color: DesignSystem.colors.textPrimary,
    lineHeight: DesignSystem.typography.lineHeight.relaxed * DesignSystem.typography.fontSize.sm,
  },
});
