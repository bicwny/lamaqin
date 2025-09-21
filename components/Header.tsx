
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
          container: [styles.baseContainer, styles.pageContainer],
          header: [styles.baseHeader, styles.pageHeader],
          title: [styles.baseTitle, styles.pageTitle],
          subtitle: [styles.baseSubtitle, styles.pageSubtitle],
        };
      case 'modal':
        return {
          container: [styles.baseContainer, styles.modalContainer],
          header: [styles.baseHeader, styles.modalHeader],
          title: [styles.baseTitle, styles.modalTitle],
          subtitle: [styles.baseSubtitle, styles.modalSubtitle],
        };
      case 'section':
        return {
          container: [styles.baseContainer, styles.sectionContainer],
          header: [styles.baseHeader, styles.sectionHeader],
          title: [styles.baseTitle, styles.sectionTitle],
          subtitle: [styles.baseSubtitle, styles.sectionSubtitle],
        };
      default:
        return {
          container: [styles.baseContainer, styles.pageContainer],
          header: [styles.baseHeader, styles.pageHeader],
          title: [styles.baseTitle, styles.pageTitle],
          subtitle: [styles.baseSubtitle, styles.pageSubtitle],
        };
    }
  };

  const contextStyles = getContextStyles();

  return (
    <View 
      style={[
        contextStyles.container,
        context === 'page' ? { paddingTop: insets.top } : undefined
      ]}
    >
      <View style={contextStyles.header}>
        {/* Left side */}
        {showBackButton ? (
          <TouchableOpacity 
            onPress={onBackPress} 
            style={styles.actionButton}
          >
            <Ionicons name="arrow-back" size={24} color="#ef4444" />
          </TouchableOpacity>
        ) : leftAction ? (
          <TouchableOpacity 
            onPress={leftAction.onPress} 
            style={styles.actionButton}
          >
            {leftAction.component || (
              <Text style={styles.actionText}>{leftAction.text}</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButtonSpacer} />
        )}

        {/* Title section */}
        <View style={styles.titleSection}>
          <Text style={contextStyles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={contextStyles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right side */}
        {rightAction ? (
          <TouchableOpacity 
            onPress={rightAction.onPress} 
            style={styles.actionButton}
          >
            {rightAction.component || (
              <Text style={styles.actionText}>{rightAction.text}</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButtonSpacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Base styles
  baseContainer: {
    backgroundColor: 'white',
  },
  baseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  baseTitle: {
    textAlign: 'center',
    color: '#111827',
    fontWeight: 'bold',
  },
  baseSubtitle: {
    textAlign: 'center',
    fontWeight: '500',
  },

  // Page context styles
  pageContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pageHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 72,
  },
  pageTitle: {
    fontSize: 24,
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#374151',
    marginTop: 6,
    letterSpacing: 0.3,
  },

  // Modal context styles
  modalContainer: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 4,
  },

  // Section context styles
  sectionContainer: {
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    paddingVertical: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 4,
  },

  // Common elements
  titleSection: {
    flex: 1,
    alignItems: 'center',
  },
  actionButton: {
    minWidth: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  actionButtonSpacer: {
    minWidth: 44,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});

