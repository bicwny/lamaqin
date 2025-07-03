
-- Temporary RLS disable test
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS temporarily
ALTER TABLE public.meditation_topics DISABLE ROW LEVEL SECURITY;

-- 2. Test that data exists
SELECT COUNT(*) as total_topics FROM meditation_topics;

-- 3. Test a few sample records
SELECT topic_number, title 
FROM meditation_topics 
ORDER BY topic_number 
LIMIT 5;

-- 4. If the above works, your app should now be able to read the data
-- Check your app - it should show "✅ Meditation Topics (92/92)"

-- 5. When you're ready, re-enable RLS with proper policies:
-- ALTER TABLE public.meditation_topics ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "allow_read_meditation_topics" ON public.meditation_topics
-- FOR SELECT USING (true);
-- 
-- CREATE POLICY "allow_insert_meditation_topics" ON public.meditation_topics  
-- FOR INSERT WITH CHECK (true);
