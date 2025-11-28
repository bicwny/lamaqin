# Overview

This Expo React Native application is designed for Buddhist practice tracking across iOS, Android, and web platforms. Its core purpose is to help users manage daily spiritual practices such as meditation, study, and mindfulness. Key capabilities include a comprehensive user authentication system via Supabase, practice logging with progress tracking, course management, and a unique Buddhist-themed UI design using the Five Taras color system. The project aims to provide a robust tool for spiritual development, offering a digital companion for practitioners to monitor their progress and engage with their studies.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application leverages Expo Router for file-based routing and a tab-based navigation structure, categorizing practices into daily, study, mindfulness, and statistics. A "Five Taras" Buddhist-themed design system dictates the UI, employing semantic colors for different practice types. Global state management, particularly for authentication and user sessions, is handled using React Context. The UI is constructed from reusable design tokens and a comprehensive component library to ensure consistency.

The bottom tab navigation (`app/(tabs)/_layout.tsx`) uses `useSafeAreaInsets` from `react-native-safe-area-context` to properly handle iOS devices with home indicators (iPhone X and later). The tab bar dynamically adjusts its bottom padding and height based on the device's safe area, ensuring navigation icons and labels never overlap with the iPhone's home indicator bar.

### Key Features
- **Daily Practice Display**: The 当日 (Daily) tab displays ALL active practices with `target_period='daily'`, showing complete progress for all daily count-based and time-based practices. Previously limited to 3 practices, the limit was removed (2025-11-16) to ensure all daily practices are visible regardless of enrollment order.
- **Practice Sharing**: Users can share their daily practice summary via the "分享" button on the daily view. The share modal (`app/modals/share-practice.tsx`) displays a date-based title (e.g., "10/8修行总结") and formats today's practice data using the user's dharma name without units (e.g., "圆青：莲师心咒1000，百字明100，三十五佛忏悔文1"). The modal includes Buddhist dedication prayers below the copy button and provides clipboard copy functionality using expo-clipboard for easy sharing to WhatsApp.

## Backend Architecture
Supabase serves as the backend-as-a-service, providing authentication, a real-time database, and API functionality. The database schema includes tables for users, practices, courses, practice records, and progress tracking. All data operations are managed through the Supabase JavaScript client, which supports automatic session management and offline synchronization. The authentication system features a complete email-based flow with registration, verification, password reset, and session persistence, maintaining user profiles with Buddhist-specific information.

## Data Storage Solutions
The primary database is Supabase PostgreSQL, an external cloud service, handling all persistent data and real-time subscriptions. Database migrations are managed via the Supabase SQL Editor. Local storage for session persistence and offline data caching is handled by AsyncStorage on mobile and localStorage on the web. The application explicitly does not use Replit's built-in PostgreSQL database, relying solely on Supabase for all database interactions through environment variables.

## Authentication and Authorization
A complete authentication system is implemented using Supabase Auth, supporting email/password flows, user registration with email verification, password reset, persistent sessions, and secure token refreshing. User data is automatically synchronized between Supabase Auth and the application's user database table.

## React Native Architecture Configuration
The app uses React Native with a configurable architecture setting in `app.json`. Currently, `"newArchEnabled": false` is set for optimal compatibility with Expo Go during development and testing. For production deployments to app stores, `"newArchEnabled": true` can be enabled to leverage the performance benefits of React Native's New Architecture (Fabric + TurboModules), especially for features like React Native Reanimated 4.1+ on iOS.

## App Branding Assets
Custom app icon and splash screen are configured in `app.json`:
- **App Icon**: `assets/icon.png` - Used for iOS, Android, and web app icon
- **Splash Screen**: `assets/splash.png` - Loading screen displayed during app initialization
- **Android Adaptive Icon**: Uses the same `assets/icon.png` with white background
All branding assets are located in the `assets/` folder and can be replaced by uploading new files with the same names.

## System Design Choices
The application supports a class-based curriculum system, allowing users to enroll in multiple Buddhist study classes concurrently. Upon enrollment, users automatically receive all required practices, courses, and study materials specific to their selected curricula. This system includes database schema for class curricula, required courses, and practices, alongside user enrollment and progress tracking. Required study types must be completed for lesson progress, while optional activities track attendance without affecting core progress.

### Configured Classes
- **加行** (display_order: 1): Foundation stage - basic practice and merit accumulation
- **预科：入行** (display_order: 2): Preparatory stage - Study and meditation on Bodhisattva's Way. Includes meditation choice system with 2 options: 《入行论广释》201观修 or 前行实修法
- **正科** (display_order: 3): Core stage - formal study of Buddhist teachings. Includes count-based practices (莲师心咒 1000/day, 百字明 100/day) and meditation choice system with 3 options
- **净土** (display_order: 4): Pure Land class - chanting for rebirth in Amitabha's Western Pure Land

### Practice Choice System
Some classes offer optional practice choices where users must select at least one practice from a choice group during enrollment. The system tracks selections using the `choice_group` field in `class_required_practices` table, with `is_optional=true` marking choices. User selections are stored in `user_practice_choices` table and automatically synced to create corresponding practice projects.

### Entry Year / Cohort Tracking
All class enrollments now track the user's entry year (cohort) to identify which study group they belong to. When enrolling in any class, users must select their entry year from a dropdown menu showing years from 1984 to the current year. This information is stored in the `entry_year` field in the `user_enrolled_classes` table. The entry year identifies which cohort a user belongs to, though all practices and study materials remain the same across cohorts. Both profile setup and edit profile screens provide:
- Dropdown selection for entry year when enrolling in new classes (dynamically generated from 1984 to current year)
- Display of entry year for already enrolled classes
- Validation requiring entry year selection before enrollment
- Migration: `docs/ADD_ENTRY_YEAR_MIGRATION.sql` adds the nullable `entry_year` TEXT column

