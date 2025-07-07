
-- Create preset_project_names table
CREATE TABLE IF NOT EXISTS public.preset_project_names (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying(100) NOT NULL,
    category character varying(50),
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT preset_project_names_pkey PRIMARY KEY (id),
    CONSTRAINT preset_project_names_name_unique UNIQUE (name)
);

-- Enable RLS
ALTER TABLE preset_project_names ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read preset names
CREATE POLICY "Everyone can view preset project names" ON preset_project_names
    FOR SELECT USING (is_active = true);

-- Insert the preset project names
INSERT INTO preset_project_names (name, category, display_order) VALUES
    ('前行班', '基础修行', 1),
    ('金刚萨埵法会', '法会共修', 2),
    ('地藏法会', '法会共修', 3),
    ('观音法会', '法会共修', 4),
    ('药师佛法会', '法会共修', 5),
    ('阿弥陀佛法会', '法会共修', 6),
    ('文殊菩萨法会', '法会共修', 7),
    ('普贤菩萨法会', '法会共修', 8),
    ('莲师法会', '法会共修', 9),
    ('度母法会', '法会共修', 10),
    ('百日共修', '长期共修', 11),
    ('千日共修', '长期共修', 12),
    ('个人闭关', '个人修行', 13),
    ('集体共修', '集体修行', 14),
    ('新年发愿', '特殊节日', 15)
ON CONFLICT (name) DO NOTHING;
