
import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface LessonWebViewProps {
  lessonUrl: string;
  onClose: () => void;
  onProgress?: (progress: number) => void;
}

export default function LessonWebView({ lessonUrl, onClose, onProgress }: LessonWebViewProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleProgress = ({ nativeEvent }: { nativeEvent: { progress: number } }) => {
    const currentProgress = Math.round(nativeEvent.progress * 100);
    setProgress(currentProgress);
    onProgress?.(currentProgress);
  };

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    Alert.alert(
      '加载错误',
      '无法加载课程内容，请检查网络连接',
      [
        { text: '重试', onPress: () => webViewRef.current?.reload() },
        { text: '关闭', onPress: onClose }
      ]
    );
  };

  const goBack = () => {
    webViewRef.current?.goBack();
  };

  const goForward = () => {
    webViewRef.current?.goForward();
  };

  const reload = () => {
    webViewRef.current?.reload();
  };

  return (
    <View style={styles.container}>
      {/* Header with navigation controls */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            onPress={goBack} 
            style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
            disabled={!canGoBack}
          >
            <Ionicons name="chevron-back" size={20} color={canGoBack ? "#333" : "#ccc"} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={goForward} 
            style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
            disabled={!canGoForward}
          >
            <Ionicons name="chevron-forward" size={20} color={canGoForward ? "#333" : "#ccc"} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={reload} style={styles.navButton}>
            <Ionicons name="refresh" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      {loading && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: lessonUrl }}
        style={styles.webView}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onLoadProgress={handleProgress}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleError}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#da4347" />
            <Text style={styles.loadingText}>加载课程中...</Text>
          </View>
        )}
        // Enable JavaScript and DOM storage
        javaScriptEnabled={true}
        domStorageEnabled={true}
        // Allow mixed content (HTTP/HTTPS)
        mixedContentMode="compatibility"
        // Enable zooming
        scalesPageToFit={true}
        // Show loading indicator
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  headerButton: {
    padding: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#e0e0e0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#da4347',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
