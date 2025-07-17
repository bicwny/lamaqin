
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DesignSystem, colorWithOpacity } from '@/constants/DesignSystem';
import { Typography } from '@/utils/typography';

export default function OpacityTestScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Opacity System Test</Text>
      
      {/* Test Background Opacity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Background Opacity</Text>
        {Object.keys(DesignSystem.opacity).map((opacityKey) => (
          <View 
            key={opacityKey}
            style={[
              styles.testBox,
              { backgroundColor: colorWithOpacity.backgroundWithOpacity(DesignSystem.colors.primary, opacityKey as keyof typeof DesignSystem.opacity) }
            ]}
          >
            <Text style={styles.testLabel}>Opacity {opacityKey}: {DesignSystem.opacity[opacityKey as keyof typeof DesignSystem.opacity]}</Text>
          </View>
        ))}
      </View>

      {/* Test Buddhist Color Opacity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buddhist Color Opacity</Text>
        <View style={[styles.testBox, { backgroundColor: colorWithOpacity.buddhist.dharmaWithOpacity(20) }]}>
          <Text style={styles.testLabel}>Dharma Red 20%</Text>
        </View>
        <View style={[styles.testBox, { backgroundColor: colorWithOpacity.buddhist.compassionWithOpacity(50) }]}>
          <Text style={styles.testLabel}>Compassion Orange 50%</Text>
        </View>
        <View style={[styles.testBox, { backgroundColor: colorWithOpacity.buddhist.wisdomWithOpacity(80) }]}>
          <Text style={styles.testLabel}>Wisdom Gold 80%</Text>
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
  title: {
    ...Typography.styles.heading('2xl'),
    marginBottom: DesignSystem.spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: DesignSystem.spacing.xl,
  },
  sectionTitle: {
    ...Typography.styles.subheading('lg'),
    marginBottom: DesignSystem.spacing.md,
    color: DesignSystem.colors.primary,
  },
  testBox: {
    padding: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
  },
  testLabel: {
    ...Typography.styles.body('sm'),
    color: DesignSystem.colors.textPrimary,
  },
});
