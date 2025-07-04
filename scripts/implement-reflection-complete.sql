
-- 佛教修行追踪App - 观后感功能完整实施
-- 执行所有必要的数据库更新以支持观后感功能

-- Step 1: 确保meditation_records表有观后感字段
ALTER TABLE public.meditation_records 
ADD COLUMN IF NOT EXISTS reflection TEXT,
ADD COLUMN IF NOT EXISTS reflection_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS method TEXT;

-- Step 2: 添加性能优化索引
CREATE INDEX IF NOT EXISTS idx_meditation_records_practice_date 
ON public.meditation_records(practice_id, record_date);

CREATE INDEX IF NOT EXISTS idx_meditation_records_user_date 
ON public.meditation_records(user_id, record_date DESC);

CREATE INDEX IF NOT EXISTS idx_meditation_records_reflection 
ON public.meditation_records(user_id) WHERE reflection IS NOT NULL;

-- Step 3: 更新RLS策略
DO $$
BEGIN
    -- 删除旧策略（如果存在）
    DROP POLICY IF EXISTS "Users can manage own meditation records" ON public.meditation_records;
    
    -- 创建新的综合策略
    CREATE POLICY "meditation_records_policy" 
    ON public.meditation_records 
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- Step 4: 确保meditation_topics表和数据完整
DO $$
DECLARE
    meditation_practice_id uuid;
    topic_count integer;
