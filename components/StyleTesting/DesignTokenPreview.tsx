
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { Typography } from '@/utils/typography';

export function DesignTokenPreview() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Design System Tokens Preview</Text>
      
      {/* Color Tokens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color Tokens</Text>
        <View style={styles.colorGrid}>
          {Object.entries(DesignSystem.colors).map(([name, color]) => (
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
        {Object.entries(DesignSystem.typography.fontSize).map(([size, value]) => (
          <View key={size} style={styles.typographyItem}>
            <Text style={[styles.sampleText, { fontSize: value }]}>
              Sample Text ({size}: {value}px)
            </Text>
          </View>
        ))}

        {/* Font Weights */}
        <Text style={styles.subSectionTitle}>Font Weights</Text>
        {Object.entries(DesignSystem.typography.fontWeight).map(([weight, value]) => (
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
        {Object.entries(DesignSystem.spacing).map(([size, value]) => (
          <View key={size} style={styles.spacingItem}>
            <Text style={styles.spacingLabel}>{size}: {value}px</Text>
            <View style={[styles.spacingBox, { width: value, height: 20 }]} />
          </View>
        ))}
      </View>

      {/* Border Radius Tokens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Border Radius Tokens</Text>
        {Object.entries(DesignSystem.borderRadius).map(([size, value]) => (
          <View key={size} style={styles.radiusItem}>
            <Text style={styles.radiusLabel}>{size}: {value}px</Text>
            <View style={[styles.radiusBox, { borderRadius: value }]} />
          </View>
        ))}
      </View>

      {/* Shadow Tokens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shadow Tokens</Text>
        {Object.entries(DesignSystem.shadow).map(([size, shadowProps]) => (
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
    backgroundColor: DesignSystem.colors.background,
    padding: DesignSystem.spacing.lg,
  },
  title: {
    ...Typography.styles.heading('2xl'),
    marginBottom: DesignSystem.spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: DesignSystem.spacing['3xl'],
  },
  sectionTitle: {
    ...Typography.styles.subheading('xl'),
    marginBottom: DesignSystem.spacing.lg,
    color: DesignSystem.colors.primary,
  },
  subSectionTitle: {
    ...Typography.styles.subheading('lg'),
    marginTop: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.md,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.md,
  },
  colorItem: {
    alignItems: 'center',
    width: 100,
    marginBottom: DesignSystem.spacing.md,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: DesignSystem.borderRadius.md,
    marginBottom: DesignSystem.spacing.xs,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
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
    paddingVertical: DesignSystem.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
  },
  sampleText: {
    color: DesignSystem.colors.textPrimary,
  },
  spacingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  spacingLabel: {
    ...Typography.styles.label('sm'),
    width: 100,
  },
  spacingBox: {
    backgroundColor: DesignSystem.colors.primary,
    marginLeft: DesignSystem.spacing.md,
  },
  radiusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  radiusLabel: {
    ...Typography.styles.label('sm'),
    width: 100,
  },
  radiusBox: {
    width: 60,
    height: 40,
    backgroundColor: DesignSystem.colors.primaryLight,
    marginLeft: DesignSystem.spacing.md,
  },
  shadowItem: {
    marginBottom: DesignSystem.spacing.lg,
  },
  shadowLabel: {
    ...Typography.styles.label('sm'),
    marginBottom: DesignSystem.spacing.sm,
  },
  shadowBox: {
    width: 100,
    height: 60,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
  },
});
