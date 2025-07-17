
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { Typography } from '@/utils/typography';
import { colorMigrationMap } from '@/utils/colorMigration';
import { spacingMigrationMap } from '@/utils/spacingMigration';

interface ValidationResult {
  type: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export function MigrationValidator() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateColorMigration = (): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    // Check if all hardcoded colors have migrations
    const hardcodedColors = [
      '#da4347', '#ffffff', '#1a1a1a', '#666666', '#999999',
      '#f8f9fa', '#e9ecef', '#2e7d32', '#000000'
    ];
    
    hardcodedColors.forEach(color => {
      if (colorMigrationMap[color]) {
        results.push({
          type: 'success',
          message: `✅ Color ${color} has migration mapping`,
          details: `Maps to: ${colorMigrationMap[color]}`
        });
      } else {
        results.push({
          type: 'warning',
          message: `⚠️ Color ${color} missing migration mapping`,
          details: 'Consider adding to colorMigrationMap'
        });
      }
    });
    
    return results;
  };

  const validateTypographyMigration = (): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    // Check if all common font sizes have migrations
    const commonFontSizes = [12, 14, 16, 18, 20, 24];
    
    commonFontSizes.forEach(size => {
      if (Typography.migrationMap.fontSize[size]) {
        results.push({
          type: 'success',
          message: `✅ Font size ${size}px has migration mapping`,
          details: `Maps to: ${Typography.migrationMap.fontSize[size]}px`
        });
      } else {
        results.push({
          type: 'error',
          message: `❌ Font size ${size}px missing migration mapping`,
          details: 'Add to Typography.migrationMap.fontSize'
        });
      }
    });
    
    return results;
  };

  const validateSpacingMigration = (): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    // Check if all common spacing values have migrations
    const commonSpacing = [4, 6, 8, 10, 12, 16, 20, 24];
    
    commonSpacing.forEach(size => {
      if (spacingMigrationMap[size]) {
        results.push({
          type: 'success',
          message: `✅ Spacing ${size}px has migration mapping`,
          details: `Maps to: ${spacingMigrationMap[size]}px`
        });
      } else {
        results.push({
          type: 'warning',
          message: `⚠️ Spacing ${size}px missing migration mapping`,
          details: 'Consider adding to spacingMigrationMap'
        });
      }
    });
    
    return results;
  };

  const validateDesignTokens = (): ValidationResult[] => {
    const results: ValidationResult[] = [];
    
    // Validate that design tokens are properly structured
    try {
      // Check colors
      if (Object.keys(DesignSystem.colors).length > 0) {
        results.push({
          type: 'success',
          message: `✅ DesignSystem.colors loaded (${Object.keys(DesignSystem.colors).length} colors)`
        });
      }
      
      // Check typography
      if (Object.keys(DesignSystem.typography.fontSize).length > 0) {
        results.push({
          type: 'success',
          message: `✅ Typography scales loaded (${Object.keys(DesignSystem.typography.fontSize).length} sizes)`
        });
      }
      
      // Check spacing
      if (Object.keys(DesignSystem.spacing).length > 0) {
        results.push({
          type: 'success',
          message: `✅ Spacing scale loaded (${Object.keys(DesignSystem.spacing).length} values)`
        });
      }
      
      // Check component tokens
      if (Object.keys(DesignSystem.components).length > 0) {
        results.push({
          type: 'success',
          message: `✅ Component tokens loaded (${Object.keys(DesignSystem.components).length} components)`
        });
      }
      
    } catch (error) {
      results.push({
        type: 'error',
        message: '❌ Error loading design tokens',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return results;
  };

  const runValidation = async () => {
    setIsValidating(true);
    setValidationResults([]);
    
    try {
      const results = [
        ...validateDesignTokens(),
        ...validateColorMigration(),
        ...validateTypographyMigration(),
        ...validateSpacingMigration(),
      ];
      
      setValidationResults(results);
      
      // Show summary
      const successCount = results.filter(r => r.type === 'success').length;
      const warningCount = results.filter(r => r.type === 'warning').length;
      const errorCount = results.filter(r => r.type === 'error').length;
      
      Alert.alert(
        'Validation Complete',
        `✅ ${successCount} passed\n⚠️ ${warningCount} warnings\n❌ ${errorCount} errors`
      );
      
    } catch (error) {
      Alert.alert('Validation Error', 'Failed to run validation');
    } finally {
      setIsValidating(false);
    }
  };

  const clearResults = () => {
    setValidationResults([]);
  };

  const getResultStyle = (type: ValidationResult['type']) => {
    switch (type) {
      case 'success': return styles.successResult;
      case 'warning': return styles.warningResult;
      case 'error': return styles.errorResult;
      default: return styles.defaultResult;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Migration Validator</Text>
      <Text style={styles.subtitle}>
        Validate that design system migration is complete and accurate
      </Text>

      {/* Control Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={runValidation}
          disabled={isValidating}
        >
          <Text style={styles.primaryButtonText}>
            {isValidating ? 'Validating...' : 'Run Validation'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={clearResults}
        >
          <Text style={styles.secondaryButtonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      {/* Validation Results */}
      {validationResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Validation Results</Text>
          
          {validationResults.map((result, index) => (
            <View key={index} style={[styles.resultItem, getResultStyle(result.type)]}>
              <Text style={styles.resultMessage}>{result.message}</Text>
              {result.details && (
                <Text style={styles.resultDetails}>{result.details}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Migration Checklist */}
      <View style={styles.checklistContainer}>
        <Text style={styles.checklistTitle}>Migration Checklist</Text>
        
        <View style={styles.checklistItem}>
          <Text style={styles.checklistLabel}>✅ Phase 1: Audit Complete</Text>
          <Text style={styles.checklistDetails}>
            Style inventory, typography audit, color usage audit, spacing analysis
          </Text>
        </View>
        
        <View style={styles.checklistItem}>
          <Text style={styles.checklistLabel}>✅ Phase 2: DesignSystem.ts Expanded</Text>
          <Text style={styles.checklistDetails}>
            Typography scales, color tokens, spacing values, component tokens
          </Text>
        </View>
        
        <View style={styles.checklistItem}>
          <Text style={styles.checklistLabel}>✅ Phase 3: Migration Utilities</Text>
          <Text style={styles.checklistDetails}>
            Style mapping functions, component templates, migration helpers
          </Text>
        </View>
        
        <View style={styles.checklistItem}>
          <Text style={styles.checklistLabel}>🔄 Phase 4: File Migration</Text>
          <Text style={styles.checklistDetails}>
            Ready to migrate practice-detail and other high-priority files
          </Text>
        </View>
        
        <View style={styles.checklistItem}>
          <Text style={styles.checklistLabel}>🔄 Phase 5: Testing & Validation</Text>
          <Text style={styles.checklistDetails}>
            Style testing components, migration validation, rollback planning
          </Text>
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
  title: {
    ...Typography.styles.heading('2xl'),
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  subtitle: {
    ...Typography.styles.body('base'),
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.xl,
  },
  controls: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.xl,
  },
  button: {
    flex: 1,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.md,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: DesignSystem.colors.primary,
  },
  primaryButtonText: {
    ...Typography.styles.buttonText('primary'),
  },
  secondaryButton: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
  },
  secondaryButtonText: {
    ...Typography.styles.label('base'),
    color: DesignSystem.colors.textSecondary,
  },
  resultsContainer: {
    marginBottom: DesignSystem.spacing.xl,
  },
  resultsTitle: {
    ...Typography.styles.subheading('lg'),
    marginBottom: DesignSystem.spacing.md,
  },
  resultItem: {
    padding: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    marginBottom: DesignSystem.spacing.sm,
    borderLeftWidth: 4,
  },
  successResult: {
    backgroundColor: DesignSystem.colors.successBackground,
    borderLeftColor: DesignSystem.colors.success,
  },
  warningResult: {
    backgroundColor: DesignSystem.colors.warningBackground,
    borderLeftColor: DesignSystem.colors.warning,
  },
  errorResult: {
    backgroundColor: DesignSystem.colors.errorBackground,
    borderLeftColor: DesignSystem.colors.error,
  },
  defaultResult: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderLeftColor: DesignSystem.colors.border,
  },
  resultMessage: {
    ...Typography.styles.body('base'),
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  resultDetails: {
    ...Typography.styles.caption(),
    marginTop: DesignSystem.spacing.xs,
  },
  checklistContainer: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.lg,
    ...DesignSystem.shadow.sm,
  },
  checklistTitle: {
    ...Typography.styles.subheading('lg'),
    marginBottom: DesignSystem.spacing.md,
  },
  checklistItem: {
    marginBottom: DesignSystem.spacing.md,
    paddingBottom: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
  },
  checklistLabel: {
    ...Typography.styles.label('base'),
    marginBottom: DesignSystem.spacing.xs,
  },
  checklistDetails: {
    ...Typography.styles.caption(),
  },
});
