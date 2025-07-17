
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { createStyles } from '@/constants/DesignSystem';
import { migrationHelpers, colorMigrationMap } from '@/utils/colorMigration';

export default function MigrationTestScreen() {
  // Test style object with hardcoded colors
  const testStyleObject = {
    backgroundColor: '#ffffff',
    borderColor: '#e9ecef',
    color: '#1a1a1a',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
  };

  // Test migration
  const migrationResult = migrationHelpers.performFullMigration(testStyleObject);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pre-Migration Validation</Text>
      
      {/* Test Color Migration Map */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Color Migration Map Test</Text>
        {Object.entries(colorMigrationMap).slice(0, 5).map(([old, newColor]) => (
          <View key={old} style={styles.colorTest}>
            <View style={[styles.colorSwatch, { backgroundColor: old }]} />
            <Text style={styles.colorText}>{old} → {newColor}</Text>
            <View style={[styles.colorSwatch, { backgroundColor: newColor }]} />
          </View>
        ))}
      </View>

      {/* Test Typography Migration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Typography Migration Test</Text>
        <Text style={createStyles.heading('2xl')}>Heading 2xl</Text>
        <Text style={createStyles.subheading('lg')}>Subheading lg</Text>
        <Text style={createStyles.body('base')}>Body base</Text>
        <Text style={createStyles.label('sm')}>Label sm</Text>
        <Text style={createStyles.caption()}>Caption</Text>
      </View>

      {/* Test Buddhist Semantic Colors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Buddhist Semantic Colors Test</Text>
        <View style={[styles.colorTest, { backgroundColor: DesignSystem.colors.dharmaRed }]}>
          <Text style={{ color: DesignSystem.colors.textInverse }}>Dharma Red</Text>
        </View>
        <View style={[styles.colorTest, { backgroundColor: DesignSystem.colors.wisdomGold }]}>
          <Text style={{ color: DesignSystem.colors.textInverse }}>Wisdom Gold</Text>
        </View>
        <View style={[styles.colorTest, { backgroundColor: DesignSystem.colors.compassionOrange }]}>
          <Text style={{ color: DesignSystem.colors.textInverse }}>Compassion Orange</Text>
        </View>
      </View>

      {/* Test Migration Functions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Migration Functions Test</Text>
        <Text style={styles.testResult}>
          Migration Result: {JSON.stringify(migrationResult, null, 2)}
        </Text>
      </View>

      {/* Test Buddhist Validation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buddhist Semantic Validation</Text>
        <Text style={styles.resultText}>
          Valid: {migrationResult.buddhistValidation.valid ? '✅' : '❌'}
        </Text>
        <Text style={styles.resultText}>
          Violations: {migrationResult.buddhistValidation.violations.length}
        </Text>
        <Text style={styles.resultText}>
          Suggestions: {migrationResult.buddhistValidation.suggestions.length}
        </Text>
      </View>

      {/* Test Migration Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Migration Results</Text>
        <Text style={styles.resultText}>Summary: {migrationResult.summary}</Text>
        {migrationResult.colorChanges.map((change, index) => (
          <Text key={index} style={styles.changeText}>{change}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
    padding: DesignSystem.spacing.lg,
  },
  title: {
    ...createStyles.heading('2xl'),
    marginBottom: DesignSystem.spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: DesignSystem.spacing.xl,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    padding: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.lg,
  },
  sectionTitle: {
    ...createStyles.subheading('lg'),
    marginBottom: DesignSystem.spacing.md,
    color: DesignSystem.colors.primary,
  },
  colorTest: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: DesignSystem.borderRadius.sm,
    marginHorizontal: DesignSystem.spacing.sm,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
  },
  colorText: {
    ...createStyles.body('sm'),
    fontFamily: 'monospace',
    flex: 1,
  },
  resultText: {
    ...createStyles.body('base'),
    marginBottom: DesignSystem.spacing.xs,
  },
  changeText: {
    ...createStyles.body('sm'),
    color: DesignSystem.colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: DesignSystem.spacing.xs,
  },
});
