import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { DesignSystem } from '@/constants/DesignSystem';
import { DesignSystem } from '@/constants/DesignSystem';

interface LessonTemplateProps {
  title?: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  backgroundColor?: string;
  contentContainerStyle?: any;
}

export default function LessonTemplate({
  title,
  headerLeft,
  headerRight,
  children,
  backgroundColor = DesignSystem.colors.background,
  contentContainerStyle,
}: LessonTemplateProps) {
  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen 
        options={{ 
          presentation: 'modal',
          title: title || '',
          headerLeft: () => headerLeft,
          headerRight: () => headerRight,
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors.text,
          },
        }} 
      />
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={backgroundColor}
        translucent={false}
      />

      <ThemedView style={[styles.content, contentContainerStyle]}>
        {children}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background,
  },
  content: {
    flex: 1,
    padding: DesignSystem.spacing.lg,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});