
-- Complete SQL script to create meditation_topics table with all 92 meditation topics
-- Run this in your Supabase SQL Editor

-- Step 1: Create the meditation_topics table
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

-- Step 2: Enable Row Level Security
ALTER TABLE public.meditation_topics ENABLE ROW LEVEL SECURITY;

-- Step 3: Insert all 92 meditation topics
DO $$
DECLARE
    meditation_practice_id uuid;
BEGIN
    -- Find the practice_id for 前行观修
    SELECT id INTO meditation_practice_id 
    FROM practices 
    WHERE name ILIKE '%前行%' OR name ILIKE '%观修%'
    LIMIT 1;
    
    -- If no meditation practice found, create one
    IF meditation_practice_id IS NULL THEN
        INSERT INTO practices (name, type, unit, description)
        VALUES ('前行观修', 'time', '座', '前行实修法92座观修')
        RETURNING id INTO meditation_practice_id;
    END IF;

    -- Clear existing topics for this practice (if any)
    DELETE FROM meditation_topics WHERE practice_id = meditation_practice_id;

    -- Insert all 92 meditation topics with exact titles
    INSERT INTO meditation_topics (practice_id, topic_number, title, description)
    VALUES 
        (meditation_practice_id, 1, '思维闲暇之本体', '第1修法：思维闲暇之本体'),
        (meditation_practice_id, 2, '思维差别之圆满', '第2修法：思维差别之圆满'),
        (meditation_practice_id, 3, '思维恶趣之险地', '第3修法：思维恶趣之险地'),
        (meditation_practice_id, 4, '思维难得之比喻', '第4修法：思维难得之比喻'),
        (meditation_practice_id, 5, '思维次第之数目', '第5修法：思维次第之数目'),
        (meditation_practice_id, 6, '思维无义而空耗', '第6修法：思维无义而空耗'),
        (meditation_practice_id, 7, '思维因缘与缘起', '第7修法：思维因缘与缘起'),
        (meditation_practice_id, 8, '思维生死之流转', '第8修法：思维生死之流转'),
        (meditation_practice_id, 9, '思维暇满之赞颂', '第9修法：思维暇满之赞颂'),
        (meditation_practice_id, 10, '思维当生欢喜心', '第10修法：思维当生欢喜心'),
        (meditation_practice_id, 11, '观蕴身而修无常', '第11修法：观蕴身而修无常'),
        (meditation_practice_id, 12, '观世间尊主而修无常', '第12修法：观世间尊主而修无常'),
        (meditation_practice_id, 13, '观器情成坏而修无常', '第13修法：观器情成坏而修无常'),
        (meditation_practice_id, 14, '观身不净而修无常', '第14修法：观身不净而修无常'),
        (meditation_practice_id, 15, '观寿命无常而修无常', '第15修法：观寿命无常而修无常'),
        (meditation_practice_id, 16, '观死缘无定而修无常', '第16修法：观死缘无定而修无常'),
        (meditation_practice_id, 17, '观死时无能而修无常', '第17修法：观死时无能而修无常'),
        (meditation_practice_id, 18, '观死后无定而修无常', '第18修法：观死后无定而修无常'),
        (meditation_practice_id, 19, '观修行精进而修无常', '第19修法：观修行精进而修无常'),
        (meditation_practice_id, 20, '观念死亡而修无常', '第20修法：观念死亡而修无常'),
        (meditation_practice_id, 21, '观地狱之苦', '第21修法：观地狱之苦'),
        (meditation_practice_id, 22, '观饿鬼之苦', '第22修法：观饿鬼之苦'),
        (meditation_practice_id, 23, '观旁生之苦', '第23修法：观旁生之苦'),
        (meditation_practice_id, 24, '观人道之苦', '第24修法：观人道之苦'),
        (meditation_practice_id, 25, '观阿修罗之苦', '第25修法：观阿修罗之苦'),
        (meditation_practice_id, 26, '观天道之苦', '第26修法：观天道之苦'),
        (meditation_practice_id, 27, '观轮回总苦', '第27修法：观轮回总苦'),
        (meditation_practice_id, 28, '观轮回无安乐', '第28修法：观轮回无安乐'),
        (meditation_practice_id, 29, '观轮回无定性', '第29修法：观轮回无定性'),
        (meditation_practice_id, 30, '观轮回无厌足', '第30修法：观轮回无厌足'),
        (meditation_practice_id, 31, '观轮回无伴侣', '第31修法：观轮回无伴侣'),
        (meditation_practice_id, 32, '观轮回数数生死', '第32修法：观轮回数数生死'),
        (meditation_practice_id, 33, '观轮回数数高下', '第33修法：观轮回数数高下'),
        (meditation_practice_id, 34, '观轮回无救护', '第34修法：观轮回无救护'),
        (meditation_practice_id, 35, '观轮回无自在', '第35修法：观轮回无自在'),
        (meditation_practice_id, 36, '观轮回无依靠', '第36修法：观轮回无依靠'),
        (meditation_practice_id, 37, '观十善业道', '第37修法：观十善业道'),
        (meditation_practice_id, 38, '观十不善业道', '第38修法：观十不善业道'),
        (meditation_practice_id, 39, '观身业果报', '第39修法：观身业果报'),
        (meditation_practice_id, 40, '观语业果报', '第40修法：观语业果报'),
        (meditation_practice_id, 41, '观意业果报', '第41修法：观意业果报'),
        (meditation_practice_id, 42, '观业果决定', '第42修法：观业果决定'),
        (meditation_practice_id, 43, '观业果无失', '第43修法：观业果无失'),
        (meditation_practice_id, 44, '观业果增长', '第44修法：观业果增长'),
        (meditation_practice_id, 45, '观业果不作不遇', '第45修法：观业果不作不遇'),
        (meditation_practice_id, 46, '观业果作已必遇', '第46修法：观业果作已必遇'),
        (meditation_practice_id, 47, '观四力忏悔', '第47修法：观四力忏悔'),
        (meditation_practice_id, 48, '观守护根门', '第48修法：观守护根门'),
        (meditation_practice_id, 49, '观修持戒律', '第49修法：观修持戒律'),
        (meditation_practice_id, 50, '观修善法', '第50修法：观修善法'),
        (meditation_practice_id, 51, '观皈依三宝', '第51修法：观皈依三宝'),
        (meditation_practice_id, 52, '观佛宝功德', '第52修法：观佛宝功德'),
        (meditation_practice_id, 53, '观法宝功德', '第53修法：观法宝功德'),
        (meditation_practice_id, 54, '观僧宝功德', '第54修法：观僧宝功德'),
        (meditation_practice_id, 55, '观皈依学处', '第55修法：观皈依学处'),
        (meditation_practice_id, 56, '观皈依功德', '第56修法：观皈依功德'),
        (meditation_practice_id, 57, '观皈依供养', '第57修法：观皈依供养'),
        (meditation_practice_id, 58, '观皈依念恩', '第58修法：观皈依念恩'),
        (meditation_practice_id, 59, '观皈依精进', '第59修法：观皈依精进'),
        (meditation_practice_id, 60, '观皈依依止', '第60修法：观皈依依止'),
        (meditation_practice_id, 61, '观修舍心', '第61修法：观修舍心'),
        (meditation_practice_id, 62, '观修慈心', '第62修法：观修慈心'),
        (meditation_practice_id, 63, '观修悲心', '第63修法：观修悲心'),
        (meditation_practice_id, 64, '观修喜心', '第64修法：观修喜心'),
        (meditation_practice_id, 65, '观修菩提心', '第65修法：观修菩提心'),
        (meditation_practice_id, 66, '观菩提心利益', '第66修法：观菩提心利益'),
        (meditation_practice_id, 67, '观七重因果', '第67修法：观七重因果'),
        (meditation_practice_id, 68, '观自他相换', '第68修法：观自他相换'),
        (meditation_practice_id, 69, '观菩提心学处', '第69修法：观菩提心学处'),
        (meditation_practice_id, 70, '观修七支供', '第70修法：观修七支供'),
        (meditation_practice_id, 71, '观修礼敬支', '第71修法：观修礼敬支'),
        (meditation_practice_id, 72, '观修供养支', '第72修法：观修供养支'),
        (meditation_practice_id, 73, '观修忏悔支', '第73修法：观修忏悔支'),
        (meditation_practice_id, 74, '观修随喜支', '第74修法：观修随喜支'),
        (meditation_practice_id, 75, '观修请转法轮支', '第75修法：观修请转法轮支'),
        (meditation_practice_id, 76, '观修请不涅槃支', '第76修法：观修请不涅槃支'),
        (meditation_practice_id, 77, '观修回向支', '第77修法：观修回向支'),
        (meditation_practice_id, 78, '观修布施波罗蜜', '第78修法：观修布施波罗蜜'),
        (meditation_practice_id, 79, '观修持戒波罗蜜', '第79修法：观修持戒波罗蜜'),
        (meditation_practice_id, 80, '观修忍辱波罗蜜', '第80修法：观修忍辱波罗蜜'),
        (meditation_practice_id, 81, '观修精进波罗蜜', '第81修法：观修精进波罗蜜'),
        (meditation_practice_id, 82, '观修禅定波罗蜜', '第82修法：观修禅定波罗蜜'),
        (meditation_practice_id, 83, '观修智慧波罗蜜', '第83修法：观修智慧波罗蜜'),
        (meditation_practice_id, 84, '观修四摄法', '第84修法：观修四摄法'),
        (meditation_practice_id, 85, '观修布施摄', '第85修法：观修布施摄'),
        (meditation_practice_id, 86, '观修爱语摄', '第86修法：观修爱语摄'),
        (meditation_practice_id, 87, '观修利行摄', '第87修法：观修利行摄'),
        (meditation_practice_id, 88, '观修同事摄', '第88修法：观修同事摄'),
        (meditation_practice_id, 89, '观修止观', '第89修法：观修止观'),
        (meditation_practice_id, 90, '观修奢摩他', '第90修法：观修奢摩他'),
        (meditation_practice_id, 91, '观修毗婆舍那', '第91修法：观修毗婆舍那'),
        (meditation_practice_id, 92, '观修止观双运', '第92修法：观修止观双运');

    RAISE NOTICE '已成功创建 meditation_topics 表并插入92个观修主题！';
END $$;
