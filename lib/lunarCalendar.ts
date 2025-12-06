import { Solar, Lunar } from 'lunar-javascript';

export interface LunarDateInfo {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  lunarMonthName: string;
  lunarDayName: string;
  isLeapMonth: boolean;
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  zodiac: string;
  solarTerm: string | null;
}

const LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

export function getLunarDate(dateString: string): LunarDateInfo {
  const [year, month, day] = dateString.split('-').map(Number);
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  
  const lunarMonth = lunar.getMonth();
  const lunarDay = lunar.getDay();
  const isLeapMonth = lunar.getMonth() < 0;
  
  const monthIndex = Math.abs(lunarMonth) - 1;
  const lunarMonthName = (isLeapMonth ? '闰' : '') + LUNAR_MONTHS[monthIndex] + '月';
  const lunarDayName = LUNAR_DAYS[lunarDay - 1];
  
  const jieQi = lunar.getJieQi();
  
  return {
    lunarYear: lunar.getYear(),
    lunarMonth: Math.abs(lunarMonth),
    lunarDay: lunarDay,
    lunarMonthName: lunarMonthName,
    lunarDayName: lunarDayName,
    isLeapMonth: isLeapMonth,
    yearGanZhi: lunar.getYearInGanZhi(),
    monthGanZhi: lunar.getMonthInGanZhi(),
    dayGanZhi: lunar.getDayInGanZhi(),
    zodiac: lunar.getYearShengXiao(),
    solarTerm: jieQi || null,
  };
}

export function formatLunarDate(info: LunarDateInfo): string {
  return `${info.lunarMonthName}${info.lunarDayName}`;
}

export function formatLunarDateFull(info: LunarDateInfo): string {
  return `${info.yearGanZhi}年 ${info.lunarMonthName}${info.lunarDayName}`;
}
