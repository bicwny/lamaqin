
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '@/components/Card';
import Notification from '@/components/Notification';
import { ComponentTokens, componentHelpers } from '@/utils/componentTokens';

/**
 * Example showing how to migrate from old card patterns to new consolidated Card system
 */

export default function CardConsolidationExample() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Card Consolidation Migration Examples</Text>
      
      {/* OLD WAY - before consolidation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❌ Old Pattern (DON'T USE)</Text>
        <Text style={styles.code}>
          {`// Old 4-variant system
<View style={ComponentTokens.card.standard}>Standard Card</View>
<View style={ComponentTokens.card.practice}>Practice Card</View>
<View style={ComponentTokens.card.course}>Course Card</View>
<View style={ComponentTokens.card.status}>Status Card</View>`}
        </Text>
      </View>

      {/* NEW WAY - after consolidation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ New Pattern (USE THIS)</Text>
        
        {/* Outlined Cards (replaces standard + practice) */}
        <View style={styles.example}>
          <Text style={styles.label}>Outlined Cards (low shadow):</Text>
          
          <Card variant="outlined" padding="spacious">
            <Text style={styles.cardTitle}>Spacious Outlined Card</Text>
            <Text style={styles.cardContent}>Replaces: standard card (20px padding)</Text>
          </Card>
          
          <Card variant="outlined" padding="comfortable">
            <Text style={styles.cardTitle}>Comfortable Outlined Card</Text>
            <Text style={styles.cardContent}>Replaces: practice card (16px padding)</Text>
          </Card>
          
          <Card variant="outlined" padding="compact">
            <Text style={styles.cardTitle}>Compact Outlined Card</Text>
            <Text style={styles.cardContent}>New option (12px padding)</Text>
          </Card>
        </View>

        {/* Elevated Cards (replaces course) */}
        <View style={styles.example}>
          <Text style={styles.label}>Elevated Cards (high shadow):</Text>
          
          <Card variant="elevated" padding="spacious">
            <Text style={styles.cardTitle}>Spacious Elevated Card</Text>
            <Text style={styles.cardContent}>Replaces: course card (20px padding, high shadow)</Text>
          </Card>
          
          <Card variant="elevated" padding="comfortable">
            <Text style={styles.cardTitle}>Comfortable Elevated Card</Text>
            <Text style={styles.cardContent}>New combination (16px padding, high shadow)</Text>
          </Card>
        </View>

        {/* Notifications (replaces status) */}
        <View style={styles.example}>
          <Text style={styles.label}>Notifications (replaces status cards):</Text>
          
          <Notification 
            variant="success" 
            title="Practice Complete"
            message="You've successfully completed your daily practice goal!"
          />
          
          <Notification 
            variant="warning" 
            message="Reminder: Your practice streak is at risk."
          />
          
          <Notification 
            variant="error" 
            title="Sync Failed"
            message="Unable to sync your practice data. Please try again."
          />
          
          <Notification 
            variant="info" 
            message="New meditation course available in your study section."
          />
        </View>
      </View>

      {/* Migration Guide */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Migration Mapping</Text>
        <View style={styles.mappingContainer}>
          <Text style={styles.mappingText}>
            ComponentTokens.card.standard → Card variant="outlined" padding="spacious"
          </Text>
          <Text style={styles.mappingText}>
            ComponentTokens.card.practice → Card variant="outlined" padding="comfortable"
          </Text>
          <Text style={styles.mappingText}>
            ComponentTokens.card.course → Card variant="elevated" padding="spacious"
          </Text>
          <Text style={styles.mappingText}>
            ComponentTokens.card.status → Notification variant="success/warning/error/info"
          </Text>
        </View>
      </View>

      {/* Legacy Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Legacy Support (Temporary)</Text>
        <Text style={styles.code}>
          {`// Legacy helper functions (use during migration)
const legacyStyle = componentHelpers.getLegacyCardStyle('standard');
const newStyle = componentHelpers.getCardStyle('outlined', 'spacious');

// Notification helper
const notificationStyle = componentHelpers.getNotificationStyle('success');`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  example: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#555',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  cardContent: {
    fontSize: 14,
    color: '#666',
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    color: '#333',
  },
  mappingContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  mappingText: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'monospace',
    color: '#333',
  },
});
