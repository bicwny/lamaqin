import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import ConsolidatedDesignSystem from '@/constants/ConsolidatedDesignSystem';

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
  backgroundColor = Colors.background,
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
    backgroundColor: ConsolidatedDesignSystem.colors["surface-primary"],
  },
  content: {
    flex: 1,
    padding: ConsolidatedDesignSystem.spacing.lg,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});