-- ========================================
-- 正科课程课时记录添加脚本
-- Add Course Lessons for 正科 Courses
-- ========================================
-- 在 Supabase SQL Editor 中运行此脚本
-- Run this script in Supabase SQL Editor after running add-zhengke-courses.sql
--
-- 为以下5门课程添加课时记录 (Adding lesson records for):
-- 1. 三戒要解(上) - 22课
-- 2. 缘起赞 - 8课
-- 3. 中观四百论 - 72课
-- 4. 中观根本慧论 - 114课
-- 5. 中观庄严论释 - 128课
--
-- 总计: 344课
-- ========================================

BEGIN;

-- ========================================
-- 辅助函数：生成课时记录
-- Helper function to generate lesson records
-- ========================================

-- 1. 三戒要解(上) - 22课
INSERT INTO course_lessons (course_id, lesson_number, title)
SELECT 
  c.id as course_id,
  generate_series as lesson_number,
  '第' || generate_series || '课' as title
FROM courses c
CROSS JOIN generate_series(1, 22)
WHERE c.name = '三戒要解(上)'
  AND NOT EXISTS (
    SELECT 1 FROM course_lessons cl 
    WHERE cl.course_id = c.id 
    AND cl.lesson_number = generate_series
  );

-- 2. 缘起赞 - 8课
INSERT INTO course_lessons (course_id, lesson_number, title)
SELECT 
  c.id as course_id,
  generate_series as lesson_number,
  '第' || generate_series || '课' as title
FROM courses c
CROSS JOIN generate_series(1, 8)
WHERE c.name = '缘起赞'
  AND NOT EXISTS (
    SELECT 1 FROM course_lessons cl 
    WHERE cl.course_id = c.id 
    AND cl.lesson_number = generate_series
  );

-- 3. 中观四百论 - 72课
INSERT INTO course_lessons (course_id, lesson_number, title)
SELECT 
  c.id as course_id,
  generate_series as lesson_number,
  '第' || generate_series || '课' as title
FROM courses c
CROSS JOIN generate_series(1, 72)
WHERE c.name = '中观四百论'
  AND NOT EXISTS (
    SELECT 1 FROM course_lessons cl 
    WHERE cl.course_id = c.id 
    AND cl.lesson_number = generate_series
  );

-- 4. 中观根本慧论 - 114课
INSERT INTO course_lessons (course_id, lesson_number, title)
SELECT 
  c.id as course_id,
  generate_series as lesson_number,
  '第' || generate_series || '课' as title
FROM courses c
CROSS JOIN generate_series(1, 114)
WHERE c.name = '中观根本慧论'
  AND NOT EXISTS (
    SELECT 1 FROM course_lessons cl 
    WHERE cl.course_id = c.id 
    AND cl.lesson_number = generate_series
  );

-- 5. 中观庄严论释 - 128课
INSERT INTO course_lessons (course_id, lesson_number, title)
SELECT 
  c.id as course_id,
  generate_series as lesson_number,
  '第' || generate_series || '课' as title
FROM courses c
CROSS JOIN generate_series(1, 128)
WHERE c.name = '中观庄严论释'
  AND NOT EXISTS (
    SELECT 1 FROM course_lessons cl 
    WHERE cl.course_id = c.id 
    AND cl.lesson_number = generate_series
  );

-- ========================================
-- 验证插入结果
-- Verify insertions
-- ========================================

-- 显示每门课程的课时统计
-- Display lesson counts for each course
SELECT 
  '✅ 课时统计' as status,
  c.name as course_name,
  c.total_lessons as expected_lessons,
  COUNT(cl.id) as actual_lessons,
  CASE 
    WHEN COUNT(cl.id) = c.total_lessons THEN '✓ 完整'
    ELSE '❌ 不完整'
  END as completeness
FROM courses c
LEFT JOIN course_lessons cl ON c.id = cl.course_id
WHERE c.name IN (
  '三戒要解(上)',
  '缘起赞',
  '中观四百论',
  '中观根本慧论',
  '中观庄严论释'
)
GROUP BY c.id, c.name, c.total_lessons
ORDER BY 
  CASE c.name
    WHEN '三戒要解(上)' THEN 1
    WHEN '缘起赞' THEN 2
    WHEN '中观四百论' THEN 3
    WHEN '中观根本慧论' THEN 4
    WHEN '中观庄严论释' THEN 5
  END;

-- 显示总计信息
-- Display total summary
SELECT 
  '✅ 总计摘要' as status,
  COUNT(*) as total_lessons_added,
  COUNT(DISTINCT course_id) as courses_processed
FROM course_lessons cl
JOIN courses c ON cl.course_id = c.id
WHERE c.name IN (
  '三戒要解(上)',
  '缘起赞',
  '中观四百论',
  '中观根本慧论',
  '中观庄严论释'
);

-- 显示示例课时（每门课程前3课）
-- Display sample lessons (first 3 from each course)
SELECT 
  '📚 示例课时' as status,
  c.name as course_name,
  cl.lesson_number,
  cl.title
FROM course_lessons cl
JOIN courses c ON cl.course_id = c.id
WHERE c.name IN (
  '三戒要解(上)',
  '缘起赞',
  '中观四百论',
  '中观根本慧论',
  '中观庄严论释'
)
AND cl.lesson_number <= 3
ORDER BY 
  CASE c.name
    WHEN '三戒要解(上)' THEN 1
    WHEN '缘起赞' THEN 2
    WHEN '中观四百论' THEN 3
    WHEN '中观根本慧论' THEN 4
    WHEN '中观庄严论释' THEN 5
  END,
  cl.lesson_number;

COMMIT;

-- ========================================
-- 执行完成提示
-- Completion Message
-- ========================================
SELECT '🎉 脚本执行完成！已为5门正科课程添加344个课时记录' as message;

-- ========================================
-- 脚本说明
-- Script Notes
-- ========================================
/*
执行顺序 (Execution Order):
1. 先运行 add-zhengke-courses.sql （添加课程记录）
2. 再运行本脚本 add-zhengke-course-lessons.sql （添加课时记录）

执行结果 (Expected Results):
- 三戒要解(上): 22个课时记录 (第1课 - 第22课)
- 缘起赞: 8个课时记录 (第1课 - 第8课)
- 中观四百论: 72个课时记录 (第1课 - 第72课)
- 中观根本慧论: 114个课时记录 (第1课 - 第114课)
- 中观庄严论释: 128个课时记录 (第1课 - 第128课)
- 总计: 344个课时记录

课时格式 (Lesson Format):
- lesson_number: 1, 2, 3, ...
- title: "第1课", "第2课", "第3课", ...
- url: NULL (可后续手动更新)
- content_summary: NULL (可后续手动更新)

后续操作 (Next Steps):
1. 在 Supabase SQL Editor 中执行此脚本
2. 检查验证查询的输出，确保所有课时都已添加
3. 刷新应用，课程详情页应显示完整课时列表
4. 如需添加课程链接(url)，可手动更新 course_lessons 表
*/
