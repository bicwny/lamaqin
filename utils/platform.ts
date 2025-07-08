
import { Platform, Linking } from 'react-native';

export interface PlatformInfo {
  platform: string;
  isMobileWeb: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
}

export function detectPlatform(): PlatformInfo {
  if (Platform.OS === 'web') {
    const userAgent = navigator.userAgent;
    const isMobileWeb = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    return {
      platform: Platform.OS,
      isMobileWeb,
      isIOS,
      isAndroid,
      isDesktop: !isMobileWeb
    };
  }
  
  return {
    platform: Platform.OS,
    isMobileWeb: false,
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isDesktop: false
  };
}

export async function attemptAppRedirect(route: string, code?: string): Promise<boolean> {
  const { isMobileWeb } = detectPlatform();
  
  if (!isMobileWeb) {
    console.log('🖥️ Desktop detected, staying in web version');
    return false;
  }

  console.log('📱 Mobile web detected, attempting app redirect...');
  
  try {
    const deepLinkUrl = code 
      ? `dharmapractice://auth/reset-password?code=${code}`
      : `dharmapractice://${route}`;
    
    console.log('🚀 Attempting redirect to:', deepLinkUrl);
    
    // Set a timeout to detect if app opened
    const timeout = new Promise<boolean>(resolve => 
      setTimeout(() => resolve(false), 3000)
    );
    
    // Try to open the app
    const redirectPromise = Linking.openURL(deepLinkUrl)
      .then(() => true)
      .catch(() => false);
    
    // Race between redirect and timeout
    const result = await Promise.race([redirectPromise, timeout]);
    
    if (!result) {
      console.log('⏰ App redirect timeout, showing fallback options');
    }
    
    return result as boolean;
  } catch (error) {
    console.error('❌ App redirect failed:', error);
    return false;
  }
}

export function getAppStoreUrl(isIOS: boolean): string {
  return isIOS 
    ? 'https://apps.apple.com/app/your-app-id' // Replace with your actual App Store URL
    : 'https://play.google.com/store/apps/details?id=your.package.name'; // Replace with your actual Play Store URL
}
