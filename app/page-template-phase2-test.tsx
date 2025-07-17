
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import PageTemplate from '@/components/PageTemplate';
import { DesignSystem } from '@/constants/DesignSystem';

export default function PageTemplatePhase2Test() {
  const testCases = [
    {
      variant: 'default' as const,
      title: 'Default Background',
      description: 'Standard page background'
    },
    {
      variant: 'secondary' as const,
      title: 'Secondary Background',
      description: 'Card-like background'
    },
    {
      variant: 'dharma' as const,
      title: 'Red Tara - Dharma',
      description: 'Practice energy & determination'
    },
    {
      variant: 'practice' as const,
      title: 'Green Tara - Practice',
      description: 'Growth & completion'
    },
    {
      variant: 'meditation' as const,
      title: 'Blue Tara - Meditation',
      description: 'Contemplation & deep practice'
    },
    {
      variant: 'study' as const,
      title: 'Yellow Tara - Study',
      description: 'Wisdom & achievement'
    },
    {
      variant: 'mindfulness' as const,
      title: 'Orange Tara - Mindfulness',
      description: 'Mindfulness & compassion'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>PageTemplate Tara Buddhist Semantic Test</Text>
      
      {testCases.map((testCase, index) => (
        <View key={index} style={styles.testSection}>
          <Text style={styles.testTitle}>{testCase.title}</Text>
          <Text style={styles.testDescription}>{testCase.description}</Text>
          
          <View style={styles.templateContainer}>
            <PageTemplate
              title={testCase.title}
              backgroundVariant={testCase.variant}
              showHeader={false}
              scrollable={false}
              padding="md"
            >
              <View style={styles.contentSample}>
                <Text style={styles.sampleText}>Sample content with Tara theming</Text>
                <Text style={styles.sampleSubtext}>Background variant: {testCase.variant}</Text>
              </View>
            </PageTemplate>
          </View>
        </View>
      ))}

      <View style={styles.testSection}>
        <Text style={styles.testTitle}>Tara Color Reference</Text>
        <View style={styles.colorGrid}>
          <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.redTara }]}>
            <Text style={styles.colorLabel}>Red Tara</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.orangeTara }]}>
            <Text style={styles.colorLabel}>Orange Tara</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.yellowTara }]}>
            <Text style={[styles.colorLabel, { color: DesignSystem.colors.textPrimary }]}>Yellow Tara</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.blueTara }]}>
            <Text style={styles.colorLabel}>Blue Tara</Text>
          </View>
          <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.greenTara }]}>
            <Text style={styles.colorLabel}>Green Tara</Text>
          </View>
        </View>
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
  mainTitle: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.xl,
    textAlign: 'center',
  },
  testSection: {
    marginBottom: DesignSystem.spacing['2xl'],
  },
  testTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.sm,
  },
  testDescription: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.textSecondary,
    marginBottom: DesignSystem.spacing.md,
  },
  templateContainer: {
    height: 120,
    borderRadius: DesignSystem.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DesignSystem.colors.borderLight,
  },
  contentSample: {
    padding: DesignSystem.spacing.md,
  },
  sampleText: {
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.medium,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.xs,
  },
  sampleSubtext: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.textSecondary,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.sm,
  },
  colorSwatch: {
    width: 80,
    height: 60,
    borderRadius: DesignSystem.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  colorLabel: {
    fontSize: DesignSystem.typography.fontSize.xs,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textInverse,
    textAlign: 'center',
  },
});
