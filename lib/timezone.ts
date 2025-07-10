
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface TimezoneInfo {
  timezone: string;
  offset: number;
  displayName: string;
}

/**
 * Detect user's timezone automatically
 */
export async function detectUserTimezone(): Promise<TimezoneInfo> {
  try {
    // Try device/browser detection first
    let timezone: string;
    
    if (Platform.OS === 'web') {
      // Web browser detection
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } else {
      // React Native - use Intl API if available
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } else {
        // Fallback to device locale calculation
        const offset = new Date().getTimezoneOffset();
        timezone = getTimezoneFromOffset(offset);
      }
    }

    // Get timezone info
    const now = new Date();
    const offset = -now.getTimezoneOffset(); // Convert to minutes ahead of UTC
    const displayName = getTimezoneDisplayName(timezone, offset);

    console.log('🌍 Detected timezone:', timezone, 'offset:', offset, 'display:', displayName);

    return {
      timezone,
      offset,
      displayName
    };
  } catch (error) {
    console.error('❌ Timezone detection failed:', error);
    // Fallback to UTC
    return {
      timezone: 'UTC',
      offset: 0,
      displayName: 'UTC (GMT+0)'
    };
  }
}

/**
 * Get or detect user's timezone (with caching)
 */
export async function getUserTimezone(): Promise<TimezoneInfo> {
  try {
    // Check if we have a stored timezone preference
    const storedTimezone = await AsyncStorage.getItem('@user_timezone');
    
    if (storedTimezone) {
      const timezoneInfo = JSON.parse(storedTimezone);
      console.log('🕒 Using stored timezone:', timezoneInfo.timezone);
      return timezoneInfo;
    }

    // No stored preference, detect automatically
    console.log('🔍 No stored timezone found, detecting...');
    const detectedTimezone = await detectUserTimezone();
    
    // Store the detected timezone for future use
    await saveUserTimezone(detectedTimezone);
    
    return detectedTimezone;
  } catch (error) {
    console.error('❌ Error getting user timezone:', error);
    return {
      timezone: 'UTC',
      offset: 0,
      displayName: 'UTC (GMT+0)'
    };
  }
}

/**
 * Save user's timezone preference
 */
export async function saveUserTimezone(timezoneInfo: TimezoneInfo): Promise<void> {
  try {
    await AsyncStorage.setItem('@user_timezone', JSON.stringify(timezoneInfo));
    console.log('💾 Saved timezone preference:', timezoneInfo.timezone);
  } catch (error) {
    console.error('❌ Error saving timezone:', error);
  }
}

/**
 * Get current date in user's timezone
 */
