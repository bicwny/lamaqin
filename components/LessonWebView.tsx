import React from 'react';
import { Platform, StyleSheet, Dimensions, TouchableOpacity, Linking } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

interface LessonWebViewProps {
  url: string;
  title?: string;
}

export function LessonWebView({ url, title }: LessonWebViewProps) {
  const { width, height } = Dimensions.get('window');

  if (Platform.OS === 'web') {
    // For web platform, use iframe
    return (
      <ThemedView style={styles.container}>
        {title && (
          <ThemedView style={styles.header}>
            <ThemedText style={styles.title}>{title}</ThemedText>
          </ThemedView>
        )}
        <iframe
          src={url}
          style={{
            width: '100%',
            height: height - 100,
            border: 'none',
            borderRadius: 8,
          }}
          title={title || 'Lesson Content'}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          onError={() => {
            console.log('iframe loading error');
          }}
          onLoad={(e) => {
            console.log('iframe loaded successfully');
          }}
        />
      </ThemedView>
    );
  }

  // For mobile platforms, use React Native WebView
  try {
    const { WebView } = require('react-native-webview');

    return (
      <ThemedView style={styles.container}>
        {title && (
          <ThemedView style={styles.header}>
            <ThemedText style={styles.title}>{title}</ThemedText>
          </ThemedView>
        )}
        <WebView
          source={{ uri: url }}
          style={[styles.webview, { height: height - 100 }]}
          startInLoadingState={true}
          scalesPageToFit={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </ThemedView>
    );
  } catch (error) {
    // Fallback if WebView is not available
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorTitle}>无法加载内容</ThemedText>
          <ThemedText style={styles.errorText}>
            请在移动设备上查看此内容，或访问以下链接：
          </ThemedText>
          <ThemedText style={styles.linkText} selectable>
            {url}
          </ThemedText>
          <TouchableOpacity 
            style={styles.openButton} 
            onPress={() => Linking.openURL(url)}
          >
            <ThemedText style={styles.openButtonText}>
              在浏览器中打开
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  linkText: {
    fontSize: 14,
    color: '#0066cc',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  openButton: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  openButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});