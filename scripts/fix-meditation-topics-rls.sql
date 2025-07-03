
-- Fix Row Level Security policy for meditation_topics table
-- Run this in your Supabase SQL Editor

-- Create a policy to allow authenticated users to read meditation topics
CREATE POLICY "Allow authenticated users to read meditation topics" ON public.meditation_topics
FOR SELECT TO authenticated
USING (true);

-- Create a policy to allow service role to insert meditation topics
CREATE POLICY "Allow service role to insert meditation topics" ON public.meditation_topics
FOR INSERT TO service_role
WITH CHECK (true);

-- Create a policy to allow service role to update meditation topics
CREATE POLICY "Allow service role to update meditation topics" ON public.meditation_topics
FOR UPDATE TO service_role
USING (true)
WITH CHECK (true);

-- Create a policy to allow service role to delete meditation topics
CREATE POLICY "Allow service role to delete meditation topics" ON public.meditation_topics
FOR DELETE TO service_role
USING (true);
