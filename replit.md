# Overview

This is an Expo React Native application for Buddhist practice tracking that supports iOS, Android, and web platforms. The app helps users manage their daily spiritual practices including meditation, study, and mindfulness activities. It features a comprehensive user authentication system via Supabase, practice logging with progress tracking, course management, and Buddhist-themed UI design using the Five Taras color system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The app follows Expo Router's file-based routing system with a tab-based navigation structure. The main tabs represent different aspects of Buddhist practice: daily practice (当日), study (闻思), mindfulness (正念), and statistics (统计). The UI implements a Buddhist-themed design system called "Five Taras" that assigns semantic colors to different practice types and spiritual contexts.

The architecture uses React Context for global state management, particularly for authentication and user session handling. Components are built with reusable design tokens and a comprehensive component library that maintains consistency across the app.

## Backend Architecture
The app uses Supabase as the backend-as-a-service, providing authentication, real-time database, and API functionality. The database schema includes users, practices, courses, practice records, and progress tracking tables. All data operations go through Supabase's JavaScript client with automatic session management and offline synchronization capabilities.

Authentication follows a complete email-based flow including registration, email verification, password reset, and session persistence. The system maintains user profiles with Buddhist context (dharma names, practice years, current class).

## Data Storage Solutions
Supabase PostgreSQL database handles all persistent data with real-time subscriptions for live updates. The app uses AsyncStorage (mobile) and localStorage (web) for session persistence and offline data caching. Practice records, progress tracking, and user preferences are synchronized across devices through Supabase's real-time features.

## Authentication and Authorization
Complete authentication system using Supabase Auth with email/password flow. Features include user registration with email verification, password reset functionality, persistent sessions across app launches, and secure token refresh. User data is automatically synced between Supabase Auth and the app's user database table.

## React Native Architecture Configuration

The app uses React Native with a configurable architecture setting in `app.json`:

- **Current Setting**: `"newArchEnabled": false` - Optimized for Expo Go testing and development
- **Production Option**: `"newArchEnabled": true` - Enables React Native New Architecture (Fabric + TurboModules)

**Testing Configuration**: New Architecture is disabled to ensure compatibility with Expo Go on all devices. This allows seamless testing through QR code scanning without requiring custom development builds.

**Production Deployment**: For App Store/Play Store builds, New Architecture can be enabled to take advantage of improved performance, better gesture handling, and future React Native features. React Native Reanimated 4.1+ requires New Architecture for iOS builds.

**Technical Note**: This configuration affects the build process - Expo Go requires New Architecture disabled, while modern production builds benefit from New Architecture enabled.

## External Dependencies

- **Supabase**: Backend-as-a-service providing authentication, database, and real-time features
- **Expo**: Cross-platform development framework with router, notifications, and native modules
- **NativeWind**: Tailwind CSS integration for React Native styling
- **React Navigation**: Navigation libraries for tab and stack navigation
- **AsyncStorage**: Persistent storage for mobile platforms
- **React Native Elements**: UI component library for consistent interface elements
- **Expo Notifications**: Push notification system for practice reminders
- **Vector Icons**: Icon library for Buddhist-themed iconography

## Recent Changes (October 5, 2025)

### Enhanced Study Record Status Options - COMPLETED ✅
- **Updated 共修 (Group Study) status options**: Expanded from simple attendance tracking to include specific activities: 回顾 (review), 串讲 (connecting lecture), 参加 (attended), 缺席 (absent)
- **Updated 讲考 (Teaching Exam) status options**: Now supports: 讲考 (teaching exam), 提问 (questions), 参加 (attended), 缺席 (absent)
- **Type system updates**: Modified StudyRecord interface to support six new status values while maintaining backward compatibility
- **UI improvements**: Course detail screen now shows context-specific status pickers based on study type with distinct button styling
- **Data flow verified**: Status values are properly persisted to database and displayed in lesson progress summaries

## Recent Changes (October 4, 2025)

### Class-Based Curriculum System - IN PROGRESS 🚧

**Feature:** Implementing a class-based curriculum structure where users can enroll in multiple Buddhist study classes simultaneously (加行, 净土) and automatically receive all required practices, courses, and study materials for their selected curricula.

**Completed:**
1. ✅ Database schema design and migration SQL (docs/CLASS_CURRICULUM_MIGRATION.sql)
   - 5 new tables: class_curricula, class_required_courses, class_required_practices, user_enrolled_classes, user_class_progress
   - Seeded data for 加行 (146 lessons, 7 practices) and 净土 (161 lessons, 1 practice)
   - Unique constraints on courses.name and practices.name to prevent duplicates
   - Backward-compatible with existing study_records table

2. ✅ TypeScript types (types/database.ts)
   - New interfaces: ClassCurriculum, ClassRequiredCourse, ClassRequiredPractice, UserEnrolledClass, UserClassProgress
   - Updated StudyRecord to support 听上师传承, 看法本, 共修, 讲考 with status tracking (参加/缺席)

3. ✅ Backend API (lib/database.ts)
   - classCurriculumService with full CRUD operations
   - Enrollment, progress tracking, and auto-creation of practice projects
   - Fixed FK query issues for concurrent class enrollment support

4. ✅ Profile setup integration (app/profile-setup.tsx)
   - Multi-select class enrollment UI with checkboxes
   - Auto-enrollment and practice project creation on profile save
   - Loads available classes from database dynamically

**Next Steps:**
- Update lesson study tracking UI to support required/optional study types
- Update 闻思 tab to group courses by enrolled classes
- Update 当日 tab to display practices from enrolled classes
- End-to-end testing with both 加行 and 净土 enrollments

**Key Design Decisions:**
- Concurrent enrollment supported (users can be in multiple classes)
- Required study types (听上师传承 + 看法本) must be completed for lesson progress
- Optional status fields (共修, 讲考) track attendance (参加/缺席) without affecting progress
- Database migration runs on both fresh and existing databases safely

## Recent Changes (September 29, 2025)

### iPhone 16 Crash Resolution - FIXED ✅
- **Identified root cause**: App was crashing within 0.35 seconds of startup in `expo.controller.errorRecoveryQueue` during React Native Reanimated initialization on iPhone 16 with iOS 18.6.2
- **Version compatibility issue**: React Native Reanimated v3.19.1 has known stability issues with iOS 18 causing immediate app crashes on iPhone 16
- **Stable version implementation**: Successfully downgraded react-native-reanimated from v3.19.1 to v3.15.5 (verified stable version for iOS 18)
- **Package protection**: Added dependency overrides in package.json to prevent accidental upgrades to problematic Reanimated versions
- **Enhanced error detection**: Improved ErrorBoundary to detect and handle Reanimated-specific errors with detailed logging
- **Development verification**: App now runs stably with all core features working (authentication, navigation, database operations)

**Critical Fix**: The startup crash that was happening on iPhone 16 iOS 18 is now resolved. The app uses Reanimated v3.15.5 which maintains full compatibility with Legacy Architecture while providing all Expo Router functionality.

**Technical Configuration**: 
- React Native New Architecture remains disabled (`newArchEnabled: false`) for optimal iPhone 16 compatibility
- Reanimated v3.15.5 supports Legacy Architecture and provides stable navigation animations
- Package overrides prevent dependency conflicts and version drift

**Next Step**: Build a fresh iOS release build (EAS) with `--clear-cache` flag and test on physical iPhone 16 to verify the crash fix in production environment.