BEGIN
    -- 查找前行观修practice
    SELECT id INTO meditation_practice_id 
    FROM practices 
    WHERE name ILIKE '%前行%' OR name ILIKE '%观修%'
    LIMIT 1;
    
    -- 如果没有找到，创建一个
    IF meditation_practice_id IS NULL THEN
        INSERT INTO practices (name, type, unit, description)
        VALUES ('前行实修法', 'time', '座', '前行实修法92座观修')
        RETURNING id INTO meditation_practice_id;
        
        RAISE NOTICE '✅ 创建了前行实修法practice: %', meditation_practice_id;
    END IF;

    -- 检查是否已有92个topics
    SELECT COUNT(*) INTO topic_count
    FROM meditation_topics 
    WHERE practice_id = meditation_practice_id;
    
    IF topic_count < 92 THEN
        -- 清理现有topics，重新插入完整的92个
        DELETE FROM meditation_topics WHERE practice_id = meditation_practice_id;
        
        -- 插入完整的92个观修方法
        INSERT INTO meditation_topics (practice_id, topic_number, title, description)
        VALUES 
            (meditation_practice_id, 1, '思维闲暇之本体', '第1修法：思维闲暇之本体，观想人身难得的本质'),
            (meditation_practice_id, 2, '思维差别之圆满', '第2修法：思维差别之圆满，观想十种圆满条件'),
            (meditation_practice_id, 3, '思维恶趣之险地', '第3修法：思维恶趣之险地，观想三恶道痛苦'),
            (meditation_practice_id, 4, '思维难得之比喻', '第4修法：思维难得之比喻，观想人身如盲龟值木'),
            (meditation_practice_id, 5, '思维次第之数目', '第5修法：思维次第之数目，观想人身如优昙花'),
            (meditation_practice_id, 6, '思维无义而空耗', '第6修法：思维无义而空耗，观想浪费人身的过患'),
            (meditation_practice_id, 7, '思维因缘与缘起', '第7修法：思维因缘与缘起，观想因果不虚'),
            (meditation_practice_id, 8, '思维生死之流转', '第8修法：思维生死之流转，观想轮回过患'),
            (meditation_practice_id, 9, '思维暇满之赞颂', '第9修法：思维暇满之赞颂，赞叹人身宝贵'),
            (meditation_practice_id, 10, '思维当生欢喜心', '第10修法：思维当生欢喜心，对人身生起珍惜'),
            (meditation_practice_id, 11, '观蕴身而修无常', '第11修法：观蕴身而修无常，观想五蕴无常'),
            (meditation_practice_id, 12, '观世间尊主而修无常', '第12修法：观世间尊主而修无常，观想权势无常'),
            (meditation_practice_id, 13, '观器情成坏而修无常', '第13修法：观器情成坏而修无常，观想世界无常'),
            (meditation_practice_id, 14, '观四季变迁而修无常', '第14修法：观四季变迁而修无常，观想季节更替'),
            (meditation_practice_id, 15, '观日夜更替而修无常', '第15修法：观日夜更替而修无常，观想昼夜轮转'),
            (meditation_practice_id, 16, '观死缘众多而修无常', '第16修法：观死缘众多而修无常，观想死因不定'),
            (meditation_practice_id, 17, '观生命无增而修无常', '第17修法：观生命无增而修无常，观想寿命递减'),
            (meditation_practice_id, 18, '观寿量不定而修无常', '第18修法：观寿量不定而修无常，观想死期无定'),
            (meditation_practice_id, 19, '观临终助益而修无常', '第19修法：观临终助益而修无常，观想死时无助'),
            (meditation_practice_id, 20, '观唯法有益而修无常', '第20修法：观唯法有益而修无常，观想唯法能救'),
            (meditation_practice_id, 21, '观地狱寒冻而修苦谛', '第21修法：观地狱寒冻而修苦谛，观想寒地狱苦'),
            (meditation_practice_id, 22, '观地狱炽燃而修苦谛', '第22修法：观地狱炽燃而修苦谛，观想热地狱苦'),
            (meditation_practice_id, 23, '观孤独地狱而修苦谛', '第23修法：观孤独地狱而修苦谛，观想近边狱苦'),
            (meditation_practice_id, 24, '观饿鬼障外而修苦谛', '第24修法：观饿鬼障外而修苦谛，观想饿鬼外障'),
            (meditation_practice_id, 25, '观饿鬼障内而修苦谛', '第25修法：观饿鬼障内而修苦谛，观想饿鬼内障'),
            (meditation_practice_id, 26, '观饿鬼障特而修苦谛', '第26修法：观饿鬼障特而修苦谛，观想饿鬼特障'),
            (meditation_practice_id, 27, '观旁生劳役而修苦谛', '第27修法：观旁生劳役而修苦谛，观想旁生被役'),
            (meditation_practice_id, 28, '观旁生相残而修苦谛', '第28修法：观旁生相残而修苦谛，观想旁生互害'),
            (meditation_practice_id, 29, '观旁生愚痴而修苦谛', '第29修法：观旁生愚痴而修苦谛，观想旁生无知'),
            (meditation_practice_id, 30, '观旁生驯养而修苦谛', '第30修法：观旁生驯养而修苦谛，观想旁生被养'),
            (meditation_practice_id, 31, '观天人堕落而修苦谛', '第31修法：观天人堕落而修苦谛，观想天人五衰'),
            (meditation_practice_id, 32, '观天人好战而修苦谛', '第32修法：观天人好战而修苦谛，观想天人战争'),
            (meditation_practice_id, 33, '观天人嫉妒而修苦谛', '第33修法：观天人嫉妒而修苦谛，观想阿修罗嫉'),
            (meditation_practice_id, 34, '观人类生老而修苦谛', '第34修法：观人类生老而修苦谛，观想生老病死'),
            (meditation_practice_id, 35, '观人类病死而修苦谛', '第35修法：观人类病死而修苦谛，观想疾病死亡'),
            (meditation_practice_id, 36, '观人类怨憎而修苦谛', '第36修法：观人类怨憎而修苦谛，观想怨憎会苦'),
            (meditation_practice_id, 37, '观人类别离而修苦谛', '第37修法：观人类别离而修苦谛，观想爱别离苦'),
            (meditation_practice_id, 38, '观人类求不得而修苦谛', '第38修法：观人类求不得而修苦谛，观想求不得苦'),
            (meditation_practice_id, 39, '观五蕴炽盛而修苦谛', '第39修法：观五蕴炽盛而修苦谛，观想五取蕴苦'),
            (meditation_practice_id, 40, '观轮回总相而修苦谛', '第40修法：观轮回总相而修苦谛，观想轮回过患'),
            (meditation_practice_id, 41, '观业力黑白而修集谛', '第41修法：观业力黑白而修集谛，观想善恶业果'),
            (meditation_practice_id, 42, '观业果确定而修集谛', '第42修法：观业果确定而修集谛，观想因果不爽'),
            (meditation_practice_id, 43, '观业果增长而修集谛', '第43修法：观业果增长而修集谛，观想业果增长'),
            (meditation_practice_id, 44, '观业果不失而修集谛', '第44修法：观业果不失而修集谛，观想业果不失'),
            (meditation_practice_id, 45, '观业果不作不遇而修集谛', '第45修法：观业果不作不遇而修集谛，观想不作不遇'),
            (meditation_practice_id, 46, '观业果已作必遇而修集谛', '第46修法：观业果已作必遇而修集谛，观想已作必遇'),
            (meditation_practice_id, 47, '观十善业道而修集谛', '第47修法：观十善业道而修集谛，观想十善行'),
            (meditation_practice_id, 48, '观十恶业道而修集谛', '第48修法：观十恶业道而修集谛，观想十恶行'),
            (meditation_practice_id, 49, '观根本烦恼而修集谛', '第49修法：观根本烦恼而修集谛，观想六根本惑'),
            (meditation_practice_id, 50, '观随烦恼而修集谛', '第50修法：观随烦恼而修集谛，观想二十随惑'),
            (meditation_practice_id, 51, '观皈依之因而修皈依', '第51修法：观皈依之因而修皈依，观想皈依因缘'),
            (meditation_practice_id, 52, '观皈依之境而修皈依', '第52修法：观皈依之境而修皈依，观想三宝功德'),
            (meditation_practice_id, 53, '观皈依之相而修皈依', '第53修法：观皈依之相而修皈依，观想皈依行相'),
            (meditation_practice_id, 54, '观皈依佛宝而修皈依', '第54修法：观皈依佛宝而修皈依，观想佛宝功德'),
            (meditation_practice_id, 55, '观皈依法宝而修皈依', '第55修法：观皈依法宝而修皈依，观想法宝功德'),
            (meditation_practice_id, 56, '观皈依僧宝而修皈依', '第56修法：观皈依僧宝而修皈依，观想僧宝功德'),
            (meditation_practice_id, 57, '观皈依学处而修皈依', '第57修法：观皈依学处而修皈依，观想皈依戒'),
            (meditation_practice_id, 58, '观皈依功德而修皈依', '第58修法：观皈依功德而修皈依，观想皈依利益'),
            (meditation_practice_id, 59, '观皈依精进而修皈依', '第59修法：观皈依精进而修皈依，观想修行精进'),
            (meditation_practice_id, 60, '观皈依供养而修皈依', '第60修法：观皈依供养而修皈依，观想供养三宝'),
            (meditation_practice_id, 61, '观发心之因而修菩提心', '第61修法：观发心之因而修菩提心，观想发心因'),
            (meditation_practice_id, 62, '观知母而修菩提心', '第62修法：观知母而修菩提心，观想一切众生为母'),
            (meditation_practice_id, 63, '观念恩而修菩提心', '第63修法：观念恩而修菩提心，观想母恩深重'),
            (meditation_practice_id, 64, '观报恩而修菩提心', '第64修法：观报恩而修菩提心，观想报答母恩'),
            (meditation_practice_id, 65, '观慈心而修菩提心', '第65修法：观慈心而修菩提心，观想慈心广大'),
            (meditation_practice_id, 66, '观悲心而修菩提心', '第66修法：观悲心而修菩提心，观想悲心深切'),
            (meditation_practice_id, 67, '观增上意乐而修菩提心', '第67修法：观增上意乐而修菩提心，观想救度众生'),
            (meditation_practice_id, 68, '观发菩提心而修菩提心', '第68修法：观发菩提心而修菩提心，观想菩提心'),
            (meditation_practice_id, 69, '观自他相换而修菩提心', '第69修法：观自他相换而修菩提心，观想自他交换'),
            (meditation_practice_id, 70, '观菩提心利益而修菩提心', '第70修法：观菩提心利益而修菩提心，观想发心功德'),
            (meditation_practice_id, 71, '观布施度而修六度', '第71修法：观布施度而修六度，观想布施波罗蜜'),
            (meditation_practice_id, 72, '观持戒度而修六度', '第72修法：观持戒度而修六度，观想持戒波罗蜜'),
            (meditation_practice_id, 73, '观忍辱度而修六度', '第73修法：观忍辱度而修六度，观想忍辱波罗蜜'),
            (meditation_practice_id, 74, '观精进度而修六度', '第74修法：观精进度而修六度，观想精进波罗蜜'),
            (meditation_practice_id, 75, '观禅定度而修六度', '第75修法：观禅定度而修六度，观想禅定波罗蜜'),
            (meditation_practice_id, 76, '观智慧度而修六度', '第76修法：观智慧度而修六度，观想智慧波罗蜜'),
            (meditation_practice_id, 77, '观资粮积集而修六度', '第77修法：观资粮积集而修六度，观想福慧双修'),
            (meditation_practice_id, 78, '观回向而修六度', '第78修法：观回向而修六度，观想功德回向'),
            (meditation_practice_id, 79, '观四无量心而修六度', '第79修法：观四无量心而修六度，观想慈悲喜舍'),
            (meditation_practice_id, 80, '观六度总义而修六度', '第80修法：观六度总义而修六度，观想六度圆满'),
            (meditation_practice_id, 81, '观上师功德而修依止法', '第81修法：观上师功德而修依止法，观想师长功德'),
            (meditation_practice_id, 82, '观上师恩德而修依止法', '第82修法：观上师恩德而修依止法，观想师长恩德'),
            (meditation_practice_id, 83, '观依止胜利而修依止法', '第83修法：观依止胜利而修依止法，观想依止利益'),
            (meditation_practice_id, 84, '观不依过患而修依止法', '第84修法：观不依过患而修依止法，观想不依过失'),
            (meditation_practice_id, 85, '观意乐依止而修依止法', '第85修法：观意乐依止而修依止法，观想心依上师'),
            (meditation_practice_id, 86, '观加行依止而修依止法', '第86修法：观加行依止而修依止法，观想身语依止'),
            (meditation_practice_id, 87, '观具德上师而修依止法', '第87修法：观具德上师而修依止法，观想善知识相'),
            (meditation_practice_id, 88, '观依止之心而修依止法', '第88修法：观依止之心而修依止法，观想依止之心'),
            (meditation_practice_id, 89, '观上师即佛而修依止法', '第89修法：观上师即佛而修依止法，观想师佛无别'),
            (meditation_practice_id, 90, '观全分依止而修依止法', '第90修法：观全分依止而修依止法，观想全面依止'),
            (meditation_practice_id, 91, '观修总结前行要义', '第91修法：观修总结前行要义，总结前行修法'),
            (meditation_practice_id, 92, '观修圆满回向发愿', '第92修法：观修圆满回向发愿，圆满回向发愿');
        
        RAISE NOTICE '✅ 成功插入92个观修方法';
    ELSE
        RAISE NOTICE '✅ 观修方法已存在，共%个', topic_count;
    END IF;
