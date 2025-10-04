# Class-Based Curriculum System Design Decisions

**Date:** October 4, 2025  
**Status:** Design & Planning Phase

---

## 1. Theme System Deprecation

### Decision
**Deprecate the existing theme system** in favor of a class-based curriculum structure.

### Rationale
- Themes were designed for practice categorization (foundation, puja, meditation, practice)
- No UI components currently use the theme system
- Class-based curriculum (加行, 入行, 正科, 净土) better represents the actual Buddhist educational progression
- Theme infrastructure exists in database but is unused in the application

### Implementation Status
✅ **Completed:**
- Removed `getAllThemes()`, `getThemePractices()`, `joinTheme()` functions from `lib/database.ts`
- Fixed all LSP errors in database layer
- Maintained backward compatibility: `theme_id` field and `Theme` interface remain in codebase

### Backward Compatibility
- `theme_id` column in `user_practice_projects` table remains (nullable)
- `Theme` interface in `types/database.ts` preserved
- Existing user data with theme references will continue to work

---

## 2. Class-Based Curriculum Structure

### Classes
Four sequential curriculum levels:
1. **加行** (Foundational Practice)
2. **入行** (Entry Practice)
3. **正科** (Main Curriculum)
4. **净土** (Pure Land)

### Core Concept
Users select a class level that determines:
- Required courses with specific study requirements
- Required count-based practices with daily targets
- Required session-based practices with frequency and duration requirements

---

## 3. 前行 (Foundational Practice) Requirements

