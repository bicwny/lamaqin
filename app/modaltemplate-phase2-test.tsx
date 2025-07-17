
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Stack } from 'expo-router';
import ModalTemplate from '@/components/ModalTemplate';
import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTextStyles } from '@/utils/componentTokens';

export default function ModalTemplatePhase2Test() {
  const [showDialog, setShowDialog] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [currentSize, setCurrentSize] = useState<'compact' | 'default' | 'large'>('default');

  const renderTestContent = () => (
    <View style={styles.testContent}>
      <Text style={styles.contentTitle}>Modal Content with Tara Theming</Text>
      <Text style={styles.contentText}>
        This modal demonstrates the Five Taras Buddhist color system:
      </Text>
      
      <View style={styles.taraColorDemo}>
        <View style={[styles.colorBox, { backgroundColor: DesignSystem.colors.redTara }]}>
          <Text style={styles.colorLabel}>Red Tara</Text>
          <Text style={styles.colorDescription}>Action Energy</Text>
        </View>
        
        <View style={[styles.colorBox, { backgroundColor: DesignSystem.colors.blueTara }]}>
          <Text style={[styles.colorLabel, { color: DesignSystem.colors.whiteTara }]}>Blue Tara</Text>
          <Text style={[styles.colorDescription, { color: DesignSystem.colors.whiteTara }]}>Contemplation</Text>
        </View>
        
        <View style={[styles.colorBox, { backgroundColor: DesignSystem.colors.greenTara }]}>
          <Text style={[styles.colorLabel, { color: DesignSystem.colors.whiteTara }]}>Green Tara</Text>
          <Text style={[styles.colorDescription, { color: DesignSystem.colors.whiteTara }]}>Growth</Text>
        </View>
      </View>

      <Text style={styles.contentText}>
        Notice the subtle Tara color accents in the modal header and action buttons, 
        providing spiritual context while maintaining clarity and usability.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'ModalTemplate Tara Migration Test' }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Test Header */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>ModalTemplate Tara Migration Test</Text>
          <Text style={styles.sectionDescription}>
            Testing modal components with Five Taras Buddhist color system integration
          </Text>
        </View>

        {/* Dialog Modal Tests */}
        <View style={styles.testSection}>
          <Text style={styles.testTitle}>Dialog Modals with Tara Theming</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.testButton, { backgroundColor: DesignSystem.colors.redTara }]}
              onPress={() => {
                setCurrentSize('compact');
                setShowDialog(true);
              }}
            >
              <Text style={styles.buttonText}>Compact Dialog</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.testButton, { backgroundColor: DesignSystem.colors.blueTara }]}
              onPress={() => {
                setCurrentSize('default');
                setShowDialog(true);
              }}
            >
              <Text style={styles.buttonText}>Default Dialog</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.testButton, { backgroundColor: DesignSystem.colors.greenTara }]}
              onPress={() => {
                setCurrentSize('large');
                setShowDialog(true);
              }}
            >
              <Text style={styles.buttonText}>Large Dialog</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fullscreen Modal Test */}
        <View style={styles.testSection}>
          <Text style={styles.testTitle}>Fullscreen Modal with Tara Theming</Text>
          
          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: DesignSystem.colors.yellowTara }]}
            onPress={() => setShowFullscreen(true)}
          >
            <Text style={[styles.buttonText, { color: DesignSystem.colors.blackTara }]}>
              Open Fullscreen Modal
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tara Color Context Explanation */}
        <View style={styles.testSection}>
          <Text style={styles.testTitle}>Five Taras Modal Context</Text>
          <Text style={styles.explanation}>
            • White Tara: Modal backgrounds for purity and healing{'\n'}
            • Blue Tara: Header accents for contemplative context{'\n'}
            • Red Tara: Action buttons for spiritual energy{'\n'}
            • Black Tara: Close icons for protective energy{'\n'}
            • Consistent spiritual theming throughout modal experience
          </Text>
        </View>

      </ScrollView>

      {/* Dialog Modal */}
      {showDialog && (
        <ModalTemplate
          title={`${currentSize.charAt(0).toUpperCase() + currentSize.slice(1)} Modal with Tara`}
          onClose={() => setShowDialog(false)}
          variant="dialog"
          size={currentSize}
          rightAction={{
            text: "Complete",
            onPress: () => setShowDialog(false)
          }}
        >
          {renderTestContent()}
        </ModalTemplate>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <ModalTemplate
          title="Fullscreen Modal with Tara Theming"
          onClose={() => setShowFullscreen(false)}
          variant="fullscreen"
          rightAction={{
            text: "Done",
            onPress: () => setShowFullscreen(false)
          }}
        >
          {renderTestContent()}
        </ModalTemplate>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: DesignSystem.spacing.lg,
  },
  testSection: {
    marginBottom: DesignSystem.spacing['2xl'],
  },
  sectionTitle: {
    ...ComponentTextStyles.heading,
    marginBottom: DesignSystem.spacing.md,
    color: DesignSystem.colors.redTara,
  },
  sectionDescription: {
    ...ComponentTextStyles.body,
    marginBottom: DesignSystem.spacing.lg,
  },
  testTitle: {
    ...ComponentTextStyles.subheading,
    marginBottom: DesignSystem.spacing.md,
    color: DesignSystem.colors.blueTara,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.lg,
  },
  testButton: {
    paddingVertical: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.xl,
    borderRadius: DesignSystem.borderRadius.lg,
    minWidth: 120,
    alignItems: 'center',
    ...DesignSystem.shadow.md,
  },
  buttonText: {
    ...ComponentTextStyles.button.primary,
    color: DesignSystem.colors.whiteTara,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  explanation: {
    ...ComponentTextStyles.body,
    backgroundColor: DesignSystem.colors.whiteTara,
    padding: DesignSystem.spacing.lg,
    borderRadius: DesignSystem.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: DesignSystem.colors.yellowTara,
  },

  // Test Content Styles
  testContent: {
    padding: DesignSystem.spacing.lg,
  },
  contentTitle: {
    ...ComponentTextStyles.subheading,
    marginBottom: DesignSystem.spacing.md,
    color: DesignSystem.colors.redTara,
  },
  contentText: {
    ...ComponentTextStyles.body,
    marginBottom: DesignSystem.spacing.lg,
    lineHeight: 24,
  },
  taraColorDemo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.lg,
  },
  colorBox: {
    flex: 1,
    minWidth: 100,
    padding: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    alignItems: 'center',
  },
  colorLabel: {
    ...ComponentTextStyles.label,
    color: DesignSystem.colors.whiteTara,
    fontWeight: DesignSystem.typography.fontWeight.bold,
  },
  colorDescription: {
    ...ComponentTextStyles.caption,
    color: DesignSystem.colors.whiteTara,
    textAlign: 'center',
  },
});
