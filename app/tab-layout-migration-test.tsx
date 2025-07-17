
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
          Buddhist Five Taras Tab Colors
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
            <Ionicons size={24} name="heart" color={DesignSystem.colors.greenTara} />
            <ThemedText variant="caption">The Green Tara</ThemedText>
          </View>
        </View>
      </View>

      {/* Black and White Tara Examples */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          Additional Tara Colors
        </ThemedText>

        <View style={styles.tabExample}>
          <Ionicons
            size={32}
            name="shield"
            color={DesignSystem.colors.blackTara}
          />
          <View style={styles.tabInfo}>
            <ThemedText variant="label">Protection - The Black Tara</ThemedText>
            <ThemedText variant="caption">Fierce compassion and protective energy</ThemedText>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.blackTara }]} />
          </View>
        </View>

        <View style={styles.tabExample}>
          <Ionicons
            size={32}
            name="medical"
            color={DesignSystem.colors.blackTara}
          />
          <View style={styles.tabInfo}>
            <ThemedText variant="label">Healing - The White Tara</ThemedText>
            <ThemedText variant="caption">Purity, healing, and long life</ThemedText>
            <View style={[styles.colorSwatch, { backgroundColor: DesignSystem.colors.whiteTara, borderWidth: 1, borderColor: DesignSystem.colors.border }]} />
          </View>
        </View>
      </View>

      {/* Seven Taras Color Reference */}
      <View style={styles.section}>
        <ThemedText variant="subheading" style={styles.sectionTitle}>
          Seven Taras Color Reference
        </ThemedText>

        <View style={styles.colorReference}>
          <View style={styles.colorRefRow}>
            <ThemedText variant="label">Green Tara:</ThemedText>
            <ThemedText variant="caption">{DesignSystem.colors.greenTara}</ThemedText>
          </View>
          <View style={styles.colorRefRow}>
            <ThemedText variant="label">Red Tara:</ThemedText>
            <ThemedText variant="caption">{DesignSystem.colors.redTara}</ThemedText>
          </View>
          <View style={styles.colorRefRow}>
            <ThemedText variant="label">Blue Tara:</ThemedText>
            <ThemedText variant="caption">{DesignSystem.colors.blueTara}</ThemedText>
          </View>
          <View style={styles.colorRefRow}>
            <ThemedText variant="label">Yellow Tara:</ThemedText>
            <ThemedText variant="caption">{DesignSystem.colors.yellowTara}</ThemedText>
          </View>
          <View style={styles.colorRefRow}>
            <ThemedText variant="label">Orange Tara:</ThemedText>
            <ThemedText variant="caption">{DesignSystem.colors.orangeTara}</ThemedText>
          </View>
          <View style={styles.colorRefRow}>
            <ThemedText variant="label">Black Tara:</ThemedText>
            <ThemedText variant="caption">{DesignSystem.colors.blackTara}</ThemedText>
          </View>
          <View style={styles.colorRefRow}>
            <ThemedText variant="label">White Tara:</ThemedText>
            <ThemedText variant="caption">{DesignSystem.colors.whiteTara}</ThemedText>
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
  colorReference: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.lg,
  },
  colorRefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border,
  },
});
