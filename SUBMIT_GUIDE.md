# App Store & Google Play Submission Guide

This guide explains how to fill in the `eas.json` submit section and publish your app.

---

## iOS (Apple App Store)

`eas.json` → `submit.production.ios` is fully configured:

| Field | Current value | Where it came from |
|-------|---------------|-----------------|
| `appleId` | `fob.design@gmail.com` | Apple ID used to sign in to App Store Connect |
| `ascAppId` | `6764305709` | App Store Connect → 三殊胜 → General → App Information → Apple ID |
| `appleTeamId` | `XCS8NXLU3K` | Apple Developer Portal → Membership Details → Team ID |

### Prerequisites (already satisfied)
- Active [Apple Developer Program](https://developer.apple.com/programs/) membership under team `XCS8NXLU3K`.
- App record exists in App Store Connect for bundle id `com.bicwny.sanshusheng` (ascAppId `6764305709`).

### App Store listing content (required before review)
The App Store Connect listing for 三殊胜 needs categories, age rating,
privacy policy URL, description, keywords, screenshots, etc. before Apple
will accept a build for review. All of that copy is pre-written in
[`docs/APP_STORE_SUBMISSION.md`](./docs/APP_STORE_SUBMISSION.md), and a
ready-to-host privacy policy ships with the web build at
[`public/privacy-policy.html`](./public/privacy-policy.html).

### Submit command
```bash
eas submit --platform ios --profile production
```

---

## Android (Google Play Store)

`eas.json` → `submit.production.android` is wired up to read the service
account key from `./google-play-service-account.json` (project root). That
filename is already in `.gitignore`, so once you drop the real key in place it
will not be committed.

| Field | Current value | What it means |
|-------|---------------|---------------|
| `serviceAccountKeyPath` | `./google-play-service-account.json` | Where EAS reads the JSON key from. Just place the file at this path. |
| `track` | `production` | Release track: `production`, `beta`, `alpha`, or `internal`. |

### What you need to do once (manual, ~15 min)

These steps require a real Google account and a $25 payment, so they cannot be
automated from this repo.

1. **Create a Google Play Developer account** at
   <https://play.google.com/console> ($25 one-time fee). Skip if you already
   have one.
2. **Create an app entry** in Play Console with package name
   `com.bicwny.sanshusheng` (must match `app.json` `android.package`).
3. **Link a Google Cloud project**: Play Console → Setup → API access → "Link
   project". Create a new GCP project if you don't have one.
4. **Create a service account** in that GCP project (IAM & Admin → Service
   Accounts → Create). Give it the role **Service Account User**. No need to
   grant it any GCP project permissions beyond that.
5. **Create a JSON key** for the service account (Service Account → Keys →
   Add Key → Create new key → JSON). A `.json` file will download.
6. **Grant Play Console access**: back in Play Console → Setup → API access,
   find the service account in the list and click "Grant access". Give it
   **Release manager** (or **Admin (all permissions)**) for this app.
7. **Drop the JSON key into the project** at exactly this path:

   ```
   ./google-play-service-account.json
   ```

   (`.gitignore` already excludes `google-play-service-account*.json`, so the
   secret stays out of git. Do **not** rename it unless you also update
   `eas.json`.)

### Verify it works

```bash
# 1. Confirm the file is there and gitignored
ls -l google-play-service-account.json
git check-ignore -v google-play-service-account.json   # should print the rule

# 2. Build a production .aab
eas build --platform android --profile production

# 3. Submit it
eas submit --platform android --profile production
```

The first `eas submit` after setup will also ask you to upload an initial
manual release through the Play Console UI (Google requires a human to publish
the very first version of an app). Subsequent submissions will be fully
automated.

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

---

## iOS folly/coro build error — RESOLVED (verified 2026-04-28)

> **✅ Status: FIXED.** Both iOS `.ipa` and Android `.apk` preview builds now succeed end-to-end on EAS. iOS build `816c6dba-7ae5-4f88-85b9-d8d052247cba` produced `https://expo.dev/artifacts/eas/gYWFqKGKtHDtn4wrraTPPh.ipa`. Android build `f06c3e39-8fd6-4168-bc53-1d137486417d` produced `https://expo.dev/artifacts/eas/vFVTZPeA4J3Jw4a3JpRXbD.apk`.

### What the fix is

Two pieces work together:

**1. Build RN folly from source AND disable folly coroutines via a config plugin.**
- `app.json` (`expo-build-properties` plugin, ios): `"buildReactNativeFromSource": true`, `"deploymentTarget": "15.1"`, `"useFrameworks": "static"`.
- `eas.json` `preview.env` and `production.env`: `"RCT_USE_PREBUILT_RNCORE": "0"`.
- `plugins/withFollyCoroFix.js` (registered in `app.json` plugins array): a `withDangerousMod` plugin that injects a Ruby block at the end of the Podfile `post_install` that adds `FOLLY_CFG_NO_COROUTINES=1` to `GCC_PREPROCESSOR_DEFINITIONS` for every Pod target. This is the knob folly's own `Portability.h` checks **before** auto-detecting C++20 coroutines, so it correctly turns off the `#include <folly/coro/Coroutine.h>` branch in `folly/Expected.h:1587`. (`FOLLY_HAS_COROUTINES=0` alone does NOT work — folly's `Portability.h:635` unconditionally redefines it.)

**2. Upgrade `react-native-reanimated` to v4 for RN 0.81 compatibility.**
- `package.json`: `react-native-reanimated@~4.1.0` (was `~3.15.5`), added `react-native-worklets@0.5.1` peer dep.
- Removed `expo.install.exclude` for reanimated and bumped the `overrides` entry.
- `babel.config.js`: re-added `'react-native-worklets/plugin'` (Reanimated v4 requires it).
- This also resolves the Android `:react-native-reanimated:configureCMakeRelWithDebInfo` prefab failure that was blocking the `.apk`.

### Why earlier attempts failed

- `RCT_USE_PREBUILT_RNCORE=0` + `buildReactNativeFromSource: true` correctly switched the build to source folly, but the source folly has the same `<folly/coro/Coroutine.h>` include that doesn't ship with the Pod.
- A first plugin attempt set `FOLLY_HAS_COROUTINES=0` directly. The compile log showed the define landed (`<command line>:4: #define FOLLY_HAS_COROUTINES 0`), but `RCT-Folly/folly/Portability.h:635` then unconditionally redefined it back to `1` — so the include was still pulled.
- The correct knob is `FOLLY_CFG_NO_COROUTINES=1`, which folly checks **before** the auto-detect block.

### What to do if the issue ever returns

1. Verify the plugin actually injected by inspecting the EAS Xcode log for `-DFOLLY_CFG_NO_COROUTINES\=1` in the compiler invocations (should appear hundreds of times across Pod targets).
2. Verify the source-build path is in effect (`Installing RCT-Folly (2024.11.18.00)` in the `INSTALL_PODS` phase). If you see `ReactNativeDependencies` being downloaded as a prebuilt artifact instead, `RCT_USE_PREBUILT_RNCORE=0` was not honored.
3. If folly upstream changes the gating macro again, look for the most recent `#define FOLLY_HAS_COROUTINES` in `node_modules/react-native/third-party-podspecs/RCT-Folly.podspec.json`-referenced source and adjust `plugins/withFollyCoroFix.js` accordingly.
