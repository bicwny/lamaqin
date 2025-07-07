
import { useState, useEffect } from 'react';
import { getUserTimezone, handleDailyReset, type TimezoneInfo } from '@/lib/timezone';
import { useAuth } from '@/contexts/AuthContext';

export function useTimezone() {
  const { user } = useAuth();
  const [timezoneInfo, setTimezoneInfo] = useState<TimezoneInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeTimezone();
  }, []);

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

  const handleDailyResetCheck = (onReset: () => void) => {
    if (user && timezoneInfo) {
      handleDailyReset(user.id, onReset);
    }
  };

  return {
    timezoneInfo,
    loading,
    refreshTimezone: initializeTimezone,
    handleDailyResetCheck
  };
}
