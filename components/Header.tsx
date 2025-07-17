
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/constants/DesignSystem';
import { Typography } from '@/utils/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type HeaderContext = 'page' | 'modal' | 'section';

interface HeaderProps {
  title: string;
  subtitle?: string;
  context?: HeaderContext;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    text?: string;
    component?: React.ReactNode;
    onPress: () => void;
  };
  leftAction?: {
    text?: string;
    component?: React.ReactNode;
    onPress: () => void;
  };
}

export default function Header({
  title,
  subtitle,
  context = 'page',
  showBackButton = false,
  onBackPress,
  rightAction,
  leftAction,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  const getContextStyles = () => {
    switch (context) {
      case 'page':
        return {
          container: styles.pageContainer,
          header: styles.pageHeader,
          title: styles.pageTitle,
        };
      case 'modal':
        return {
          container: styles.modalContainer,
          header: styles.modalHeader,
          title: styles.modalTitle,
        };
      case 'section':
        return {
          container: styles.sectionContainer,
          header: styles.sectionHeader,
          title: styles.sectionTitle,
        };
    }
  };

  const contextStyles = getContextStyles();

  return (
    <View style={[contextStyles.container, context === 'page' && { paddingTop: insets.top }]}>
      <View style={contextStyles.header}>
        {/* Left side */}
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.actionButton}>
            <Ionicons name="arrow-back" size={24} color={DesignSystem.colors.primary} />
          </TouchableOpacity>
        ) : leftAction ? (
          <TouchableOpacity onPress={leftAction.onPress} style={styles.actionButton}>
            {leftAction.component || (
              <Text style={styles.actionText}>{leftAction.text}</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        {/* Title section */}
        <View style={styles.titleContainer}>
          <Text style={contextStyles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right side */}
        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.actionButton}>
            {rightAction.component || (
              <Text style={styles.actionText}>{rightAction.text}</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Page header styles
  pageContainer: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
  },
  pageTitle: {
    ...Typography.styles.heading('xl'),
    textAlign: 'center',
  },

  // Modal header styles
  modalContainer: {
    backgroundColor: DesignSystem.colors.backgroundSecondary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border,
  },
  modalTitle: {
    ...Typography.styles.heading('lg'),
    textAlign: 'center',
  },

  // Section header styles
  sectionContainer: {
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: DesignSystem.spacing.sm,
    marginBottom: DesignSystem.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.borderLight,
  },
  sectionTitle: {
    ...Typography.styles.subheading('lg'),
    textAlign: 'center',
  },

  // Common styles
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  subtitle: {
    ...Typography.styles.label('sm'),
    color: DesignSystem.colors.textSecondary,
    textAlign: 'center',
    marginTop: DesignSystem.spacing.xs,
  },
  actionButton: {
    minWidth: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    ...Typography.styles.label('base'),
    color: DesignSystem.colors.primary,
    fontWeight: DesignSystem.typography.fontWeight.semibold,
  },
  placeholder: {
    minWidth: 44,
  },
});
