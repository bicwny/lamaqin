-- Update study_records status check constraint to support new status values
-- Run this in your Supabase SQL Editor

-- Drop the old constraint
ALTER TABLE study_records DROP CONSTRAINT IF EXISTS study_records_status_check;

-- Add new constraint with all allowed status values
-- 共修 (Group Study): 回顾, 串讲, 参加, 缺席
-- 讲考 (Teaching Exam): 讲考, 提问, 参加, 缺席
ALTER TABLE study_records ADD CONSTRAINT study_records_status_check 
  CHECK (status IN ('回顾', '串讲', '参加', '缺席', '讲考', '提问'));
