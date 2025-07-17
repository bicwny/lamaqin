
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';
import { ComponentTokens, componentHelpers } from '@/utils/componentTokens';
import { Typography } from '@/utils/typography';

interface ComparisonProps {
  title: string;
  oldComponent: React.ReactNode;
  newComponent: React.ReactNode;
  description?: string;
}

function Comparison({ title, oldComponent, newComponent, description }: ComparisonProps) {
  return (
    <View style={styles.comparisonContainer}>
      <Text style={styles.comparisonTitle}>{title}</Text>
      {description && <Text style={styles.comparisonDescription}>{description}</Text>}
      
      <View style={styles.comparisonRow}>
        <View style={styles.comparisonColumn}>
          <Text style={styles.columnLabel}>Old (Hardcoded)</Text>
          <View style={styles.componentContainer}>
            {oldComponent}
          </View>
        </View>
        
        <View style={styles.comparisonColumn}>
          <Text style={styles.columnLabel}>New (Design System)</Text>
          <View style={styles.componentContainer}>
            {newComponent}
          </View>
        </View>
      </View>
    </View>
  );
}

export function ComponentComparison() {
  const [selectedCategory, setSelectedCategory] = useState('buttons');

  const categories = [
    { id: 'buttons', label: 'Buttons' },
    { id: 'cards', label: 'Cards' },
    { id: 'text', label: 'Typography' },
    { id: 'inputs', label: 'Inputs' },
    { id: 'layout', label: 'Layout' },
  ];

  const renderButtons = () => (
    <>
      <Comparison
        title="Primary Button"
        description="Main action buttons used throughout the app"
        oldComponent={
          <TouchableOpacity style={oldStyles.primaryButton}>
            <Text style={oldStyles.primaryButtonText}>Old Button</Text>
          </TouchableOpacity>
        }
        newComponent={
          <TouchableOpacity style={componentHelpers.getButtonStyle('primary')}>
            <Text style={ComponentTokens.textStyles.button.primary}>New Button</Text>
          </TouchableOpacity>
        }
      />
      
      <Comparison
        title="Secondary Button"
        description="Secondary actions with outline style"
        oldComponent={
          <TouchableOpacity style={oldStyles.secondaryButton}>
            <Text style={oldStyles.secondaryButtonText}>Old Secondary</Text>
          </TouchableOpacity>
        }
        newComponent={
          <TouchableOpacity style={componentHelpers.getButtonStyle('secondary')}>
            <Text style={ComponentTokens.textStyles.button.secondary}>New Secondary</Text>
          </TouchableOpacity>
        }
      />
    </>
  );

  const renderCards = () => (
    <>
      <Comparison
        title="Practice Card"
        description="Cards used for practice projects"
        oldComponent={
          <View style={oldStyles.practiceCard}>
            <Text style={oldStyles.cardTitle}>Old Practice Card</Text>
            <Text style={oldStyles.cardContent}>This uses hardcoded values</Text>
          </View>
        }
        newComponent={
          <View style={componentHelpers.getCardStyle('practice')}>
            <Text style={Typography.components.card.title}>New Practice Card</Text>
            <Text style={Typography.components.card.content}>This uses design tokens</Text>
          </View>
        }
      />
    </>
  );

  const renderTypography = () => (
    <>
      <Comparison
        title="Page Title"
        description="Main page headings"
        oldComponent={
          <Text style={oldStyles.pageTitle}>Old Page Title</Text>
        }
        newComponent={
          <Text style={Typography.styles.heading('2xl')}>New Page Title</Text>
        }
      />
      
      <Comparison
        title="Section Title"
        description="Section headings within pages"
        oldComponent={
          <Text style={oldStyles.sectionTitle}>Old Section Title</Text>
        }
        newComponent={
          <Text style={Typography.styles.subheading('lg')}>New Section Title</Text>
        }
      />
      
      <Comparison
        title="Body Text"
        description="Regular content text"
        oldComponent={
          <Text style={oldStyles.bodyText}>Old body text with hardcoded styling</Text>
        }
        newComponent={
          <Text style={Typography.styles.body('base')}>New body text using design tokens</Text>
        }
      />
    </>
  );

  const renderInputs = () => (
    <>
      <Comparison
        title="Standard Input"
        description="Basic text input fields"
        oldComponent={
          <View style={oldStyles.inputContainer}>
            <Text style={oldStyles.inputLabel}>Old Input</Text>
            <View style={oldStyles.input} />
          </View>
        }
        newComponent={
          <View>
            <Text style={Typography.styles.label('sm')}>New Input</Text>
            <View style={ComponentTokens.input.standard} />
          </View>
        }
      />
    </>
  );

  const renderLayout = () => (
    <>
      <Comparison
        title="Page Container"
        description="Main page wrapper"
        oldComponent={
          <View style={oldStyles.pageContainer}>
            <Text>Old Container</Text>
          </View>
        }
        newComponent={
          <View style={Typography.styles.container('xl')}>
            <Text>New Container</Text>
          </View>
        }
      />
    </>
  );

  const renderCategory = () => {
    switch (selectedCategory) {
      case 'buttons': return renderButtons();
      case 'cards': return renderCards();
      case 'text': return renderTypography();
      case 'inputs': return renderInputs();
      case 'layout': return renderLayout();
      default: return renderButtons();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Component Style Comparison</Text>
      <Text style={styles.subtitle}>
        Compare old hardcoded styles with new design system tokens
      </Text>

      {/* Category Selector */}
      <View style={styles.categorySelector}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.categoryButtonTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Comparisons */}
      <View style={styles.comparisonsContainer}>
        {renderCategory()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ConsolidatedDesignSystem.colors["surface-primary"],
    padding: ConsolidatedDesignSystem.spacing.lg,
  },
  title: {
    ...Typography.styles.heading('2xl'),
    textAlign: 'center',
    marginBottom: ConsolidatedDesignSystem.spacing.sm,
  },
  subtitle: {
    ...Typography.styles.body('base'),
    textAlign: 'center',
    marginBottom: ConsolidatedDesignSystem.spacing.xl,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: ConsolidatedDesignSystem.spacing.xl,
    gap: ConsolidatedDesignSystem.spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
    paddingVertical: ConsolidatedDesignSystem.spacing.sm,
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    backgroundColor: ConsolidatedDesignSystem.colorsConsolidatedDesignSystem.colors["surface-secondary"],
    borderWidth: 1,
    borderColor: ConsolidatedDesignSystem.colors["border-default"],
  },
  categoryButtonActive: {
    backgroundColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
    borderColor: ConsolidatedConsolidatedDesignSystem.colors.primary,
  },
  categoryButtonText: {
    ...Typography.styles.label('sm'),
    color: ConsolidatedDesignSystem.colors["text-secondary"],
  },
  categoryButtonTextActive: {
    color: ConsolidatedDesignSystem.colors["text-inverse"],
  },
  comparisonsContainer: {
    gap: ConsolidatedDesignSystem.spacing.xl,
  },
  comparisonContainer: {
    backgroundColor: ConsolidatedDesignSystem.colorsConsolidatedDesignSystem.colors["surface-secondary"],
    borderRadius: ConsolidatedDesignSystem.borderRadius.lg,
    padding: ConsolidatedDesignSystem.spacing.lg,
    ...ConsolidatedDesignSystem.shadow.sm,
  },
  comparisonTitle: {
    ...Typography.styles.subheading('lg'),
    marginBottom: ConsolidatedDesignSystem.spacing.xs,
  },
  comparisonDescription: {
    ...Typography.styles.body('sm'),
    color: ConsolidatedDesignSystem.colors["text-secondary"],
    marginBottom: ConsolidatedDesignSystem.spacing.md,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: ConsolidatedDesignSystem.spacing.lg,
  },
  comparisonColumn: {
    flex: 1,
  },
  columnLabel: {
    ...Typography.styles.label('sm'),
    marginBottom: ConsolidatedDesignSystem.spacing.sm,
    textAlign: 'center',
  },
  componentContainer: {
    backgroundColor: ConsolidatedDesignSystem.colors["surface-primary"],
    borderRadius: ConsolidatedDesignSystem.borderRadius.md,
    padding: ConsolidatedDesignSystem.spacing.md,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
});

// Old styles for comparison (hardcoded values)
const oldStyles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#da4347',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#da4347',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#da4347',
  },
  practiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  bodyText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    height: 40,
    backgroundColor: '#ffffff',
  },
  pageContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
