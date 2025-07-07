
-- Add preset_project_id column to user_practice_projects table
ALTER TABLE user_practice_projects 
ADD COLUMN IF NOT EXISTS preset_project_id UUID REFERENCES preset_project_names(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_practice_projects_preset_project_id 
ON user_practice_projects(preset_project_id);

-- Add comment for documentation
COMMENT ON COLUMN user_practice_projects.preset_project_id IS 'References preset_project_names table when user selects a preset project name';
