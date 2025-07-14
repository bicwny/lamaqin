import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

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
  padding?: number;
  backgroundColor?: string;
  contentContainerStyle?: any;
  headerStyle?: any;
}

export default function ModalTemplate({
  title,
  onClose,
  showCloseButton = true,
  rightAction,
  children,
  scrollable = true,
  padding = 16,
  backgroundColor = '#f8f9fa',
  contentContainerStyle,
  headerStyle,
}: ModalTemplateProps) {
  const content = (
    <View style={[styles.content, { padding }, contentContainerStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['left', 'right', 'top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={backgroundColor}
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
}

import { DesignSystem } from '@/constants/DesignSystem';

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
    backgroundColor: DesignSystem.colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border,
  },
  headerButton: {
    paddingVertical: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  headerButtonText: {
    ...createStyles.body(),
    fontWeight: DesignSystem.typography.fontWeight.medium,
  },
  cancelButtonText: {
    color: DesignSystem.colors.textSecondary,
  },
  saveButtonText: {
    color: DesignSystem.colors.primary,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  saveButtonTextDisabled: {
    color: DesignSystem.colors.textTertiary,
  },
  title: {
    ...createStyles.heading('lg'),
  },
  content: {
    flex: 1,
    padding: DesignSystem.spacing.lg,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});