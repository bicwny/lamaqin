
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface OTPTimerProps {
  duration: number; // in seconds
  onExpired: () => void;
  onTimeUpdate?: (timeLeft: number) => void;
  isActive: boolean;
}

export function OTPTimer({ duration, onExpired, onTimeUpdate, isActive }: OTPTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (isActive) {
      setTimeLeft(duration);
    }
  }, [isActive, duration]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        onTimeUpdate?.(newTime);
        
        if (newTime <= 0) {
          onExpired();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onExpired, onTimeUpdate]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    if (timeLeft <= 30) return '#FF4444'; // Red for last 30 seconds
    if (timeLeft <= 60) return '#FF8800'; // Orange for last minute
    return Colors.primary; // Normal color
  };

  if (!isActive) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.timerText, { color: getTimerColor() }]}>
        ⏱️ 验证码有效期: {formatTime(timeLeft)}
      </Text>
      {timeLeft <= 30 && (
        <Text style={styles.warningText}>
          验证码即将过期，请尽快使用
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 5,
    textAlign: 'center',
  },
});
