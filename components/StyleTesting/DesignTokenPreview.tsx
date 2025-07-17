
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';
import { Typography } from '@/utils/typography';

export function DesignTokenPreview() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Design System Tokens Preview</Text>
      
      {/* Color Tokens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color Tokens</Text>
        <View style={styles.colorGrid}>
          {Object.entries(ConsolidatedDesignSystem.colors).map(([name, color]) => (
            <View key={name} style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: color }]} />
              <Text style={styles.colorName}>{name}</Text>
              <Text style={styles.colorValue}>{color}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Typography Tokens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Typography Tokens</Text>
        
        {/* Font Sizes */}
        <Text style={styles.subSectionTitle}>Font Sizes</Text>
        {Object.entries(ConsolidatedDesignSystem.typography.fontSize).map(([size, value]) => (
          <View key={size} style={styles.typographyItem}>
            <Text style={[styles.sampleText, { fontSize: value }]}>
              Sample Text ({size}: {value}px)
            </Text>
          </View>
        ))}

        {/* Font Weights */}
        <Text style={styles.subSectionTitle}>Font Weights</Text>
        {Object.entries(ConsolidatedDesignSystem.typography.fontWeight).map(([weight, value]) => (
          <View key={weight} style={styles.typographyItem}>
            <Text style={[styles.sampleText, { fontWeight: value }]}>
              Sample Text ({weight}: {value})
            </Text>
          </View>
        ))}
      </View>

      {/* Spacing Tokens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spacing Tokens</Text>
        {Object.entries(ConsolidatedDesignSystem.spacing).map(([size, value]) => (
          <View key={size} style={styles.spacingItem}>
            <Text style={styles.spacingLabel}>{size}: {value}px</Text>
            <View style={[styles.spacingBox, { width: value, height: 20 }]} />
          </View>
        ))}
      </View>

      {/* Border Radius Tokens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Border Radius Tokens</Text>
        {Object.entries(ConsolidatedDesignSystem.borderRadius).map(([size, value]) => (
          <View key={size} style={styles.radiusItem}>
            <Text style={styles.radiusLabel}>{size}: {value}px</Text>
            <View style={[styles.radiusBox, { borderRadius: value }]} />
          </View>
        ))}
      </View>

      {/* Shadow Tokens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shadow Tokens</Text>
        {Object.entries(ConsolidatedDesignSystem.shadow).map(([size, shadowProps]) => (
          <View key={size} style={styles.shadowItem}>
            <Text style={styles.shadowLabel}>{size}</Text>
            <View style={[styles.shadowBox, shadowProps]} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ConsolidatedDesignSystem.colors["surface-primary"],
    padding: ConsolidatedDesignSystem.spacing.lg,
  },
  title: {
    ...Typography.styles.heading('2xl'),
    marginBottom: ConsolidatedDesignSystem.spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: ConsolidatedDesignSystem.spacing['3xl'],
  },
  sectionTitle: {
    ...Typography.styles.subheading('xl'),
    marginBottom: ConsolidatedDesignSystem.spacing.lg,
    color: ConsolidatedConsolidatedDesignSystem.colors.primary,
  },
  subSectionTitle: {
    ...Typography.styles.subheading('lg'),
    marginTop: ConsolidatedDesignSystem.spacing.lg,
    marginBottom: ConsolidatedDesignSystem.spacing.md,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ConsolidatedDesignSystem.spacing.md,
  },
  colorItem: {
    alignItems: 'center',
    width: 100,
    marginBottom: ConsolidatedDesignSystem.spacing.md,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    marginBottom: ConsolidatedDesignSystem.spacing.xs,
    borderWidth: 1,
    borderColor: ConsolidatedDesignSystem.colors["border-default"],
  },
  colorName: {
    ...Typography.styles.label('xs'),
    textAlign: 'center',
  },
  colorValue: {
    ...Typography.styles.caption(),
    textAlign: 'center',
  },
  typographyItem: {
    paddingVertical: ConsolidatedDesignSystem.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: ConsolidatedDesignSystem.colors["border-default"]Light,
  },
  sampleText: {
    color: ConsolidatedDesignSystem.colors["text-primary"],
  },
  spacingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ConsolidatedDesignSystem.spacing.sm,
  },
  spacingLabel: {
    ...Typography.styles.label('sm'),
    width: 100,
  },
  spacingBox: {
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
    marginLeft: ConsolidatedDesignSystem.spacing.md,
  },
  radiusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ConsolidatedDesignSystem.spacing.md,
  },
  radiusLabel: {
    ...Typography.styles.label('sm'),
    width: 100,
  },
  radiusBox: {
    width: 60,
    height: 40,
    backgroundColor: ConsolidatedDesignSystem.colorUtils.lighten(ConsolidatedConsolidatedDesignSystem.colors.primary),
    marginLeft: ConsolidatedDesignSystem.spacing.md,
  },
  shadowItem: {
    marginBottom: ConsolidatedDesignSystem.spacing.lg,
  },
  shadowLabel: {
    ...Typography.styles.label('sm'),
    marginBottom: ConsolidatedDesignSystem.spacing.sm,
  },
  shadowBox: {
    width: 100,
    height: 60,
    backgroundColor: ConsolidatedDesignSystem.colorsConsolidatedDesignSystem.colors["surface-secondary"],
  },
});
