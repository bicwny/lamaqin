
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';
import { Typography } from '@/utils/typography';
import { ComponentTokens, ComponentTextStyles, componentHelpers } from '@/utils/componentTokens';
import { Ionicons } from '@expo/vector-icons';

type TabType = 'tokens' | 'components' | 'migration' | 'colors' | 'typography';

export default function StyleTestingScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('tokens');

  const tabs = [
    { id: 'tokens' as TabType, label: 'Tokens', icon: '🎨' },
    { id: 'components' as TabType, label: 'Components', icon: '🧩' },
    { id: 'colors' as TabType, label: 'Colors', icon: '🌈' },
    { id: 'typography' as TabType, label: 'Typography', icon: '📝' },
    { id: 'migration' as TabType, label: 'Migration', icon: '🔄' },
  ];

  const renderTokensPreview = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Component Tokens Overview</Text>
      
      {/* Button Tokens */}
      <View style={styles.tokenSection}>
        <Text style={styles.tokenSectionTitle}>Button Tokens</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity style={componentHelpers.getButtonStyle('primary', 'sm')}>
            <Text style={componentHelpers.getButtonTextStyle('primary', 'sm')}>Primary Small</Text>
          </TouchableOpacity>
          <TouchableOpacity style={componentHelpers.getButtonStyle('primary', 'md')}>
            <Text style={componentHelpers.getButtonTextStyle('primary', 'md')}>Primary Medium</Text>
          </TouchableOpacity>
          <TouchableOpacity style={componentHelpers.getButtonStyle('secondary', 'md')}>
            <Text style={componentHelpers.getButtonTextStyle('secondary', 'md')}>Secondary</Text>
          </TouchableOpacity>
          <TouchableOpacity style={componentHelpers.getButtonStyle('ghost', 'md')}>
            <Text style={componentHelpers.getButtonTextStyle('ghost', 'md')}>Ghost</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Tokens */}
      <View style={styles.tokenSection}>
        <Text style={styles.tokenSectionTitle}>Card Tokens</Text>
        <View style={componentHelpers.getCardStyle('outlined', 'md')}>
          <Text style={ComponentTextStyles.subheading}>Outlined Card</Text>
          <Text style={ComponentTextStyles.body}>This is an outlined card with medium padding</Text>
        </View>
        <View style={componentHelpers.getCardStyle('elevated', 'lg')}>
          <Text style={ComponentTextStyles.subheading}>Elevated Card</Text>
          <Text style={ComponentTextStyles.body}>This is an elevated card with large padding</Text>
        </View>
      </View>

      {/* Badge Tokens */}
      <View style={styles.tokenSection}>
        <Text style={styles.tokenSectionTitle}>Badge & Pill Tokens</Text>
        <View style={styles.badgeGrid}>
          <View style={componentHelpers.getBadgeStyle('sm', 'filled', 'primary')}>
            <Text style={{ color: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"] }}>Small Badge</Text>
          </View>
          <View style={componentHelpers.getBadgeStyle('md', 'outlined', 'success')}>
            <Text style={{ color: ConsolidatedConsolidatedDesignSystem.status.success }}>Outlined</Text>
          </View>
          <View style={componentHelpers.getPillStyle('sm', 'filled', 'dharma')}>
            <Text style={{ color: ConsolidatedConsolidatedDesignSystem.colors["text-inverse"] }}>Dharma Pill</Text>
          </View>
          <View style={componentHelpers.getBadgeStyle('md', 'soft', 'warning')}>
            <Text style={{ color: ConsolidatedConsolidatedDesignSystem.status.warning }}>Soft Warning</Text>
          </View>
        </View>
      </View>

      {/* Notification Tokens */}
      <View style={styles.tokenSection}>
        <Text style={styles.tokenSectionTitle}>Notification Tokens</Text>
        <View style={ComponentTokens.notification.variants.success}>
          <Text style={ComponentTextStyles.subheading}>Success Notification</Text>
          <Text style={ComponentTextStyles.body}>This is a success message example</Text>
        </View>
        <View style={ComponentTokens.notification.variants.warning}>
          <Text style={ComponentTextStyles.subheading}>Warning Notification</Text>
          <Text style={ComponentTextStyles.body}>This is a warning message example</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderComponentsPreview = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Component System Preview</Text>
      
      {/* Spacing Showcase */}
      <View style={styles.tokenSection}>
        <Text style={styles.tokenSectionTitle}>Spacing System</Text>
        <View style={styles.spacingGrid}>
          {Object.entries(ConsolidatedDesignSystem.spacing).map(([key, value]) => (
            <View key={key} style={styles.spacingItem}>
              <View style={[styles.spacingBox, { width: value, height: value }]} />
              <Text style={styles.spacingLabel}>{key}: {value}px</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Border Radius */}
      <View style={styles.tokenSection}>
        <Text style={styles.tokenSectionTitle}>Border Radius</Text>
        <View style={styles.radiusGrid}>
          {Object.entries(ConsolidatedDesignSystem.borderRadius).map(([key, value]) => (
            <View key={key} style={styles.radiusItem}>
              <View style={[styles.radiusBox, { borderRadius: value }]} />
              <Text style={styles.radiusLabel}>{key}: {value}px</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Shadow System */}
      <View style={styles.tokenSection}>
        <Text style={styles.tokenSectionTitle}>Shadow System</Text>
        <View style={styles.shadowGrid}>
          {Object.entries(ConsolidatedDesignSystem.shadow).map(([key, shadow]) => (
            <View key={key} style={[styles.shadowBox, shadow]}>
              <Text style={styles.shadowLabel}>{key}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderColorsPreview = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Color System</Text>
      
      <View style={styles.colorGrid}>
        {Object.entries(ConsolidatedDesignSystem.colors).map(([name, color]) => (
          <View key={name} style={styles.colorItem}>
            <View style={[styles.colorSwatch, { backgroundColor: color }]} />
            <Text style={styles.colorName}>{name}</Text>
            <Text style={styles.colorValue}>{color}</Text>
          </View>
        ))}
      </View>

      {/* Semantic Colors */}
      <View style={styles.tokenSection}>
        <Text style={styles.tokenSectionTitle}>Semantic Colors</Text>
        <View style={styles.colorGrid}>
          {Object.entries(ComponentTokens.semantic).map(([name, color]) => (
            <View key={name} style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: color }]} />
              <Text style={styles.colorName}>{name}</Text>
              <Text style={styles.colorValue}>{color}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderTypographyPreview = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Typography System</Text>
      
      {/* Typography Scale */}
      <View style={styles.tokenSection}>
        <Text style={styles.tokenSectionTitle}>Typography Scale</Text>
        
        <Text style={Typography.styles.heading('3xl')}>Heading 3XL</Text>
        <Text style={Typography.styles.heading('2xl')}>Heading 2XL</Text>
        <Text style={Typography.styles.heading('xl')}>Heading XL</Text>
        <Text style={Typography.styles.heading('lg')}>Heading LG</Text>
        
        <Text style={Typography.styles.subheading('xl')}>Subheading XL</Text>
        <Text style={Typography.styles.subheading('lg')}>Subheading LG</Text>
        <Text style={Typography.styles.subheading('base')}>Subheading Base</Text>
        
        <Text style={Typography.styles.body('lg')}>Body Large Text</Text>
        <Text style={Typography.styles.body('base')}>Body Base Text</Text>
        <Text style={Typography.styles.body('sm')}>Body Small Text</Text>
        
        <Text style={Typography.styles.label('lg')}>Label Large</Text>
        <Text style={Typography.styles.label('base')}>Label Base</Text>
        <Text style={Typography.styles.label('sm')}>Label Small</Text>
        
        <Text style={Typography.styles.dharmaTitle('2xl')}>Dharma Title 2XL</Text>
        <Text style={Typography.styles.dharmaTitle('xl')}>Dharma Title XL</Text>
      </View>

      {/* Font Sizes */}
      <View style={styles.tokenSection}>
        <Text style={styles.tokenSectionTitle}>Font Sizes</Text>
        {Object.entries(ConsolidatedDesignSystem.typography.fontSize).map(([size, value]) => (
          <Text key={size} style={{ fontSize: value, marginVertical: 4 }}>
            {size}: {value}px - Sample text
          </Text>
        ))}
      </View>
    </ScrollView>
  );

  const renderMigrationTools = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Migration Tools & Helpers</Text>
      
      {/* Component Helper Examples */}
      <View style={styles.tokenSection}>
        <Text style={styles.tokenSectionTitle}>Component Helpers</Text>
        <View style={styles.codeExample}>
          <Text style={styles.codeText}>
            {`// Button Helper
componentHelpers.getButtonStyle('primary', 'medium')
componentHelpers.getLegacyButtonStyle('dharma')

// Card Helper  
componentHelpers.getCardStyle('outlined', 'comfortable')
componentHelpers.getCardWithMargin('elevated', 'spacious', 'comfortable')

// Badge Helper
componentHelpers.getBadgeStyle('medium', 'filled', 'primary')
componentHelpers.getPillStyle('small', 'filled', 'dharma')`}
          </Text>
        </View>
      </View>

      {/* Legacy Support */}
      <View style={styles.tokenSection}>
        <Text style={styles.tokenSectionTitle}>Legacy Support</Text>
        <Text style={styles.description}>
          The component system maintains backward compatibility while encouraging migration to the new consolidated system.
        </Text>
        
        {/* Legacy vs New Comparison */}
        <View style={styles.comparisonGrid}>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonTitle}>❌ Old Pattern</Text>
            <TouchableOpacity style={componentHelpers.getLegacyButtonStyle('dharma')}>
              <Text style={componentHelpers.getLegacyButtonTextStyle('dharma')}>Legacy Dharma</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonTitle}>✅ New Pattern</Text>
            <TouchableOpacity style={componentHelpers.getButtonStyle('primary', 'lg')}>
              <Text style={componentHelpers.getButtonTextStyle('primary', 'lg')}>New Primary Large</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'tokens':
        return renderTokensPreview();
      case 'components':
        return renderComponentsPreview();
      case 'colors':
        return renderColorsPreview();
      case 'typography':
        return renderTypographyPreview();
      case 'migration':
        return renderMigrationTools();
      default:
        return renderTokensPreview();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={ConsolidatedConsolidatedDesignSystem.colors["text-primary"]} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Design System Lab</Text>
          <Text style={styles.headerSubtitle}>
            Component tokens, migration tools & testing
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
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
      </ScrollView>

      {/* Content */}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
    padding: ConsolidatedDesignSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
    paddingTop: ConsolidatedDesignSystem.spacing.xl + 20, // Account for status bar
  },
  backButton: {
    marginRight: ConsolidatedDesignSystem.spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.styles.heading('xl'),
    marginBottom: ConsolidatedDesignSystem.spacing.xs,
  },
  headerSubtitle: {
    ...Typography.styles.body('sm'),
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
  },
  tabContainer: {
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
    borderBottomWidth: 1,
    borderBottomColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
    maxHeight: 80,
  },
  tabContent: {
    paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: ConsolidatedDesignSystem.spacing.sm,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
    marginRight: ConsolidatedDesignSystem.spacing.sm,
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    minWidth: 80,
    height: 60,
  },
  activeTab: {
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors.primary + '20',
    borderBottomWidth: 2,
    borderBottomColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: ConsolidatedDesignSystem.spacing.xs,
  },
  tabLabel: {
    ...Typography.styles.label('xs'),
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    textAlign: 'center',
    numberOfLines: 1,
  },
  activeTabLabel: {
    color: ConsolidatedConsolidatedDesignSystem.colors.primary,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
    padding: ConsolidatedDesignSystem.spacing.lg,
  },
  sectionTitle: {
    ...Typography.styles.heading('lg'),
    marginBottom: ConsolidatedDesignSystem.spacing.lg,
  },
  tokenSection: {
    marginBottom: ConsolidatedDesignSystem.spacing.xl,
  },
  tokenSectionTitle: {
    ...Typography.styles.subheading('lg'),
    marginBottom: ConsolidatedDesignSystem.spacing.md,
    color: ConsolidatedConsolidatedDesignSystem.colors.primary,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ConsolidatedDesignSystem.spacing.md,
    marginBottom: ConsolidatedDesignSystem.spacing.lg,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ConsolidatedDesignSystem.spacing.md,
    alignItems: 'center',
    marginBottom: ConsolidatedDesignSystem.spacing.lg,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ConsolidatedDesignSystem.spacing.md,
  },
  colorItem: {
    alignItems: 'center',
    marginBottom: ConsolidatedDesignSystem.spacing.lg,
    width: '45%',
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    marginBottom: ConsolidatedDesignSystem.spacing.sm,
    borderWidth: 1,
    borderColor: ConsolidatedConsolidatedDesignSystem.colors["border-default"],
  },
  colorName: {
    ...Typography.styles.label('sm'),
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
    marginBottom: ConsolidatedDesignSystem.spacing.xs,
  },
  colorValue: {
    ...Typography.styles.label('xs'),
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    fontFamily: 'monospace',
  },
  spacingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ConsolidatedDesignSystem.spacing.lg,
  },
  spacingItem: {
    alignItems: 'center',
    marginBottom: ConsolidatedDesignSystem.spacing.md,
  },
  spacingBox: {
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
    marginBottom: ConsolidatedDesignSystem.spacing.xs,
  },
  spacingLabel: {
    ...Typography.styles.label('xs'),
    textAlign: 'center',
  },
  radiusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ConsolidatedDesignSystem.spacing.lg,
  },
  radiusItem: {
    alignItems: 'center',
    marginBottom: ConsolidatedDesignSystem.spacing.md,
  },
  radiusBox: {
    width: 50,
    height: 50,
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
    marginBottom: ConsolidatedDesignSystem.spacing.xs,
  },
  radiusLabel: {
    ...Typography.styles.label('xs'),
    textAlign: 'center',
  },
  shadowGrid: {
    flexDirection: 'row',
    gap: ConsolidatedDesignSystem.spacing.lg,
  },
  shadowBox: {
    width: 80,
    height: 80,
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"]Secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
  },
  shadowLabel: {
    ...Typography.styles.label('sm'),
  },
  codeExample: {
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors["surface-primary"],
    padding: ConsolidatedDesignSystem.spacing.md,
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
    marginBottom: ConsolidatedDesignSystem.spacing.lg,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: ConsolidatedDesignSystem.typography.fontSize.sm,
    color: ConsolidatedConsolidatedDesignSystem.colors["text-primary"],
    lineHeight: ConsolidatedDesignSystem.typography.lineHeight.relaxed * ConsolidatedDesignSystem.typography.fontSize.sm,
  },
  description: {
    ...Typography.styles.body('base'),
    color: ConsolidatedConsolidatedDesignSystem.colors["text-secondary"],
    marginBottom: ConsolidatedDesignSystem.spacing.md,
  },
  comparisonGrid: {
    flexDirection: 'row',
    gap: ConsolidatedDesignSystem.spacing.lg,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonTitle: {
    ...Typography.styles.label('sm'),
    marginBottom: ConsolidatedDesignSystem.spacing.sm,
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
  },
});
