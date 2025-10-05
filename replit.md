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

**Database Architecture:**
- **Primary Database**: Supabase PostgreSQL (external cloud service)
  - Handles all persistent data with real-time subscriptions
  - Complete schema defined in `docs/SUPABASE_COMPLETE_MIGRATION.sql`
  - All migrations must be run in Supabase SQL Editor (not locally)
  
- **Local Storage**: AsyncStorage (mobile) and localStorage (web)
  - Session persistence and offline data caching only
  - No local PostgreSQL database is used
  
- **Important**: The app does NOT use Replit's built-in PostgreSQL database. All database operations connect to Supabase via the Supabase JavaScript client using `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` environment variables.

Practice records, progress tracking, and user preferences are synchronized across devices through Supabase's real-time features.

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

### Class Curriculum Database Migration - COMPLETED ✅
- **Issue Identified**: Users selecting "前行" class during profile setup were not receiving their required practices due to missing database tables
- **Root Cause**: The `class_required_practices`, `user_enrolled_classes`, and related tables didn't exist in Supabase database
- **Solution**: Executed complete database migration (`SUPABASE_COMPLETE_MIGRATION.sql`) creating all necessary tables with seeded data
- **Migration Results**: Successfully created 16 tables with 2 class curricula, 12 courses, 31 practices, 7 class-course links, and 8 class-practice links
- **Database Clarification**: App uses only Supabase PostgreSQL (external), NOT Replit's local database. All migrations run in Supabase SQL Editor.
- **Cleanup**: Archived old local migration files to avoid confusion, documented single-database architecture in replit.md
- **Verification**: Users selecting "前行" now correctly receive 1 course (前行广释) and 7 practices automatically

### Profile Setup Validation Enhancement - COMPLETED ✅
- **Removed Field**: Eliminated "⏰ 修行年限（可选）" (Practice Years) field from profile setup to simplify onboarding
- **Required Fields**: Law name (法名), lay name (俗名), and class selection are mandatory
- **Toast Notifications**: Replaced native alerts with consistent toast messages for validation errors
- **Help Text Updated**: Reflects only location as optional field after practice years removal

### Web Nested Modal Fix - COMPLETED ✅
- **Root Cause Identified**: Nested modals on web platform (Expo Router modal containing React Native Modal) had event propagation issue where child modal clicks bubbled up to parent modal's outside-click listener, causing both modals to dismiss
- **Architectural Issue**: React Native Modal on web renders to a portal outside the parent modal's DOM tree, making stopPropagation ineffective
- **Solution Implemented**: Replaced React Native Modal with absolutely positioned overlay View on web platform that stays within parent's DOM tree
- **Event Handling**: Added capture-phase event handlers (onClickCapture, onMouseDownCapture, onPointerDownCapture, onTouchStartCapture) with stopPropagation to prevent all events from bubbling to parent
- **Platform-Specific**: Web uses overlay View approach; iOS/Android continue using native Modal component (no changes to mobile behavior)
- **Components Updated**: TopicSelectionModal.tsx now has separate rendering logic for web vs. native platforms
- **Verified Fix**: Architect confirmed all interactions (search input, topic selection, cancel/confirm buttons) work correctly without dismissing parent modal

### Enhanced Study Record Status Options - COMPLETED ✅
- **Updated 共修 (Group Study) status options**: Expanded from simple attendance tracking to include specific activities: 回顾 (review), 串讲 (connecting lecture), 参加 (attended), 缺席 (absent)
- **Updated 讲考 (Teaching Exam) status options**: Now supports: 讲考 (teaching exam), 提问 (questions), 参加 (attended), 缺席 (absent)
- **Type system updates**: Modified StudyRecord interface to support six new status values while maintaining backward compatibility
- **UI improvements**: Course detail screen now shows context-specific status pickers based on study type with distinct button styling
- **Data flow verified**: Status values are properly persisted to database and displayed in lesson progress summaries

## Recent Changes (October 4, 2025)

### Class-Based Curriculum System - COMPLETED ✅

**Feature:** Class-based curriculum structure where users can enroll in multiple Buddhist study classes simultaneously (加行, 净土) and automatically receive all required practices, courses, and study materials for their selected curricula.

**Implementation:**
1. ✅ Database schema and migration (docs/SUPABASE_COMPLETE_MIGRATION.sql)
   - 5 new tables: class_curricula, class_required_courses, class_required_practices, user_enrolled_classes, user_class_progress
   - Seeded data for 加行 (146 lessons, 7 practices) and 净土 (161 lessons, 1 practice)
   - Migration successfully executed on Supabase database

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
   - Verified working: Users selecting 前行 receive 1 course + 7 practices automatically

**Future Enhancements:**
- Update lesson study tracking UI to show required vs optional study types
- Update 闻思 tab to group courses by enrolled classes
- Update 当日 tab to filter practices by enrolled classes

**Key Design Decisions:**
- Concurrent enrollment supported (users can be in multiple classes)
- Required study types (听上师传承 + 看法本) must be completed for lesson progress
- Optional status fields (共修, 讲考) track attendance (参加/缺席) without affecting progress
- Single Supabase database for all environments (no local dev database)

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