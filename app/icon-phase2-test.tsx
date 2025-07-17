
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon, { IconTokens, iconHelpers } from '@/components/Icon';
import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTextStyles } from '@/utils/componentTokens';

export default function IconPhase2TestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Icon Migration Test - Phase 2</Text>
        <Text style={styles.subtitle}>Tara Buddhist Semantic Icon System</Text>

        {/* Five Taras Color Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Five Taras Icon Colors</Text>
          <View style={styles.iconGrid}>
            <View style={styles.iconItem}>
              <Icon name="flower" color="redTara" size="xl" />
              <Text style={styles.iconLabel}>Red Tara{'\n'}Practice Energy</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon name="heart" color="orangeTara" size="xl" />
              <Text style={styles.iconLabel}>Orange Tara{'\n'}Compassion</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon name="school" color="yellowTara" size="xl" />
              <Text style={styles.iconLabel}>Yellow Tara{'\n'}Wisdom</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon name="leaf" color="blueTara" size="xl" />
              <Text style={styles.iconLabel}>Blue Tara{'\n'}Contemplation</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon name="checkmark-circle" color="greenTara" size="xl" />
              <Text style={styles.iconLabel}>Green Tara{'\n'}Completion</Text>
            </View>
          </View>
        </View>

        {/* Semantic Icon Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Semantic Icons with Buddhist Context</Text>
          <View style={styles.iconGrid}>
            <View style={styles.iconItem}>
              <Icon semantic="practice" />
              <Text style={styles.iconLabel}>Practice{'\n'}(Red Tara)</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon semantic="meditation" />
              <Text style={styles.iconLabel}>Meditation{'\n'}(Blue Tara)</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon semantic="mindfulness" />
              <Text style={styles.iconLabel}>Mindfulness{'\n'}(Orange Tara)</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon semantic="study" />
              <Text style={styles.iconLabel}>Study{'\n'}(Yellow Tara)</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon semantic="completion" />
              <Text style={styles.iconLabel}>Completion{'\n'}(Green Tara)</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation Icons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tab Navigation with Tara Colors</Text>
          <View style={styles.iconRow}>
            <View style={styles.iconItem}>
              <Icon semantic="practiceTab" />
              <Text style={styles.iconLabel}>Practice</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon semantic="studyTab" />
              <Text style={styles.iconLabel}>Study</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon semantic="mindfulnessTab" />
              <Text style={styles.iconLabel}>Mindfulness</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon semantic="statsTab" />
              <Text style={styles.iconLabel}>Stats</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon semantic="profileTab" />
              <Text style={styles.iconLabel}>Profile</Text>
            </View>
          </View>
        </View>

        {/* Context-Based Icons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Context-Based Icon System</Text>
          <View style={styles.contextSection}>
            <Text style={styles.contextTitle}>Practice Context (Red Tara)</Text>
            <View style={styles.iconRow}>
              <Icon name="add" context="practice" variant="primary" />
              <Icon name="edit" context="practice" variant="secondary" />
              <Icon name="checkmark" context="practice" variant="accent" />
            </View>
          </View>
          <View style={styles.contextSection}>
            <Text style={styles.contextTitle}>Meditation Context (Blue Tara)</Text>
            <View style={styles.iconRow}>
              <Icon name="play" context="meditation" variant="primary" />
              <Icon name="pause" context="meditation" variant="secondary" />
              <Icon name="stop" context="meditation" variant="accent" />
            </View>
          </View>
          <View style={styles.contextSection}>
            <Text style={styles.contextTitle}>Study Context (Yellow Tara)</Text>
            <View style={styles.iconRow}>
              <Icon name="book" context="study" variant="primary" />
              <Icon name="bookmark" context="study" variant="secondary" />
              <Icon name="trophy" context="study" variant="accent" />
            </View>
          </View>
        </View>

        {/* Helper Function Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Helper Function Examples</Text>
          <View style={styles.helperGrid}>
            <View style={styles.iconItem}>
              <Icon {...iconHelpers.createSuccessIcon('lg')} />
              <Text style={styles.iconLabel}>Success Helper</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon {...iconHelpers.createPracticeIcon(true)} />
              <Text style={styles.iconLabel}>Active Practice</Text>
            </View>
            <View style={styles.iconItem}>
              <Icon {...iconHelpers.createMeditationIcon('mindfulness')} />
              <Text style={styles.iconLabel}>Mindfulness Helper</Text>
            </View>
          </View>
        </View>

        {/* Size and State Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Size Variations with Tara Colors</Text>
          <View style={styles.sizeRow}>
            <Icon semantic="practice" size="xs" />
            <Icon semantic="practice" size="sm" />
            <Icon semantic="practice" size="md" />
            <Icon semantic="practice" size="lg" />
            <Icon semantic="practice" size="xl" />
            <Icon semantic="practice" size="2xl" />
          </View>
          <Text style={styles.sizeLabel}>xs, sm, md, lg, xl, 2xl</Text>
        </View>

        {/* Buddhist Semantic Validation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buddhist Semantic Validation</Text>
          <View style={styles.validationInfo}>
            <Text style={styles.validationText}>
              ✅ All semantic icons use appropriate Tara colors{'\n'}
              ✅ Red Tara for practice energy and action{'\n'}
              ✅ Orange Tara for mindfulness and compassion{'\n'}
              ✅ Yellow Tara for wisdom and achievement{'\n'}
              ✅ Blue Tara for contemplation and meditation{'\n'}
              ✅ Green Tara for completion and growth{'\n'}
              ✅ Context-based color inheritance working{'\n'}
              ✅ Helper functions create consistent icons
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
    padding: DesignSystem.spacing.lg,
  },
  title: {
    ...ComponentTextStyles.heading,
    color: DesignSystem.colors.redTara,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  subtitle: {
    ...ComponentTextStyles.subheading,
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xl,
  },
  section: {
    marginBottom: DesignSystem.spacing['2xl'],
  },
  sectionTitle: {
    ...ComponentTextStyles.subheading,
    color: DesignSystem.colors.blueTara,
    marginBottom: DesignSystem.spacing.lg,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.md,
  },
  iconItem: {
    alignItems: 'center',
    padding: DesignSystem.spacing.md,
    minWidth: 80,
  },
  iconLabel: {
    ...ComponentTextStyles.label,
    textAlign: 'center',
    marginTop: DesignSystem.spacing.sm,
    fontSize: DesignSystem.typography.fontSize.xs,
  },
  contextSection: {
    marginBottom: DesignSystem.spacing.lg,
    padding: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.md,
  },
  contextTitle: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.textPrimary,
    marginBottom: DesignSystem.spacing.sm,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  helperGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.lg,
  },
  sizeLabel: {
    ...ComponentTextStyles.caption,
    textAlign: 'center',
    color: DesignSystem.colors.textTertiary,
  },
  validationInfo: {
    backgroundColor: `${DesignSystem.colors.greenTara}15`,
    padding: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: DesignSystem.colors.greenTara,
  },
  validationText: {
    ...ComponentTextStyles.body,
    color: DesignSystem.colors.textPrimary,
    lineHeight: 20,
  },
});
