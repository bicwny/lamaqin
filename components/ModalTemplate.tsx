import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/constants/DesignSystem';
import { ComponentTokens, componentHelpers, ComponentTextStyles } from '@/utils/componentTokens';

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
  // Get modal styles using consolidated Tara system
  const modalStyles = componentHelpers.getModalStyle(variant, size);
  
  // Use Tara colors for modal backgrounds with spiritual context
  const defaultBackgroundColor = variant === 'fullscreen' 
    ? DesignSystem.colors.background 
    : DesignSystem.colors.whiteTara; // Pure White Tara for modal clarity and healing

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
              <Ionicons name="close" size={24} color={DesignSystem.colors.blackTara} />
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
    backgroundColor: DesignSystem.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.whiteTara, // Pure White Tara for header clarity
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
    // Subtle Blue Tara accent for contemplative modal distinction
    borderTopWidth: 2,
    borderTopColor: DesignSystem.colors.blueTara,
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
    ...ComponentTextStyles.subheading, // Using consolidated Tara text styles
  },
  closeButton: {
    paddingVertical: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    // Subtle hover/press state with protective Black Tara energy
    backgroundColor: 'transparent',
  },
  actionButton: {
    paddingVertical: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    ...ComponentTextStyles.link, // Using consolidated Tara text styles
    color: DesignSystem.colors.redTara, // Red Tara for action buttons with spiritual energy
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
    backgroundColor: DesignSystem.colors.whiteTara, // Pure White Tara for content healing energy
  },
  scrollView: {
    flex: 1,
    backgroundColor: DesignSystem.colors.whiteTara, // Consistent White Tara background
  },
  scrollContent: {
    flexGrow: 1,
    // Padding now handled by modal size tokens from Tara system
  },
});