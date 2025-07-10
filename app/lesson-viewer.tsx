
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LessonWebView from '@/components/LessonWebView';

export default function LessonViewerScreen() {
  const { lessonUrl, lessonTitle } = useLocalSearchParams<{
    lessonUrl: string;
    lessonTitle: string;
  }>();

  if (!lessonUrl) {
    router.back();
    return null;
  }

  const handleClose = () => {
    router.back();
  };

  const handleProgress = (progress: number) => {
    console.log(`📖 Lesson progress: ${progress}%`);
    // You can track lesson viewing progress here
  };

  return (
    <SafeAreaView style={styles.container}>
      <LessonWebView
        lessonUrl={lessonUrl}
        onClose={handleClose}
        onProgress={handleProgress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
