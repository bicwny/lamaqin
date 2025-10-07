-- Meditation Practice Choice System Schema Updates
-- Run this SQL in Supabase SQL Editor

-- 1. Add choice_group and is_optional to class_required_practices
ALTER TABLE class_required_practices
ADD COLUMN choice_group TEXT,
ADD COLUMN is_optional BOOLEAN DEFAULT false;

COMMENT ON COLUMN class_required_practices.choice_group IS 'Groups optional practices that users can choose from (e.g., "入行观修选项")';
COMMENT ON COLUMN class_required_practices.is_optional IS 'If true, user must select this practice during enrollment or later';

-- 2. Create user_practice_choices table to track which optional practices users selected
CREATE TABLE IF NOT EXISTS user_practice_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES class_curricula(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
  choice_group TEXT NOT NULL,
  selected_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure user doesn't select same practice twice for same class
  UNIQUE(user_id, class_id, practice_id)
);

COMMENT ON TABLE user_practice_choices IS 'Tracks which optional practice choices users selected for each class';

CREATE INDEX idx_user_practice_choices_user ON user_practice_choices(user_id);
CREATE INDEX idx_user_practice_choices_class ON user_practice_choices(class_id);
CREATE INDEX idx_user_practice_choices_group ON user_practice_choices(choice_group);

-- 3. Mark the 入行 meditation practices as optional choices
-- First, get the class_id and practice_ids
DO $$
DECLARE
  v_class_id UUID;
  v_practice_1_id UUID;
  v_practice_2_id UUID;
BEGIN
  -- Get 入行 class ID
  SELECT id INTO v_class_id FROM class_curricula WHERE class_name = '入行';
  
  -- Get practice IDs
  SELECT id INTO v_practice_1_id FROM practices WHERE name = '入行论观修';
  SELECT id INTO v_practice_2_id FROM practices WHERE name = '前行实修法';
  
  -- Update the existing practices to be optional choices
  UPDATE class_required_practices
  SET 
    choice_group = '入行观修选项',
    is_optional = true
  WHERE class_id = v_class_id
    AND practice_id IN (v_practice_1_id, v_practice_2_id);
    
  RAISE NOTICE 'Updated practices to optional choice group';
END $$;

-- Verify the changes
SELECT 
  crp.id,
  cc.class_name,
  p.name as practice_name,
  crp.choice_group,
  crp.is_optional
FROM class_required_practices crp
JOIN class_curricula cc ON crp.class_id = cc.id
JOIN practices p ON crp.practice_id = p.id
WHERE crp.choice_group IS NOT NULL;
