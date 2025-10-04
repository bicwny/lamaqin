-- Fix study_type constraint to allow all 4 study types
-- Run this in your Supabase SQL Editor

-- Drop the old constraint that only allows 听传承 and 看法本
ALTER TABLE study_records DROP CONSTRAINT IF EXISTS study_type_check;

-- Add new constraint that allows all 4 study types
ALTER TABLE study_records 
ADD CONSTRAINT study_type_check 
CHECK (study_type IN ('听传承', '看法本', '共修', '讲考'));

-- Verify the constraint is updated
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'study_records'::regclass 
AND conname = 'study_type_check';
