
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '@/components/Header';
import PageHeader from '@/components/PageHeader';
import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';

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
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
  },
  title: {
    fontSize: ConsolidatedDesignSystem.typography.fontSize['2xl'],
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    textAlign: 'center',
    padding: ConsolidatedDesignSystem.spacing.xl,
  },
  section: {
    marginBottom: ConsolidatedDesignSystem.spacing.xl,
  },
  sectionTitle: {
    fontSize: ConsolidatedDesignSystem.typography.fontSize.lg,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    paddingHorizontal: ConsolidatedDesignSystem.spacing.lg,
    paddingVertical: ConsolidatedDesignSystem.spacing.md,
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
  },
  benefitsSection: {
    margin: ConsolidatedDesignSystem.spacing.lg,
    padding: ConsolidatedDesignSystem.spacing.lg,
    backgroundColor: ConsolidatedConsolidatedDesignSystem.status.successBackground,
    borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: ConsolidatedConsolidatedDesignSystem.status.success,
  },
  benefitsTitle: {
    fontSize: ConsolidatedDesignSystem.typography.fontSize.lg,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.bold,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    marginBottom: ConsolidatedDesignSystem.spacing.md,
  },
  benefitItem: {
    fontSize: ConsolidatedDesignSystem.typography.fontSize.base,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    marginBottom: ConsolidatedDesignSystem.spacing.xs,
    lineHeight: 24,
  },
});
