
import React from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { DesignSystem } from '@/constants/DesignSystem';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayoutPhase2Test() {
  return (
    <ScrollView style={styles.container}>
      <ThemedText variant="heading" style={styles.pageTitle}>
        Phase 2: Tab Layout Migration Test
      </ThemedText>

      {/* Migration Status */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          ✅ Migration Status: Complete
        </ThemedText>
        <ThemedText variant="body">
          Tab layout has been successfully migrated to use Tara design tokens:
        </ThemedText>
        
        <View style={styles.checklistItem}>
          <ThemedText variant="label">✅ Shadow colors use DesignSystem.colors.cardShadow</ThemedText>
        </View>
        <View style={styles.checklistItem}>
          <ThemedText variant="label">✅ Shadow opacity uses DesignSystem.opacity[10]</ThemedText>
        </View>
        <View style={styles.checklistItem}>
          <ThemedText variant="label">✅ Spacing uses DesignSystem.spacing tokens</ThemedText>
        </View>
        <View style={styles.checklistItem}>
          <ThemedText variant="label">✅ Typography uses DesignSystem.typography tokens</ThemedText>
        </View>
        <View style={styles.checklistItem}>
          <ThemedText variant="label">✅ Each tab has specific Tara color identity</ThemedText>
        </View>
      </View>

      {/* Tara Tab Color Identity Test */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          Buddhist Tara Tab Colors - Semantic Identity
        </ThemedText>

        {/* Daily Practice Tab - Orange Tara */}
        <View style={styles.tabExample}>
          <Ionicons
            size={32}
            name="sunny"
            color={DesignSystem.colors.orangeTara}
          />
          <View style={styles.tabInfo}>
            <ThemedText variant="label">当日 (Daily) - The Orange Tara</ThemedText>
            <ThemedText variant="caption">Daily practice warmth and compassion</ThemedText>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.orangeTara }]} />
          </View>
        </View>

        {/* Study Tab - Yellow Tara */}
        <View style={styles.tabExample}>
          <Ionicons
            size={32}
            name="ear"
            color={DesignSystem.colors.yellowTara}
          />
          <View style={styles.tabInfo}>
            <ThemedText variant="label">闻思 (Study) - The Yellow Tara</ThemedText>
            <ThemedText variant="caption">Learning and wisdom cultivation</ThemedText>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.yellowTara }]} />
          </View>
        </View>

        {/* Mindfulness Tab - Red Tara */}
        <View style={styles.tabExample}>
          <Ionicons
            size={32}
            name="ellipse"
            color={DesignSystem.colors.redTara}
          />
          <View style={styles.tabInfo}>
            <ThemedText variant="label">心性 (Mindfulness) - The Red Tara</ThemedText>
            <ThemedText variant="caption">Spiritual practice energy and power</ThemedText>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.redTara }]} />
          </View>
        </View>

        {/* Practice Tab - Green Tara */}
        <View style={styles.tabExample}>
          <Ionicons
            size={32}
            name="heart"
            color={DesignSystem.colors.greenTara}
          />
          <View style={styles.tabInfo}>
            <ThemedText variant="label">修行 (Practice) - The Green Tara</ThemedText>
            <ThemedText variant="caption">Practice completion and enlightened activity</ThemedText>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.greenTara }]} />
          </View>
        </View>

        {/* Stats Tab - Blue Tara */}
        <View style={styles.tabExample}>
          <Ionicons
            size={32}
            name="moon"
            color={DesignSystem.colors.blueTara}
          />
          <View style={styles.tabInfo}>
            <ThemedText variant="label">回向 (Stats) - The Blue Tara</ThemedText>
            <ThemedText variant="caption">Deep contemplation and analytical wisdom</ThemedText>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.blueTara }]} />
          </View>
        </View>
      </View>

      {/* Platform-Specific Tab Bar Styling */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          Platform-Specific Tab Bar Styling
        </ThemedText>

        <View style={styles.platformTest}>
          <ThemedText variant="label">Current Platform: {Platform.OS}</ThemedText>
          
          {Platform.OS === 'ios' ? (
            <View style={styles.iosTabBarPreview}>
              <ThemedText variant="caption">iOS Tab Bar (Height: 88px)</ThemedText>
              <View style={styles.tabBarExample}>
                <Ionicons size={24} name="sunny" color={DesignSystem.colors.orangeTara} />
                <Ionicons size={24} name="ear-outline" color={DesignSystem.colors.textTertiary} />
                <Ionicons size={24} name="ellipse-outline" color={DesignSystem.colors.textTertiary} />
                <Ionicons size={24} name="heart-outline" color={DesignSystem.colors.textTertiary} />
                <Ionicons size={24} name="moon-outline" color={DesignSystem.colors.textTertiary} />
              </View>
            </View>
          ) : (
            <View style={styles.androidTabBarPreview}>
              <ThemedText variant="caption">Android Tab Bar (Height: 68px)</ThemedText>
              <View style={styles.tabBarExample}>
                <Ionicons size={24} name="sunny" color={DesignSystem.colors.orangeTara} />
                <Ionicons size={24} name="ear-outline" color={DesignSystem.colors.textTertiary} />
                <Ionicons size={24} name="ellipse-outline" color={DesignSystem.colors.textTertiary} />
                <Ionicons size={24} name="heart-outline" color={DesignSystem.colors.textTertiary} />
                <Ionicons size={24} name="moon-outline" color={DesignSystem.colors.textTertiary} />
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Design Token Usage Verification */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          Design Token Usage Verification
        </ThemedText>

        <View style={styles.tokenVerification}>
          <ThemedText variant="label">Typography Tokens:</ThemedText>
          <ThemedText variant="caption">fontSize: {DesignSystem.typography.fontSize.xs}px</ThemedText>
          <ThemedText variant="caption">fontWeight: {DesignSystem.typography.fontWeight.semibold}</ThemedText>
        </View>

        <View style={styles.tokenVerification}>
          <ThemedText variant="label">Spacing Tokens:</ThemedText>
          <ThemedText variant="caption">paddingTop: {DesignSystem.spacing.sm}px</ThemedText>
          <ThemedText variant="caption">paddingBottom: {DesignSystem.spacing.xs}px</ThemedText>
          <ThemedText variant="caption">marginTop: {DesignSystem.spacing.xxs / 3}px</ThemedText>
        </View>

        <View style={styles.tokenVerification}>
          <ThemedText variant="label">Color Tokens:</ThemedText>
          <ThemedText variant="caption">cardShadow: {DesignSystem.colors.cardShadow}</ThemedText>
          <ThemedText variant="caption">backgroundSecondary: {DesignSystem.colors.backgroundSecondary}</ThemedText>
          <ThemedText variant="caption">border: {DesignSystem.colors.border}</ThemedText>
        </View>

        <View style={styles.tokenVerification}>
          <ThemedText variant="label">Opacity Tokens:</ThemedText>
          <ThemedText variant="caption">shadowOpacity: {DesignSystem.opacity[10]}</ThemedText>
        </View>
      </View>

      {/* Next Steps */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          ✅ Phase 2 Day 1 Complete - Next Steps
        </ThemedText>
        
        <View style={styles.nextSteps}>
          <ThemedText variant="label">🎯 Tab Layout Migration: COMPLETE</ThemedText>
          <ThemedText variant="body">
            Ready to proceed to Phase 2 Day 2 components:
          </ThemedText>
          <ThemedText variant="caption">• components/PageTemplate.tsx</ThemedText>
          <ThemedText variant="caption">• components/ThemedText.tsx</ThemedText>
          <ThemedText variant="caption">• components/Header.tsx</ThemedText>
          <ThemedText variant="caption">• components/ModalTemplate.tsx</ThemedText>
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
    marginBottom: DesignSystem.spacing.xl,
    textAlign: 'center',
    color: DesignSystem.colors.redTara,
  },
  section: {
    marginBottom: DesignSystem.spacing['2xl'],
    padding: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
  },
  sectionTitle: {
    marginBottom: DesignSystem.spacing.md,
    color: DesignSystem.colors.textPrimary,
  },
  checklistItem: {
    paddingVertical: DesignSystem.spacing.xs,
    paddingLeft: DesignSystem.spacing.md,
  },
  tabExample: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
  },
  tabInfo: {
    marginLeft: DesignSystem.spacing.md,
    flex: 1,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: DesignSystem.borderRadius.sm,
    marginTop: DesignSystem.spacing.xs,
  },
  platformTest: {
    padding: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.background,
    borderRadius: DesignSystem.borderRadius.md,
  },
  iosTabBarPreview: {
    marginTop: DesignSystem.spacing.md,
    padding: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.backgroundSecondary + 'F2',
    borderRadius: DesignSystem.borderRadius.lg,
    borderTopWidth: 0.5,
    borderTopColor: DesignSystem.colors.border,
  },
  androidTabBarPreview: {
    marginTop: DesignSystem.spacing.md,
    padding: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    borderTopWidth: 0.5,
    borderTopColor: DesignSystem.colors.border,
    elevation: 8,
  },
  tabBarExample: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: DesignSystem.spacing.sm,
  },
  tokenVerification: {
    marginBottom: DesignSystem.spacing.md,
    padding: DesignSystem.spacing.sm,
    backgroundColor: DesignSystem.colors.background,
    borderRadius: DesignSystem.borderRadius.sm,
  },
  nextSteps: {
    padding: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.successBackground,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.greenTara,
  },
});
