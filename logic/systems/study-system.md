
# Study System Logic

## Overview
The study system provides structured Buddhist learning through courses, lessons, and progress tracking.

## Core Components

### 1. Course Management
- **Course Structure**: Hierarchical course organization
- **Lesson Content**: Individual lesson materials
- **Progress Tracking**: User learning progress
- **Completion System**: Course and lesson completion

### 2. Database Schema

#### Tables
- `courses`: Course definitions and metadata
- `lessons`: Individual lesson content
- `user_courses`: User enrollment and progress
- `user_lesson_progress`: Detailed lesson progress

### 3. Course Types

#### Structured Courses
- Sequential lesson progression
- Prerequisites and dependencies
- Completion certificates
- Progress percentages

#### Reference Materials
- Non-sequential access
- Resource libraries
- Quick reference guides
- Supplementary content

## Key Features

### Course Discovery
1. **Course Catalog**: Browse available courses
2. **Course Details**: Comprehensive course information
3. **Enrollment**: Join courses of interest
4. **Prerequisites**: Check learning requirements

### Lesson Experience
1. **Content Delivery**: Rich lesson content presentation
2. **Progress Tracking**: Automatic progress saving
3. **Bookmarking**: Save important sections
4. **Note Taking**: Personal study notes

### Learning Analytics
1. **Progress Metrics**: Course completion percentages
2. **Time Tracking**: Study time analytics
3. **Achievement System**: Learning milestones
4. **Performance Reports**: Study effectiveness metrics

## User Interface Components

### Study Screens
- **Study Tab** (`/app/(tabs)/study.tsx`): Main study dashboard
- **Course Detail** (`/app/course-detail/[courseId].tsx`): Individual course view
- **Lesson Viewer** (`/app/lesson-viewer.tsx`): Lesson content presentation

### Learning Tools
- **LessonWebView** (`/components/LessonWebView.tsx`): Web-based lesson renderer
- **Progress Indicators**: Visual progress tracking
- **Navigation Controls**: Lesson navigation

## Data Flow

### Course Enrollment Flow
1. User browses course catalog
2. Views course details and requirements
3. Enrolls in selected course
4. Creates user_courses record
5. Initializes progress tracking

### Lesson Learning Flow
1. User accesses lesson content
2. System tracks lesson start time
3. Content is presented via WebView
4. Progress is automatically saved
5. Completion status updated

### Progress Calculation
1. Fetches user's enrolled courses
2. Calculates lesson completion rates
3. Updates overall course progress
4. Provides analytics and insights

## Advanced Features

### Content Management
- HTML-based lesson content
- Multimedia support (videos, images)
- Interactive elements
- Responsive design

### Learning Path Optimization
- Adaptive content recommendations
- Personalized learning paths
- Skill-based progression
- Prerequisites enforcement

### Social Learning
- Community discussions
- Peer interaction features
- Study groups
- Mentor systems

## Integration Points
- **Authentication**: User-specific progress
- **Profile System**: Learning preferences
- **Practice System**: Applied learning
- **Daily System**: Study activity tracking

## Content Structure

### Course Hierarchy
```
Course
├── Module 1
│   ├── Lesson 1.1
│   ├── Lesson 1.2
│   └── Quiz 1
├── Module 2
│   ├── Lesson 2.1
│   ├── Lesson 2.2
│   └── Quiz 2
└── Final Assessment
```

### Lesson Components
- **Title and Description**: Lesson overview
- **Learning Objectives**: Expected outcomes
- **Content Body**: Main teaching material
- **Activities**: Interactive exercises
- **Assessment**: Knowledge checks
- **Resources**: Additional materials

## Quality Assurance
- Content review process
- User feedback integration
- Performance optimization
- Accessibility compliance
