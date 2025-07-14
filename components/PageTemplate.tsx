
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import PageHeader from './PageHeader';

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    text?: string;
    component?: React.ReactNode;
    onPress: () => void;
  };
  scrollable?: boolean;
  backgroundColor?: string;
  padding?: number;
  variant?: 'default' | 'modal' | 'auth' | 'form' | 'list';
  modalCloseButton?: boolean;
  onClose?: () => void;
}

export default function PageTemplate({
  title,
  subtitle,
  children,
  showBackButton = false,
  onBackPress,
  rightAction,
  scrollable = true,
  backgroundColor = Colors.background,
  padding = 16,
  variant = 'default',
  modalCloseButton = false,
  onClose,
}: PageTemplateProps) {
  const renderContent = () => {
    if (variant === 'auth') {
      return (
        <KeyboardAvoidingView 
          style={[styles.authContainer, { backgroundColor }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.authContent}>
            {children}
          </View>
        </KeyboardAvoidingView>
      );
    }

    if (variant === 'form') {
      return (
        <KeyboardAvoidingView 
          style={[styles.container, { backgroundColor }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { padding }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }

    if (variant === 'list') {
      return (
        <View style={[styles.container, { backgroundColor }]}>
          <View style={styles.listContent}>
            {children}
          </View>
        </View>
      );
    }

    if (scrollable) {
      return (
        <ScrollView 
          style={[styles.scrollView, { backgroundColor }]}
          contentContainerStyle={[styles.scrollContent, { padding }]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor, padding }]}>
        {children}
      </View>
    );
  };

  const getHeaderProps = () => {
    if (variant === 'modal') {
      return {
        title,
        subtitle,
        showBackButton: modalCloseButton,
        onBackPress: onClose,
        rightAction,
      };
    }

    return {
      title,
      subtitle,
      showBackButton,
      onBackPress,
      rightAction,
    };
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <PageHeader {...getHeaderProps()} />
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
  },
});
