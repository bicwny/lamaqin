
# Database Schema Overview

## Core Tables

### Authentication & Users
- `users`: Core user profile information
- `user_preferences`: Application preferences

### Practice Management
- `practices`: Available practice types
- `user_practice_projects`: User's practice projects
- `meditation_records`: Time-based practice sessions
- `daily_records`: Count-based practice records

### Study System
- `courses`: Available courses
- `lessons`: Course content
- `user_courses`: User enrollments
- `user_lesson_progress`: Learning progress

### Mindfulness & Topics
- `meditation_topics`: Meditation content topics
- `user_practice_topic_progress`: Topic progress tracking

### Support Tables
- `preset_project_names`: Predefined project names
- `user_statistics`: Aggregated statistics
- `user_achievements`: Achievement tracking

## Key Relationships

### User-Centric Design
- All major tables link to `users.id`
- Row Level Security (RLS) enforced
- User data isolation

### Practice Hierarchy
```
practices -> user_practice_projects -> meditation_records/daily_records
         -> meditation_topics -> user_practice_topic_progress
```

### Study Progression
```
courses -> lessons -> user_courses -> user_lesson_progress
```

## Data Types and Constraints
- UUID primary keys for security
- Timestamp tracking (created_at, updated_at)
- Foreign key constraints for data integrity
- Check constraints for data validation
