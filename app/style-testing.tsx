
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { Typography } from '@/utils/typography';
import { DesignTokenPreview, ComponentComparison, MigrationValidator } from '@/components/StyleTesting';

type TabType = 'tokens' | 'comparison' | 'validator';

export default function StyleTestingScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('tokens');

  const tabs = [
    { id: 'tokens' as TabType, label: 'Design Tokens', icon: '🎨' },
    { id: 'comparison' as TabType, label: 'Comparison', icon: '🔄' },
    { id: 'validator' as TabType, label: 'Validator', icon: '✅' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'tokens':
        return <DesignTokenPreview />;
      case 'comparison':
        return <ComponentComparison />;
      case 'validator':
        return <MigrationValidator />;
      default:
        return <DesignTokenPreview />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Style Testing Lab</Text>
        <Text style={styles.headerSubtitle}>
          Validate design system migration and test components
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.id && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
  },
  header: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    padding: DesignSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border,
  },
  headerTitle: {
    ...Typography.styles.heading('xl'),
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xs,
  },
  headerSubtitle: {
    ...Typography.styles.body('sm'),
    textAlign: 'center',
    color: DesignSystem.colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.sm,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: DesignSystem.colors.primary,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: DesignSystem.spacing.xs,
  },
  tabLabel: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textSecondary,
  },
  activeTabLabel: {
    color: DesignSystem.colors.primary,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
});