### Course Requirements
**前行广释** - 146 lessons
- **Study types required per lesson:**
  - 听上师传承 (Listen to master's transmission) ×1
  - 看法本 (Read dharma text) ×1

### Count-Based Practices (6 practices)
All practices require 100,000 repetitions with specific daily targets:

| Practice | Total Count | Daily Target | Days to Complete |
|----------|-------------|--------------|------------------|
| 顶礼 (Prostrations) | 100,000 | 200 | 500 days |
| 皈依 (Refuge) | 100,000 | 500 | 200 days |
| 发心 (Bodhicitta) | 100,000 | 500 | 200 days |
| 百字明 (100-syllable mantra) | 100,000 | 300 | 333 days |
| 供曼茶 (Mandala offering) | 100,000 | 500 | 200 days |
| 莲师上师瑜伽 (Guru Yoga) | 100,000 | 1,000 | 100 days |

### Session-Based Practice
**前行实修法** (Foundational Practice Sessions)
- **Total sessions:** 92
- **Frequency:** 4 sessions per week (23 weeks)
- **Duration:** Minimum 30 minutes per session

---

## 4. Database Schema Design

### New Tables

#### `class_curricula`
Defines available class levels.
```sql
CREATE TABLE class_curricula (
  id UUID PRIMARY KEY,
  class_name TEXT NOT NULL,        -- '加行', '入行', '正科', '净土'
  display_order INTEGER,
  description TEXT,
  created_at TIMESTAMP
);
```

#### `class_required_courses`
Links classes to required courses with study type specifications.
```sql
CREATE TABLE class_required_courses (
  id UUID PRIMARY KEY,
  class_id UUID REFERENCES class_curricula(id),
  course_id UUID REFERENCES courses(id),
  required_study_types TEXT[],     -- ['听上师传承', '看法本']
  created_at TIMESTAMP
);
```

#### `class_required_practices`
Defines practice requirements for each class.
```sql
CREATE TABLE class_required_practices (
  id UUID PRIMARY KEY,
  class_id UUID REFERENCES class_curricula(id),
  practice_id UUID REFERENCES practices(id),
  
  -- For count-based practices
  target_count INTEGER,            -- 100,000
  daily_target INTEGER,            -- 200, 500, 300, etc.
  
  -- For session-based practices  
  total_sessions INTEGER,          -- 92
  weekly_sessions INTEGER,         -- 4
  min_duration_minutes INTEGER,    -- 30
  
  practice_category TEXT,          -- 'count' or 'session'
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);
```

#### `user_class_progress`
Tracks user progress through class requirements.
```sql
CREATE TABLE user_class_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  class_id UUID REFERENCES class_curricula(id),
  courses_completed INTEGER DEFAULT 0,
  practices_completed INTEGER DEFAULT 0,
  overall_progress_percentage DECIMAL,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### Existing Tables (Reused)
- `users` - already has `class_name` field
- `courses` - stores course information (e.g., 前行广释)
- `course_lessons` - stores individual lessons
- `practices` - stores practice definitions
- `user_practice_projects` - user's active practice goals
- `daily_records` - count-based practice logs
- `meditation_records` - session-based practice logs
- `study_records` - course study logs

---

## 5. UX Design Decisions

### Class Selection Entry Points

#### Primary: Profile Setup (Onboarding)
**When:** First-time user registration, after email verification
- **Required field** - user must select a class to continue
- Auto-loads all required practices and courses for selected class
- Creates personalized starting experience

**Flow:**
```
Sign up → Email verify → Profile Setup:
  - Dharma name
  - Location
  - Practice years
  → Class selection ← NEW PROMINENT FIELD
  
  Options: 
  ○ 加行 (Foundational Practice)
  ○ 入行 (Entry Practice)
  ○ 正科 (Main Curriculum)
  ○ 净土 (Pure Land)
```

#### Secondary: Edit Profile (Settings)
**When:** User wants to change or advance to a new class
- Allows progression through curriculum
- Shows confirmation dialog when changing classes
- Preserves existing progress data

### Progress Display
Add visual indicators showing:
- Current class badge (e.g., "加行修行中")
- Overall class completion percentage
- Link to view detailed class requirements

---

## 6. Open Questions & Decisions Needed

### Class Enrollment Model

**Question:** Should users be able to enroll in multiple classes simultaneously or only one at a time?

#### Option A: Sequential Progression (One Class at a Time)
**Pros:**
- Clear focus on current curriculum level
- Simpler UI and progress tracking
- Matches traditional Buddhist curriculum progression
- Less overwhelming for users

**Cons:**
- Cannot practice previous class requirements simultaneously
- No flexibility for review/maintenance of completed practices

**Implementation:**
- User has one active class stored in `users.class_name`
- Completed classes tracked in `user_class_progress` with completion dates
- When advancing, update `class_name` and auto-load new requirements

#### Option B: Concurrent Enrollment (Multiple Classes)
**Pros:**
- Can maintain previous class practices while learning new curriculum
- More flexible for experienced practitioners
- Supports review and reinforcement

**Cons:**
- More complex UI (need filtering/switching between classes)
- Potentially overwhelming practice list
- Harder to track "current focus"

**Implementation:**
- Many-to-many relationship via `user_enrolled_classes`
- Each enrollment has status: 'active', 'completed', 'paused'
- UI needs class filtering/grouping

**UX Considerations for Option B:**
- Tabbed view to switch between classes
- Collapsible sections (active expanded, completed collapsed)
- "Primary class" setting to determine default view

### Recommendation
**Start with Option A (Sequential)** for simplicity. Can add concurrent enrollment in future if users request it.

---

## 7. Implementation Roadmap

### Phase 1: Database Setup
- [ ] Create new tables: `class_curricula`, `class_required_courses`, `class_required_practices`, `user_class_progress`
- [ ] Populate 加行 requirements data
- [ ] Create database migration scripts

### Phase 2: Backend API
- [ ] Add service methods for class management
- [ ] Implement auto-loading of class requirements
- [ ] Add progress calculation logic

### Phase 3: Frontend Integration
- [ ] Add class selection to profile setup flow
- [ ] Add class selector to edit profile screen
- [ ] Update practice tab to show class-based requirements
- [ ] Add class progress indicators

### Phase 4: Testing & Refinement
- [ ] Test complete user journey (signup → class selection → practice loading)
- [ ] Test class advancement flow
- [ ] Validate progress calculations

---

## 8. Data Integrity Considerations

### When User Changes Class
1. Show confirmation dialog
2. Preserve existing `user_practice_projects` records
3. Mark current class progress as completed (if applicable)
4. Create new class progress entry
5. Auto-generate new practice projects for new class requirements

### Progress Calculation
- Course progress: (lessons with all required study types completed) / total lessons
- Practice progress: current_count / target_count
- Overall class progress: weighted average of all requirements

---

## Notes
- This design leverages existing table structures to minimize schema changes
- Backward compatibility maintained throughout
- Flexible enough to support future class additions (入行, 正科, 净土)
- Daily targets enable realistic progress pacing
