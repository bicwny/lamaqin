import { useState, useEffect, useCallback } from 'react';
import { getUserTimezone, handleDailyReset, type TimezoneInfo, getCurrentDateInTimezone } from '@/lib/timezone';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useTimezone() {
  const { user } = useAuth();
  const [timezoneInfo, setTimezoneInfo] = useState<TimezoneInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastResetDate, setLastResetDate] = useState<string | null>(null);

  useEffect(() => {
    initializeTimezone();
    loadLastResetDate();
  }, []);

  const loadLastResetDate = async () => {
    try {
      const savedDate = await AsyncStorage.getItem('lastResetDate');
      setLastResetDate(savedDate);
    } catch (error) {
      console.error('❌ Error loading last reset date:', error);
    }
  };

  const initializeTimezone = async () => {
    try {
      const timezone = await getUserTimezone();
      setTimezoneInfo(timezone);
    } catch (error) {
      console.error('❌ Error initializing timezone:', error);
      // Fallback to UTC
      setTimezoneInfo({
        timezone: 'UTC',
        offset: 0,
        displayName: 'UTC (GMT+0)'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDailyResetCheck = useCallback((onReset?: () => void) => {
    if (!timezoneInfo) return;

    const checkForNewDay = () => {
      try {
        const currentDate = getCurrentDateInTimezone(timezoneInfo.timezone);

        // Validate the date format
        if (!currentDate || !/^\d{4}-\d{2}-\d{2}$/.test(currentDate)) {
          console.error('❌ Invalid date format received:', currentDate);
          return;
        }

        if (lastResetDate && currentDate !== lastResetDate) {
          console.log('🌅 New day detected! Resetting daily counters...');
          console.log('🕒 Timezone:', timezoneInfo.timezone);
          console.log('📅 Current date:', currentDate);
          console.log('📅 Last reset:', lastResetDate);

          setLastResetDate(currentDate);
          AsyncStorage.setItem('lastResetDate', currentDate);

          if (onReset) {
            onReset();
          }

          console.log('✅ Daily reset completed');
        }
      } catch (error) {
        console.error('❌ Error in daily reset check:', error);
      }
    };

    checkForNewDay();
  }, [timezoneInfo, lastResetDate]);

  useEffect(() => {
    if (user && timezoneInfo) {
      handleDailyReset(user.id, () => {
        console.log("Daily reset completed from handleDailyReset.");
      });
    }
  }, [user, timezoneInfo]);

  return {
    timezoneInfo,
    loading,
    refreshTimezone: initializeTimezone,
    handleDailyResetCheck
  };
}