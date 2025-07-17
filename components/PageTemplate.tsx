import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PageHeader from './PageHeader';
import { DesignSystem } from '@/constants/DesignSystem';
import { componentHelpers } from '@/utils/componentTokens';

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
  padding?: keyof typeof DesignSystem.spacing;
  backgroundColor?: string;
  /** 
   * Background variant using Tara Buddhist semantic colors:
   * - default: Standard background
   * - secondary: Card-like background
   * - tertiary: Subtle background
   * - dharma: Red Tara (practice energy & determination)
   * - practice: Green Tara (growth & completion)
   * - meditation: Blue Tara (contemplation & deep practice)
   * - study: Yellow Tara (wisdom & achievement)
   * - mindfulness: Orange Tara (mindfulness & compassion)
   */
  backgroundVariant?: 'default' | 'secondary' | 'tertiary' | 'dharma' | 'practice' | 'meditation' | 'study' | 'mindfulness';
  contentContainerStyle?: any;
  showHeader?: boolean;
  shadowVariant?: 'none' | 'subtle' | 'elevated';
  /** 
   * Configure SafeAreaView edges to prevent double safe area padding
   * Use 'none' when parent already has SafeAreaView
   */
  safeAreaEdges?: 'all' | 'horizontal' | 'none' | Array<'top' | 'right' | 'bottom' | 'left'>;
}

export default function PageTemplate({
  title,
  showBackButton = false,
  onBackPress,
  rightAction,
  subtitle,
  children,
  scrollable = true,
  padding = 'lg',
  backgroundColor,
  backgroundVariant = 'default',
  contentContainerStyle,
  showHeader = true,
  shadowVariant = 'none',
  safeAreaEdges = 'all',
}: PageTemplateProps) {
  const insets = useSafeAreaInsets();

  // Buddhist semantic background colors using Tara system
  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    
    switch (backgroundVariant) {
      case 'secondary':
        return DesignSystem.colors.backgroundSecondary;
      case 'tertiary':
        return DesignSystem.colors.backgroundTertiary;
      case 'dharma':
        return `${DesignSystem.colors.redTara}0D`; // 5% opacity Red Tara - practice energy & determination
      case 'practice':
        return `${DesignSystem.colors.greenTara}0D`; // 5% opacity Green Tara - growth & completion
      case 'meditation':
        return `${DesignSystem.colors.blueTara}0D`; // 5% opacity Blue Tara - contemplation & deep practice
      case 'study':
        return `${DesignSystem.colors.yellowTara}0D`; // 5% opacity Yellow Tara - wisdom & achievement
      case 'mindfulness':
        return `${DesignSystem.colors.orangeTara}0D`; // 5% opacity Orange Tara - mindfulness & compassion
      default:
        return DesignSystem.colors.background;
    }
  };

  // Get shadow styles using component tokens
  const getShadowStyle = () => {
    switch (shadowVariant) {
      case 'subtle':
        return DesignSystem.shadow.sm;
      case 'elevated':
        return DesignSystem.shadow.md;
      default:
        return {};
    }
  };

  const finalBackgroundColor = getBackgroundColor();
  const paddingValue = typeof padding === 'string' ? DesignSystem.spacing[padding] : padding;

  // Configure SafeAreaView edges to prevent double safe area padding
  const getSafeAreaEdges = () => {
    if (safeAreaEdges === 'all') return ['left', 'right', 'top', 'bottom'];
    if (safeAreaEdges === 'horizontal') return ['left', 'right'];
    if (safeAreaEdges === 'none') return [];
    return safeAreaEdges;
  };

  const content = (
    <View style={[
      styles.content, 
      { padding: paddingValue }, 
      getShadowStyle(),
      contentContainerStyle
    ]}>
      {children}
    </View>
  );

  const mainContent = (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={finalBackgroundColor}
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
          contentContainerStyle={[styles.scrollContent, { padding: paddingValue }]}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </>
  );

  // Only wrap with SafeAreaView if edges are configured
  const safeEdges = getSafeAreaEdges();
  if (safeEdges.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: finalBackgroundColor }]}>
        {mainContent}
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: finalBackgroundColor }]} edges={safeEdges}>
      {mainContent}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});