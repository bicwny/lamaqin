import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, Dimensions, TouchableOpacity, Linking } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

interface LessonWebViewProps {
  url: string;
  title?: string;
}

export function LessonWebView({ url, title }: LessonWebViewProps) {
  const { width, height } = Dimensions.get('window');
  const [loadError, setLoadError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // Known domains that typically don't allow embedding
  const restrictedDomains = [
    'google.com',
    'googleapis.com',
    'googlesites.com',
    'youtube.com',
    'youtu.be',
    'facebook.com',
    'twitter.com',
    'x.com',
    'instagram.com',
    'linkedin.com',
    'github.com'
  ];

  const isRestrictedDomain = (url: string): boolean => {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      return restrictedDomains.some(restricted => 
        domain.includes(restricted) || domain.endsWith(`.${restricted}`)
      );
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // Check if this is likely a restricted domain
    if (isRestrictedDomain(url)) {
      setShowFallback(true);
    }
  }, [url]);

  const handleOpenInBrowser = () => {
    Linking.openURL(url);
  };

  if (Platform.OS === 'web') {
    // For web platform, use iframe with better error handling
    if (showFallback || loadError) {
      return (
        <ThemedView style={styles.container}>
          {title && (
            <ThemedView style={styles.header}>
              <ThemedText style={styles.title}>{title}</ThemedText>
            </ThemedView>
          )}
          <ThemedView style={styles.fallbackContainer}>
            <ThemedText style={styles.fallbackTitle}>内容无法直接显示</ThemedText>
            <ThemedText style={styles.fallbackText}>
              此网站限制了嵌入显示。请点击下方按钮在新窗口中打开课程内容。
            </ThemedText>
            <TouchableOpacity style={styles.openButton} onPress={handleOpenInBrowser}>
              <ThemedText style={styles.openButtonText}>在浏览器中打开</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.urlText} selectable>{url}</ThemedText>
          </ThemedView>
        </ThemedView>
      );
    }

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
            setLoadError(true);
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

    if (showFallback || loadError) {
      return (
        <ThemedView style={styles.container}>
          {title && (
            <ThemedView style={styles.header}>
              <ThemedText style={styles.title}>{title}</ThemedText>
            </ThemedView>
          )}
          <ThemedView style={styles.fallbackContainer}>
            <ThemedText style={styles.fallbackTitle}>内容无法直接显示</ThemedText>
            <ThemedText style={styles.fallbackText}>
              此网站限制了嵌入显示。请点击下方按钮在外部浏览器中打开课程内容。
            </ThemedText>
            <TouchableOpacity style={styles.openButton} onPress={handleOpenInBrowser}>
              <ThemedText style={styles.openButtonText}>在浏览器中打开</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.urlText} selectable>{url}</ThemedText>
          </ThemedView>
        </ThemedView>
      );
    }

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
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.log('WebView error: ', nativeEvent);
            setLoadError(true);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.log('WebView HTTP error: ', nativeEvent);
            if (nativeEvent.statusCode === 403 || nativeEvent.statusCode === 404) {
              setLoadError(true);
            }
          }}
          onLoadEnd={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            if (nativeEvent.title === '' || nativeEvent.url === 'about:blank') {
              setLoadError(true);
            }
          }}
        />
      </ThemedView>
    );
  } catch (error) {
    // Fallback if WebView is not available
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.fallbackContainer}>
          <ThemedText style={styles.fallbackTitle}>无法加载内容</ThemedText>
          <ThemedText style={styles.fallbackText}>
            WebView组件不可用。请点击下方按钮在外部浏览器中打开课程内容。
          </ThemedText>
          <TouchableOpacity style={styles.openButton} onPress={handleOpenInBrowser}>
            <ThemedText style={styles.openButtonText}>在浏览器中打开</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.urlText} selectable>{url}</ThemedText>
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
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  fallbackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#343a40',
  },
  fallbackText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    color: '#6c757d',
    maxWidth: 300,
  },
  openButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  openButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  urlText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f3f4',
    borderRadius: 6,
    overflow: 'hidden',
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
});