export function getCurrentDateInTimezone(timezone: string): string {
  try {
    const now = new Date();
    // Convert to user's timezone and get date string
    const userDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    return userDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('❌ Error getting date in timezone:', error);
    // Fallback to local date
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Check if it's a new day in user's timezone
 */
export function isNewDayInTimezone(timezone: string, lastResetDate?: string): boolean {
  const currentDate = getCurrentDateInTimezone(timezone);
  return !lastResetDate || currentDate !== lastResetDate;
}

/**
 * Get time until midnight in user's timezone (for countdown)
 */
export function getTimeUntilMidnight(timezone: string): { hours: number; minutes: number; seconds: number } {
  try {
    const now = new Date();
    const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    
    // Calculate time until midnight
    const midnight = new Date(userTime);
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    const timeUntilMidnight = midnight.getTime() - userTime.getTime();
    
    const hours = Math.floor(timeUntilMidnight / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilMidnight % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  } catch (error) {
    console.error('❌ Error calculating time until midnight:', error);
    return { hours: 0, minutes: 0, seconds: 0 };
  }
}

/**
 * Force daily reset for testing (remove after testing)
 */
export async function forceTestReset(
  userId: string,
  onReset: () => void
): Promise<void> {
  console.log('🧪 TESTING: Forcing daily reset...');
  
  try {
    // Import supabase here to avoid circular dependencies
    const { supabase } = await import('@/lib/supabase');
    
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Delete today's daily records
    const { error: deleteRecordsError } = await supabase
      .from('daily_records')
      .delete()
      .eq('user_id', userId)
      .eq('record_date', today);
    
    if (deleteRecordsError) {
      console.error('❌ Error deleting daily records:', deleteRecordsError);
    } else {
      console.log('✅ Deleted today\'s daily records');
    }
    
    // 2. Delete today's meditation records
    const { error: deleteMeditationError } = await supabase
      .from('meditation_records')
      .delete()
      .eq('user_id', userId)
      .eq('record_date', today);
    
    if (deleteMeditationError) {
      console.error('❌ Error deleting meditation records:', deleteMeditationError);
    } else {
      console.log('✅ Deleted today\'s meditation records');
    }
    
    // 3. Execute the callback to refresh UI
    onReset();
    
    // 4. Update storage to simulate a new day reset
    const testResetKey = `@daily_reset_${userId}`;
    await AsyncStorage.setItem(testResetKey, today);
    
    console.log('✅ TESTING: Forced reset completed - all daily data cleared');
  } catch (error) {
    console.error('❌ Error during forced reset:', error);
  }
}

/**
 * Reset daily counters if new day detected
 */
export async function handleDailyReset(
  userId: string,
  onReset: () => void
): Promise<void> {
  try {
    const timezoneInfo = await getUserTimezone();
    const currentDate = getCurrentDateInTimezone(timezoneInfo.timezone);
    
    // Check last reset date
    const lastResetKey = `@daily_reset_${userId}`;
    const lastResetDate = await AsyncStorage.getItem(lastResetKey);
    
    if (isNewDayInTimezone(timezoneInfo.timezone, lastResetDate || undefined)) {
      console.log('🌅 New day detected! Resetting daily counters...');
      console.log('🕒 Timezone:', timezoneInfo.timezone);
      console.log('📅 Current date:', currentDate);
      console.log('📅 Last reset:', lastResetDate || 'never');
      
      // Execute reset callback
      onReset();
      
      // Update last reset date
      await AsyncStorage.setItem(lastResetKey, currentDate);
      
      console.log('✅ Daily reset completed');
    }
  } catch (error) {
    console.error('❌ Error handling daily reset:', error);
  }
}

// Helper functions
function getTimezoneFromOffset(offsetMinutes: number): string {
  // Simple offset to timezone mapping for common cases
  const offsetHours = offsetMinutes / 60;
  
  if (offsetHours === 0) return 'UTC';
  if (offsetHours === 8) return 'Asia/Shanghai';
  if (offsetHours === 9) return 'Asia/Tokyo';
  if (offsetHours === -5) return 'America/New_York';
  if (offsetHours === -8) return 'America/Los_Angeles';
  
  // Generic UTC offset format
  const sign = offsetHours >= 0 ? '+' : '';
  return `UTC${sign}${offsetHours}`;
}

function getTimezoneDisplayName(timezone: string, offsetMinutes: number): string {
  const offsetHours = offsetMinutes / 60;
  const sign = offsetHours >= 0 ? '+' : '';
  const offsetStr = `GMT${sign}${offsetHours}`;
  
  // Common timezone display names
  const displayNames: Record<string, string> = {
    'Asia/Shanghai': '北京时间',
    'Asia/Hong_Kong': '香港时间',
    'Asia/Taipei': '台北时间',
    'Asia/Tokyo': '东京时间',
    'America/New_York': '纽约时间',
    'America/Los_Angeles': '洛杉矶时间',
    'Europe/London': '伦敦时间',
    'UTC': 'UTC'
  };
  
  const displayName = displayNames[timezone] || timezone;
  return `${displayName} (${offsetStr})`;
}

// Common timezone options for manual selection
export const COMMON_TIMEZONES = [
  { timezone: 'Asia/Shanghai', name: '北京时间 (GMT+8)' },
  { timezone: 'Asia/Hong_Kong', name: '香港时间 (GMT+8)' },
  { timezone: 'Asia/Taipei', name: '台北时间 (GMT+8)' },
  { timezone: 'Asia/Tokyo', name: '东京时间 (GMT+9)' },
  { timezone: 'Asia/Singapore', name: '新加坡时间 (GMT+8)' },
  { timezone: 'America/New_York', name: '纽约时间 (GMT-5)' },
  { timezone: 'America/Los_Angeles', name: '洛杉矶时间 (GMT-8)' },
  { timezone: 'Europe/London', name: '伦敦时间 (GMT+0)' },
  { timezone: 'Australia/Sydney', name: '悉尼时间 (GMT+11)' },
  { timezone: 'UTC', name: 'UTC (GMT+0)' }
];
