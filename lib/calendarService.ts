import { supabase } from './supabase';
import { getCachedData, setCachedData, CACHE_KEYS } from './calendarCache';

export interface TibetanCalendarEntry {
  id: string;
  gregorian_date: string;
  tibetan_month: number;
  tibetan_day: number;
  tibetan_year: number | null;
  is_leap_month: boolean;
  tibetan_month_name: string | null;
  tibetan_day_name: string | null;
}

export interface BuddhistDay {
  id: string;
  gregorian_date: string;
  day_type: string;
  day_name: string;
  description: string | null;
  multiplier: number;
  display_order: number;
}

export interface CalendarDayInfo {
  tibetan: TibetanCalendarEntry | null;
  buddhistDays: BuddhistDay[];
}

const tibetanMonthNames = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const tibetanDayNames = [
  '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

export function formatTibetanMonth(month: number, isLeap: boolean): string {
  const monthName = tibetanMonthNames[month - 1] || `${month}`;
  return isLeap ? `闰${monthName}月` : `${monthName}月`;
}

export function formatTibetanDay(day: number): string {
  return tibetanDayNames[day] || `${day}日`;
}

async function fetchTibetanCalendarFromDB(startDate: string, endDate: string): Promise<TibetanCalendarEntry[]> {
  try {
    const { data, error } = await supabase
      .from('tibetan_calendar')
      .select('*')
      .gte('gregorian_date', startDate)
      .lte('gregorian_date', endDate)
      .order('gregorian_date');

    if (error) {
      console.error('Error fetching Tibetan calendar:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Tibetan calendar fetch error:', error);
    return [];
  }
}

async function fetchBuddhistDaysFromDB(startDate: string, endDate: string): Promise<BuddhistDay[]> {
  try {
    const { data, error } = await supabase
      .from('buddhist_days')
      .select('*')
      .gte('gregorian_date', startDate)
      .lte('gregorian_date', endDate)
      .order('gregorian_date')
      .order('display_order');

    if (error) {
      console.error('Error fetching Buddhist days:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Buddhist days fetch error:', error);
    return [];
  }
}

export async function getCalendarDataForMonth(year: number, month: number): Promise<Map<string, CalendarDayInfo>> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  
  const cacheKey = `${CACHE_KEYS.TIBETAN_CALENDAR}_${year}_${month}`;
  const buddhistCacheKey = `${CACHE_KEYS.BUDDHIST_DAYS}_${year}_${month}`;

  let tibetanData = await getCachedData<TibetanCalendarEntry[]>(cacheKey);
  let buddhistData = await getCachedData<BuddhistDay[]>(buddhistCacheKey);

  if (!tibetanData) {
    tibetanData = await fetchTibetanCalendarFromDB(startDate, endDate);
    if (tibetanData.length > 0) {
      await setCachedData(cacheKey, tibetanData);
    }
  }

  if (!buddhistData) {
    buddhistData = await fetchBuddhistDaysFromDB(startDate, endDate);
    if (buddhistData.length > 0) {
      await setCachedData(buddhistCacheKey, buddhistData);
    }
  }

  const result = new Map<string, CalendarDayInfo>();

  for (const entry of tibetanData || []) {
    const dateKey = entry.gregorian_date;
    if (!result.has(dateKey)) {
      result.set(dateKey, { tibetan: null, buddhistDays: [] });
    }
    result.get(dateKey)!.tibetan = entry;
  }

  for (const day of buddhistData || []) {
    const dateKey = day.gregorian_date;
    if (!result.has(dateKey)) {
      result.set(dateKey, { tibetan: null, buddhistDays: [] });
    }
    result.get(dateKey)!.buddhistDays.push(day);
  }

  return result;
}

export async function getCalendarDayInfo(dateString: string): Promise<CalendarDayInfo> {
  const [year, month] = dateString.split('-').map(Number);
  const monthData = await getCalendarDataForMonth(year, month);
  return monthData.get(dateString) || { tibetan: null, buddhistDays: [] };
}
