-- December 2025 Tibetan Calendar and Buddhist Days Data
-- 藏历: 木蛇年 (Tibetan Year 2152)
-- Run this in your Supabase SQL Editor after creating the tables

-- =============================================
-- TIBETAN CALENDAR DATA (藏历)
-- =============================================

INSERT INTO tibetan_calendar (gregorian_date, tibetan_month, tibetan_day, tibetan_year, is_leap_month, tibetan_month_name, tibetan_day_name) VALUES
-- December 1-7 (持众月 / 十月)
('2025-12-01', 10, 11, 2152, false, '十月', '十一'),
('2025-12-02', 10, 12, 2152, false, '十月', '十二'),
('2025-12-03', 10, 13, 2152, false, '十月', '十三'),
('2025-12-04', 10, 15, 2152, false, '十月', '十五'),
('2025-12-05', 10, 16, 2152, false, '十月', '十六'),
('2025-12-06', 10, 17, 2152, false, '十月', '十七'),
('2025-12-07', 10, 18, 2152, false, '十月', '十八'),
-- December 8-14
('2025-12-08', 10, 19, 2152, false, '十月', '十九'),
('2025-12-09', 10, 20, 2152, false, '十月', '二十'),
('2025-12-10', 10, 21, 2152, false, '十月', '廿一'),
('2025-12-11', 10, 22, 2152, false, '十月', '廿二'),
('2025-12-12', 10, 23, 2152, false, '十月', '廿三'),
('2025-12-13', 10, 24, 2152, false, '十月', '廿四'),
('2025-12-14', 10, 25, 2152, false, '十月', '廿五'),
-- December 15-20
('2025-12-15', 10, 26, 2152, false, '十月', '廿六'),
('2025-12-16', 10, 27, 2152, false, '十月', '廿七'),
('2025-12-17', 10, 28, 2152, false, '十月', '廿八'),
('2025-12-18', 10, 29, 2152, false, '十月', '廿九'),
('2025-12-19', 10, 30, 2152, false, '十月', '三十'),
('2025-12-20', 11, 1, 2152, false, '十一月', '初一'),
-- December 21-24 (庄严月 / 十一月)
('2025-12-21', 11, 2, 2152, false, '十一月', '初二'),
('2025-12-22', 11, 3, 2152, false, '十一月', '初三'),
('2025-12-23', 11, 4, 2152, false, '十一月', '初四'),
('2025-12-24', 11, 4, 2152, true, '十一月', '闰初四'),
-- December 25-31
('2025-12-25', 11, 5, 2152, false, '十一月', '初五'),
('2025-12-26', 11, 6, 2152, false, '十一月', '初六'),
('2025-12-27', 11, 8, 2152, false, '十一月', '初八'),
('2025-12-28', 11, 9, 2152, false, '十一月', '初九'),
('2025-12-29', 11, 10, 2152, false, '十一月', '初十'),
('2025-12-30', 11, 11, 2152, false, '十一月', '十一'),
('2025-12-31', 11, 12, 2152, false, '十一月', '十二');

-- =============================================
-- BUDDHIST DAYS DATA (殊胜日)
-- =============================================

-- December 4 - 阿弥陀佛加持日
INSERT INTO buddhist_days (gregorian_date, day_type, day_name, description, multiplier, display_order) VALUES
('2025-12-04', 'special_day', '阿弥陀佛加持日', '作何善恶成百万倍', 1000000, 1);

-- December 7 - 观世音菩萨加持日 + 八吉同聚
INSERT INTO buddhist_days (gregorian_date, day_type, day_name, description, multiplier, display_order) VALUES
('2025-12-07', 'special_day', '观世音菩萨加持日', '作何善恶成千万倍', 10000000, 1),
('2025-12-07', 'auspicious', '八吉同聚', '得健康、长寿、福德、妙好、荣誉、善缘、广大财富及四业成就', 1, 2);

-- December 8 - 飞幡日
INSERT INTO buddhist_days (gregorian_date, day_type, day_name, description, multiplier, display_order) VALUES
('2025-12-08', 'caution', '飞幡日', '不适宜悬挂经幡', 1, 1);

