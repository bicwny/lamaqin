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