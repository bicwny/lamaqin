# Student Information System (SIS) Plan

## Overview

This document outlines the plan for adding a Student Information System to the 三殊胜 project. The SIS will enable administrators and teachers to track attendance and manage grades for each class.

---

## Key Decision: Separate Web App vs. In-App Admin Mode

### Recommendation: **Build a Separate Web Admin Console**

After analysis, building a separate web-based admin console is the recommended approach.

### Why Separate Web App?

| Aspect | In-App Admin Mode | Separate Web App |
|--------|-------------------|------------------|
| **User Experience** | Cramped data tables on mobile | Desktop-friendly grids, bulk actions |
| **Target Users** | Students primarily | Teachers/Admins primarily |
| **Development Risk** | Higher - mixing student/admin UX | Lower - isolated codebases |
| **Data Entry** | Difficult on small screens | Keyboard-friendly forms |
| **Reporting** | Limited screen real estate | Full dashboards and exports |
| **Maintenance** | Complex feature flags | Clean separation |

### Replit Setup Options

**Option 1: Same Replit (Monorepo Approach)**
- Add a `/web-admin` folder in this project
- Use `process-compose` to run both apps
- Share Supabase client code and types
- Single deployment manages both

**Option 2: Separate Replit App**
- Create a new Replit project for web admin
- Connect to the same Supabase database
- Completely independent deployment
- Cleaner separation but more overhead

**Recommended: Option 1 (Monorepo)** - Easier to share code and maintain consistency.

---

## Core Features (MVP)

### 1. Attendance Management
- View class roster
- Mark attendance (present/absent/late/excused)
- View attendance history by date
- Attendance summary reports

### 2. Grade Management
- Two grades per class session (as specified)
- Grade entry form for each student
- Grade history view
- Class average calculations

### 3. Admin Access Control
- Role-based authentication (admin/teacher/student)
- Teachers can only access their assigned classes
- Admins have full access

---

## Database Schema Changes (Supabase)

### New Tables Needed

```sql
-- Teachers/Staff table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'teacher', -- 'admin' or 'teacher'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES teachers(id),
  schedule TEXT, -- e.g., "Every Saturday 10:00 AM"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student-Class enrollment
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id),
  class_id UUID REFERENCES classes(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active', -- 'active', 'dropped', 'completed'
  UNIQUE(student_id, class_id)
);

-- Attendance records
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id),
  class_id UUID REFERENCES classes(id),
  session_date DATE NOT NULL,
  status TEXT NOT NULL, -- 'present', 'absent', 'late', 'excused'
  notes TEXT,
  marked_by UUID REFERENCES teachers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_id, session_date)
);

-- Grades table (two grades per class session)
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id),
  class_id UUID REFERENCES classes(id),
  session_date DATE NOT NULL,
  grade_1 DECIMAL(5,2), -- First grade
  grade_2 DECIMAL(5,2), -- Second grade
  grade_1_label TEXT DEFAULT 'Participation',
  grade_2_label TEXT DEFAULT 'Assignment',
  comments TEXT,
  graded_by UUID REFERENCES teachers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_id, session_date)
);
```

### Row Level Security (RLS) Policies

```sql
-- Attendance: Teachers can view/edit their own classes, admins can see all
CREATE POLICY "Teachers view own class attendance" ON attendance
  FOR SELECT USING (
    class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
    OR EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Similar policies for grades, classes, enrollments...
```

---

## Web Admin Tech Stack

### Recommended Stack
- **Framework**: React (can use Expo Web or plain React/Vite)
- **Styling**: Tailwind CSS
- **Database**: Same Supabase instance
- **Auth**: Supabase Auth with role checking
- **Tables**: React Table or AG Grid for data management

### Alternative: Next.js
If you prefer server-side rendering and API routes, Next.js is also a good option.

---

## Implementation Phases

### Phase 1: Foundation
1. Set up web admin folder structure
2. Configure Supabase schema and RLS
3. Implement admin authentication

### Phase 2: Core Features
1. Class management (CRUD)
2. Student roster views
3. Attendance marking interface
4. Grade entry forms

### Phase 3: Reporting
1. Attendance reports
2. Grade reports
3. Export to CSV/PDF

### Phase 4: Polish
1. Dashboard with overview stats
2. Notifications for missing attendance
3. Bulk actions (mark all present, etc.)

---

## Questions for You

Before proceeding, please confirm:

1. **Deployment preference**: Should the web admin be part of this Replit (monorepo) or a separate project?

2. **Grade structure**: You mentioned "two grades per class" - what do these represent? (e.g., participation + assignment, quiz + homework, etc.)

3. **Who marks attendance?**: Just teachers, or can admins also mark?

4. **Student visibility**: Should students see their own attendance/grades in the mobile app?

5. **Class schedule**: Are classes recurring (e.g., every Saturday) or one-time sessions?

---

## Next Steps

Once you approve this plan:
1. I'll set up the database schema in Supabase
2. Create the web admin folder structure
3. Build the authentication flow
4. Implement attendance and grade management

Let me know your thoughts and answers to the questions above!
