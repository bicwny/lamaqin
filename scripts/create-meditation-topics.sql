
-- Create meditation_topics table
CREATE TABLE IF NOT EXISTS public.meditation_topics (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    practice_id uuid REFERENCES public.practices(id),
    topic_number integer NOT NULL,
    title character varying NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT meditation_topics_pkey PRIMARY KEY (id),
    CONSTRAINT meditation_topics_unique_practice_number UNIQUE (practice_id, topic_number)
);

-- Add some sample meditation topics for 前行观修
-- First, let's find the practice_id for a meditation practice
DO $$
DECLARE
    meditation_practice_id uuid;
BEGIN
    -- Try to find an existing meditation/观修 practice
    SELECT id INTO meditation_practice_id 
    FROM practices 
    WHERE name ILIKE '%观修%' OR name ILIKE '%前行%' OR name ILIKE '%禅修%'
    LIMIT 1;
    
    -- If no meditation practice found, create one
    IF meditation_practice_id IS NULL THEN
        INSERT INTO practices (name, type, unit, description)
        VALUES ('前行观修', 'time', '座', '前行实修法92座观修')
        RETURNING id INTO meditation_practice_id;
    END IF;

    -- Insert the 92 meditation topics
    INSERT INTO meditation_topics (practice_id, topic_number, title, description)
    VALUES 
        (meditation_practice_id, 1, '观修暇满难得人身', '思维暇满人身的珍贵与难得，培养珍惜的心'),
        (meditation_practice_id, 2, '思维寿命无常', '观修生命的无常性，培养精进修行的紧迫感'),
        (meditation_practice_id, 3, '观修轮回过患', '思维三界轮回的痛苦本质，生起出离心'),
        (meditation_practice_id, 4, '观修因果业力', '思维善恶业果的必然性，谨慎取舍'),
        (meditation_practice_id, 5, '修习皈依三宝', '以至诚心皈依佛法僧三宝'),
        (meditation_practice_id, 6, '发菩提心', '为利益一切众生而发起成佛的心愿'),
        (meditation_practice_id, 7, '观修四无量心', '修习慈悲喜舍四无量心'),
        (meditation_practice_id, 8, '金刚萨埵净化法', '通过金刚萨埵法门净化业障'),
        (meditation_practice_id, 9, '供养曼达拉', '以虚供实的方式积累福德资粮'),
        (meditation_practice_id, 10, '上师瑜伽', '与上师心相应，祈请加持');

    -- Add remaining topics (11-92) with generic descriptions
    FOR i IN 11..92 LOOP
        INSERT INTO meditation_topics (practice_id, topic_number, title, description)
        VALUES (
            meditation_practice_id, 
            i, 
            '第' || i || '座观修', 
            '前行实修法第' || i || '座的观修内容，深入修持佛法要义'
        );
    END LOOP;

    RAISE NOTICE '已创建92个观修主题';
END $$;
