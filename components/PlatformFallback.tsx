
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser';

interface FallbackInfo {
  isIOS: boolean;
  isAndroid: boolean;
  originalRoute: string;
  code?: string;
}

export function PlatformFallback() {
  const [fallbackInfo, setFallbackInfo] = useState<FallbackInfo | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    // Check for fallback info in session storage (web only)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const stored = window.sessionStorage.getItem('showAppFallback');
      if (stored) {
        try {
          const info = JSON.parse(stored);
          setFallbackInfo(info);
          
          // Start countdown
          const timer = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                setShowOptions(true);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          // Clear the session storage
          window.sessionStorage.removeItem('showAppFallback');
          
          return () => clearInterval(timer);
        } catch (error) {
          console.error('❌ Failed to parse fallback info:', error);
        }
      }
    }
  }, []);

  const handleDownloadApp = async () => {
    const appStoreUrl = fallbackInfo?.isIOS 
      ? 'https://apps.apple.com/app/your-app-id' // Replace with your actual App Store URL
      : 'https://play.google.com/store/apps/details?id=your.package.name'; // Replace with your actual Play Store URL
    
    try {
      if (Platform.OS === 'web') {
        window.open(appStoreUrl, '_blank');
      } else {
        await openBrowserAsync(appStoreUrl);
      }
    } catch (error) {
      console.error('❌ Failed to open app store:', error);
    }
  };

  const handleContinueInBrowser = () => {
    setFallbackInfo(null);
    setShowOptions(false);
    // The user can continue using the web version
  };

  if (!fallbackInfo) {
    return null;
  }

  if (!showOptions) {
    return (
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>🚀 正在打开应用...</Text>
          <Text style={styles.subtitle}>
            正在尝试打开 DharmaPractice 应用
          </Text>
          <View style={styles.countdownContainer}>
            <Text style={styles.countdown}>{countdown}</Text>
          </View>
          <Text style={styles.hint}>
            如果应用没有自动打开，请稍等...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>📱 应用未安装</Text>
        <Text style={styles.subtitle}>
          为了获得最佳体验，建议下载我们的移动应用
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={handleDownloadApp}
        >
          <Text style={styles.primaryButtonText}>
            {fallbackInfo.isIOS ? '📲 在 App Store 下载' : '📲 在 Google Play 下载'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={handleContinueInBrowser}
        >
          <Text style={styles.secondaryButtonText}>
            🌐 在浏览器中继续
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.note}>
          您可以稍后随时下载应用，现在继续在浏览器中使用所有功能
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 30,
    borderRadius: 15,
    maxWidth: 400,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 25,
    lineHeight: 22,
  },
  countdownContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  countdown: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  hint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 10,
  },
});