### No Dharma Name Option (2025-11-28)
Both profile setup (`profile-setup.tsx`) and edit profile (`edit-profile.tsx`) screens include a "未得法名" (No Dharma Name) checkbox below the 法名 input field. This allows users who haven't received a dharma name yet to complete their profile:
- When checked, the 法名 input field is disabled and cleared
- Validation skips dharma name requirement when checkbox is checked
- Saves `null` (not empty string) to database when checked, making state distinguishable
- On profile load, checkbox is automatically checked if `dharma_name` is null or empty
- Full round-trip persistence: check → save → reload → checkbox remains checked

### Course Display Ordering
The `class_required_courses` table includes a `display_order` field allowing each class to define its own custom sequence for courses. This enables flexible learning paths where the same course can appear in different positions across classes (e.g., "大学演讲" might be first in one class but third in another). Courses are automatically displayed in ascending order based on this field, with any courses lacking a display_order value appearing last.

**正科 Course Expansion (2025-10-24)**: Two SQL scripts required to add 5 courses to 正科 class: 三戒要解(上) (22课), 缘起赞 (8课), 中观四百论 (72课), 中观根本慧论 (114课), 中观庄严论释 (128课). Execute in order:
1. `docs/add-zhengke-courses.sql` - Adds course records to `courses` table and links to 正科 class. Handles display_order column creation if missing.
2. `docs/add-zhengke-course-lessons.sql` - Adds 344 lesson records to `course_lessons` table (第1课, 第2课, etc.). Must run after step 1.

### Shared Course Handling
When the same course is required by multiple classes, students only need to enroll once. The `syncUserCoursesWithClassRequirements` function checks existing enrollments before adding courses. If a student already has a course from a previous class enrollment, it is automatically skipped when enrolling in new classes. This ensures:
- No duplicate course entries in user_courses table
- Students see each unique course only once on the study page
- Progress on shared courses counts toward all classes requiring it
- Example: If both "加行" and "预科：入行" require "大学演讲", the student is enrolled only when joining the first class, and the second class enrollment skips it

### Practice Deletion System
The `user_practice_projects` table includes a `source_type` field ('class_required' | 'user_created') that tracks the origin of each practice project. This enables safe deletion control:
- **Class-required practices**: Created automatically during class enrollment, marked as `source_type='class_required'`, and cannot be deleted by users
- **User-created practices**: Future support for manually created practices marked as `source_type='user_created'`, which can be deleted by users
- **Delete validation**: The `deletePracticeProject` function in `classCurriculumService` validates both user ownership and source_type before allowing deletion
- **UI controls**: Delete button appears in practice-history screen (`app/practice-history.tsx`) only for user-created practices with confirmation dialog
- **Migration**: `docs/ADD_SOURCE_TYPE_MIGRATION.sql` adds the source_type field with default 'class_required' for backward compatibility
- **Note**: Currently all practices are class-required since there's no manual practice creation feature yet. The infrastructure is ready for future manual practice creation.

### Practice Detail Deprecation (2025-11-26)
The `practice-detail/[practiceId].tsx` page has been deprecated and replaced with a redirect to `practice-history.tsx`. All "详情" button clicks now navigate directly to practice-history, which provides the same functionality:
- Progress summary with daily/total targets
- Action buttons: 删除 (for user_created only), 编辑, 记录
- Complete practice record history with edit/delete capabilities
- The old practice-detail page now auto-redirects to practice-history for backward compatibility

### Practice History Tab System (2025-11-27)
The `practice-history.tsx` page now features a three-tab navigation system with Buddhist-themed naming:
- **日志 (Journal)**: Displays all practice records with an "添加记录" button at the top. Shows the chronological list of practice entries with edit/delete options for each record.
- **功课 (Practice)**: Shows project details including progress summary, stats grid (start date, status, end date, type, days practiced, days remaining), and action buttons for editing settings or deleting user-created projects.
- **圆满 (Completion)**: Placeholder for future report/statistics functionality (TBD).

The tab bar uses a pill-style design with icons, smooth state switching, and follows the app's design system colors. Default tab is "日志" (Journal).

### 修行 Tab Reorganization (2025-11-27)
The 修行 (Practice) tab now features a two-tab navigation system:
- **功课 (Practices)**: Displays all user practice projects with progress tracking, showing the complete list of enrolled practices with action buttons for viewing history and adding records.
- **日历 (Calendar)**: Shows the practice calendar (CalendarView component) that was previously in the 回向 tab, allowing users to view their practice history by date.

The 回向 (Stats/Dedication) tab has been simplified to only display the dedication prayers (回向文), removing the calendar which is now in the 修行 tab. This reorganization makes the 修行 tab the central hub for all practice-related activities.

# External Dependencies

-   **Supabase**: Backend-as-a-service for authentication, database, and real-time features.
-   **Expo**: Cross-platform development framework facilitating router, notifications, and native modules.
-   **NativeWind**: Integrates Tailwind CSS for styling React Native components.
-   **React Navigation**: Provides navigation libraries for tab and stack navigation.
-   **AsyncStorage**: Used for persistent local storage on mobile platforms.
-   **React Native Elements**: A UI component library for consistent interface elements.
-   **Expo Notifications**: Manages push notifications for practice reminders.
-   **Vector Icons**: Provides a library of icons, including Buddhist-themed iconography.