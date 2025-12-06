import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import { getLunarDate } from '@/lib/lunarCalendar';
import { getCalendarDayInfo, CalendarDayInfo, formatTibetanMonth, formatTibetanDay } from '@/lib/calendarService';

interface CalendarInfoCardProps {
  dateString: string;
}

export default function CalendarInfoCard({ dateString }: CalendarInfoCardProps) {
  const [calendarInfo, setCalendarInfo] = useState<CalendarDayInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const lunarInfo = getLunarDate(dateString);
  
  const dateParts = dateString.split('-');
  const formattedDate = `${dateParts[0]}年${parseInt(dateParts[1], 10)}月${parseInt(dateParts[2], 10)}`;

  useEffect(() => {
    let mounted = true;
    
    async function fetchCalendarInfo() {
      setLoading(true);
      try {
        const info = await getCalendarDayInfo(dateString);
        if (mounted) {
          setCalendarInfo(info);
        }
      } catch (error) {
        console.error('Error fetching calendar info:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchCalendarInfo();

    return () => {
      mounted = false;
    };
  }, [dateString]);

  const tibetanText = calendarInfo?.tibetan
    ? `${calendarInfo.tibetan.tibetan_month_name || formatTibetanMonth(calendarInfo.tibetan.tibetan_month, calendarInfo.tibetan.is_leap_month)}${calendarInfo.tibetan.tibetan_day_name || formatTibetanDay(calendarInfo.tibetan.tibetan_day)}`
    : null;

  const buddhistDays = calendarInfo?.buddhistDays || [];

  return (
    <View style={styles.container}>
      <Text style={styles.dateHeader}>{formattedDate}</Text>
      
      <View style={styles.calendarRow}>
        <View style={styles.calendarItem}>
          <View style={[styles.badge, styles.lunarBadge]}>
            <Text style={styles.badgeText}>农</Text>
          </View>
          <Text style={styles.calendarText}>
            {lunarInfo.lunarMonthName}{lunarInfo.lunarDayName}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={DesignSystem.colors.textSecondary} />
        ) : tibetanText ? (
          <View style={styles.calendarItem}>
            <View style={[styles.badge, styles.tibetanBadge]}>
              <Text style={styles.badgeText}>藏</Text>
            </View>
            <Text style={styles.calendarText}>{tibetanText}</Text>
          </View>
        ) : null}
      </View>

      {(lunarInfo.solarTerm || buddhistDays.length > 0) && (
        <View style={styles.tagsRow}>
          {lunarInfo.solarTerm && (
            <View style={[styles.tag, styles.solarTermTag]}>
              <Text style={styles.solarTermTagText}>{lunarInfo.solarTerm}</Text>
            </View>
          )}
          {buddhistDays.map((day) => (
            <View key={day.id} style={[styles.tag, getTagStyle(day.day_type)]}>
              <Text style={[styles.tagText, getTagTextStyle(day.day_type)]}>{day.day_name}</Text>
            </View>
          ))}
        </View>
      )}

      {buddhistDays.length > 0 && buddhistDays[0].description && (
        <Text style={styles.descriptionText}>{buddhistDays[0].description}</Text>
      )}
    </View>
  );
}

function getTagStyle(dayType: string) {
  switch (dayType) {
    case 'special_day':
      return styles.specialDayTag;
    case 'fasting_day':
      return styles.fastingDayTag;
    case 'auspicious':
      return styles.auspiciousTag;
    default:
      return styles.defaultTag;
  }
}

function getTagTextStyle(dayType: string) {
  switch (dayType) {
    case 'special_day':
      return styles.specialDayTagText;
    case 'fasting_day':
      return styles.fastingDayTagText;
    case 'auspicious':
      return styles.auspiciousTagText;
    default:
      return styles.defaultTagText;
  }
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
  dateHeader: {
    fontSize: 22,
    fontWeight: '600',
    color: DesignSystem.colors.textPrimary,
    marginBottom: 8,
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 24,
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  tibetanBadge: {
    backgroundColor: '#8B5CF6',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarText: {
    fontSize: 16,
    color: '#8B7355',
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  solarTermTag: {
    backgroundColor: '#fef3c7',
  },
  solarTermTagText: {
    fontSize: 14,
    color: '#d97706',
    fontWeight: '600',
  },
  specialDayTag: {
    backgroundColor: '#fce7f3',
  },
  specialDayTagText: {
    color: '#be185d',
  },
  fastingDayTag: {
    backgroundColor: '#e0e7ff',
  },
  fastingDayTagText: {
    color: '#4338ca',
  },
  auspiciousTag: {
    backgroundColor: '#dcfce7',
  },
  auspiciousTagText: {
    color: '#15803d',
  },
  defaultTag: {
    backgroundColor: '#f3f4f6',
  },
  defaultTagText: {
    color: '#4b5563',
  },
  descriptionText: {
    fontSize: 14,
    color: DesignSystem.colors.textSecondary,
    lineHeight: 20,
  },
});
