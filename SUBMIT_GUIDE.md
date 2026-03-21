# App Store & Google Play Submission Guide

This guide explains how to fill in the `eas.json` submit section and publish your app.

---

## iOS (Apple App Store)

In `eas.json` → `submit.production.ios`, replace the placeholder values:

| Field | Where to find it |
|-------|-----------------|
| `appleId` | Your Apple ID email (the one you use to sign in to App Store Connect) |
| `ascAppId` | Go to [App Store Connect](https://appstoreconnect.apple.com) → Your App → General → App Information → Apple ID (a numeric ID like `1234567890`) |
| `appleTeamId` | Go to [Apple Developer Portal](https://developer.apple.com/account) → Membership Details → Team ID (a 10-character string like `ABCDE12345`) |

### Prerequisites
- An active [Apple Developer Program](https://developer.apple.com/programs/) membership ($99/year)
- An app record created in App Store Connect with a matching bundle identifier: `com.bicwny.sanshusheng`

### Submit command
```bash
eas submit --platform ios --profile production
```

---

## Android (Google Play Store)

In `eas.json` → `submit.production.android`, replace the placeholder values:

| Field | Where to find it |
|-------|-----------------|
| `serviceAccountKeyPath` | Path to your Google Play service account JSON key file (relative to project root) |
| `track` | The release track: `production`, `beta`, `alpha`, or `internal` (default: `production`) |

### How to create a Google Play service account key
1. Go to [Google Play Console](https://play.google.com/console) → Setup → API access
2. Link your Google Cloud project (or create one)
3. Create a new service account with "Service Account User" role
4. In Google Cloud Console, create a JSON key for that service account
5. Download the JSON key file and place it in your project (e.g., `./google-play-service-account.json`)
6. Back in Google Play Console, grant the service account "Release manager" permissions
7. Update `serviceAccountKeyPath` in `eas.json` to point to your key file

### Prerequisites
- A [Google Play Developer account](https://play.google.com/console) ($25 one-time fee)
- An app created in Google Play Console with matching package name: `com.bicwny.sanshusheng`

### Submit command
```bash
eas submit --platform android --profile production
```

---

## Building before submission

Before submitting, you need a successful production build:

```bash
# Build for both platforms
eas build --platform all --profile production

# Or build individually
eas build --platform ios --profile production
eas build --platform android --profile production
```

Make sure the EAS environment variables `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set in your EAS project secrets at https://expo.dev.

---

## Version management

Version auto-increment is enabled (`autoIncrement: true` in the production build profile). EAS will automatically bump the build number for each new build. The app version (`1.0.0`) is set in `app.json` and should be manually updated for major/minor releases.
