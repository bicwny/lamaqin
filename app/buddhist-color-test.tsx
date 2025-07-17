
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { Typography } from '@/utils/typography';

export default function BuddhistColorTestScreen() {
  const buddhistColors = [
    { name: 'Dharma Red', color: DesignSystem.colors.dharmaRed, meaning: 'Spiritual practice, determination' },
    { name: 'Dharma Red Light', color: DesignSystem.colors.dharmaRedLight, meaning: 'Gentle practice states' },
    { name: 'Compassion Orange', color: DesignSystem.colors.compassionOrange, meaning: 'Loving-kindness, meditation' },
    { name: 'Compassion Light', color: DesignSystem.colors.compassionLight, meaning: 'Gentle compassion' },
    { name: 'Wisdom Gold', color: DesignSystem.colors.wisdomGold, meaning: 'Learning, achievement' },
    { name: 'Wisdom Light', color: DesignSystem.colors.wisdomLight, meaning: 'Progress indicators' },
    { name: 'Meditation Blue', color: DesignSystem.colors.meditationBlue, meaning: 'Calm, focus, mindfulness' },
    { name: 'Mindfulness Calm', color: DesignSystem.colors.mindfulnessCalm, meaning: 'Peaceful meditation' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Buddhist Color Semantics</Text>
      <Text style={styles.subtitle}>Verify spiritual appropriateness and cultural sensitivity</Text>
      
      {buddhistColors.map((item, index) => (
        <View key={index} style={styles.colorCard}>
          <View style={[styles.colorSwatch, { backgroundColor: item.color }]} />
          <View style={styles.colorInfo}>
            <Text style={styles.colorName}>{item.name}</Text>
            <Text style={styles.colorValue}>{item.color}</Text>
            <Text style={styles.colorMeaning}>{item.meaning}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
    padding: DesignSystem.spacing.lg,
  },
  title: {
    ...Typography.styles.heading('2xl'),
    marginBottom: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.styles.body('base'),
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xl,
  },
  colorCard: {
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.md,
    ...DesignSystem.shadow.sm,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: DesignSystem.borderRadius.md,
    marginRight: DesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
  },
  colorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  colorName: {
    ...Typography.styles.subheading('base'),
    marginBottom: DesignSystem.spacing.xs,
  },
  colorValue: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: DesignSystem.spacing.xs,
  },
  colorMeaning: {
    ...Typography.styles.body('sm'),
    color: DesignSystem.colors.textSecondary,
    fontStyle: 'italic',
  },
});