-- December 9 - 文殊菩萨出家日
INSERT INTO buddhist_days (gregorian_date, day_type, day_name, description, multiplier, display_order) VALUES
('2025-12-09', 'special_day', '文殊菩萨出家日', '汉传佛教纪念日', 1, 1);

-- December 10 - 地藏菩萨加持日
INSERT INTO buddhist_days (gregorian_date, day_type, day_name, description, multiplier, display_order) VALUES
('2025-12-10', 'special_day', '地藏菩萨加持日', '作何善恶成亿倍', 100000000, 1);

-- December 11 - 禅宗五祖弘忍大师圆寂日
INSERT INTO buddhist_days (gregorian_date, day_type, day_name, description, multiplier, display_order) VALUES
('2025-12-11', 'special_day', '禅宗五祖弘忍大师圆寂日', '汉传佛教纪念日', 1, 1);

-- December 12 - 九凶同聚
INSERT INTO buddhist_days (gregorian_date, day_type, day_name, description, multiplier, display_order) VALUES
('2025-12-12', 'caution', '九凶同聚', '忌嫁娶，无论从事何事都不吉', 1, 1);

-- December 14 - 宗喀巴大师圆寂纪念日/燃灯节 + 空行母荟供日
INSERT INTO buddhist_days (gregorian_date, day_type, day_name, description, multiplier, display_order) VALUES
('2025-12-14', 'special_day', '宗喀巴大师圆寂纪念日', '燃灯节', 1, 1),
('2025-12-14', 'special_day', '空行母荟供日', '作何善恶成十万倍', 100000, 2);

-- December 19 - 释迦牟尼佛加持日 + 八吉同聚
INSERT INTO buddhist_days (gregorian_date, day_type, day_name, description, multiplier, display_order) VALUES
('2025-12-19', 'special_day', '释迦牟尼佛加持日', '作何善恶成九亿倍', 900000000, 1),
('2025-12-19', 'auspicious', '八吉同聚', '得健康、长寿、福德、妙好、荣誉、善缘、广大财富及四业成就', 1, 2);

-- December 20 - 禅定胜王佛加持日 + 八吉同聚
INSERT INTO buddhist_days (gregorian_date, day_type, day_name, description, multiplier, display_order) VALUES
('2025-12-20', 'special_day', '禅定胜王佛加持日', '作何善恶成百倍', 100, 1),
('2025-12-20', 'auspicious', '八吉同聚', '得健康、长寿、福德、妙好、荣誉、善缘、广大财富及四业成就', 1, 2);

-- December 23 - 净宗十三祖印光大师圆寂日 + 飞幡日
INSERT INTO buddhist_days (gregorian_date, day_type, day_name, description, multiplier, display_order) VALUES
('2025-12-23', 'special_day', '净宗十三祖印光大师圆寂日', '汉传佛教纪念日', 1, 1),
('2025-12-23', 'caution', '飞幡日', '不适宜悬挂经幡', 1, 2);

-- December 27 - 药师佛加持日
INSERT INTO buddhist_days (gregorian_date, day_type, day_name, description, multiplier, display_order) VALUES
('2025-12-27', 'special_day', '药师佛加持日', '作何善恶成千倍', 1000, 1);

-- December 29 - 莲师荟供日
INSERT INTO buddhist_days (gregorian_date, day_type, day_name, description, multiplier, display_order) VALUES
('2025-12-29', 'special_day', '莲师荟供日', '作何善恶成十万倍', 100000, 1);

-- =============================================
-- Verification queries (optional - run to check data)
-- =============================================
-- SELECT * FROM tibetan_calendar WHERE gregorian_date BETWEEN '2025-12-01' AND '2025-12-31' ORDER BY gregorian_date;
-- SELECT * FROM buddhist_days WHERE gregorian_date BETWEEN '2025-12-01' AND '2025-12-31' ORDER BY gregorian_date, display_order;
