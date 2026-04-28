# App Store Connect Submission Pack — 三殊胜 (v1.0.0)

This document is the copy-paste source of truth for filling in the App Store
Connect listing for **三殊胜** (`ascAppId 6764305709`, bundle id
`com.bicwny.sanshusheng`). Every field App Store Connect asks for is
pre-written below. The privacy policy lives at
[`public/privacy-policy.html`](../public/privacy-policy.html) and is hosted
automatically with any web build of the app.

> Done = every red "required" warning in App Store Connect is cleared and
> v1.0.0 reaches **Waiting for Review** (or further).

---

## 0. Where to host the privacy policy

App Store Connect requires a **publicly reachable URL** for the privacy
policy. The HTML file at `public/privacy-policy.html` is shipped as part of
the Expo web build (`expo export -p web` puts everything in `public/` into
the web output). Pick one of these to host it:

| Option | URL pattern | Effort |
|---|---|---|
| Replit deploy of this repo's web build | `https://<your-deploy>.replit.app/privacy-policy.html` | Lowest — already part of the build |
| GitHub Pages | `https://<user>.github.io/<repo>/privacy-policy.html` | Low |
| Any static host (Netlify / Vercel / Cloudflare Pages) | `https://<host>/privacy-policy.html` | Low |

Whichever you pick, **paste that URL into App Store Connect → App Privacy →
Privacy Policy URL**.

---

## 1. App Information

| Field | Value |
|---|---|
| **Name** | 三殊胜 |
| **Subtitle** (≤30 chars) | 佛弟子的每日修行记录工具 |
| **Primary Category** | Lifestyle |
| **Secondary Category** | Education |
| **Content Rights** | "Does your app contain, show, or access third-party content?" → **No** |
| **Age Rating** | 4+ (see questionnaire below) |

### Age Rating questionnaire (all answers = "None")

| Topic | Answer |
|---|---|
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Prolonged Graphic or Sadistic Realistic Violence | None |
| Profanity or Crude Humor | None |
| Mature/Suggestive Themes | None |
| Horror/Fear Themes | None |
| Medical/Treatment Information | None |
| Alcohol, Tobacco, or Drug Use or References | None |
| Simulated Gambling | None |
| Sexual Content and Nudity | None |
| Graphic Sexual Content and Nudity | None |
| Unrestricted Web Access | **No** |
| Gambling and Contests | **No** |
| Made for Kids | **No** (audience is adult practitioners) |

Result: rating **4+**.

---

## 2. Pricing and Availability

| Field | Value |
|---|---|
| **Price** | Free (Tier 0) |
| **Availability** | All territories (or restrict to mainland China + Hong Kong + Taiwan + US if you prefer a smaller initial rollout) |
| **Pre-order** | Off |
| **App Distribution** | Public |

---

## 3. App Privacy

After pasting the privacy policy URL, fill in the **Data Collection**
questionnaire as follows. The answers reflect what the codebase actually does
(Supabase email auth + practice records, no analytics, no ads, no IDFA, no
location/camera/etc.).

### Data Types Collected

| Category | Item | Used for | Linked to user | Tracking |
|---|---|---|---|---|
| **Contact Info** | Email Address | App Functionality (account) | **Yes — linked** | No |
| **User Content** | Other User Content (practice logs, dharma name) | App Functionality | **Yes — linked** | No |
| **Identifiers** | User ID (Supabase auth UUID) | App Functionality | **Yes — linked** | No |

### Data Types NOT Collected

Mark **"No, we do not collect data of this type"** for everything else,
including:
Health & Fitness · Financial Info · Location · Sensitive Info · Contacts ·
Browsing/Search History · Audio/Photos/Videos · Gameplay Content · Diagnostics ·
Usage Data · Purchases · Advertising Data · Other Data Types.

### Tracking

Answer: **"No, we do not track users."** (No advertising / analytics SDKs are
present in the build.)

---

## 4. Version 1.0.0 — Prepare for Submission

### 4.1 Promotional Text (≤170 characters)

```
专为佛弟子打造的修行记录工具：每日功课打卡、课程学习、班级共修进度，一目了然。坚持，从今天开始。
```

### 4.2 Description (≤4000 characters)

```
三殊胜 是一款专为佛弟子设计的修行记录与功课管理工具，帮助您建立稳定的日常修行习惯。

【核心功能】
• 当日功课：自动展示当天所有需要完成的功课，包括计数类（如念诵咒语）与时长类（如禅修打坐）。
• 修行记录：随时记录功课次数、时长、日期与备注，所有数据自动同步。
• 班级共修：加入您所学习的课程班级后，自动获得对应的必修功课与课程教材。
• 课程学习：支持课程章节阅读、进度追踪与复习。
• 圆满统计:  自动汇总修行次数与时长，让您看到自己日积月累的成果。
• 修行日历：以日历视图回顾自己每日的修行轨迹。
• 一键分享：将每日功课记录格式化分享给师友,内含回向文与法名。
• 暂停与恢复：暂时无法兼顾的课程可以暂停,不影响其他班级的进度。
• 法名设置：支持已得法名与未得法名两种使用方式。

【适合人群】
• 系统学习佛法、需要每日打卡的学员
• 希望养成稳定修行习惯的居士
• 参加共修课程、需要提交功课记录的同修

【关于隐私】
本应用不投放广告、不接入任何分析 SDK，您的修行记录仅用于您本人查阅与同步。

愿一切众生离苦得乐,究竟成佛。

—— English ——

Sanshusheng (三殊胜) is a daily practice tracker built for Buddhist
practitioners. Log count-based practices (like mantra recitation) and
time-based practices (like meditation), enroll in study classes, follow
required courses, review your practice calendar, and share daily summaries
with your dharma friends — all in one place. No ads, no tracking.
```

