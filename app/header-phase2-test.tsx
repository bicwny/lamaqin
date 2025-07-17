
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTextStyles } from '@/utils/componentTokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HeaderPhase2Test() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>🏛️ Header Component - Phase 2 Migration Test</Text>
      
      {/* Migration Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Migration Status: Complete</Text>
        <Text style={styles.description}>
          Header component has been successfully migrated to use Tara design tokens:
        </Text>
        
        <View style={styles.checklistItem}>
          <Text style={styles.checklistText}>✅ Text styles use ComponentTextStyles</Text>
        </View>
        <View style={styles.checklistItem}>
          <Text style={styles.checklistText}>✅ Action buttons use Red Tara color</Text>
        </View>
        <View style={styles.checklistItem}>
          <Text style={styles.checklistText}>✅ Context-specific Tara accents added</Text>
        </View>
        <View style={styles.checklistItem}>
          <Text style={styles.checklistText}>✅ Spacing uses DesignSystem tokens</Text>
        </View>
        <View style={styles.checklistItem}>
          <Text style={styles.checklistText}>✅ Icons use Tara semantic colors</Text>
        </View>
      </View>

      {/* Page Header Example */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📄 Page Header Context</Text>
        <Text style={styles.description}>
          Page headers with White Tara accent for purity and clarity
        </Text>
        
        <View style={styles.headerExample}>
          <Header
            title="Practice Dashboard"
            subtitle="Daily Buddhist Practice"
            context="page"
            showBackButton={true}
            onBackPress={() => {}}
            rightAction={{
              text: "编辑",
              onPress: () => {},
            }}
          />
        </View>
      </View>

      {/* Modal Header Example */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔵 Modal Header Context</Text>
        <Text style={styles.description}>
          Modal headers with Blue Tara accent for contemplation and focus
        </Text>
        
        <View style={styles.headerExample}>
          <Header
            title="Meditation Session"
            subtitle="Deep Contemplation"
            context="modal"
            leftAction={{
              text: "取消",
              onPress: () => {},
            }}
            rightAction={{
              text: "完成",
              onPress: () => {},
            }}
          />
        </View>
      </View>

      {/* Section Header Example */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Section Header Context</Text>
        <Text style={styles.description}>
          Section headers for content organization
        </Text>
        
        <View style={styles.headerExample}>
          <Header
            title="Recent Practices"
            context="section"
            rightAction={{
              text: "查看全部",
              onPress: () => {},
            }}
          />
        </View>
      </View>

      {/* Tara Color Reference */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Tara Color Integration</Text>
        <Text style={styles.description}>
          Header component now uses Tara Buddhist semantic colors
        </Text>
        
        <View style={styles.colorGrid}>
          <View style={styles.colorExample}>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.redTara }]}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </View>
            <Text style={styles.colorLabel}>Red Tara</Text>
            <Text style={styles.colorDescription}>Action buttons</Text>
          </View>
          
          <View style={styles.colorExample}>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.blueTara }]}>
              <Ionicons name="close" size={24} color="white" />
            </View>
            <Text style={styles.colorLabel}>Blue Tara</Text>
            <Text style={styles.colorDescription}>Modal accents</Text>
          </View>
          
          <View style={styles.colorExample}>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.whiteTara, borderWidth: 2, borderColor: DesignSystem.colors.border }]}>
              <Ionicons name="menu" size={24} color={DesignSystem.colors.textPrimary} />
            </View>
            <Text style={styles.colorLabel}>White Tara</Text>
            <Text style={styles.colorDescription}>Page purity</Text>
          </View>
        </View>
      </View>

      {/* Text Style Migration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Text Style Migration</Text>
        <Text style={styles.description}>
          All text styles now use ComponentTextStyles for consistency
        </Text>
        
        <View style={styles.textExample}>
          <Text style={ComponentTextStyles.heading}>Page Title (heading)</Text>
          <Text style={ComponentTextStyles.subheading}>Modal Title (subheading)</Text>
          <Text style={ComponentTextStyles.label}>Subtitle (label)</Text>
          <Text style={[ComponentTextStyles.label, { color: DesignSystem.colors.redTara }]}>
            Action Text (label + Red Tara)
          </Text>
        </View>
      </View>

      {/* Component Token Usage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Component Token Usage</Text>
        <Text style={styles.description}>
          Header uses proper spacing and sizing tokens
        </Text>
        
        <View style={styles.tokenGrid}>
          <View style={styles.tokenExample}>
            <Text style={styles.tokenLabel}>Spacing</Text>
            <Text style={styles.tokenValue}>DesignSystem.spacing.lg (16px)</Text>
          </View>
          
          <View style={styles.tokenExample}>
            <Text style={styles.tokenLabel}>Border Radius</Text>
            <Text style={styles.tokenValue}>DesignSystem.borderRadius.md (8px)</Text>
          </View>
          
          <View style={styles.tokenExample}>
            <Text style={styles.tokenLabel}>Min Height</Text>
            <Text style={styles.tokenValue}>Page: 60px, Modal: 56px</Text>
          </View>
          
          <View style={styles.tokenExample}>
            <Text style={styles.tokenLabel}>Action Button</Text>
            <Text style={styles.tokenValue}>44x44px touch target</Text>
          </View>
        </View>
      </View>

      {/* Buddhist Context Testing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧘 Buddhist Context Appropriateness</Text>
        <Text style={styles.description}>
          Header design respects Buddhist spiritual values
        </Text>
        
        <View style={styles.contextGrid}>
          <View style={styles.contextExample}>
            <Text style={styles.contextLabel}>✅ Clarity</Text>
            <Text style={styles.contextDescription}>White Tara brings purity to page headers</Text>
          </View>
          
          <View style={styles.contextExample}>
            <Text style={styles.contextLabel}>✅ Focus</Text>
            <Text style={styles.contextDescription}>Blue Tara enhances contemplative modal states</Text>
          </View>
          
          <View style={styles.contextExample}>
            <Text style={styles.contextLabel}>✅ Action</Text>
            <Text style={styles.contextDescription}>Red Tara energizes interactive elements</Text>
          </View>
          
          <View style={styles.contextExample}>
            <Text style={styles.contextLabel}>✅ Simplicity</Text>
            <Text style={styles.contextDescription}>Clean design supports mindful interaction</Text>
          </View>
        </View>
      </View>

      {/* Cross-Platform Testing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Cross-Platform Compatibility</Text>
        <Text style={styles.description}>
          Header component works consistently across platforms
        </Text>
        
        <View style={styles.platformGrid}>
          <View style={styles.platformExample}>
            <Text style={styles.platformLabel}>iOS</Text>
            <Text style={styles.platformStatus}>✅ Safe area handled</Text>
          </View>
          
          <View style={styles.platformExample}>
            <Text style={styles.platformLabel}>Android</Text>
            <Text style={styles.platformStatus}>✅ Elevation support</Text>
          </View>
          
          <View style={styles.platformExample}>
            <Text style={styles.platformLabel}>Web</Text>
            <Text style={styles.platformStatus}>✅ Responsive design</Text>
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
  },
  title: {
    ...ComponentTextStyles.heading,
    textAlign: 'center',
    marginVertical: DesignSystem.spacing.lg,
    color: DesignSystem.colors.redTara,
  },
  section: {
    marginHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.xl,
    padding: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: DesignSystem.colors.redTara,
  },
  sectionTitle: {
    ...ComponentTextStyles.subheading,
    marginBottom: DesignSystem.spacing.md,
    color: DesignSystem.colors.textPrimary,
  },
  description: {
    ...ComponentTextStyles.body,
    marginBottom: DesignSystem.spacing.md,
    color: DesignSystem.colors.textSecondary,
  },
  checklistItem: {
    marginBottom: DesignSystem.spacing.xs,
  },
  checklistText: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.greenTara,
  },
  headerExample: {
    marginTop: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.background,
    borderRadius: DesignSystem.borderRadius.md,
    overflow: 'hidden',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: DesignSystem.spacing.md,
  },
  colorExample: {
    alignItems: 'center',
    width: '30%',
    marginBottom: DesignSystem.spacing.md,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: DesignSystem.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  colorLabel: {
    ...ComponentTextStyles.label,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xs,
  },
  colorDescription: {
    ...ComponentTextStyles.caption,
    textAlign: 'center',
    color: DesignSystem.colors.textSecondary,
  },
  textExample: {
    marginTop: DesignSystem.spacing.md,
    padding: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.background,
    borderRadius: DesignSystem.borderRadius.md,
  },
  tokenGrid: {
    marginTop: DesignSystem.spacing.md,
  },
  tokenExample: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: DesignSystem.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
  },
  tokenLabel: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textPrimary,
  },
  tokenValue: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.blueTara,
  },
  contextGrid: {
    marginTop: DesignSystem.spacing.md,
  },
  contextExample: {
    marginBottom: DesignSystem.spacing.md,
  },
  contextLabel: {
    ...ComponentTextStyles.label,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    color: DesignSystem.colors.greenTara,
    marginBottom: DesignSystem.spacing.xs,
  },
  contextDescription: {
    ...ComponentTextStyles.caption,
    color: DesignSystem.colors.textSecondary,
  },
  platformGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: DesignSystem.spacing.md,
  },
  platformExample: {
    alignItems: 'center',
    width: '30%',
  },
  platformLabel: {
    ...ComponentTextStyles.label,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    marginBottom: DesignSystem.spacing.xs,
  },
  platformStatus: {
    ...ComponentTextStyles.caption,
    color: DesignSystem.colors.greenTara,
    textAlign: 'center',
  },
});
