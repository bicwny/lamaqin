import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { DesignSystem, createStyles } from '@/constants/ConsolidatedDesignSystem';
import { ComponentTokens, componentHelpers } from '@/utils/componentTokens';

interface ModalTemplateProps {
  title: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  rightAction?: {
    text?: string;
    component?: React.ReactNode;
    onPress: () => void;
  };
  children: React.ReactNode;
  scrollable?: boolean;
  size?: 'compact' | 'default' | 'large';
  variant?: 'dialog' | 'fullscreen';
  backgroundColor?: string;
  contentContainerStyle?: any;
  headerStyle?: any;
  keyboardAvoidingView?: 'padding' | 'height' | 'position';
}

export default function ModalTemplate({
  title,
  onClose,
  showCloseButton = true,
  rightAction,
  children,
  scrollable = true,
  size = 'default',
  variant = 'dialog',
  backgroundColor,
  contentContainerStyle,
  headerStyle,
  keyboardAvoidingView,
}: ModalTemplateProps) {
  // Get modal styles using consolidated system
  const modalStyles = componentHelpers.getModalStyle(variant, size);
  
  const defaultBackgroundColor = variant === 'fullscreen' 
    ? ConsolidatedDesignSystem.colors["surface-primary"] 
    : ConsolidatedDesignSystem.colorsConsolidatedDesignSystem.colors["surface-secondary"];

  const content = (
    <View style={[styles.content, modalStyles, contentContainerStyle]}>
      {children}
    </View>
  );

  const containerBackground = backgroundColor || defaultBackgroundColor;
  
  const modalContainer = (
    <SafeAreaView style={[styles.container, { backgroundColor: containerBackground }]} edges={['left', 'right', 'top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={containerBackground}
        translucent={false}
      />

      {/* Modal Header */}
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerLeft}>
          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        <View style={styles.headerRight}>
          {rightAction && (
            rightAction.component ? rightAction.component : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={rightAction.onPress}
              >
                <Text style={styles.actionButtonText}>
                  {rightAction.text || '完成'}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      {/* Modal Content */}
      {scrollable ? (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );

  // Wrap with KeyboardAvoidingView if specified
  if (keyboardAvoidingView) {
    const KeyboardAvoidingView = require('react-native').KeyboardAvoidingView;
    return (
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={keyboardAvoidingView}
        keyboardVerticalOffset={0}
      >
        {modalContainer}
      </KeyboardAvoidingView>
    );
  }

  return modalContainer;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ConsolidatedDesignSystem.colors["surface-primary"],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ConsolidatedDesignSystem.spacing.lg,
    paddingVertical: ConsolidatedDesignSystem.spacing.md,
    backgroundColor: ConsolidatedDesignSystem.colorsConsolidatedDesignSystem.colors["surface-secondary"],
    borderBottomWidth: 1,
    borderBottomColor: ConsolidatedDesignSystem.colors["border-default"],
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    ...createStyles.heading('lg'),
  },
  closeButton: {
    paddingVertical: ConsolidatedDesignSystem.spacing.sm,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.sm,
  },
  actionButton: {
    paddingVertical: ConsolidatedDesignSystem.spacing.sm,
    paddingHorizontal: ConsolidatedDesignSystem.spacing.md,
  },
  actionButtonText: {
    ...createStyles.body(),
    fontWeight: ConsolidatedDesignSystem.typography.fontWeight.semibold,
    color: ConsolidatedConsolidatedDesignSystem.colors.primary,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    // Padding now handled by modal size tokens
  },
});