### 4.3 Keywords (≤100 characters, comma-separated)

```
佛教,修行,功课,念诵,禅修,打坐,持咒,共修,佛学,Buddhist,meditation,mantra,practice
```

### 4.4 Support URL (required)

If you don't have a support site yet, the simplest approach is a `mailto:`
landing page or a single-page repo. Recommended placeholder until you set up
something nicer:

```
https://github.com/bicwny/sanshusheng-support
```

…or just point it to the same host as the privacy policy:
`https://<your-host>/support.html`. (You can copy `public/privacy-policy.html`
as a starting template.)

### 4.5 Marketing URL (optional)

Leave blank, or reuse the support URL.

### 4.6 What's New in This Version

```
首次发布 1.0.0：
• 每日功课与修行记录
• 班级共修与课程学习
• 修行日历与圆满统计
• 一键生成每日修行分享
```

### 4.7 App Icon

Already embedded in the build via `assets/icon.png` (1024×1024). No upload
needed in App Store Connect.

### 4.8 Screenshots — what you must upload

Apple currently requires screenshots for the **two largest device classes**;
all smaller sizes are auto-derived from these.

| Device class | Resolution (portrait) | Source |
|---|---|---|
| **6.9" iPhone** (iPhone 16 Pro Max / 17 Pro Max) | 1320 × 2868 px | iOS Simulator → "iPhone 16 Pro Max" |
| **13" iPad** (iPad Pro M4 13") | 2064 × 2752 px | iOS Simulator → "iPad Pro 13-inch (M4)" |

Upload **at least 3, ideally 5–10** screenshots per class. Suggested screens
to capture (route → what to show):

1. `/(tabs)` 当日 tab — daily practices list, ideally with 2–3 active items.
2. `/(tabs)/practice` 功课 sub-tab — list of practice projects with progress bars.
3. `/(tabs)/practice` 日历 sub-tab — calendar view with several logged days.
4. `/(tabs)/study` — study tab with an enrolled class.
5. `/practice-history` 圆满 / 日志 tab — completion / journal view.
6. (Optional) `/profile` — profile with dharma name set.

How to capture (Mac with Xcode):

```bash
# Build a release web/native bundle, then run in simulator:
open -a Simulator
xcrun simctl boot "iPhone 16 Pro Max"
# launch the app in the simulator, navigate to the screen you want, then:
xcrun simctl io booted screenshot ~/Desktop/sanshusheng-iphone-1.png
# Repeat for iPad:
xcrun simctl boot "iPad Pro 13-inch (M4)"
xcrun simctl io booted screenshot ~/Desktop/sanshusheng-ipad-1.png
```

(If you don't have a Mac handy, EAS can also produce screenshots via a
cloud simulator session, or you can run the app on a physical device and
use the iOS screenshot shortcut.)

### 4.9 Build

In the **Build** section of v1.0.0, pick the production build that comes
out of the upcoming "Run a real iOS production build and confirm it uploads
to TestFlight" task. Until that build is uploaded, this section will stay
empty — that's expected; you can fill in everything else above first.

### 4.10 Copyright

```
2026 三殊胜
```

### 4.11 Sign-In Information for Reviewers

Apple's reviewer needs working credentials to log in. Create a dedicated
demo account in your Supabase project (e.g.
`appstore-review@bicwny.com` / a strong password you write down) with one
class enrolled and a couple of practice records pre-seeded so the reviewer
can see real content.

| Field | Value |
|---|---|
| Demo account required | **Yes** |
| User Name | `appstore-review@bicwny.com` |
| Password | *(set in Supabase, paste here)* |
| Notes for reviewer | "请使用上述账号登录，应用为佛弟子日常修行记录工具，所有功能可在登录后体验。This app is a daily practice tracker for Buddhist practitioners; all features are accessible after sign-in with the credentials above. No payments, no third-party login required." |

### 4.12 Export Compliance

Already handled by `app.json` → `ios.infoPlist.ITSAppUsesNonExemptEncryption: false`.
App Store Connect will not ask again at upload time.

---

## 5. Submit for Review — final checklist

Tick each item before clicking **Add for Review**:

- [ ] App Information section: category, content rights, age rating all green.
- [ ] Pricing and Availability saved.
- [ ] App Privacy: privacy policy URL set, data questionnaire submitted, tracking = No.
- [ ] v1.0.0 Promotional Text, Description, Keywords filled in.
- [ ] Support URL is reachable (open it in a private browser window to verify).
- [ ] Privacy policy URL is reachable.
- [ ] Screenshots uploaded for 6.9" iPhone and 13" iPad.
- [ ] "What's New in This Version" filled in.
- [ ] Build attached (after the production build is uploaded).
- [ ] Copyright filled in.
- [ ] Reviewer demo account created in Supabase and credentials pasted in App Review Information.
- [ ] **Add for Review** clicked → status changes to **Waiting for Review**.

When that last bullet is checked, this task is done.
