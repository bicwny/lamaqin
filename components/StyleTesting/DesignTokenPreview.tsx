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

        {/* Typography Styles */}
        <Text style={styles.subSectionTitle}>Typography Styles</Text>
        <View style={styles.typographyStylesGrid}>
          <View style={styles.typographyStyleItem}>
            <Text style={styles.componentLabel}>Heading XL</Text>
            <Text style={Typography.styles.heading('xl')}>Heading XL Sample</Text>
          </View>
          <View style={styles.typographyStyleItem}>
            <Text style={styles.componentLabel}>Heading 2XL</Text>
            <Text style={Typography.styles.heading('2xl')}>Heading 2XL Sample</Text>
          </View>
          <View style={styles.typographyStyleItem}>
            <Text style={styles.componentLabel}>Subheading LG</Text>
            <Text style={Typography.styles.subheading('lg')}>Subheading LG Sample</Text>
          </View>
          <View style={styles.typographyStyleItem}>
            <Text style={styles.componentLabel}>Body Base</Text>
            <Text style={Typography.styles.body('base')}>Body Base Sample</Text>
          </View>
          <View style={styles.typographyStyleItem}>
            <Text style={styles.componentLabel}>Label SM</Text>
            <Text style={Typography.styles.label('sm')}>Label SM Sample</Text>
          </View>
        </View>
      </View>

      {/* Spacing Tokens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spacing Tokens</Text>
        <View style={styles.spacingGrid}>
          {Object.entries(DesignSystem.spacing).map(([size, value]) => (
            <View key={size} style={styles.spacingItem}>
              <View style={[styles.spacingBox, { width: value, height: value }]} />
              <Text style={styles.spacingLabel}>{size}: {value}px</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Border Radius Tokens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Border Radius Tokens</Text>
        <View style={styles.borderRadiusGrid}>
          {Object.entries(DesignSystem.borderRadius).map(([size, value]) => (
            <View key={size} style={styles.borderRadiusItem}>
              <View style={[styles.borderRadiusBox, { borderRadius: value }]} />
              <Text style={styles.borderRadiusLabel}>{size}: {value}px</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Shadow Tokens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shadow Tokens</Text>
        <View style={styles.shadowGrid}>
          {Object.entries(DesignSystem.shadow).map(([size, shadowStyle]) => (
            <View key={size} style={styles.shadowItem}>
              <View style={[styles.shadowBox, shadowStyle]} />
              <Text style={styles.shadowLabel}>{size} shadow</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.background,
  },
  title: {
    ...Typography.styles.heading('2xl'),
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xl,
    color: DesignSystem.colors.textPrimary,
  },
  section: {
    marginBottom: DesignSystem.spacing['2xl'],
  },
  sectionTitle: {
    ...Typography.styles.heading('xl'),
    marginBottom: DesignSystem.spacing.lg,
    color: DesignSystem.colors.textPrimary,
  },
  subSectionTitle: {
    ...Typography.styles.subheading('lg'),
    marginTop: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.md,
    color: DesignSystem.colors.textSecondary,
  },

  // Component Grids
  componentGrid: {
    gap: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.xl,
  },
  componentItem: {
    marginBottom: DesignSystem.spacing.lg,
  },
  componentLabel: {
    ...Typography.styles.label('sm'),
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    marginBottom: DesignSystem.spacing.sm,
    color: DesignSystem.colors.textSecondary,
    textTransform: 'capitalize' as const,
  },
  buttonText: {
    color: DesignSystem.colors.textInverse,
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  inputPlaceholder: {
    color: DesignSystem.colors.textSecondary,
  },
  modalPreview: {
    minHeight: 80,
    maxWidth: '90%',
  },

  // Typography Styles Grid
  typographyStylesGrid: {
    gap: DesignSystem.spacing.md,
  },
  typographyStyleItem: {
    marginBottom: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
  },

  // Color Grid
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.md,
  },
  colorItem: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
    minWidth: 100,
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
    ...Typography.styles.label('sm'),
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  colorValue: {
    ...Typography.styles.label('xs'),
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
  },

  // Typography Grid
  typographyItem: {
    marginBottom: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
  },
  sampleText: {
    color: DesignSystem.colors.textPrimary,
  },

  // Spacing Grid
  spacingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.md,
  },
  spacingItem: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
    minWidth: 120,
  },
  spacingBox: {
    backgroundColor: DesignSystem.colors.primary,
    marginBottom: DesignSystem.spacing.xs,
    minWidth: 20,
    minHeight: 20,
  },
  spacingLabel: {
    ...Typography.styles.label('xs'),
    color: DesignSystem.colors.textPrimary,
    textAlign: 'center',
  },

  // Border Radius Grid
  borderRadiusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.md,
  },
  borderRadiusItem: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
    minWidth: 100,
  },
  borderRadiusBox: {
    width: 60,
    height: 60,
    backgroundColor: DesignSystem.colors.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  borderRadiusLabel: {
    ...Typography.styles.label('xs'),
    color: DesignSystem.colors.textPrimary,
    textAlign: 'center',
  },

  // Shadow Grid
  shadowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.lg,
  },
  shadowItem: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.lg,
    minWidth: 100,
  },
  shadowBox: {
    width: 60,
    height: 60,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    marginBottom: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.md,
  },
  shadowLabel: {
    ...Typography.styles.label('xs'),
    color: DesignSystem.colors.textPrimary,
    textAlign: 'center',
  },
});