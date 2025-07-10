
-- Add url column to course_lessons table if it doesn't exist
ALTER TABLE course_lessons 
ADD COLUMN IF NOT EXISTS url TEXT;

-- You can then update lessons with their specific URLs like this:
-- UPDATE course_lessons 
-- SET url = 'https://specific-lesson-url.com' 
-- WHERE course_id = 'your-course-id' AND lesson_number = 1;
