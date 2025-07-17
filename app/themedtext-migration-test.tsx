
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { DesignSystem } from '@/constants/DesignSystem';

export default function ThemedTextMigrationTest() {
  return (
    <ScrollView style={styles.container}>
      <ThemedText variant="heading" style={styles.pageTitle}>
        ThemedText Migration Test
      </ThemedText>
      
      {/* New Variant System */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          New Variant System
        </ThemedText>
        
        <ThemedText variant="heading">Heading Text</ThemedText>
        <ThemedText variant="subheading">Subheading Text</ThemedText>
        <ThemedText variant="body">Body text for general content</ThemedText>
        <ThemedText variant="label">Label text for forms</ThemedText>
        <ThemedText variant="caption">Caption text for small details</ThemedText>
        <ThemedText variant="link">Link text (clickable)</ThemedText>
      </View>

      {/* Buddhist Semantic Colors */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          Buddhist Semantic Variants
        </ThemedText>
        
        <ThemedText variant="dharma">Dharma Practice Title</ThemedText>
        <ThemedText variant="practice">Practice Description Text</ThemedText>
        <ThemedText variant="success">Success/Completion Text</ThemedText>
      </View>

      {/* Legacy Type System (Backward Compatibility) */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          Legacy Type System (Backward Compatibility)
        </ThemedText>
        
        <ThemedText type="title">Legacy Title</ThemedText>
        <ThemedText type="subtitle">Legacy Subtitle</ThemedText>
        <ThemedText type="default">Legacy Default Text</ThemedText>
        <ThemedText type="defaultSemiBold">Legacy SemiBold Text</ThemedText>
        <ThemedText type="link">Legacy Link Text</ThemedText>
      </View>

      {/* Size Overrides */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          Size Overrides
        </ThemedText>
        
        <ThemedText variant="body" size="xs">Extra Small Body</ThemedText>
        <ThemedText variant="body" size="sm">Small Body</ThemedText>
        <ThemedText variant="body" size="base">Base Body</ThemedText>
        <ThemedText variant="body" size="lg">Large Body</ThemedText>
        <ThemedText variant="body" size="xl">Extra Large Body</ThemedText>
      </View>

      {/* Color Overrides */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          Color Overrides
        </ThemedText>
        
        <ThemedText variant="body" color={DesignSystem.colors.primary}>
          Primary Color Override
        </ThemedText>
        <ThemedText variant="body" color={DesignSystem.colors.success}>
          Success Color Override
        </ThemedText>
        <ThemedText variant="body" color={DesignSystem.colors.dharmaRed}>
          Dharma Red Override
        </ThemedText>
        <ThemedText variant="body" color={DesignSystem.colors.wisdomGold}>
          Wisdom Gold Override
        </ThemedText>
      </View>

      {/* Comparison: Before vs After */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          Before vs After Comparison
        </ThemedText>
        
        <View style={styles.comparisonRow}>
          <View style={styles.comparisonColumn}>
            <ThemedText variant="caption" color={DesignSystem.colors.textTertiary}>
              BEFORE (hardcoded)
            </ThemedText>
            <ThemedText style={{ fontSize: 16, color: '#0a7ea4' }}>
              Old hardcoded link
            </ThemedText>
          </View>
          
          <View style={styles.comparisonColumn}>
            <ThemedText variant="caption" color={DesignSystem.colors.textTertiary}>
              AFTER (design system)
            </ThemedText>
            <ThemedText variant="link">
              New semantic link
            </ThemedText>
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
  
  pageTitle: {
    marginBottom: DesignSystem.spacing['2xl'],
    textAlign: 'center',
  },
  
  section: {
    marginBottom: DesignSystem.spacing['2xl'],
    padding: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    ...DesignSystem.shadow.sm,
  },
  
  sectionTitle: {
    marginBottom: DesignSystem.spacing.lg,
    color: DesignSystem.colors.primary,
  },
  
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  comparisonColumn: {
    flex: 1,
    marginHorizontal: DesignSystem.spacing.sm,
  },
});
