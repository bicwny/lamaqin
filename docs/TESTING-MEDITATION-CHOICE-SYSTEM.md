# 观修选择系统测试指南
# Meditation Practice Choice System Testing Guide

## 前置条件 (Prerequisites)

### 1. 运行SQL设置脚本 (Run SQL Setup Script)

在Supabase SQL Editor中运行 `docs/setup-meditation-choice-system.sql` 文件：

1. 打开 Supabase Dashboard → SQL Editor
2. 复制粘贴 `docs/setup-meditation-choice-system.sql` 的内容
3. **重要**: 按照文件中的步骤顺序执行：
   - 步骤1: 查询班级和修法ID
   - 步骤2: 将查询到的ID填入UPDATE语句并执行
   - 步骤3: 运行验证查询确认配置成功

In Supabase SQL Editor, run the `docs/setup-meditation-choice-system.sql` file:

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste contents of `docs/setup-meditation-choice-system.sql`
3. **Important**: Execute in order following the file's steps:
   - Step 1: Query for class and practice IDs
   - Step 2: Fill the IDs into UPDATE statement and execute
   - Step 3: Run verification query to confirm configuration

## 测试场景 (Test Scenarios)

### 场景 1: 新用户注册并选择观修 (New User Registration with Practice Choice)

**测试步骤:**

1. 注册新账户
   - 使用新邮箱注册
   - 验证邮箱并登录

2. 完成个人资料设置 (Profile Setup)
   - 输入法名和俗名
   - 选择 "预科：入行" 班级
   - **关键测试点**: 应该看到观修选择UI显示：
     ```
     🧘 预科：入行 观修选择
     至少选择一项，可选择多项
     
     观修选择:
     □ 《入行论广释》201观修
     □ 《前行实修法》第59-92修法
     ```
   - 尝试不选择任何观修，点击"完成设置" → 应该显示验证错误
   - 选择一项或两项观修
   - 点击"完成设置" → 应该成功

3. 验证修法项目创建
   - 进入"功课"页面
   - 确认只看到选择的观修对应的practice项目
   - 如果选择了《入行论广释》201观修，应该看到该修法的项目
   - 如果选择了《前行实修法》第59-92修法，应该看到该修法的项目
   - 如果两个都选了，应该看到两个项目

**Expected Results:**
1. Registration and email verification works
2. Profile setup shows practice choice UI for 预科：入行 class
3. Validation requires at least one practice selection
4. After completion, only selected practices appear in 功课 page

---

### 场景 2: 已有用户修改观修选择 (Existing User Modifying Practice Choices)

**测试步骤:**

1. 以已注册用户登录（已加入预科：入行班级）

2. 进入个人资料编辑
   - 点击"统计" → "个人资料" → "编辑个人资料"

3. 查看观修选择
   - **关键测试点**: 应该看到观修选择UI，并且用户之前的选择已被勾选
   ```
   🧘 预科：入行 观修选择（可修改）
   至少选择一项，可选择多项
   
   观修选择:
   ☑ 《入行论广释》201观修 [如果之前选了]
   □ 《前行实修法》第59-92修法 [如果之前没选]
   ```

4. 修改选择
   - 取消当前选择 → 点击保存 → 应该显示验证错误（至少选择一项）
   - 添加第二个选项（如果之前只选了一个）
   - 点击"保存更改" → 应该成功

5. 验证修法项目更新
   - 返回"功课"页面
   - 确认现在有两个观修的practice项目（如果选择了两个）
   - 新添加的修法应该出现在列表中

**Expected Results:**
1. Edit profile shows current practice selections pre-checked
2. Validation prevents saving with no selections
3. Can add additional practice choices
4. New practice projects appear in 功课 page after save

---

### 场景 3: 多班级观修选择 (Multiple Class Practice Choices)

**测试步骤:**

1. 创建第二个班级的观修选择（在Supabase中配置）
2. 用户加入多个班级
3. 在profile-setup或edit-profile中
   - 应该看到每个班级的独立观修选择区域
   - 每个班级的选择是独立的
4. 验证每个班级的修法都正确创建

**Expected Results:**
1. Multiple classes show separate practice choice sections
2. Each class's choices are independent
3. All selected practices from all classes are created correctly

---

## 数据库验证查询 (Database Verification Queries)

### 查看用户的修法选择 (View User's Practice Choices)

```sql
SELECT 
  u.dharma_name,
  cc.class_name,
  upc.choice_group,
  p.name as selected_practice
FROM user_practice_choices upc
JOIN users u ON upc.user_id = u.id
JOIN class_curricula cc ON upc.class_id = cc.id
JOIN practices p ON upc.practice_id = p.id
WHERE u.dharma_name = '<USER_DHARMA_NAME>'
ORDER BY cc.class_name, upc.choice_group;
```

### 查看用户的修法项目 (View User's Practice Projects)

```sql
SELECT 
  pp.id,
  p.name as practice_name,
  pp.status,
  pp.created_at
FROM practice_projects pp
JOIN practices p ON pp.practice_id = p.id
WHERE pp.user_id = '<USER_ID>'
  AND p.name IN (
    '《入行论广释》201观修',
    '《前行实修法》第59-92修法'
  )
ORDER BY pp.created_at DESC;
```

---

## 常见问题排查 (Troubleshooting)

### 问题1: 看不到观修选择UI
**可能原因:**
- SQL设置脚本未正确执行
- class_required_practices表中的is_optional和choice_group字段未设置

**解决方法:**
```sql
-- 验证配置
SELECT 
  cc.class_name,
  p.name,
  crp.choice_group,
  crp.is_optional
FROM class_required_practices crp
JOIN class_curriculum cc ON crp.class_id = cc.id
JOIN practices p ON crp.practice_id = p.id
WHERE crp.is_optional = TRUE;
```

### 问题2: 保存失败或验证错误
**可能原因:**
- user_practice_choices表未创建
- 数据库权限问题

**解决方法:**
- 检查浏览器控制台的错误信息
- 验证user_practice_choices表存在并有正确权限

### 问题3: 修法项目未创建
**可能原因:**
- createPracticeProjectsForClass函数未正确处理用户选择

**解决方法:**
- 检查浏览器控制台日志
- 查询user_practice_choices表确认选择已保存
- 查询practice_projects表确认项目创建状态

---

## 成功标准 (Success Criteria)

✅ 所有场景测试通过
✅ 观修选择UI正确显示
✅ 验证逻辑正确工作（至少选择一项）
✅ 用户选择正确保存到user_practice_choices表
✅ 只有选择的修法创建了practice项目
✅ 用户可以在edit-profile中修改选择
✅ 修改选择后，新的修法项目正确创建
