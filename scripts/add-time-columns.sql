
-- Add time columns for UTC time logging

-- Add record_time to daily_records
ALTER TABLE daily_records 
ADD COLUMN IF NOT EXISTS record_time TIME;

-- Add study_time to study_records  
ALTER TABLE study_records 
ADD COLUMN IF NOT EXISTS study_time TIME;

-- Add record_time to meditation_records
ALTER TABLE meditation_records 
ADD COLUMN IF NOT EXISTS record_time TIME;

-- Update existing records with a default time if needed
UPDATE daily_records 
SET record_time = '12:00:00' 
WHERE record_time IS NULL;

UPDATE study_records 
SET study_time = '12:00:00' 
WHERE study_time IS NULL;

UPDATE meditation_records 
SET record_time = '12:00:00' 
WHERE record_time IS NULL;
