
-- Check all URLs in the course_lessons table
-- Execute this in Supabase SQL Editor

-- 1. Check if url column exists and show its structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'course_lessons' 
  AND column_name = 'url';

-- 2. Show all lessons with their URLs
SELECT 
  cl.id,
  c.name as course_name,
  cl.lesson_number,
  cl.title,
  cl.url,
  cl.created_at
FROM course_lessons cl
JOIN courses c ON cl.course_id = c.id
ORDER BY c.name, cl.lesson_number;

-- 3. Count lessons with and without URLs
SELECT 
  c.name as course_name,
  COUNT(*) as total_lessons,
  COUNT(cl.url) as lessons_with_url,
  COUNT(*) - COUNT(cl.url) as lessons_without_url
FROM course_lessons cl
JOIN courses c ON cl.course_id = c.id
GROUP BY c.name
ORDER BY c.name;

-- 4. Show sample URLs for each course
SELECT DISTINCT
  c.name as course_name,
  cl.url as sample_url
FROM course_lessons cl
JOIN courses c ON cl.course_id = c.id
WHERE cl.url IS NOT NULL
ORDER BY c.name;

-- 5. Show lessons that need URLs (NULL values)
SELECT 
  c.name as course_name,
  cl.lesson_number,
  cl.title,
  'URL needed' as status
FROM course_lessons cl
JOIN courses c ON cl.course_id = c.id
WHERE cl.url IS NULL
ORDER BY c.name, cl.lesson_number
LIMIT 10;
