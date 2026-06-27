# مستندات پروژه — Shekan Launcher (بخاریز / x100)

> یک **لانچر گیمینگ دسکتاپ** مبتنی بر Electron با رابط کاربری فارسی (RTL).
> این سند به‌صورت خودکار از روی کد منبع تولید شده و معماری، صفحات، کامپوننت‌ها و منطق برنامه را شرح می‌دهد.

---

## فهرست

1. [معرفی کلی](#۱-معرفی-کلی)
2. [پشته فنی و ساختار پوشه‌ها](#۲-پشته-فنی-و-ساختار-پوشهها)
3. [لایه Electron (پروسه اصلی)](#۳-لایه-electron-پروسه-اصلی)
4. [رندرر — لانچر اصلی](#۴-رندرر--لانچر-اصلی)
5. [پنل ادمین](#۵-پنل-ادمین)
6. [سیستم طراحی و CSS](#۶-سیستم-طراحی-و-css)
7. [مدیریت داده و State](#۷-مدیریت-داده-و-state)
8. [اجرا و ساخت خروجی](#۸-اجرا-و-ساخت-خروجی)
9. [قراردادها و نکات](#۹-قراردادها-و-نکات)

---

## ۱. معرفی کلی

**Shekan Launcher** (با نام محصول «بخاریز») یک لانچر گیمینگ دسکتاپ است که به‌عنوان نمونه اولیه تجربه کاربری (UX Prototype) ساخته شده. این برنامه یک هاب متمرکز برای گیمرها فراهم می‌کند:

- 🎮 کشف، نصب و مدیریت بازی‌ها
- 👥 امکانات اجتماعی (دوستان، پیام مستقیم، کامیونیتی، شبکه اجتماعی)
- 🏆 میزبانی تورنومنت و مدیریت تیم
- 🌐 بهینه‌سازی شبکه / تحریم‌شکن (Shecan)
- 📺 استریم زنده و Matchmaking بازیکنان
- 👤 مدیریت پروفایل و حساب کاربری

پروژه از دو بخش مجزا تشکیل شده:

| بخش | مسیر | توضیح |
|-----|------|-------|
| **رندرر (Renderer)** | `renderer/` | رابط اصلی لانچر که به کاربر نهایی نمایش داده می‌شود |
| **پنل ادمین (Admin)** | `admin/` | داشبورد مدیریتی برای مدیریت محتوا، کاربران، بنرها و... |

> ⚠️ کل برنامه با **داده‌های ساختگی (Mock)** کار می‌کند و در حال حاضر هیچ API بک‌اند یا پایگاه داده واقعی ندارد. تمام تعاملات شبیه‌سازی شده‌اند.

---

## ۲. پشته فنی و ساختار پوشه‌ها

**پشته فنی:** Electron + Vanilla JavaScript + HTML + CSS (بدون فریم‌ورک، بدون مرحله build برای کد فرانت).

```
DashboardPanel_X100/
├── main.js                  # پروسه اصلی Electron (پنجره، IPC)
├── preload.js               # پل امن بین رندرر و پروسه اصلی (contextBridge)
├── package.json             # وابستگی‌ها و پیکربندی electron-builder
│
├── renderer/                # ── لانچر اصلی ──
│   ├── index.html           # ساختار DOM همه صفحات و مودال‌ها (۲۸۹۱ خط)
│   ├── scripts/
│   │   ├── app.js           # کل منطق برنامه (۳۸۰۹ خط)
│   │   └── data.js          # داده ساختگی: window.AppData (۵۱۴ خط)
│   └── styles/
│       ├── tokens.css       # توکن‌های طراحی (متغیرهای CSS)
│       ├── base.css         # ریست‌ها، فونت، اسکرول‌بار، RTL
│       ├── layout.css       # چیدمان (هدر، سایدبار، گرید)
│       └── components.css    # کامپوننت‌های قابل‌استفاده مجدد
│
├── admin/                   # ── پنل ادمین ──
│   ├── index.html           # ساختار DOM پنل ادمین (۶۶۰ خط)
│   ├── scripts/admin.js     # منطق پنل ادمین (۲۱۱۵ خط)
│   └── styles/admin.css     # استایل پنل ادمین (۱۰۴۰ خط)
│
├── add_community.py         # اسکریپت کمکی پایتون (تولید/درج محتوا)
└── update_appjs.py          # اسکریپت کمکی پایتون
```

---

## ۳. لایه Electron (پروسه اصلی)

### `main.js`
پروسه اصلی Electron که پنجره برنامه را می‌سازد:

- **پنجره بدون فریم** (`frame: false`, `titleBarStyle: 'hidden'`) با کنترل‌های سفارشی پنجره.
- ابعاد: `1440×900` (حداقل `1100×700`)، رنگ پس‌زمینه `#131316`.
- امنیت: `contextIsolation: true` و `nodeIntegration: false`.
- فایل `renderer/index.html` را بارگذاری می‌کند.
- مدیریت رویدادهای پنجره از طریق **IPC**:
  - `window:minimize` → کوچک‌کردن
  - `window:toggle-maximize` → تمام‌صفحه/بازگشت
  - `window:close` → بستن
  - ارسال `window:maximized` به رندرر هنگام تغییر وضعیت maximize.

### `preload.js`
با استفاده از `contextBridge` یک API امن به نام `window.windowAPI` در اختیار رندرر می‌گذارد:

```js
window.windowAPI = {
  minimize(),
  toggleMaximize(),
  close(),
  onMaximizeChange(callback)
}
```

---

## ۴. رندرر — لانچر اصلی

رندرر یک **اپلیکیشن تک‌صفحه‌ای (SPA)** است که جابه‌جایی بین صفحات با تغییر کلاس `.page--active` انجام می‌شود.

### ۴.۱ صفحات و مسیریابی

ناوبری با تابع `showPage(pageName)` و آبجکت `ROUTES` انجام می‌شود؛ آیتم‌های سایدبار از `data-route` و دکمه‌های هدر مستقیماً صفحه را عوض می‌کنند.

| شناسه صفحه (`data-page`) | عنوان | توضیح |
|---|---|---|
| `home` | خانه | داشبورد: بنر Hero، بازی‌های در حال ادامه، فروشگاه، تورنومنت‌ها، استریم‌ها، لیدربورد |
| `games` | بازی‌ها | کتابخانه بازی با فیلتر/جستجو، بنر featured، بخش‌های My Games/Top/Newest/Dedicated |
| `game-detail` | جزئیات بازی | اسکرین‌شات، متادیتا، تب‌ها (درباره، فروشگاه، تورنومنت، کامیونیتی، استریم) |
| `connection` | اتصال | تست شبکه، سرویس تحریم‌شکن (Shecan)، پلن‌های اشتراک |
| `tournaments` | تورنومنت | کاروسل featured، تورنومنت‌های رسمی/کاربری، مسابقات زنده، مدیریت تیم |
| `downloads` | دانلودها | مدیریت دانلود: فعال، در صف، نصب‌شده با نوار پیشرفت |
| `profile` | پروفایل | آواتار، نیک‌نیم، سن، جنسیت، تنظیم رمز عبور |
| `community` | دورهمی گیمرها | فید پست‌ها + سیستم کانال شبیه Discord + جستجوی کامیونیتی |
| `placeholder` | (فروشگاه/استریمینگ/تنظیمات) | صفحات در دست ساخت |

**مکانیزم ناوبری:**
- سایدبار: `#sidebar-nav` با `.nav-item[data-route]` و وضعیت فعال `.nav-item--active`.
- دکمه‌های هدر: `#hdr-downloads-btn`، `#hdr-connection-btn`، `#hdr-avatar-btn`.
- زیرتب‌های کامیونیتی با `data-commtab` (مقادیر `community` یا `posts`).

### ۴.۲ ساختار `app.js` بر اساس حوزه ویژگی

#### بوت و هسته
- `initWindowControls()` — اتصال دکمه‌های پنجره به IPC.
- `initSidebar()` — ناوبری و مدیریت وضعیت فعال.
- `ROUTES` + `showPage(pageName)` — نگاشت مسیر به صفحه و نمایش آن.
- هندلر `DOMContentLoaded` — توالی اصلی راه‌اندازی همه ماژول‌ها.

#### صفحه خانه و بنر Hero
- `initHeroThumbs()` — بنر Hero با چرخش خودکار هر **۵ ثانیه** و انتخابگر تصویر بندانگشتی (داده‌محور با `data-title`/`data-subtitle`/`data-desc`/`data-cta`).
- `renderContinueGames()`، `renderStreams()`/`renderStreamCard()`، `renderTournaments(filter)`، `renderMatchmaking()`، `renderLeaderboard()`.
- `initTabs(containerSel, onChange)` — سیستم تب چیپی (`.chip` با `data-tab`).

#### صفحه بازی‌ها
- State: `gamesState = { search, genre, connection, subscription }`.
- بنر featured: `initFeaturedBanner()` / `renderFeaturedBanner()`.
- فیلترها: `renderDropdowns()`، `initDropdowns()`، `updateClearFiltersBtn()`، `clearAllFilters()`.
- کتابخانه: `renderGameSections()`، `renderSectionRow()`، `renderMyGamesSection()`، `renderGames()`، `initGamesSearch()`.

#### صفحه جزئیات بازی
- State: `gdState = { idx, game }`.
- `showGameDetail(gameName)` رندر اصلی؛ به‌همراه `gdFindByName()`، `gdRenderThumbs()`، `gdUpdateViewer()`، `resetGdTabs()`.
- `gdRefreshCTA()` — دکمه‌های Play/Install/Pause/Uninstall بر اساس `gameInstallStates[game.id]`.
- `addGameClickListeners()` (در `window._refreshGameClicks`) — اتصال کلیک همه کارت‌های بازی به صفحه جزئیات.

#### صفحه اتصال (Shecan / تحریم‌شکن)
- `initConnectionPage()`، `setShecanState(on)`، `renderSubscription()`، `initSubscription()`.
- وضعیت سرویس در `currentTier` (free/bronze/silver/gold) و `shecanOn`.
- تست شبکه با انیمیشن گیج SVG (دکمه `#conn-start-test`).

#### تورنومنت‌ها و تیم‌ها
- داده‌ها: `TOURNAMENTS`، `TOUR_STATUS`، `TOUR_HERO`، `LIVE_MATCHES`، `tbTeams`، `registeredTours` (Set).
- پین‌ها با `data-tpane`: `matches` / `all` / `team`.
- کاروسل: `initTourHero()`؛ رندر کارت: `tourCardHTML()`، `renderRails()`، `renderAllList()`.
- جزئیات/ثبت‌نام: `openTourDetail(tid)`، `joinTour(tid)`.
- تیم‌بیلدر: `initTeamBuilder()`، `renderTeams()`، `teamAccordionHTML()`، `openFriendPicker()`، `openIncomingPopup()`، `openSentPopup()`، `openHistoryPopup()`، `renderMyTeam()`.

#### دانلودها
- State: `dlState = { active, queue, installed }`.
- شبیه‌سازی پیشرفت با `_dlInterval` (تیک هر ۲ ثانیه).
- رندر: `dlRenderActive()`، `dlRenderQueue()`، `dlRenderInstalled()`، `dlStartFromQueue()`.

#### پروفایل و احراز هویت
- `initProfilePage()` — آپلود آواتار، ویرایش نیک‌نیم (به‌صورت پیش‌فرض قفل)، سن/جنسیت، ذخیره. نیک‌نیم در `localStorage` با کلید `'shekan_nickname'` ذخیره می‌شود.
- `initSetPassword()` — مودال تنظیم/تغییر رمز با اعتبارسنجی قدرت رمز و کد تأیید.
- **ورود OTP:** `initOtpLogin()` — جریان سه‌مرحله‌ای (شماره تلفن → رمز یا کد OTP)، فیلدهای رقمی با پیشروی خودکار، تایمر ۳۰ ثانیه و دکمه ارسال مجدد.
- **برش آواتار:** `initAvatarCropper()` — برش دایره‌ای با Pan/Zoom و خروجی `512×512` JPEG.

#### پنل دوستان و کامیونیتی
- `initFriendsPanel()` — پنل کشویی دوستان با تب‌های Online/All/Pending/Add و پیام مستقیم (`dmHistory`).
- `initCommunityPage()` — بزرگ‌ترین ماژول؛ شامل:
  - سیستم سرور/کانال شبیه Discord (`.dsc-server[data-server]`، `.dsc-ch[data-ch]`).
  - جستجو و عضویت در کامیونیتی (`communitiesDB`، overlay جستجو، `joinState`).
  - درخواست‌های عضویت (`incomingReqs`/`outgoingReqs`).
  - فید پست‌ها (`.posts-nav-item`، کاربران پیشنهادی، لایک/دیسلایک/کامنت، پخش ویدیو).

#### ابزارها
- `faNum(s)` — تبدیل ارقام انگلیسی به فارسی (۰–۹).
- `parseOnlineCount(str)` — تبدیل «1M»/«500K» به عدد.

### ۴.۳ صفحه اولیه (Splash) و ورود
- صفحه ورود OTP در `#otp-screen` با مراحل `#otp-step-phone`/`#otp-step-pass`/`#otp-step-code`.
- اسپلش `#app-splash` با انیمیشن beam که پس از ورود موفق حذف می‌شود.

---

## ۵. پنل ادمین

پنل ادمین یک داشبورد مدیریتی فارسی (RTL) با Vanilla JS است که به‌عنوان هاب مرکزی مدیریت محتوا و پیکربندی لانچر عمل می‌کند. ابتدا صفحه ورود (`#login-screen`) نمایش داده می‌شود و پس از ورود `#admin-app` نمایان می‌گردد.

### ۵.۱ بخش‌ها و ناوبری

سایدبار چپ با آیتم‌های والد قابل‌جمع‌شدن و زیرآیتم‌ها. جابه‌جایی با کلاس `.admin-view--active` و آبجکت `VIEW_TITLE` انجام می‌شود.

| نمای (`data-view`) | عنوان | توضیح |
|---|---|---|
| `overview` | داشبورد | آمار سیستم، تعداد کاربران/بازی‌ها، مجموع سکه، کاربران اخیر |
| `users` | کاربران | دو زیرتب: `list` (لیست کاربران) و `avatars` (تأیید عکس با ورنیک هوش مصنوعی) |
| `games` | انتشار بازی | فرم تعریف بازی + لیست با فیلتر ژانر/اشتراک |
| `launcher` | لانچر | آپلود نسخه و چنج‌لاگ، تاریخچه نسخه‌ها |
| `servers` | سرورها | افزودن/مانیتور سرور با LED وضعیت بلادرنگ |
| `transactions` | تراکنش | تنظیمات پاداش سکه (اکروال در دقیقه، سقف روزانه) و لاگ تراکنش |
| `publish` | انتشار محتوا | سه زیربخش: `home` (ویرایشگر بنر خانه)، `game` (بنر بازی)، `notif` (انتشار پیام) |

### ۵.۲ ساختار `admin.js` بر اساس ماژول

| ماژول | توابع کلیدی |
|---|---|
| **بوت** | `initLogin()`، `initNav()`، `bootDashboard()` |
| **داشبورد** | `renderOverview()` |
| **کاربران** | `initUsers()`، `renderUsers()`، `openUserModal(uid)`، `closeUserModal()` |
| **تأیید آواتار** | `initAvatarReviews()`، `renderAvatarReviews()`، `runAiVerdict()` (شبیه‌سازی امتیاز هوش مصنوعی) |
| **بازی‌ها** | `initGames()`، `renderGames()`، `resetGameForm()`، `renderDraftMedia()` |
| **لانچر** | `initLauncher()`، `renderLaunchers()`، `fmtSize(bytes)` |
| **سرورها** | `initServers()`، `renderServers()` |
| **بنر خانه** | `initHomeBanners()`، `renderHomeBanners()`، `bindBannerCard()`، `bannerCardHTML()` |
| **بنر بازی** | `initGameBanners()`، `renderGameBanners()`، `gbShotsHTML()` |
| **انتشار/نوتیف** | `initPublish()`، `setPubTarget()`، `initNotif()`، `renderNotifications()`، `openNotifPreview()`، `confirmNotifSend()` |
| **سکه** | `initCoins()`، `renderCoinTx()`، `computeSessionCoins(minutes)` |

### ۵.۳ ویژگی‌های شاخص

- **ویرایشگر بنر خانه (WYSIWYG + Drag & Drop):** ۳ تا ۷ بنر، مرتب‌سازی با کشیدن (`.bnr-card--dragging`/`--dragover`)، پیش‌نمایش زنده با فیلدهای `contenteditable`، انتخاب اکشن دکمه (لینک به بازی/URL).
- **بنر بازی:** چک‌باکس چند ژانره، تاگل رایگان/قیمت، ۳ تا ۶ اسکرین‌شات.
- **سیستم نوتیفیکیشن:** عمومی/خصوصی، زمان‌بندی ارسال، مودال پیش‌نمایش و ویرایش، فیلتر تاریخچه بر اساس زمان/نوع/تگ.
- **تأیید آواتار با هوش مصنوعی (شبیه‌سازی):** وضعیت‌های suspicious/reported/approved/rejected و بَج شمارنده در سایدبار.
- **سیستم پاداش سکه:** فرمول «هر X دقیقه = Y سکه + پایه Z» با سقف روزانه و شبیه‌سازی session.

### ۵.۴ مودال‌ها
`#user-modal` (جزئیات کاربر)، `#notif-preview-modal` (تأیید پیش از ارسال)، `#notif-edit-modal` (ویرایش نوتیف).

---

## ۶. سیستم طراحی و CSS

### ۶.۱ معماری چهارفایلی
استایل رندرر به چهار فایل تخصصی تقسیم شده و به‌ترتیب در `index.html` ایمپورت می‌شوند:

| فایل | مسئولیت |
|---|---|
| `tokens.css` | توکن‌های طراحی (متغیرهای CSS در `:root`) |
| `base.css` | ریست سراسری، فونت، اسکرول‌بار، جهت RTL، انیمیشن‌های پایه |
| `layout.css` | پوسته اپ: هدر ثابت، سایدبار، گریدها، نواحی صفحه |
| `components.css` | کامپوننت‌های قابل‌استفاده مجدد (کارت، دکمه، مودال، بنر، بَج و...) |

### ۶.۲ توکن‌های طراحی کلیدی (`tokens.css`)
طرح «Cyber-Tactical»، تم تیره با اکسنت فیروزه‌ای:

```css
/* سطوح / پس‌زمینه */
--color-surface: #131316;        --color-background: #131316;
--color-surface-container: #1f1f22;

/* متن */
--color-on-surface: #e4e1e6;     --color-on-surface-variant: #aec3c8;

/* اصلی (فیروزه‌ای) */
--color-primary: #00bcd4;        --color-primary-container: #0097a7;

/* ثانویه (سبز) و سوم (آبی الکتریک) */
--color-secondary-fixed: #4ade80;  --color-tertiary: #00daf8;

/* تایپوگرافی */
--font-sans: 'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Cascadia Code', Consolas, monospace;
--fs-display-lg: 48px; ... --fs-micro: 10px;

/* فاصله‌گذاری (پایه ۴px) */
--space-1: 4px; ... --space-24: 96px;

/* چیدمان */
--sidebar-width: 280px;  --header-height: 80px;  --gutter: 24px;

/* شعاع، سایه، نور، موشن */
--radius-md: 0.5rem; ... --radius-full: 9999px;
--glow-primary: 0 0 15px rgba(0,188,212,.5);
--ease-out: cubic-bezier(0.16,1,0.3,1);  --dur-base: 250ms;
```

### ۶.۳ پایه (`base.css`)
- ریست سراسری (`box-sizing: border-box`)، `body { direction: rtl; user-select: none; }`.
- اسکرول‌بار باریک ۶px با هاور فیروزه‌ای؛ رنگ Selection فیروزه‌ای شفاف.
- آیکن‌ها با فونت **Material Symbols Outlined** و `direction: ltr`.
- انیمیشن‌ها: `pulse-red`، `pulse-dot`، `fade-in-up`، `spin`.

### ۶.۴ چیدمان (`layout.css`)
- `.app-header` — هدر ثابت بالا با Glass (blur 20px)، ارتفاع ۸۰px، قابل‌درگ (`-webkit-app-region: drag`).
- `.app-sidebar` — سایدبار ثابت سمت **راست** (به‌خاطر RTL)، عرض ۲۸۰px.
- چیدمان کامیونیتی شبیه Discord (`.dsc-servers`، `.dsc-channels`، `.comm-feed`).
- گریدهای صفحه اتصال (`.conn-grid-top`، `.net-test`، `.gauge`).

### ۶.۵ کامپوننت‌ها (`components.css`)
دکمه‌ها (`.btn--primary/success/danger/ghost/lg/icon`)، چیپ/تب (`.chip`)، بَج (`.badge--live-pulse`)، کارت بازی (`.game-card`، `.game-tile`)، کارت‌های فروشگاه/استریم/تورنومنت/مَچ، لیدربورد (`.podium`)، Hero، بنر فروشگاه، گریدها، و کلاس‌های کمکی فلکس (`.flex`, `.gap-*`, `.items-center` و...).

### ۶.۶ فونت‌ها
از Google Fonts بارگذاری می‌شوند:
- **IBM Plex Sans** (وزن ۴۰۰–۷۰۰) — متن اصلی UI.
- **JetBrains Mono** (وزن ۵۰۰) — متن مونواسپیس/فنی.
- **Material Symbols Outlined** — آیکن‌ها (فونت متغیر).

---

## ۷. مدیریت داده و State

- **منبع داده:** `window.AppData` در `renderer/scripts/data.js` (لیست بازی‌ها، استریم‌ها، تورنومنت‌ها، فیلترها، بازی‌های featured و...).
- **State سمت کلاینت** در متغیرهای ماژول: `gamesState`، `dlState`، `gdState`، `gameInstallStates`، `currentTier`، `shecanOn`، `dmHistory`، `joinState`، `registeredTours`، `tbTeams` و...
- **persist واقعی فقط برای پروفایل:** `localStorage['shekan_nickname']`.
- **پنل ادمین** کاملاً **in-memory** است (`USERS`, `GAMES`, `LAUNCHERS`, `SERVERS`, `homeBanners`, `gameBanners`, `NOTIFICATIONS`, `COIN_SETTINGS`, ...). با ریلود صفحه، داده‌ها به مقادیر mock بازمی‌گردند.
- **IPC:** ارتباط با پروسه اصلی تنها از طریق `window.windowAPI` (کنترل پنجره).

---

## ۸. اجرا و ساخت خروجی

اسکریپت‌های موجود در `package.json`:

```bash
npm start            # اجرای برنامه با Electron
npm run dev          # اجرا با حالت inspect (دیباگ)
npm run pack         # بسته‌بندی بدون installer (--dir)
npm run dist         # ساخت خروجی کامل با electron-builder
npm run dist:portable  # خروجی پرتابل ویندوز
npm run dist:installer # خروجی نصب‌کننده NSIS
```

**پیکربندی electron-builder:** `appId: com.shekan.launcher`، هدف ویندوز x64 (portable + nsis)؛ فایل‌های پکیج‌شده: `main.js`, `preload.js`, `renderer/**/*`, `package.json`.

> توجه: مسیر `admin/` در آرایه `build.files` نیست؛ پنل ادمین در خروجی بسته‌بندی نمی‌شود و جدا از لانچر اصلی اجرا/سرو می‌شود.

---

## ۹. قراردادها و نکات

- **زبان و جهت:** کل برنامه فارسی و RTL (`<html lang="fa" dir="rtl">`). آیکن‌ها، ارقام و محتوای انگلیسی به‌صورت LTR ایزوله می‌شوند.
- **ارقام فارسی:** نمایش با `faNum()` (رندرر) و `faNum`/`faPrice` (ادمین)؛ ورودی‌ها با `enNum()` به انگلیسی تبدیل می‌شوند.
- **نام‌گذاری:** شناسه‌ها/کلاس‌ها/توابع انگلیسی (kebab-case و BEM-مانند با `__` و `--`)، اما تمام متن‌های نمایشی فارسی.
- **کامنت‌ها:** بخش زیادی از کامنت‌های کد به فارسی نوشته شده‌اند.
- **بدون بک‌اند:** همه چیز mock و شبیه‌سازی‌شده است؛ برای محصول واقعی باید لایه API و پایگاه داده اضافه شود.

---

*این سند از روی وضعیت فعلی کد منبع تولید شده است. با تغییر کد، آن را به‌روزرسانی کنید.*
