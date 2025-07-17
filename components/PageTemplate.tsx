import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import PageHeader from './PageHeader';
import { DesignSystem } from '@/constants/DesignSystem';

interface PageTemplateProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    text?: string;
    component?: React.ReactNode;
    onPress: () => void;
  };
  subtitle?: string;
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: number;
  backgroundColor?: string;
  contentContainerStyle?: any;
  showHeader?: boolean;
}

export default function PageTemplate({
  title,
  showBackButton = false,
  onBackPress,
  rightAction,
  subtitle,
  children,
  scrollable = true,
  padding = 16,
  backgroundColor = '#f8f9fa',
  contentContainerStyle,
  showHeader = true,
}: PageTemplateProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.content, { padding }, contentContainerStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['left', 'right', 'top', 'bottom']}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={backgroundColor}
        translucent={false}
      />
      {showHeader && (
        <PageHeader
          title={title}
          showBackButton={showBackButton}
          onBackPress={onBackPress}
          rightAction={rightAction}
          subtitle={subtitle}
        />
      )}
      {scrollable ? (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: DesignSystem.spacing.lg,
  },
});