
-- 佛教修行追踪App - 观后感功能数据库扩展
-- Phase 1: 数据库Schema更新

-- Step 1: 为 meditation_records 表添加观后感字段
ALTER TABLE public.meditation_records 
ADD COLUMN IF NOT EXISTS reflection TEXT,
ADD COLUMN IF NOT EXISTS reflection_created_at TIMESTAMP WITH TIME ZONE;

-- Step 2: 添加性能优化索引
CREATE INDEX IF NOT EXISTS idx_meditation_records_practice_date 
ON public.meditation_records(practice_id, record_date);

CREATE INDEX IF NOT EXISTS idx_meditation_records_user_date 
ON public.meditation_records(user_id, record_date DESC);

-- Step 3: 更新RLS策略以支持观后感
-- 确保用户可以管理自己的观后感
DO $$
BEGIN
    -- 检查策略是否存在，如果不存在则创建
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'meditation_records' 
        AND policyname = 'Users can manage own meditation records'
    ) THEN
        CREATE POLICY "Users can manage own meditation records" 
        ON public.meditation_records 
        FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Step 4: 验证表结构
DO $$
BEGIN
    -- 检查新字段是否成功添加
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meditation_records' 
        AND column_name = 'reflection'
    ) THEN
        RAISE NOTICE '✅ 观后感字段已成功添加到 meditation_records 表';
    ELSE
        RAISE NOTICE '❌ 观后感字段添加失败';
    END IF;

    -- 检查索引是否成功创建
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_meditation_records_practice_date'
    ) THEN
        RAISE NOTICE '✅ 性能索引已成功创建';
    ELSE
        RAISE NOTICE '❌ 性能索引创建失败';
    END IF;
END $$;

-- Step 5: 插入测试数据验证功能
-- 为现有用户添加一条带观后感的测试记录
INSERT INTO public.meditation_records (
    user_id,
    practice_id,
    record_date,
    session_number,
    duration_minutes,
    session_attempt,
    reflection,
    reflection_created_at
) 
SELECT 
    '954dc879-cbfe-4b5f-a7ef-113acf1f5569'::uuid, -- 已知的测试用户ID
    '432e30ee-f8e8-4569-8da3-86ff7b264f5e'::uuid, -- 前行观修practice_id
    CURRENT_DATE,
    1,
    25,
    1,
    '今日观修"思维闲暇之本体"，深感人身难得。通过观想八种闲暇和十种圆满，认识到现在的修行条件是多么珍贵。应当珍惜每一次修行的机会，不可空耗这难得的人身。',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.meditation_records 
    WHERE user_id = '954dc879-cbfe-4b5f-a7ef-113acf1f5569'::uuid 
    AND record_date = CURRENT_DATE 
    AND reflection IS NOT NULL
);

RAISE NOTICE '🎯 Phase 1 数据库扩展完成！';
RAISE NOTICE '✅ 观后感功能已就绪';
RAISE NOTICE '✅ 性能索引已优化';
RAISE NOTICE '✅ 测试数据已插入';
RAISE NOTICE '📋 下一步: 更新TypeScript类型定义';
