
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export function WebPlatformDetector() {
  const [showPromotion, setShowPromotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Check if user is on mobile web
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      setIsMobile(isMobileDevice);
      
      // Check if promotion was previously dismissed
      const dismissed = localStorage.getItem('appPromotionDismissed');
      if (!dismissed && isMobileDevice) {
        // Show promotion after a short delay
        setTimeout(() => setShowPromotion(true), 3000);
      }
    }
  }, []);

  const handleDownloadApp = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const appStoreUrl = isIOS 
      ? 'https://apps.apple.com/app/your-app-id' // Replace with your actual App Store URL
      : 'https://play.google.com/store/apps/details?id=your.package.name'; // Replace with your actual Play Store URL
    
    window.open(appStoreUrl, '_blank');
    handleDismiss();
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPromotion(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('appPromotionDismissed', 'true');
    }
  };

  if (!showPromotion || !isMobile || dismissed || Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.content}>
          <Text style={styles.icon}>📱</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>获得更好的体验</Text>
            <Text style={styles.subtitle}>下载我们的移动应用</Text>
          </View>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={handleDownloadApp}
          >
            <Text style={styles.downloadText}>下载</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={handleDismiss}
          >
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  banner: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: Platform.OS === 'web' ? 50 : 15, // Account for status bar on web
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  downloadText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dismissButton: {
    padding: 5,
  },
  dismissText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