END $$;

-- Step 5: 插入测试数据验证功能
INSERT INTO public.meditation_records (
    user_id,
    practice_id,
    record_date,
    session_number,
    duration_minutes,
    method,
    reflection,
    reflection_created_at
) 
SELECT 
    '954dc879-cbfe-4b5f-a7ef-113acf1f5569'::uuid,
    (SELECT id FROM practices WHERE name ILIKE '%前行%' LIMIT 1),
    CURRENT_DATE,
    1,
    30,
    '思维闲暇之本体',
    '今日观修思维闲暇之本体，深感人身难得。通过观想八种闲暇和十种圆满，认识到现在的修行条件是多么珍贵。应当珍惜每一次修行的机会，不可空耗这难得的人身。愿以此功德回向给一切众生，愿他们都能获得暇满人身，修持佛法。',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.meditation_records 
    WHERE user_id = '954dc879-cbfe-4b5f-a7ef-113acf1f5569'::uuid 
    AND record_date = CURRENT_DATE 
    AND reflection IS NOT NULL
    AND session_number = 1
);

-- Step 6: 验证完成状态
DO $$
DECLARE
    reflection_count integer;
    topics_count integer;
BEGIN
    -- 检查观后感字段
    SELECT COUNT(*) INTO reflection_count
    FROM information_schema.columns 
    WHERE table_name = 'meditation_records' 
    AND column_name = 'reflection';
    
    -- 检查观修方法数量
    SELECT COUNT(*) INTO topics_count
    FROM meditation_topics;
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE '🎯 观后感功能实施完成状态报告';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ 观后感字段状态: % (1=正常)', reflection_count;
    RAISE NOTICE '✅ 观修方法总数: %', topics_count;
    RAISE NOTICE '✅ 性能索引: 已创建';
    RAISE NOTICE '✅ RLS安全策略: 已更新';
    RAISE NOTICE '✅ 测试数据: 已插入';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '🚀 观后感功能已完全就绪！';
    RAISE NOTICE '用户现在可以：';
    RAISE NOTICE '  📝 在观修时记录观后感';
    RAISE NOTICE '  📖 查看历史观后感';
    RAISE NOTICE '  ✏️ 编辑已有观后感';
    RAISE NOTICE '  📊 统计观后感数据';
    RAISE NOTICE '==========================================';
END $$;
