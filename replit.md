# Overview

This Expo React Native application is a cross-platform (iOS, Android, web) tool for Buddhist practitioners to track and manage their daily spiritual practices, including meditation, study, and mindfulness. It features user authentication, practice logging with progress tracking, course management, and a unique "Five Taras" Buddhist-themed UI. The project aims to be a robust digital companion for spiritual development, helping users monitor progress and engage with their studies.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses Expo Router for file-based routing and a tab-based navigation structure. It employs a "Five Taras" Buddhist-themed design system with semantic colors. React Context handles global state management, particularly for authentication and user sessions. The UI is built with reusable design tokens and a component library. Bottom tab navigation (`app/(tabs)/_layout.tsx`) uses `useSafeAreaInsets` to handle iOS safe areas.

### Key Features
-   **Daily Practice Display**: The 当日 (Daily) tab shows all active daily practices, including count-based and time-based activities.
-   **Practice Sharing**: Users can share daily practice summaries via a "分享" button, generating a date-based title and practice data formatted with the user's dharma name, including dedication prayers and clipboard copy functionality.
-   **Practice History Tab System**: The `practice-history.tsx` page features a three-tab navigation system:
    -   **日志 (Journal)**: Displays all practice records with edit/delete options.
    -   **功课 (Practice)**: Shows project details, progress summary, stats, and action buttons.
    -   **圆满 (Completion)**: Placeholder for future reports.
-   **修行 Tab Reorganization**: The 修行 (Practice) tab now includes two sub-tabs:
    -   **功课 (Practices)**: Lists all user practice projects with progress tracking.
    -   **日历 (Calendar)**: Displays the practice calendar.
-   **Class-based Curriculum System**: Users can enroll in multiple Buddhist study classes, automatically receiving required practices, courses, and materials.
-   **Practice Choice System**: Classes can offer optional practice choices, where users select at least one practice from a group during enrollment.
-   **Entry Year / Cohort Tracking**: Class enrollments track the user's entry year (cohort) for group identification.
-   **"No Dharma Name" Option**: Profile setup and edit screens allow users without a dharma name to proceed by checking a "未得法名" (No Dharma Name) checkbox, disabling and clearing the dharma name input.
-   **Course Display Ordering**: `class_required_courses` table includes a `display_order` field for custom course sequencing within each class.
-   **Shared Course Handling**: The system prevents duplicate course enrollments across multiple classes; progress on shared courses counts for all requiring classes.
-   **Class Pause/Resume System**: Pausing a class automatically pauses its mandatory practice projects, protecting practices required by other active classes. Resuming a class reactivates its paused projects. Paused practices are hidden from the home screen.
-   **Practice Deletion System**: Practice projects have a `source_type` ('class_required' | 'user_created'). Only user-created practices can be deleted by users.
-   **Practice Detail Deprecation**: The `practice-detail/[practiceId].tsx` page is deprecated and redirects to `practice-history.tsx`.

## Backend Architecture
Supabase provides the backend services, including authentication, a real-time database, and API functionality. Data operations use the Supabase JavaScript client. The authentication system supports email-based flows with registration, verification, password reset, and session persistence.

## Data Storage Solutions
Supabase PostgreSQL is the primary external database. Local storage for sessions and offline caching is managed by AsyncStorage (mobile) and localStorage (web).

## Authentication and Authorization
Supabase Auth handles a complete email/password authentication system, including user registration with email verification, password reset, persistent sessions, and secure token refreshing.

## React Native Architecture Configuration
The app is configured with `"newArchEnabled": false` for Expo Go compatibility. It can be set to `"newArchEnabled": true` for production to leverage React Native's New Architecture.

## App Branding Assets
Custom app icon (`assets/icon.png`) and splash screen (`assets/splash.png`) are configured in `app.json` for iOS, Android, and web.

# External Dependencies

-   **Supabase**: Backend-as-a-service for authentication, database, and real-time features.
-   **Expo**: Cross-platform development framework for routing, notifications, and native modules.
-   **NativeWind**: Integrates Tailwind CSS for styling React Native components.
-   **React Navigation**: Provides navigation libraries.
-   **AsyncStorage**: Used for persistent local storage.
-   **React Native Elements**: UI component library.
-   **Expo Notifications**: Manages push notifications.
-   **Vector Icons**: Provides a library of icons.