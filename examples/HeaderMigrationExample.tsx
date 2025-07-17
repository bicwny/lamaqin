
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '@/components/Header';
import PageHeader from '@/components/PageHeader';
import { DesignSystem } from '@/constants/DesignSystem';

/**
 * Example showing how to migrate from old header patterns to new consolidated Header component
 */

export default function HeaderMigrationExample() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Header Consolidation Examples</Text>
      
      {/* OLD WAY - PageHeader (still works via wrapper) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ PageHeader (Wrapper - Still Works)</Text>
        <PageHeader
          title="Page Title"
          subtitle="Using PageHeader wrapper"
          showBackButton={true}
          onBackPress={() => {}}
          rightAction={{
            text: "编辑",
            onPress: () => {},
          }}
        />
      </View>

      {/* NEW WAY - Direct Header component usage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ New Header Component (Direct)</Text>
        
        {/* Page context */}
        <Header
          title="Page Context"
          subtitle="Direct Header usage"
          context="page"
          showBackButton={true}
          onBackPress={() => {}}
          rightAction={{
            text: "编辑",
            onPress: () => {},
          }}
        />
        
        {/* Modal context */}
        <Header
          title="Modal Context"
          context="modal"
          leftAction={{
            text: "取消",
            onPress: () => {},
          }}
          rightAction={{
            text: "保存",
            onPress: () => {},
          }}
        />
        
        {/* Section context */}
        <Header
          title="Section Context"
          context="section"
          rightAction={{
            text: "查看全部",
            onPress: () => {},
          }}
        />
      </View>

      {/* Migration Benefits */}
      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>✅ Consolidation Benefits</Text>
        <Text style={styles.benefitItem}>• Single Header component for all contexts</Text>
        <Text style={styles.benefitItem}>• Consistent styling across app</Text>
        <Text style={styles.benefitItem}>• Reduced bundle size (~150 lines)</Text>
        <Text style={styles.benefitItem}>• Backward compatible via PageHeader wrapper</Text>
        <Text style={styles.benefitItem}>• Type-safe context prop</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
  },
  title: {
    fontSize: DesignSystem.typography.fontSize['2xl'],
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.textPrimary,
    textAlign: 'center',
    padding: DesignSystem.spacing.xl,
  },
  section: {
    marginBottom: DesignSystem.spacing.xl,
  },
  sectionTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.textPrimary,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
  },
  benefitsSection: {
    margin: DesignSystem.spacing.lg,
    padding: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.successBackground,
    borderRadius: DesignSystem.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: DesignSystem.colors.practiceComplete,
  },
  benefitsTitle: {
    fontSize: DesignSystem.typography.fontSize.lg,
    fontWeight: DesignSystem.typography.fontWeight.bold,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.md,
  },
  benefitItem: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.xs,
    lineHeight: 24,
  },
});
