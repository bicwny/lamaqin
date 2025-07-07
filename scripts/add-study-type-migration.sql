
-- 为现有的 study_records 表添加 study_type 字段
-- 这个脚本需要在 Supabase SQL Editor 中执行

-- 1. 添加 study_type 字段（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'study_records' AND column_name = 'study_type'
  ) THEN
    ALTER TABLE study_records 
    ADD COLUMN study_type VARCHAR(20) NOT NULL DEFAULT '听传承';
  END IF;
END $$;

-- 2. 更新现有记录，将它们设为"听传承"类型
UPDATE study_records 
SET study_type = '听传承' 
WHERE study_type IS NULL OR study_type = '';

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_study_records_type 
ON study_records(user_id, course_id, lesson_id, study_type);

-- 4. 验证修改
SELECT COUNT(*) as total_records, 
       study_type, 
       COUNT(*) as count_by_type
FROM study_records 
GROUP BY study_type;
