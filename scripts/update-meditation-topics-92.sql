
-- Update meditation_topics table with all 92 specific meditation topics from 前行实修法
-- First, clear existing topics and insert the complete set

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

    -- Clear existing topics for this practice
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
        (meditation_practice_id, 14, '观诸佛圣士而修无常', '第14修法：观诸佛圣士而修无常'),
        (meditation_practice_id, 15, '观死亡不定而修无常', '第15修法：观死亡不定而修无常'),
        (meditation_practice_id, 16, '观有为法自性而修无常', '第16修法：观有为法自性而修无常'),
        (meditation_practice_id, 17, '观骤然死缘而修无常', '第17修法：观骤然死缘而修无常'),
        (meditation_practice_id, 18, '观独自离世而修无常', '第18修法：观独自离世而修无常'),
        (meditation_practice_id, 19, '观时代士夫而修无常', '第19修法：观时代士夫而修无常'),
        (meditation_practice_id, 20, '观无可信赖而修无常', '第20修法：观无可信赖而修无常'),
        (meditation_practice_id, 21, '观外缘不定而修无常', '第21修法：观外缘不定而修无常'),
        (meditation_practice_id, 22, '观励力希求而修无常', '第22修法：观励力希求而修无常'),
        (meditation_practice_id, 23, '总说生起厌离心', '第23修法：总说生起厌离心'),
        (meditation_practice_id, 24, '八热地狱之苦', '第24修法：八热地狱之苦'),
        (meditation_practice_id, 25, '近边地狱之苦', '第25修法：近边地狱之苦'),
        (meditation_practice_id, 26, '八寒地狱之苦', '第26修法：八寒地狱之苦'),
        (meditation_practice_id, 27, '孤独地狱之苦', '第27修法：孤独地狱之苦'),
        (meditation_practice_id, 28, '饿鬼之苦', '第28修法：饿鬼之苦'),
        (meditation_practice_id, 29, '旁生之苦', '第29修法：旁生之苦'),
        (meditation_practice_id, 30, '根本苦', '第30修法：根本苦'),
        (meditation_practice_id, 31, '生苦', '第31修法：生苦'),
        (meditation_practice_id, 32, '老苦', '第32修法：老苦'),
        (meditation_practice_id, 33, '病苦', '第33修法：病苦'),
        (meditation_practice_id, 34, '死苦', '第34修法：死苦'),
        (meditation_practice_id, 35, '其余分支苦', '第35修法：其余分支苦'),
        (meditation_practice_id, 36, '非天之苦', '第36修法：非天之苦'),
        (meditation_practice_id, 37, '天人之苦', '第37修法：天人之苦'),
        (meditation_practice_id, 38, '推理今生来世', '第38修法：推理今生来世'),
        (meditation_practice_id, 39, '身不善业', '第39修法：身不善业'),
        (meditation_practice_id, 40, '语不善业', '第40修法：语不善业'),
        (meditation_practice_id, 41, '意不善业', '第41修法：意不善业'),
        (meditation_practice_id, 42, '身善业', '第42修法：身善业'),
        (meditation_practice_id, 43, '语善业', '第43修法：语善业'),
        (meditation_practice_id, 44, '意善业', '第44修法：意善业'),
        (meditation_practice_id, 45, '随解脱分善', '第45修法：随解脱分善'),
        (meditation_practice_id, 46, '思维一切皆为业之自性', '第46修法：思维一切皆为业之自性'),
        (meditation_practice_id, 47, '思维差别', '第47修法：思维差别'),
        (meditation_practice_id, 48, '共同法相', '第48修法：共同法相'),
        (meditation_practice_id, 49, '不共法相', '第49修法：不共法相'),
        (meditation_practice_id, 50, '第一次第赞颂', '第50修法：第一次第赞颂'),
        (meditation_practice_id, 51, '第二次第赞颂', '第51修法：第二次第赞颂'),
        (meditation_practice_id, 52, '第三次第赞颂', '第52修法：第三次第赞颂'),
        (meditation_practice_id, 53, '平时之瑜伽', '第53修法：平时之瑜伽'),
        (meditation_practice_id, 54, '修四事业之次第', '第54修法：修四事业之次第'),
        (meditation_practice_id, 55, '遣除病魔之赎死法', '第55修法：遣除病魔之赎死法'),
        (meditation_practice_id, 56, '皈依分类', '第56修法：皈依分类'),
        (meditation_practice_id, 57, '思维功德', '第57修法：思维功德'),
        (meditation_practice_id, 58, '皈依方法', '第58修法：皈依方法'),
        (meditation_practice_id, 59, '思维功德生起欢喜', '第59修法：思维功德生起欢喜'),
        (meditation_practice_id, 60, '修舍无量心', '第60修法：修舍无量心'),
        (meditation_practice_id, 61, '修慈无量心', '第61修法：修慈无量心'),
        (meditation_practice_id, 62, '修悲无量心', '第62修法：修悲无量心'),
        (meditation_practice_id, 63, '修喜无量心', '第63修法：修喜无量心'),
        (meditation_practice_id, 64, '修炼', '第64修法：修炼'),
        (meditation_practice_id, 65, '思维利益', '第65修法：思维利益'),
        (meditation_practice_id, 66, '顶礼支', '第66修法：顶礼支'),
        (meditation_practice_id, 67, '供养支', '第67修法：供养支'),
        (meditation_practice_id, 68, '忏悔支', '第68修法：忏悔支'),
        (meditation_practice_id, 69, '随喜支', '第69修法：随喜支'),
        (meditation_practice_id, 70, '请转法轮支', '第70修法：请转法轮支'),
        (meditation_practice_id, 71, '请不涅槃支', '第71修法：请不涅槃支'),
        (meditation_practice_id, 72, '回向支', '第72修法：回向支'),
        (meditation_practice_id, 73, '正行', '第73修法：正行'),
        (meditation_practice_id, 74, '修自他平等菩提心', '第74修法：修自他平等菩提心'),
        (meditation_practice_id, 75, '修自他相换菩提心', '第75修法：修自他相换菩提心'),
        (meditation_practice_id, 76, '修自轻他重菩提心', '第76修法：修自轻他重菩提心'),
        (meditation_practice_id, 77, '布施度', '第77修法：布施度'),
        (meditation_practice_id, 78, '本体', '第78修法：本体'),
        (meditation_practice_id, 79, '清净行境', '第79修法：清净行境'),
        (meditation_practice_id, 80, '观修大士八大发心', '第80修法：观修大士八大发心'),
        (meditation_practice_id, 81, '有缘之安忍', '第81修法：有缘之安忍'),
        (meditation_practice_id, 82, '无缘之安忍', '第82修法：无缘之安忍'),
        (meditation_practice_id, 83, '精进度', '第83修法：精进度'),
        (meditation_practice_id, 84, '思维变化无常之自性', '第84修法：思维变化无常之自性'),
        (meditation_practice_id, 85, '思维贪欲之过患', '第85修法：思维贪欲之过患'),
        (meditation_practice_id, 86, '思维与凡夫交往之过患', '第86修法：思维与凡夫交往之过患'),
        (meditation_practice_id, 87, '思维愦闹之过患', '第87修法：思维愦闹之过患'),
        (meditation_practice_id, 88, '思维静处功德', '第88修法：思维静处功德'),
        (meditation_practice_id, 89, '真实修持静虑', '第89修法：真实修持静虑'),
        (meditation_practice_id, 90, '显现观为幻化八喻', '第90修法：显现观为幻化八喻'),
        (meditation_practice_id, 91, '观察法性空性', '第91修法：观察法性空性'),
        (meditation_practice_id, 92, '安住于离边中观之义中', '第92修法：安住于离边中观之义中');

    RAISE NOTICE '已成功更新92个前行实修法观修主题';
END $$;
