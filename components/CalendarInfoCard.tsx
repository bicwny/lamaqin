import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { getLunarDate } from '@/lib/lunarCalendar';

interface CalendarInfoCardProps {
  dateString: string;
}

export default function CalendarInfoCard({ dateString }: CalendarInfoCardProps) {
  const lunarInfo = getLunarDate(dateString);
  const dayNumber = parseInt(dateString.split('-')[2], 10);

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <Text style={styles.dayNumber}>{dayNumber}</Text>
        
        <View style={styles.calendarInfo}>
          <View style={styles.calendarRow}>
            <View style={[styles.badge, styles.lunarBadge]}>
              <Text style={styles.badgeText}>农</Text>
            </View>
            <Text style={styles.calendarText}>
              {lunarInfo.lunarMonthName}{lunarInfo.lunarDayName}
            </Text>
          </View>

          {lunarInfo.solarTerm && (
            <View style={styles.solarTermContainer}>
              <Text style={styles.solarTermText}>{lunarInfo.solarTerm}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dayNumber: {
    fontSize: 56,
    fontWeight: '300',
    color: DesignSystem.colors.textPrimary,
    lineHeight: 60,
    marginRight: 16,
    minWidth: 70,
  },
  calendarInfo: {
    flex: 1,
    paddingTop: 8,
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  lunarBadge: {
    backgroundColor: '#6b7280',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarText: {
    fontSize: 18,
    color: '#8B7355',
    fontWeight: '500',
  },
  solarTermContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  solarTermText: {
    fontSize: 16,
    color: '#d97706',
    fontWeight: '600',
  },
});
