-- Make practice 5113293b-bb1a-4917-9235-945129992c3b mandatory for class 7651135b-1fd4-4492-a59b-6ffacb2ad1af

-- Check if record already exists
SELECT * FROM class_required_practices 
WHERE practice_id = '5113293b-bb1a-4917-9235-945129992c3b' 
AND class_id = '7651135b-1fd4-4492-a59b-6ffacb2ad1af';

-- If the record exists, update it to mandatory
UPDATE class_required_practices 
SET is_required = true 
WHERE practice_id = '5113293b-bb1a-4917-9235-945129992c3b' 
AND class_id = '7651135b-1fd4-4492-a59b-6ffacb2ad1af';

-- If the record doesn't exist, insert it as mandatory
INSERT INTO class_required_practices (
  id,
  class_id,
  practice_id,
  is_required,
  created_at
)
SELECT 
  gen_random_uuid(),
  '7651135b-1fd4-4492-a59b-6ffacb2ad1af',
  '5113293b-bb1a-4917-9235-945129992c3b',
  true,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM class_required_practices 
  WHERE practice_id = '5113293b-bb1a-4917-9235-945129992c3b' 
  AND class_id = '7651135b-1fd4-4492-a59b-6ffacb2ad1af'
);

-- Verify the result
SELECT * FROM class_required_practices 
WHERE practice_id = '5113293b-bb1a-4917-9235-945129992c3b' 
AND class_id = '7651135b-1fd4-4492-a59b-6ffacb2ad1af';
