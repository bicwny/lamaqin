import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { DesignSystem } from '@/constants/DesignSystem';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayoutMigrationTest() {
  return (
    <ScrollView style={styles.container}>
      <ThemedText variant="heading" style={styles.pageTitle}>
        Tab Layout Buddhist Colors Test
      </ThemedText>

      {/* Buddhist Tab Color Semantics */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          Buddhist Semantic Tab Colors
        </ThemedText>

        {/* Daily Practice Tab - Compassion Orange */}
        <View style={styles.tabExample}>
          <Ionicons
            size={32}
            name="sunny"
            color={DesignSystem.colors.compassionOrange}
          />
          <View style={styles.tabInfo}>
            <ThemedText variant="label">当日 (Daily) - Compassion Orange</ThemedText>
            <ThemedText variant="caption">Daily practice warmth</ThemedText>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.compassionOrange }]} />
          </View>
        </View>

        {/* Study Tab - Wisdom Gold */}
        <View style={styles.tabExample}>
          <Ionicons
            size={32}
            name="ear"
            color={DesignSystem.colors.wisdomGold}
          />
          <View style={styles.tabInfo}>
            <ThemedText variant="label">闻思 (Study) - Wisdom Gold</ThemedText>
            <ThemedText variant="caption">Learning and wisdom</ThemedText>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.wisdomGold }]} />
          </View>
        </View>

        {/* Mindfulness Tab - Dharma Red */}
        <View style={styles.tabExample}>
          <Ionicons
            size={32}
            name="ellipse"
            color={DesignSystem.colors.dharmaRed}
          />
          <View style={styles.tabInfo}>
            <ThemedText variant="label">心性 (Mindfulness) - Dharma Red</ThemedText>
            <ThemedText variant="caption">Spiritual practice energy</ThemedText>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.dharmaRed }]} />
          </View>
        </View>

        {/* Practice Tab - Success Green */}
        <View style={styles.tabExample}>
          <Ionicons
            size={32}
            name="heart"
            color={DesignSystem.colors.success}
          />
          <View style={styles.tabInfo}>
            <ThemedText variant="label">修行 (Practice) - Success Green</ThemedText>
            <ThemedText variant="caption">Practice completion and growth</ThemedText>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.success }]} />
          </View>
        </View>

        {/* Stats Tab - Study Progress Blue */}
        <View style={styles.tabExample}>
          <Ionicons
            size={32}
            name="moon"
            color={DesignSystem.colors.studyProgress}
          />
          <View style={styles.tabInfo}>
            <ThemedText variant="label">回向 (Stats) - Study Progress</ThemedText>
            <ThemedText variant="caption">Progress analytics and reflection</ThemedText>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.studyProgress }]} />
          </View>
        </View>
      </View>

      {/* Tab Bar Background Test */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          Tab Bar Background Colors
        </ThemedText>

        <View style={styles.backgroundTest}>
          <ThemedText variant="label">iOS Background (95% opacity)</ThemedText>
          <View style={[styles.backgroundSwatch, { backgroundColor: DesignSystem.colors.backgroundSecondary + 'F2' }]} />
          <ThemedText variant="caption">{DesignSystem.colors.backgroundSecondary}F2</ThemedText>
        </View>

        <View style={styles.backgroundTest}>
          <ThemedText variant="label">Android Background</ThemedText>
          <View style={[styles.backgroundSwatch, { backgroundColor: DesignSystem.colors.backgroundSecondary }]} />
          <ThemedText variant="caption">{DesignSystem.colors.backgroundSecondary}</ThemedText>
        </View>

        <View style={styles.backgroundTest}>
          <ThemedText variant="label">Border Color</ThemedText>
          <View style={[styles.backgroundSwatch, { backgroundColor: DesignSystem.colors.border }]} />
          <ThemedText variant="caption">{DesignSystem.colors.border}</ThemedText>
        </View>
      </View>

      {/* Inactive vs Active Color Comparison */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          Active vs Inactive Tab Colors
        </ThemedText>

        <View style={styles.colorComparison}>
          <View style={styles.comparisonColumn}>
            <ThemedText variant="label">Inactive</ThemedText>
            <Ionicons size={24} name="heart-outline" color={DesignSystem.colors.textTertiary} />
            <ThemedText variant="caption">Text Tertiary</ThemedText>
          </View>
          <View style={styles.comparisonColumn}>
            <ThemedText variant="label">Active (Practice)</ThemedText>
            <Ionicons size={24} name="heart" color={DesignSystem.colors.dharmaRed} />
            <ThemedText variant="caption">Dharma Red</ThemedText>
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
    marginBottom: DesignSystem.spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: DesignSystem.spacing['2xl'],
  },
  sectionTitle: {
    marginBottom: DesignSystem.spacing.lg,
    color: DesignSystem.colors.textPrimary,
  },
  tabExample: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    marginBottom: DesignSystem.spacing.md,
    ...DesignSystem.shadow.sm,
  },
  tabInfo: {
    marginLeft: DesignSystem.spacing.lg,
    flex: 1,
  },
  colorSwatch: {
    width: 40,
    height: 20,
    borderRadius: DesignSystem.borderRadius.sm,
    marginTop: DesignSystem.spacing.xs,
  },
  backgroundTest: {
    padding: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.md,
    marginBottom: DesignSystem.spacing.md,
    alignItems: 'center',
  },
  backgroundSwatch: {
    width: 80,
    height: 40,
    borderRadius: DesignSystem.borderRadius.sm,
    marginVertical: DesignSystem.spacing.sm,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
  },
  colorComparison: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: DesignSystem.spacing.lg,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
  },
  comparisonColumn: {
    alignItems: 'center',
  },
});