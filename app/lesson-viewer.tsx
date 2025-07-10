
import React from 'react';
import { StyleSheet, Platform, Linking, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { LessonWebView } from '@/components/LessonWebView';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LessonViewer() {
  const params = useLocalSearchParams<{
    url?: string;
    lessonUrl?: string;
    title?: string;
    lessonTitle?: string;
    lessonNumber?: string;
  }>();
  
  // Support both parameter formats
  const url = params.url || params.lessonUrl;
  const title = params.title || params.lessonTitle;
  const lessonNumber = params.lessonNumber;

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
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => {
                Alert.alert(
                  '打开链接',
                  '是否在浏览器中打开此课程？',
                  [
                    { text: '取消', style: 'cancel' },
                    { text: '打开', onPress: () => Linking.openURL(url) }
                  ]
                );
              }} 
              style={styles.closeButton}
            >
              <Ionicons name="open-outline" size={24} color="#007AFF" />
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
