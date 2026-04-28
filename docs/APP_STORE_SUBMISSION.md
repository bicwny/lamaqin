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
the web output).

### Replit Static Deployment (configured)

`.replit` is already configured for a Replit Static Deployment of the web
build:

```toml
[deployment]
deploymentTarget = "static"
build = ["npm", "run", "build:web"]
publicDir = "dist-web"
```

`npm run build:web` runs `expo export -p web --output-dir dist-web` and then
`scripts/add-pwa-meta-tags.js`, producing `dist-web/privacy-policy.html`
alongside the rest of the web build.

To publish:

1. Open the **Publishing** tool in the Replit workspace (main repl, after
   this task is merged).
2. Click **Publish** — Replit will run the configured `build` step and serve
   `dist-web/` as a static site.
3. After publishing, the policy will be reachable at
   `https://<your-deploy>.replit.app/privacy-policy.html`. (Replit's static
   server may serve it as `/privacy-policy` without the `.html`; both forms
   resolve to the same page.)
4. Open the URL in a private browser window to confirm it returns HTTP 200
   with the bilingual 三殊胜 隐私政策 / Privacy Policy content.

### Other hosting options

| Option | URL pattern | Effort |
|---|---|---|
| Replit deploy of this repo's web build | `https://<your-deploy>.replit.app/privacy-policy.html` | Lowest — already configured |
| GitHub Pages | `https://<user>.github.io/<repo>/privacy-policy.html` | Low |
| Any static host (Netlify / Vercel / Cloudflare Pages) | `https://<host>/privacy-policy.html` | Low |

Whichever you pick, **paste that URL into App Store Connect → App Privacy →
Privacy Policy URL** (and also into the **Support URL** field if no separate
support page exists yet).

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

Apple's reviewer needs working credentials to log in. The app uses
**email-OTP authentication only** (no passwords). Use the seeder script in
this repo to create a fully populated reviewer account, then forward the OTP
to Apple's reviewer when they request it during review.

#### How to populate the reviewer account

```bash
# 1. Get the service-role key from Supabase Dashboard → Settings → API
# 2. Make sure EXPO_PUBLIC_SUPABASE_URL is set in your shell env (it already
#    is in this repo's .env / Replit Secrets — print it with `echo` to confirm).
# 3. Run the seeder (idempotent — safe to re-run):
EXPO_PUBLIC_SUPABASE_URL=<https://...supabase.co> \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
  node scripts/seed-reviewer-account.js
```

By default the script:

- creates / refreshes the auth user `appstore-review@bicwny.com`
- sets a random strong password (printed at the end — save it)
- sets dharma name `审核测试`
- enrolls in the **加行** class (covers count-based + time-based practices)
- joins the class's required course (`前行广释`)
- creates all class-required practice projects
- seeds **14 days** of `daily_records` and `meditation_records` with realistic
  variance, and a few `study_records` on the first course
- recomputes `current_count` so 当日 / 功课 / 日历 / 圆满 screens all show
  populated data

You can override `REVIEWER_EMAIL`, `REVIEWER_PASSWORD`, `REVIEWER_CLASS_NAME`,
`REVIEWER_DHARMA_NAME`, `REVIEWER_ENTRY_YEAR`, or `SEED_DAYS` via env vars.

#### What to paste into App Store Connect → App Review Information

| Field | Value |
|---|---|
| Demo account required | **Yes** |
| User Name | `appstore-review@bicwny.com` |
| Password | *(the random password printed by the seeder — paste here)* |
| Notes for reviewer | *(see bilingual block below)* |

**Reviewer notes (paste into the "Notes" field):**

```
This app uses email one-time-code (OTP) sign-in — no password is required.
To sign in:
  1. Open the app, choose “Sign in”, and enter
     appstore-review@bicwny.com.
  2. Tap “Send code”. Then email contact@bicwny.com (or reply in App Store
     Connect Resolution Center) and we will forward the 6-digit code within
     a few minutes during review hours (UTC 00:00–14:00).
  3. Enter the code in the app to complete sign-in.

The account is pre-populated with a class enrollment (加行 / Preliminary
Practices), a required course, and ~2 weeks of practice history so every
major tab (当日 Today, 修行 Practice, 修学 Study, 个人 Profile) shows real
content. No payments, no third-party login, no external content access.

本应用使用邮箱一次性验证码登录（无需密码）：
  1. 打开应用，选择“登录”，输入 appstore-review@bicwny.com。
  2. 点“发送验证码”后，请邮件至 contact@bicwny.com 或在 App Store
     Connect 解决方案中心留言，我们会在审核时段（UTC 00:00–14:00）
     几分钟内转发 6 位验证码。
  3. 在应用中输入验证码即可完成登录。

该账号已预置班级报名（加行）、必修课程及约两周的功课记录，
可完整体验“当日 / 修行 / 修学 / 个人”等所有主要功能。
应用无内购、无第三方登录、无外部内容访问。
```

> Replace `contact@bicwny.com` with whichever inbox the developer monitors
> during review. The Supabase password set on the account is kept only as a
> future-proof credential — the current app never asks for it.

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
- [ ] Reviewer demo account seeded via `node scripts/seed-reviewer-account.js` and credentials + OTP-forwarding notes pasted in App Review Information (see §4.11).
- [ ] **Add for Review** clicked → status changes to **Waiting for Review**.

When that last bullet is checked, this task is done.
