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
-   **Class Pause/Resume System**: Pausing a class automatically pauses its mandatory practice projects AND courses, protecting shared resources (practices/courses required by other active classes stay active). Resuming a class reactivates its paused projects and courses. Paused practices are hidden from the home screen, and paused courses don't appear in the study tab.
-   **Practice Deletion System**: Practice projects have a `source_type` ('class_required' | 'user_created'). Only user-created practices can be deleted by users.
-   **Practice Detail Deprecation**: The `practice-detail/[practiceId].tsx` page is deprecated and redirects to `practice-history.tsx`.

## Backend Architecture
Supabase provides the backend services, including authentication, a real-time database, and API functionality. Data operations use the Supabase JavaScript client. The authentication system supports email-based flows with registration, verification, password reset, and session persistence.

## Data Storage Solutions
Supabase PostgreSQL is the primary external database. Local storage for sessions and offline caching is managed by AsyncStorage (mobile) and localStorage (web).

## Authentication and Authorization
Supabase Auth handles a complete email/password authentication system, including user registration with email verification, password reset, persistent sessions, and secure token refreshing.

## React Native Architecture Configuration
The app is configured with `"newArchEnabled": true` to leverage React Native's New Architecture for production builds.

## Dev Server (Metro) Watcher
Watchman is installed via Nix (`pkgs.watchman` in `replit.nix`) and Metro auto-detects it, so the dev server uses the Watchman-backed watcher instead of Metro's `FallbackWatcher`. Project-wide watcher exclusions live in `.watchmanconfig` (`ignore_dirs`: `.git`, `.local`, `.expo`, `.cache`, `.upm`, `dist`, `dist-web`, `android`, `ios`). The `.local` exclusion prevents agent-tooling churn from triggering ENOENT crashes; `metro.config.js` keeps a matching `blockList` for resolver-level safety.

## Dev Server Host Configuration
The single dev workflow `三殊胜 Development` runs `EXPO_PACKAGER_PROXY_URL=https://$REPLIT_DEV_DOMAIN REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN npx expo start --port 5000` on port 5000. These env vars are required so Metro advertises the public Replit dev domain (e.g. `exp://<repl>.<region>.replit.dev`) instead of the container's internal IP — without them, the "Simulate on iOS" iframe and Expo Go can't reach the bundler and Expo shows a 502 "Hmm... We couldn't reach this app" page. The same workflow serves both the web preview (root URL) and native bundles for the iOS/Android simulators.

## App Branding Assets
Custom app icon (`assets/icon.png`) and splash screen (`assets/splash.png`) are configured in `app.json` for iOS, Android, and web.
Android adaptive icon uses a dedicated foreground (`assets/adaptive-icon.png`) with a purple background (`#7C3AED`) matching the design system.

