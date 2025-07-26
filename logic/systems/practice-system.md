
# Practice System Logic

## Overview
The practice system manages meditation and spiritual practices, allowing users to create projects, track progress, and record sessions.

## Core Components

### 1. Practice Management
- **Practice Types**: Time-based and count-based practices
- **Project Creation**: Configurable practice projects with targets
- **Progress Tracking**: Daily/weekly progress monitoring
- **Session Recording**: Individual practice session logging

### 2. Database Schema

#### Tables
- `practices`: Core practice definitions
- `user_practice_projects`: User's practice projects
- `meditation_records`: Session records for time-based practices
- `daily_records`: Records for count-based practices
- `meditation_topics`: Topic-based meditation content
- `user_practice_topic_progress`: Topic progress tracking

### 3. Practice Types

#### Time-Based Practices
- Measured in minutes/sessions
- Weekly or daily targets
- Session duration tracking
- Topic-based progression support

#### Count-Based Practices
- Measured in repetitions (mantras, prostrations)
- Daily targets with total goals
- Flexible counting system
- Progress percentage calculation

## Key Features

### Project Configuration
1. **Practice Selection**: Choose from available practices
2. **Target Setting**: Set daily/weekly goals
3. **Duration Planning**: Fixed period or ongoing
4. **Custom Naming**: Personalized project names

### Session Recording
1. **Time Tracking**: Duration-based sessions
2. **Count Logging**: Repetition-based entries
3. **Notes System**: Reflection and notes
4. **Topic Selection**: Choose meditation topics

### Progress Analytics
1. **Daily Statistics**: Today's progress
2. **Weekly Overview**: Week progress for time practices
3. **Total Tracking**: Cumulative statistics
4. **Completion Status**: Goal achievement tracking

## User Interface Components

### Practice Screens
- **Practice Tab** (`/app/(tabs)/practice.tsx`): Main practice dashboard
- **Practice Detail** (`/app/practice-detail/[practiceId].tsx`): Individual project view
- **Meditation Detail** (`/app/meditation-detail/[practiceId].tsx`): Time practice details
- **Practice Config** (`/app/practice-config.tsx`): Project setup
- **Add Practice** (`/app/add-practice.tsx`): Practice selection

### Recording Modals
- **Meditation Record** (`/app/modals/meditation-record.tsx`): Time session recording
- **Custom Record** (`/app/modals/custom-record.tsx`): Count session recording

## Data Flow

### Project Creation Flow
1. User selects practice type
2. Configures project parameters
3. Sets goals and duration
4. Creates database project record
5. Initializes progress tracking

### Session Recording Flow
1. User starts recording session
2. Enters session data (time/count)
3. Optionally adds notes/topics
4. Saves to appropriate records table
5. Updates project progress counters

### Progress Calculation
1. Fetches user's project data
2. Aggregates session records
3. Calculates completion percentages
4. Updates UI with current status

## Advanced Features

### Topic-Based Meditation
- 92 meditation topics available
- Weekly topic targets
- Progress tracking per topic
- Reflection system integration

### Flexible Scheduling
- Daily practice targets
- Weekly goal setting
- Ongoing vs. fixed duration projects
- Custom project naming

### Analytics & History
- Session history viewing
- Progress trend analysis
- Goal achievement tracking
- Performance statistics

## Integration Points
- **Authentication**: User-specific data
- **Profile System**: User preferences
- **Daily System**: Today's practice overview
- **Mindfulness**: Meditation content integration
