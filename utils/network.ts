
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

export class NetworkUtils {
  static async checkNetworkState(): Promise<NetworkState> {
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected || false,
        isInternetReachable: state.isInternetReachable || false,
        type: state.type || 'unknown'
      };
    } catch (error) {
      console.error('Network check failed:', error);
      return {
        isConnected: false,
        isInternetReachable: false,
        type: 'unknown'
      };
    }
  }

  static async waitForConnection(maxRetries = 5, delay = 2000): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      const networkState = await this.checkNetworkState();
      if (networkState.isConnected && networkState.isInternetReachable) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return false;
  }

  static isNetworkError(error: any): boolean {
    if (!error) return false;
    
    const errorMessage = error.message?.toLowerCase() || '';
    const networkIndicators = [
      'network request failed',
      'network error',
      'connection timeout',
      'no internet',
      'offline',
      'fetch failed',
      'request timeout'
    ];
    
    return networkIndicators.some(indicator => errorMessage.includes(indicator));
  }
}

// Helper function for simplified network checking
export async function checkNetwork(): Promise<boolean> {
  const networkState = await NetworkUtils.checkNetworkState();
  return networkState.isConnected && networkState.isInternetReachable;
}

// Helper function for network error detection
export function isNetworkError(error: any): boolean {
  return NetworkUtils.isNetworkError(error);
}