## App Store Submission Materials
- `docs/APP_STORE_SUBMISSION.md` is the copy-paste source of truth for every App Store Connect field (categories, age rating, App Privacy questionnaire, description, keywords, screenshot specs, reviewer demo account notes, final checklist).
- `scripts/seed-reviewer-account.js` is an idempotent Node script that creates / refreshes the App Store reviewer demo user in Supabase (default `appstore-review@bicwny.com`), enrolls them in the 加行 class with all required practice projects + the required course, and seeds ~14 days of `daily_records`, `meditation_records`, and `study_records` so the reviewer lands on a fully populated app. Requires `SUPABASE_SERVICE_ROLE_KEY` env var (never check this key in). The app uses email-OTP login only — there is no password sign-in path — so the reviewer notes in `docs/APP_STORE_SUBMISSION.md` §4.11 instruct Apple's reviewer to request the OTP from the developer via Resolution Center / email and the developer forwards the 6-digit code during review hours.
- `public/privacy-policy.html` is the publicly hostable bilingual (zh-Hans + English) privacy policy. It ships automatically inside the Expo web build (`public/` is copied verbatim), so once the web build is deployed anywhere it becomes reachable at `/privacy-policy.html` — that URL is what gets pasted into App Store Connect → App Privacy.
- The privacy policy reflects the actual data the app collects: Supabase email auth, optional dharma name, and practice records linked to the user. No analytics/ads SDKs, no IDFA, no location/camera/contacts/health.
- **Privacy policy hosting (Replit Static Deployment configured):** `.replit` `[deployment]` is set to `deploymentTarget = "static"`, `build = ["npm", "run", "build:web"]`, `publicDir = "dist-web"`. `npm run build:web` runs `expo export -p web --output-dir dist-web` and the PWA-meta-tags post-step, producing `dist-web/privacy-policy.html`. After clicking **Publish** in the workspace, the policy is reachable at `https://<deploy>.replit.app/privacy-policy.html` (Replit's static server may also serve `/privacy-policy` without `.html`). Task agents cannot trigger Publish — the user must click it once from the main repl after the task is merged.

## EAS Build & Submit Configuration
- `eas.json` has `preview` and `production` build profiles wired with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from EAS Secrets.
- Preview Android builds produce an APK; production Android builds produce an AAB (App Bundle).
- `submit.production` block has placeholder fields for iOS (Apple ID, ASC App ID, Team ID) and Android (Google Play service account JSON path) — see `SUBMIT_GUIDE.md` for detailed instructions on filling these in.
- EAS Secrets (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) must be pushed via `eas secret:create` after authenticating with `eas login`.
- `expo-build-properties` is pinned to `~1.0.10` (compatible with Expo SDK 54). Do not upgrade without also upgrading the Expo SDK.
- `react-native-safe-area-context` has an override in `package.json` to deduplicate the version pulled by `react-native-calendars`.
- iOS deployment target is 15.1 with static frameworks; Android targets SDK 35.
- **EAS build status (verified 2026-04-28): iOS `.ipa` and Android `.apk` builds both succeed.** Latest preview builds: iOS `816c6dba-7ae5-4f88-85b9-d8d052247cba` → `https://expo.dev/artifacts/eas/gYWFqKGKtHDtn4wrraTPPh.ipa`; Android `f06c3e39-8fd6-4168-bc53-1d137486417d` → `https://expo.dev/artifacts/eas/vFVTZPeA4J3Jw4a3JpRXbD.apk`. The fix has two parts:
  1. **iOS folly/coro fix:** `app.json` has `buildReactNativeFromSource: true`, both `eas.json` profiles set `RCT_USE_PREBUILT_RNCORE: "0"`, and the local config plugin `plugins/withFollyCoroFix.js` (registered in `app.json` plugins array) injects `FOLLY_CFG_NO_COROUTINES=1` into every Pod target's `GCC_PREPROCESSOR_DEFINITIONS` via a `withDangerousMod` Podfile `post_install` block. The CFG variant is required because `RCT-Folly/folly/Portability.h:635` unconditionally redefines `FOLLY_HAS_COROUTINES`, so only the pre-detect knob (`FOLLY_CFG_NO_COROUTINES`) sticks.
  2. **react-native-reanimated v4 upgrade for RN 0.81:** `react-native-reanimated@~4.1.0` (was `~3.15.5`) + `react-native-worklets@0.5.1` (new peer dep). Removed `expo.install.exclude` and bumped `overrides`. `babel.config.js` now includes `'react-native-worklets/plugin'`. This unblocks both the iOS `ReanimatedMountHook.h` `override` C++ error and the Android `:react-native-reanimated:configureCMakeRelWithDebInfo` prefab error simultaneously.
  See `SUBMIT_GUIDE.md` → "iOS folly/coro build error — RESOLVED" for full diagnostic detail and what to check if regression occurs.
- Version auto-increment is enabled for production builds via `appVersionSource: "remote"` and `autoIncrement: true`.

# External Dependencies

-   **Supabase**: Backend-as-a-service for authentication, database, and real-time features.
-   **Expo**: Cross-platform development framework for routing, notifications, and native modules.
-   **NativeWind**: Integrates Tailwind CSS for styling React Native components.
-   **React Navigation**: Provides navigation libraries.
-   **AsyncStorage**: Used for persistent local storage.
-   **React Native Elements**: UI component library.
-   **Expo Notifications**: Manages push notifications.
-   **Vector Icons**: Provides a library of icons.