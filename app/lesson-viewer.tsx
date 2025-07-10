
import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { LessonWebView } from '@/components/LessonWebView';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LessonViewer() {
  const { url, title, lessonNumber } = useLocalSearchParams<{
    url: string;
    title: string;
    lessonNumber: string;
  }>();

  if (!url) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: '课程内容' }} />
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>
            未找到课程链接
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  const handleClose = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: title || '课程内容',
          presentation: 'modal',
          headerLeft: () => (
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ThemedView style={styles.content}>
        <LessonWebView 
          url={url} 
          title={lessonNumber ? `第${lessonNumber}课: ${title}` : title}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
});
