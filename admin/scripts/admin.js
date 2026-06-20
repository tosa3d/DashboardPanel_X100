/* ============================================
   پنل مدیریت x100 — منطق داشبورد
   ============================================ */

const ADMIN_CREDS = { user: 'admin', pass: 'admin123' };

// تبدیل عدد به فارسی
const faNum = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
const enNum = (s) => String(s).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
const faPrice = (n) => faNum(n.toLocaleString('en-US'));

// ---------- داده‌های نمونه کاربران ----------
const USERS = [
  { id: 1, name: 'احسان رضایی', handle: '@ehsan_gamer', phone: '0912 345 6789', role: 'streamer', status: 'online', coins: 1480000, joined: '2024-02-11', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop' },
  { id: 2, name: 'نرگس احمدی', handle: '@narges_gamer', phone: '0935 112 4400', role: 'creator', status: 'online', coins: 2750000, joined: '2024-05-03', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' },
  { id: 3, name: 'آرش کریمی', handle: '@ArashGG', phone: '0901 887 6655', role: 'player', status: 'online', coins: 540000, joined: '2023-11-20', avatar: 'https://i.pravatar.cc/80?u=arash' },
  { id: 4, name: 'سارا محمدی', handle: '@SaraPlay', phone: '0919 220 1133', role: 'streamer', status: 'offline', coins: 1920000, joined: '2024-01-08', avatar: 'https://i.pravatar.cc/80?u=sara' },
  { id: 5, name: 'میلاد نوری', handle: '@MiladPro', phone: '0937 654 3210', role: 'creator', status: 'offline', coins: 880000, joined: '2024-07-15', avatar: 'https://i.pravatar.cc/80?u=milad88' },
  { id: 6, name: 'علی غفاری', handle: '@GhostSniper', phone: '0902 333 7788', role: 'player', status: 'banned', coins: 12000, joined: '2025-01-22', avatar: 'https://i.pravatar.cc/80?u=ghost' },
  { id: 7, name: 'زیرک حسینی', handle: '@Zirak90', phone: '0938 909 0011', role: 'player', status: 'offline', coins: 320000, joined: '2024-09-30', avatar: 'https://i.pravatar.cc/80?u=zirak9' },
  { id: 8, name: 'پیمان شریفی', handle: '@NightWolf_IR', phone: '0991 445 6677', role: 'player', status: 'online', coins: 67000, joined: '2025-03-14', avatar: 'https://i.pravatar.cc/80?u=wolf7' },
  { id: 9, name: 'مدیر سیستم', handle: '@admin', phone: '0910 000 0001', role: 'admin', status: 'online', coins: 0, joined: '2023-01-01', avatar: 'https://i.pravatar.cc/80?u=adminx' },
  { id: 10, name: 'رضا تهرانی', handle: '@RezaT', phone: '0913 778 9900', role: 'player', status: 'offline', coins: 145000, joined: '2024-12-05', avatar: 'https://i.pravatar.cc/80?u=reza' },
  { id: 11, name: 'مریم اکبری', handle: '@MaryGamer', phone: '0922 556 7788', role: 'player', status: 'online', coins: 1100000, joined: '2024-04-19', avatar: 'https://i.pravatar.cc/80?u=maryam' },
  { id: 12, name: 'کاوه مرادی', handle: '@KavehX', phone: '0903 121 3141', role: 'player', status: 'banned', coins: 5000, joined: '2025-02-28', avatar: 'https://i.pravatar.cc/80?u=kaveh' },
];

const ROLE_LABEL = { player: 'بازیکن', creator: 'تولید کننده محتوا', streamer: 'استریمر', admin: 'ادمین کانال' };
const STATUS_LABEL = { online: 'آنلاین', offline: 'آفلاین', banned: 'مسدود' };

// ---------- مشخصات سیستم بازیکن ----------
// چند پیکربندی واقعی؛ به‌صورت قطعی بر اساس شناسه کاربر اختصاص داده می‌شود
const SYSTEM_PRESETS = [
  { tier: 'سیستم سطح بالا', os: 'Windows 11 Pro (64-bit)', cpu: 'Intel Core i9-13900K', gpu: 'NVIDIA RTX 4080 16GB', ram: '32 GB DDR5 6000MHz', storage: 'SSD NVMe 2TB', directx: 'DirectX 12', resolution: '2560×1440 @165Hz' },
  { tier: 'سیستم میان‌رده', os: 'Windows 10 Pro (64-bit)', cpu: 'AMD Ryzen 5 5600X', gpu: 'NVIDIA RTX 3060 12GB', ram: '16 GB DDR4 3200MHz', storage: 'SSD SATA 1TB', directx: 'DirectX 12', resolution: '1920×1080 @144Hz' },
  { tier: 'سیستم اقتصادی', os: 'Windows 10 Home (64-bit)', cpu: 'Intel Core i5-10400F', gpu: 'NVIDIA GTX 1650 4GB', ram: '8 GB DDR4 2666MHz', storage: 'HDD 1TB + SSD 240GB', directx: 'DirectX 12', resolution: '1920×1080 @60Hz' },
  { tier: 'لپ‌تاپ گیمینگ', os: 'Windows 11 Home (64-bit)', cpu: 'AMD Ryzen 7 6800H', gpu: 'NVIDIA RTX 3070 Laptop 8GB', ram: '16 GB DDR5 4800MHz', storage: 'SSD NVMe 512GB', directx: 'DirectX 12', resolution: '1920×1080 @144Hz' },
];
const SYS_LABELS = { os: 'سیستم‌عامل', cpu: 'پردازنده', gpu: 'کارت گرافیک', ram: 'حافظه (RAM)', storage: 'ذخیره‌سازی', directx: 'DirectX', resolution: 'نمایشگر' };
const getUserSystem = (u) => u.system || SYSTEM_PRESETS[u.id % SYSTEM_PRESETS.length];

// ---------- بازی‌های نصب‌شده کاربر ----------
const GAME_LIBRARY = [
  { name: 'Counter-Strike 2', size: '34 GB' },
  { name: 'Dota 2', size: '52 GB' },
  { name: 'Valorant', size: '29 GB' },
  { name: 'Diablo IV', size: '90 GB' },
  { name: 'PUBG: BATTLEGROUNDS', size: '40 GB' },
  { name: 'Apex Legends', size: '70 GB' },
  { name: 'Grand Theft Auto V', size: '110 GB' },
  { name: 'Rainbow Six Siege', size: '61 GB' },
  { name: 'Minecraft', size: '2 GB' },
  { name: 'League of Legends', size: '22 GB' },
];
// لیست نصب‌شده‌ها به‌صورت قطعی بر اساس شناسه کاربر ساخته می‌شود
function getUserGames(u) {
  if (u.games) return u.games;
  const count = 4 + (u.id % 6); // بین ۴ تا ۹ بازی (همیشه بیشتر از ۳ تا اسکرول دیده شود)
  const start = u.id % GAME_LIBRARY.length;
  return Array.from({ length: count }, (_, i) => {
    const g = GAME_LIBRARY[(start + i * 3) % GAME_LIBRARY.length];
    return { ...g, hours: ((u.id * 17 + i * 53) % 480) + 5 };
  });
}

// ---------- داده‌های نمونه بازی‌ها ----------
let GAMES = [
  {
    id: 1, name: 'Counter-Strike 2', genre: 'تیراندازی (FPS)', sub: 'رایگان',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=240&fit=crop' }],
    os: 'Windows 7 / Vista / XP', cpu: 'Dual core 2.8 GHz', ram: '4 GB RAM', gpu: 'nVidia GeForce 8600 / 9600GT',
    dx: 'Version 9.0c', size: '15 GB', net: 'Broadband Internet',
    dev: 'Valve Corporation', pub: 'Valve', release: '۶ شهریور ۱۴۰۲',
    revRecent: 'مختلط', revAll: 'عمدتاً مثبت (1.1M)', ownServer: true,
    tags: ['شوتر', 'تاکتیکال', 'FPS', 'اسپرت', 'رایگان', 'چندنفره'],
    desc: 'بازگشت قهرمان شوترهای تاکتیکال. کانتر استرایک ۲ با موتور جدید Source 2 بازسازی شده و گرافیک، فیزیک دود و سیستم‌های مچ‌میکینگ را به سطحی کاملاً جدید رسانده.',
  },
  {
    id: 2, name: 'Diablo IV', genre: 'نقش‌آفرینی (RPG)', sub: 'پولی',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=240&fit=crop' }],
    os: 'Windows 10', cpu: 'Core i5-2500K', ram: '16 GB RAM', gpu: 'GTX 1060',
    dx: 'Version 12', size: '90 GB', net: 'Broadband Internet',
    dev: 'Blizzard', pub: 'Blizzard', release: '۱۵ خرداد ۱۴۰۲',
    revRecent: 'عمدتاً مثبت', revAll: 'مثبت (250K)',
    tags: ['اکشن', 'نقش‌آفرینی', 'تک‌نفره', 'آنلاین'],
    desc: 'سفری تاریک در دنیای Sanctuary برای مقابله با نیروهای شیطانی.',
  },
];

let editingGameId = null;
let draftMedia = []; // رسانه‌های در حال آپلود فرم

// ============================================
// ورود / خروج
// ============================================
function initLogin() {
  const form = document.getElementById('login-form');
  const err = document.getElementById('login-error');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // هر نام کاربری/رمزی پذیرفته می‌شود
    err.hidden = true;
    document.getElementById('login-screen').hidden = true;
    document.getElementById('admin-app').hidden = false;
    bootDashboard();
  });
  document.getElementById('logout-btn').addEventListener('click', () => {
    document.getElementById('admin-app').hidden = true;
    document.getElementById('login-screen').hidden = false;
    document.getElementById('login-pass').value = '';
    document.getElementById('login-error').hidden = true;
  });
}

// ============================================
// ناوبری بین نماها
// ============================================
const VIEW_TITLE = { overview: 'داشبورد', users: 'کاربران', games: 'انتشار بازی', launcher: 'لانچر', servers: 'سرورها', transactions: 'تراکنش', publish: 'انتشار محتوا' };
function initNav() {
  const showView = (view) => {
    document.querySelectorAll('.admin-view').forEach((v) => {
      v.classList.toggle('admin-view--active', v.dataset.view === view);
    });
    document.getElementById('view-title').textContent = VIEW_TITLE[view];
  };
  const clearActive = () => {
    document.querySelectorAll('.admin-nav__item, .admin-nav__subitem')
      .forEach((i) => i.classList.remove('admin-nav__item--active', 'admin-nav__subitem--active'));
  };

  // آیتم‌های اصلی (دارای data-view مستقیم)
  document.querySelectorAll('.admin-nav__item[data-view]').forEach((item) => {
    item.addEventListener('click', () => {
      clearActive();
      item.classList.add('admin-nav__item--active');
      showView(item.dataset.view);
    });
  });

  // والدهای کشویی (کاربران / انتشار محتوا) — باز/بسته کردن منو
  document.querySelectorAll('.admin-nav__parent').forEach((parent) => {
    const sub = parent.nextElementSibling;
    parent.addEventListener('click', () => {
      const open = sub.hidden;
      sub.hidden = !open;
      parent.classList.toggle('admin-nav__parent--open', open);
    });
  });

  // زیرگزینه‌ها — بسته به نوع، به بخش مربوطه می‌روند
  document.querySelectorAll('.admin-nav__subitem').forEach((sub) => {
    sub.addEventListener('click', () => {
      clearActive();
      sub.classList.add('admin-nav__subitem--active');
      showView(sub.dataset.view);
      if (sub.dataset.pub) setPubTarget(sub.dataset.pub);
      if (sub.dataset.usub) setUsersTab(sub.dataset.usub);
    });
  });
}

// زیربخش‌های کاربران (لیست / تأیید عکس)
function setUsersTab(tab) {
  document.querySelectorAll('.users-pane').forEach((p) => p.classList.toggle('users-pane--active', p.dataset.usub === tab));
  document.querySelectorAll('.admin-nav__subitem[data-usub]').forEach((s) => s.classList.toggle('admin-nav__subitem--active', s.dataset.usub === tab));
  if (tab === 'avatars') renderAvatarReviews();
}

// ============================================
// تأیید عکس/آواتار کاربران
// ============================================
const AVATAR_STATUS = {
  suspicious:   { label: 'مشکوک — نیاز به بررسی', color: 'var(--gold)' },
  autoApproved: { label: 'تأیید خودکار (AI)',      color: 'var(--green)' },
  autoRejected: { label: 'رد خودکار (AI)',          color: 'var(--text-faint)' },
  approved:     { label: 'تأیید نهایی (ادمین)',     color: 'var(--green)' },
  rejected:     { label: 'رد نهایی (ادمین)',        color: 'var(--red)' },
  reported:     { label: 'گزارش‌شده توسط کاربران',   color: '#f97316' },
};
const AI_VERDICT = {
  safe:       { label: 'سالم',    color: 'var(--green)' },
  suspicious: { label: 'مشکوک',   color: 'var(--gold)' },
  unsafe:     { label: 'نامناسب', color: 'var(--red)' },
};
let AVATAR_REVIEWS = [
  { id: 1, userId: 3,  name: 'آرش کریمی',  username: '@ArashGG',      imageUrl: 'https://i.pravatar.cc/300?u=arashnew', status: 'suspicious', createdAt: '۲ ساعت پیش', reason: '', ai: { verdict: 'suspicious', score: 58, note: 'احتمال محتوای نامناسب — نیاز به بررسی انسانی' } },
  { id: 2, userId: 8,  name: 'پیمان شریفی', username: '@NightWolf_IR', imageUrl: 'https://i.pravatar.cc/300?u=wolfnew',  status: 'suspicious', createdAt: '۵ ساعت پیش', reason: '', ai: { verdict: 'suspicious', score: 47, note: 'متن/لوگوی ناشناس روی تصویر' } },
  { id: 3, userId: 11, name: 'مریم اکبری', username: '@MaryGamer',    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop', status: 'autoApproved', createdAt: 'دیروز', reason: '', ai: { verdict: 'safe', score: 94, note: 'تصویر چهرهٔ سالم تشخیص داده شد' } },
  { id: 4, userId: 5,  name: 'میلاد نوری', username: '@MiladPro',     imageUrl: 'https://i.pravatar.cc/300?u=miladnew', status: 'approved', createdAt: '۲ روز پیش', reason: '', ai: { verdict: 'suspicious', score: 61, note: 'پس از بررسی انسانی تأیید شد' } },
  { id: 5, userId: 12, name: 'کاوه مرادی', username: '@KavehX',       imageUrl: 'https://i.pravatar.cc/300?u=kavehnew', status: 'autoRejected', createdAt: '۳ روز پیش', reason: 'محتوای نامناسب با اطمینان بالا', ai: { verdict: 'unsafe', score: 91, note: 'محتوای نامناسب با اطمینان بالا' } },
  { id: 6, userId: 1, name: 'احسان رضایی', username: '@ehsan_gamer', imageUrl: 'https://i.pravatar.cc/300?u=ehsanrep', status: 'reported', createdAt: '۱ ساعت پیش', reason: '', reportCount: 4, ai: { verdict: 'safe', score: 88, note: 'AI سالم تشخیص داد، اما کاربران گزارش کرده‌اند' } },
  { id: 7, userId: 4, name: 'سارا محمدی', username: '@SaraPlay', imageUrl: 'https://i.pravatar.cc/300?u=sararep', status: 'reported', createdAt: '۳ ساعت پیش', reason: '', reportCount: 2, ai: { verdict: 'safe', score: 90, note: 'گزارش‌شده توسط کاربران' } },
];
let avatarFilter = 'suspicious';
let avatarSeq = 8;

// شبیه‌سازی موتور بررسی هوش مصنوعی روی یک آپلود جدید
function runAiVerdict() {
  const r = Math.random();
  if (r < 0.5) return { verdict: 'safe', score: 85 + Math.floor(Math.random() * 14), note: 'تصویر سالم تشخیص داده شد', status: 'autoApproved' };
  if (r < 0.78) return { verdict: 'suspicious', score: 42 + Math.floor(Math.random() * 22), note: 'موارد مشکوک شناسایی شد — نیاز به بررسی انسانی', status: 'suspicious' };
  return { verdict: 'unsafe', score: 80 + Math.floor(Math.random() * 19), note: 'محتوای نامناسب با اطمینان بالا', status: 'autoRejected' };
}

function renderAvatarReviews() {
  const counts = { suspicious: 0, reported: 0, autoApproved: 0, autoRejected: 0, approved: 0, rejected: 0 };
  AVATAR_REVIEWS.forEach((a) => { if (counts[a.status] !== undefined) counts[a.status]++; });

  const navBadge = document.getElementById('nav-avatar-badge');
  const needReview = counts.suspicious + counts.reported;
  if (navBadge) { navBadge.textContent = faNum(needReview); navBadge.hidden = !needReview; }

  const statsEl = document.getElementById('avatar-stats');
  if (statsEl) {
    const statDefs = [
      { key: 'suspicious',   label: 'مشکوک (بررسی)',  cls: 'avatar-stat--warn' },
      { key: 'reported',     label: 'گزارش کاربران',   cls: 'avatar-stat--report' },
      { key: 'autoApproved', label: 'تأیید خودکار AI', cls: 'avatar-stat--ok' },
      { key: 'approved',     label: 'تأیید نهایی',     cls: 'avatar-stat--ok' },
      { key: 'rejected',     label: 'رد نهایی',        cls: 'avatar-stat--reject' },
    ];
    statsEl.innerHTML = statDefs.map((d) =>
      `<button type="button" class="avatar-stat ${d.cls} ${avatarFilter === d.key ? 'avatar-stat--active' : ''}" data-fstatus="${d.key}">
        <div class="avatar-stat__num">${faNum(counts[d.key] || 0)}</div>
        <div class="avatar-stat__lbl">${d.label}</div>
      </button>`).join('');
    statsEl.querySelectorAll('[data-fstatus]').forEach((c) => c.addEventListener('click', () => {
      avatarFilter = c.dataset.fstatus;
      const f = document.getElementById('avatar-filter'); if (f) f.value = avatarFilter;
      renderAvatarReviews();
    }));
  }

  const grid = document.getElementById('avatar-grid');
  if (!grid) return;
  const rows = avatarFilter === 'all' ? AVATAR_REVIEWS : AVATAR_REVIEWS.filter((a) => a.status === avatarFilter);
  document.getElementById('avatar-count').textContent = `${faNum(rows.length)} مورد`;
  if (!rows.length) {
    grid.innerHTML = '<div class="empty-state">موردی در این وضعیت نیست</div>';
    return;
  }
  grid.innerHTML = rows.map((a) => {
    const st = AVATAR_STATUS[a.status] || AVATAR_STATUS.suspicious;
    const ai = a.ai || { verdict: 'suspicious', score: 50, note: '' };
    const av = AI_VERDICT[ai.verdict] || AI_VERDICT.suspicious;
    const canApprove = a.status !== 'approved'; // روی همه (حتی تأیید خودکار AI) امکان تأیید دستی
    const canReject = a.status !== 'rejected';   // روی همه امکان رد دستی
    return `
    <div class="avatar-review" data-aid="${a.id}" data-uid="${a.userId}">
      <div class="avatar-review__img"><img src="${a.imageUrl}" alt=""></div>
      <div class="avatar-review__body">
        <div class="avatar-review__name">${a.name} <span class="avatar-review__handle">${a.username}</span></div>
        <span class="avatar-review__status" style="color:${st.color}">● ${st.label}</span>
        ${a.reportCount ? `<div class="avatar-review__report"><span class="material-icons-outlined">flag</span>${faNum(a.reportCount)} گزارش کاربر</div>` : ''}
        <div class="avatar-review__ai"><span class="material-icons-outlined">smart_toy</span>هوش مصنوعی: <b style="color:${av.color}">${av.label}</b> · ${faNum(ai.score)}٪ اطمینان</div>
        ${ai.note ? `<div class="avatar-review__ainote">${ai.note}</div>` : ''}
        ${a.reason ? `<div class="avatar-review__reason">دلیل رد: ${a.reason}</div>` : ''}
        <div class="avatar-review__date"><span class="material-icons-outlined">schedule</span>${a.createdAt}</div>
      </div>
      <div class="avatar-review__actions">
        ${canApprove ? `<button class="ar-btn ar-btn--ok" data-act="approve"><span class="material-icons-outlined">check</span>تأیید</button>` : ''}
        ${canReject ? `<button class="ar-btn ar-btn--no" data-act="reject"><span class="material-icons-outlined">close</span>رد</button>` : ''}
        <button class="ar-btn ar-btn--ghost" data-act="profile"><span class="material-icons-outlined">person</span>پروفایل</button>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.avatar-review');
      const a = AVATAR_REVIEWS.find((x) => x.id === Number(card.dataset.aid));
      if (!a) return;
      if (btn.dataset.act === 'approve') {
        a.status = 'approved'; a.reason = '';
        renderAvatarReviews();
      } else if (btn.dataset.act === 'reject') {
        const reason = prompt('دلیل رد عکس (به کاربر نمایش داده می‌شود):', (a.ai && a.ai.note) || 'عکس نامناسب است');
        if (reason === null) return;
        a.status = 'rejected'; a.reason = reason.trim() || 'عکس تأیید نشد';
        renderAvatarReviews();
      } else if (btn.dataset.act === 'profile') {
        openUserModal(Number(card.dataset.uid));
      }
    });
  });
}

function initAvatarReviews() {
  const filter = document.getElementById('avatar-filter');
  if (filter) filter.addEventListener('change', (e) => { avatarFilter = e.target.value; renderAvatarReviews(); });

  // شبیه‌سازی آپلود کاربر → بررسی فوری AI و قرارگیری در وضعیت مناسب
  const sim = document.getElementById('avatar-simulate');
  if (sim) sim.addEventListener('click', () => {
    const u = USERS[Math.floor(Math.random() * USERS.length)];
    const v = runAiVerdict();
    AVATAR_REVIEWS.unshift({
      id: avatarSeq++, userId: u.id, name: u.name, username: u.handle,
      imageUrl: 'https://i.pravatar.cc/300?u=sim' + avatarSeq + Math.floor(Math.random() * 9999),
      status: v.status, createdAt: 'هم‌اکنون',
      reason: v.status === 'autoRejected' ? v.note : '',
      ai: { verdict: v.verdict, score: v.score, note: v.note },
    });
    avatarFilter = v.status;
    if (filter) filter.value = v.status;
    renderAvatarReviews();
  });

  // شبیه‌سازی گزارش کاربر روی یک عکس تأییدشده
  const rep = document.getElementById('avatar-report');
  if (rep) rep.addEventListener('click', () => {
    const candidates = AVATAR_REVIEWS.filter((a) => a.status === 'autoApproved' || a.status === 'approved');
    let target = candidates[Math.floor(Math.random() * candidates.length)];
    if (!target) {
      const u = USERS[Math.floor(Math.random() * USERS.length)];
      target = { id: avatarSeq++, userId: u.id, name: u.name, username: u.handle, imageUrl: 'https://i.pravatar.cc/300?u=rep' + avatarSeq, status: 'autoApproved', createdAt: 'دیروز', reason: '', reportCount: 0, ai: { verdict: 'safe', score: 90, note: '' } };
      AVATAR_REVIEWS.unshift(target);
    }
    target.reportCount = (target.reportCount || 0) + 1;
    target.status = 'reported';
    avatarFilter = 'reported';
    if (filter) filter.value = 'reported';
    renderAvatarReviews();
  });

  renderAvatarReviews();
}

// ============================================
// نمای کلی
// ============================================
function renderOverview() {
  document.getElementById('stat-users').textContent = faNum(USERS.length);
  document.getElementById('stat-online').textContent = faNum(USERS.filter((u) => u.status === 'online').length);
  document.getElementById('stat-games').textContent = faNum(GAMES.length);
  const totalCoins = USERS.reduce((s, u) => s + u.coins, 0);
  document.getElementById('stat-coins').textContent = faPrice(totalCoins);

  const recent = [...USERS].sort((a, b) => new Date(b.joined) - new Date(a.joined)).slice(0, 5);
  document.getElementById('overview-recent').innerHTML = recent.map((u) => `
    <div class="data-table" style="border:none">
      <div style="display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid var(--border)">
        <img src="${u.avatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover">
        <div style="flex:1">
          <div style="font-weight:600;font-size:13px">${u.name}</div>
          <div style="font-size:11px;color:var(--text-faint)">${u.handle}</div>
        </div>
        <span class="role-badge role-badge--${u.role}">${ROLE_LABEL[u.role]}</span>
        <span style="font-size:12px;color:var(--text-dim);direction:ltr">${faNum(u.joined)}</span>
      </div>
    </div>
  `).join('');
}

// ============================================
// کاربران — سرچ، فیلتر، سورت
// ============================================
function initUsers() {
  const search = document.getElementById('user-search');
  const fStatus = document.getElementById('filter-status');
  const fRole = document.getElementById('filter-role');
  const sortBy = document.getElementById('sort-by');
  [search, fStatus, fRole, sortBy].forEach((el) => {
    el.addEventListener('input', renderUsers);
    el.addEventListener('change', renderUsers);
  });

  // بستن مودال جزئیات
  document.getElementById('user-modal-close').addEventListener('click', closeUserModal);
  document.getElementById('user-modal').addEventListener('click', (e) => {
    if (e.target.id === 'user-modal') closeUserModal();
  });

  renderUsers();
}

function openUserModal(uid) {
  const u = USERS.find((x) => x.id === uid);
  if (!u) return;
  const sys = getUserSystem(u);
  const games = getUserGames(u);
  const steam = u.steam || ('7656119' + String(8100000000 + u.id * 4823719).slice(0, 10)); // SteamID64 قطعی
  document.getElementById('user-modal-body').innerHTML = `
    <div class="umodal-head">
      <img src="${u.avatar}" alt="">
      <div>
        <div class="umodal-name">${u.name} <span class="role-badge role-badge--${u.role}">${ROLE_LABEL[u.role]}</span></div>
        <div class="umodal-handle">${u.handle}</div>
        <span class="status-badge status-badge--${u.status}">${STATUS_LABEL[u.status]}</span>
      </div>
    </div>
    <div class="umodal-rows">
      <div class="umodal-row"><span>شماره تلفن</span><b style="direction:ltr">${u.phone}</b></div>
      <div class="umodal-row"><span>نقش</span><b>${ROLE_LABEL[u.role]}</b></div>
      <div class="umodal-row"><span>وضعیت</span><b>${STATUS_LABEL[u.status]}</b></div>
      <div class="umodal-row"><span>موجودی سکه X</span><b style="color:var(--gold);direction:ltr">${faPrice(u.coins)}</b></div>
      <div class="umodal-row"><span>شناسه Steam</span><b style="direction:ltr">${steam}</b></div>
      <div class="umodal-row"><span>تاریخ عضویت</span><b style="direction:ltr">${faNum(u.joined)}</b></div>
    </div>
    <div class="umodal-accordion">
      <button type="button" class="umodal-acc-head">
        <span class="umodal-acc-title"><span class="material-icons-outlined">memory</span>مشخصات سیستم بازیکن</span>
        <span class="umodal-acc-chevron material-icons-outlined">expand_more</span>
      </button>
      <div class="umodal-acc-body" id="umodal-sys-body" hidden>
        <div class="umodal-row"><span>دسته سیستم</span><b>${sys.tier}</b></div>
        ${Object.keys(SYS_LABELS).map((k) => `
          <div class="umodal-row"><span>${SYS_LABELS[k]}</span><b style="direction:ltr">${sys[k] || '—'}</b></div>
        `).join('')}
      </div>
    </div>
    <div class="umodal-accordion">
      <button type="button" class="umodal-acc-head">
        <span class="umodal-acc-title"><span class="material-icons-outlined">sports_esports</span>بازی‌های نصب‌شده<span class="umodal-acc-count">${faNum(games.length)}</span></span>
        <span class="umodal-acc-chevron material-icons-outlined">expand_more</span>
      </button>
      <div class="umodal-acc-body umodal-acc-body--scroll" hidden>
        ${games.length ? games.map((g) => `
          <div class="umodal-game">
            <span class="material-icons-outlined umodal-game__ic">sports_esports</span>
            <div class="umodal-game__info">
              <div class="umodal-game__name" style="direction:ltr">${g.name}</div>
              <div class="umodal-game__meta">${g.size}<span class="umodal-game__dot">•</span>${faNum(g.hours)} ساعت بازی</div>
            </div>
          </div>
        `).join('') : '<div class="umodal-empty">بازی نصب‌شده‌ای ندارد</div>'}
      </div>
    </div>
    <div class="umodal-actions">
      <button class="btn-ghost" id="umodal-ban">${u.status === 'banned' ? 'رفع مسدودیت' : 'مسدود کردن'}</button>
      <button class="btn-danger" id="umodal-del">حذف کاربر</button>
    </div>
  `;
  document.getElementById('user-modal').hidden = false;

  // باز/بسته کردن بخش‌های کشویی (مشخصات سیستم، بازی‌های نصب‌شده)
  document.querySelectorAll('#user-modal-body .umodal-acc-head').forEach((head) => {
    head.addEventListener('click', () => {
      const body = head.nextElementSibling;
      const willOpen = body.hidden;
      body.hidden = !willOpen;
      head.classList.toggle('umodal-acc-head--open', willOpen);
    });
  });

  document.getElementById('umodal-ban').addEventListener('click', () => {
    u.status = u.status === 'banned' ? 'offline' : 'banned';
    renderUsers(); renderOverview(); openUserModal(uid);
  });
  document.getElementById('umodal-del').addEventListener('click', () => {
    if (confirm(`کاربر «${u.name}» حذف شود؟`)) {
      const idx = USERS.findIndex((x) => x.id === uid);
      USERS.splice(idx, 1);
      closeUserModal(); renderUsers(); renderOverview();
    }
  });
}
function closeUserModal() {
  document.getElementById('user-modal').hidden = true;
}

function renderUsers() {
  const q = document.getElementById('user-search').value.trim().toLowerCase();
  const fStatus = document.getElementById('filter-status').value;
  const fRole = document.getElementById('filter-role').value;
  const sortBy = document.getElementById('sort-by').value;

  let rows = USERS.filter((u) => {
    const matchQ = !q || u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q) || u.phone.replace(/\s/g, '').includes(q.replace(/\s/g, ''));
    const matchStatus = fStatus === 'all' || u.status === fStatus;
    const matchRole = fRole === 'all' || u.role === fRole;
    return matchQ && matchStatus && matchRole;
  });

  rows.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'fa');
    if (sortBy === 'joined') return new Date(b.joined) - new Date(a.joined);
    if (sortBy === 'coins') return b.coins - a.coins;
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    return 0;
  });

  const tbody = document.getElementById('users-tbody');
  const empty = document.getElementById('users-empty');
  document.getElementById('user-count').textContent = `${faNum(rows.length)} کاربر`;

  if (!rows.length) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  tbody.innerHTML = rows.map((u) => `
    <tr data-uid="${u.id}">
      <td>
        <div class="cell-user">
          <img src="${u.avatar}" alt="">
          <div>
            <div class="cell-user__name">${u.name}</div>
            <div class="cell-user__handle">${u.handle}</div>
          </div>
        </div>
      </td>
      <td class="cell-email">${u.phone}</td>
      <td><span class="status-badge status-badge--${u.status}">${STATUS_LABEL[u.status]}</span></td>
      <td class="cell-coins">${faPrice(u.coins)}</td>
      <td style="direction:ltr;text-align:right;color:var(--text-dim);font-size:12px">${faNum(u.joined)}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn icon-btn--view" data-action="view" title="مشاهده جزئیات">
            <span class="material-icons-outlined">visibility</span>
          </button>
          <button class="icon-btn icon-btn--ban" data-action="ban" title="${u.status === 'banned' ? 'رفع مسدودیت' : 'مسدود کردن'}">
            <span class="material-icons-outlined">${u.status === 'banned' ? 'lock_open' : 'block'}</span>
          </button>
          <button class="icon-btn icon-btn--del" data-action="del" title="حذف کاربر">
            <span class="material-icons-outlined">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const uid = Number(btn.closest('tr').dataset.uid);
      const user = USERS.find((u) => u.id === uid);
      if (!user) return;
      if (btn.dataset.action === 'view') {
        openUserModal(uid);
        return;
      }
      if (btn.dataset.action === 'ban') {
        user.status = user.status === 'banned' ? 'offline' : 'banned';
      } else if (btn.dataset.action === 'del') {
        if (confirm(`کاربر «${user.name}» حذف شود؟`)) {
          const idx = USERS.findIndex((u) => u.id === uid);
          USERS.splice(idx, 1);
        }
      }
      renderUsers();
      renderOverview();
    });
  });
}

// ============================================
// بازی‌ها — تعریف و لیست
// ============================================
function resetGameForm() {
  document.getElementById('game-form').reset();
  editingGameId = null;
  draftMedia = [];
  renderDraftMedia();
  document.getElementById('game-form-title').textContent = 'تعریف بازی جدید';
  document.getElementById('game-submit').textContent = 'افزودن بازی';
  document.getElementById('game-reset').textContent = 'پاک کردن';
  document.getElementById('game-delete').hidden = true;
}

function renderDraftMedia() {
  const grid = document.getElementById('g-media-grid');
  grid.innerHTML = draftMedia.map((m, i) => `
    <div class="media-thumb" data-mi="${i}">
      ${m.type === 'video'
        ? `<video src="${m.url}" muted></video><span class="media-thumb__badge"><span class="material-icons-outlined">videocam</span>ویدیو</span>`
        : `<img src="${m.url}" alt=""><span class="media-thumb__badge"><span class="material-icons-outlined">image</span>عکس</span>`}
      ${i === 0 ? '<span class="media-thumb__cover">کاور</span>' : ''}
      <button type="button" class="media-thumb__del" data-mi="${i}"><span class="material-icons-outlined">close</span></button>
    </div>
  `).join('');
  grid.querySelectorAll('.media-thumb__del').forEach((btn) => {
    btn.addEventListener('click', () => {
      draftMedia.splice(Number(btn.dataset.mi), 1);
      renderDraftMedia();
    });
  });
}

function initGames() {
  const form = document.getElementById('game-form');

  // آپلود رسانه (عکس/ویدیو)
  const mediaInput = document.getElementById('g-media-input');
  document.getElementById('g-media-add').addEventListener('click', () => mediaInput.click());
  mediaInput.addEventListener('change', () => {
    Array.from(mediaInput.files).forEach((file) => {
      const type = file.type.startsWith('video') ? 'video' : 'image';
      const url = URL.createObjectURL(file);
      draftMedia.push({ type, url });
    });
    mediaInput.value = '';
    renderDraftMedia();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const tags = document.getElementById('g-tags').value.split(/[,،]/).map((t) => t.trim()).filter(Boolean);
    const media = draftMedia.slice();
    if (!media.length) media.push({ type: 'image', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=240&fit=crop' });
    const data = {
      name: document.getElementById('g-name').value.trim(),
      genre: document.getElementById('g-genre').value,
      sub: document.getElementById('g-sub').value,
      media,
      os: document.getElementById('g-os').value.trim(),
      cpu: document.getElementById('g-cpu').value.trim(),
      ram: document.getElementById('g-ram').value.trim(),
      gpu: document.getElementById('g-gpu').value.trim(),
      dx: document.getElementById('g-dx').value.trim(),
      size: document.getElementById('g-size').value.trim(),
      net: document.getElementById('g-net').value.trim(),
      dev: document.getElementById('g-dev').value.trim(),
      pub: document.getElementById('g-pub').value.trim(),
      release: document.getElementById('g-release').value.trim(),
      revRecent: document.getElementById('g-rev-recent').value.trim(),
      revAll: document.getElementById('g-rev-all').value.trim(),
      ownServer: document.getElementById('g-own-server').checked,
      tags,
      desc: document.getElementById('g-desc').value.trim(),
    };
    if (editingGameId) {
      const g = GAMES.find((x) => x.id === editingGameId);
      Object.assign(g, data);
    } else {
      data.id = Date.now();
      GAMES.unshift(data);
    }
    resetGameForm();
    renderGames();
    renderOverview();
  });

  document.getElementById('game-reset').addEventListener('click', resetGameForm);

  // متن راهنمای تاگل منبع دانلود
  const ownToggle = document.getElementById('g-own-server');
  const ownHint = document.getElementById('g-own-server-hint');
  ownToggle.addEventListener('change', () => {
    ownHint.textContent = ownToggle.checked
      ? 'فعال: دانلود و آپدیت از سرور اختصاصی ما'
      : 'غیرفعال: دانلود و آپدیت از سمت سرور استیم';
  });

  // حذف بازی در حال ویرایش
  document.getElementById('game-delete').addEventListener('click', () => {
    if (!editingGameId) return;
    const g = GAMES.find((x) => x.id === editingGameId);
    if (g && confirm(`بازی «${g.name}» حذف شود؟`)) {
      GAMES = GAMES.filter((x) => x.id !== editingGameId);
      resetGameForm();
      renderGames();
      renderOverview();
    }
  });

  // سرچ / فیلتر / سورت لیست بازی‌ها
  ['game-search', 'game-filter-genre', 'game-filter-sub', 'game-sort'].forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener('input', renderGames);
    el.addEventListener('change', renderGames);
  });

  renderGames();
}

function renderGames() {
  const list = document.getElementById('games-list');

  // سرچ / فیلتر / سورت
  const q = (document.getElementById('game-search')?.value || '').trim().toLowerCase();
  const fGenre = document.getElementById('game-filter-genre')?.value || 'all';
  const fSub = document.getElementById('game-filter-sub')?.value || 'all';
  const sort = document.getElementById('game-sort')?.value || 'newest';

  let rows = GAMES.filter((g) => {
    const matchQ = !q
      || g.name.toLowerCase().includes(q)
      || (g.dev || '').toLowerCase().includes(q)
      || (g.tags || []).some((t) => t.toLowerCase().includes(q));
    const matchGenre = fGenre === 'all' || g.genre === fGenre;
    const matchSub = fSub === 'all' || g.sub === fSub;
    return matchQ && matchGenre && matchSub;
  });

  rows.sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name, 'fa');
    if (sort === 'genre') return a.genre.localeCompare(b.genre, 'fa');
    return b.id - a.id; // newest
  });

  document.getElementById('games-count').textContent = faNum(rows.length);
  if (!rows.length) {
    list.innerHTML = '<div class="empty-state">بازی‌ای با این فیلتر یافت نشد</div>';
    return;
  }
  list.innerHTML = rows.map((g) => {
    const cover = (g.media && g.media[0]) || { type: 'image', url: '' };
    const mediaCount = g.media ? g.media.length : 0;
    const videoCount = g.media ? g.media.filter((m) => m.type === 'video').length : 0;
    return `
    <div class="game-card" data-gid="${g.id}">
      <div class="game-card__cover-wrap">
        ${cover.type === 'video' ? `<video class="game-card__cover" src="${cover.url}" muted></video>` : `<img class="game-card__cover" src="${cover.url}" alt="">`}
        ${mediaCount > 1 ? `<span class="game-card__mcount"><span class="material-icons-outlined">collections</span>${faNum(mediaCount)}</span>` : ''}
        ${videoCount ? `<span class="game-card__vbadge"><span class="material-icons-outlined">play_circle</span></span>` : ''}
      </div>
      <div class="game-card__info">
        <div class="game-card__name">${g.name}
          <span class="src-badge ${g.ownServer ? 'src-badge--own' : 'src-badge--steam'}">
            <span class="material-icons-outlined">${g.ownServer ? 'cloud_done' : 'cloud_download'}</span>${g.ownServer ? 'سرور ما' : 'استیم'}
          </span>
        </div>
        <div class="game-card__genre">${g.genre} • ${g.sub}${g.dev ? ' • ' + g.dev : ''}</div>
        ${g.desc ? `<div class="game-card__desc">${g.desc}</div>` : ''}
        <div class="game-card__specs">
          ${g.os ? `<span class="spec-chip"><b>OS:</b> ${g.os}</span>` : ''}
          ${g.cpu ? `<span class="spec-chip"><b>CPU:</b> ${g.cpu}</span>` : ''}
          ${g.ram ? `<span class="spec-chip"><b>RAM:</b> ${g.ram}</span>` : ''}
          ${g.gpu ? `<span class="spec-chip"><b>GPU:</b> ${g.gpu}</span>` : ''}
          ${g.dx ? `<span class="spec-chip"><b>DirectX:</b> ${g.dx}</span>` : ''}
          ${g.size ? `<span class="spec-chip"><b>حجم:</b> ${g.size}</span>` : ''}
          ${g.release ? `<span class="spec-chip"><b>عرضه:</b> ${g.release}</span>` : ''}
          ${g.revAll ? `<span class="spec-chip"><b>بررسی:</b> ${g.revAll}</span>` : ''}
        </div>
        <div class="game-card__specs">
          ${g.tags.map((t) => `<span class="spec-chip spec-chip--tag">${t}</span>`).join('')}
        </div>
      </div>
      <button class="game-card__del" data-action="edit" title="ویرایش" style="left:44px"><span class="material-icons-outlined">edit</span></button>
      <button class="game-card__del" data-action="del" title="حذف"><span class="material-icons-outlined">delete</span></button>
    </div>`;
  }).join('');

  list.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const gid = Number(btn.closest('.game-card').dataset.gid);
      const g = GAMES.find((x) => x.id === gid);
      if (!g) return;
      if (btn.dataset.action === 'del') {
        if (confirm(`بازی «${g.name}» حذف شود؟`)) {
          GAMES = GAMES.filter((x) => x.id !== gid);
          renderGames();
          renderOverview();
        }
      } else if (btn.dataset.action === 'edit') {
        editingGameId = gid;
        document.getElementById('g-name').value = g.name;
        document.getElementById('g-genre').value = g.genre;
        document.getElementById('g-sub').value = g.sub;
        document.getElementById('g-os').value = g.os || '';
        document.getElementById('g-cpu').value = g.cpu || '';
        document.getElementById('g-ram').value = g.ram || '';
        document.getElementById('g-gpu').value = g.gpu || '';
        document.getElementById('g-dx').value = g.dx || '';
        document.getElementById('g-size').value = g.size || '';
        document.getElementById('g-net').value = g.net || '';
        document.getElementById('g-dev').value = g.dev || '';
        document.getElementById('g-pub').value = g.pub || '';
        document.getElementById('g-release').value = g.release || '';
        document.getElementById('g-rev-recent').value = g.revRecent || '';
        document.getElementById('g-rev-all').value = g.revAll || '';
        document.getElementById('g-own-server').checked = !!g.ownServer;
        document.getElementById('g-tags').value = g.tags.join('، ');
        document.getElementById('g-desc').value = g.desc || '';
        draftMedia = (g.media || []).slice();
        renderDraftMedia();
        document.getElementById('game-form-title').textContent = 'ویرایش بازی';
        document.getElementById('game-submit').textContent = 'ذخیره تغییرات';
        document.getElementById('game-reset').textContent = 'لغو';
        document.getElementById('game-delete').hidden = false;
        document.getElementById('g-name').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
}

// ============================================
// لانچر — آپلود نسخه و تاریخچه
// ============================================
let LAUNCHERS = [
  { id: 1, version: '1.3.2', date: '۱۰ خرداد ۱۴۰۴', platform: 'Windows (x64)', fileName: 'x100-setup-1.3.2.exe', size: 94 * 1024 * 1024, mandatory: false, changelog: '• رفع باگ نمایش دوستان\n• بهبود سرعت اتصال تحریم‌شکن' },
  { id: 2, version: '1.2.0', date: '۲ اردیبهشت ۱۴۰۴', platform: 'Windows (x64)', fileName: 'x100-setup-1.2.0.exe', size: 88 * 1024 * 1024, mandatory: true, changelog: '• بازطراحی کامل رابط کاربری\n• افزودن بخش شبکه اجتماعی' },
];
let draftSetup = null; // { name, size }

function fmtSize(bytes) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return faNum((mb / 1024).toFixed(2)) + ' GB';
  return faNum(mb.toFixed(1)) + ' MB';
}

function resetLauncherForm() {
  document.getElementById('launcher-form').reset();
  draftSetup = null;
  document.getElementById('l-file-info').hidden = true;
  document.getElementById('l-file-add').hidden = false;
}

function renderLaunchers() {
  document.getElementById('launcher-count').textContent = faNum(LAUNCHERS.length);
  const list = document.getElementById('launcher-list');
  if (!LAUNCHERS.length) {
    list.innerHTML = '<div class="empty-state">هنوز نسخه‌ای ثبت نشده است</div>';
    return;
  }
  list.innerHTML = LAUNCHERS.map((l, i) => `
    <div class="ver-card" data-lid="${l.id}">
      <div class="ver-card__icon"><span class="material-icons-outlined">rocket_launch</span></div>
      <div class="ver-card__body">
        <div class="ver-card__top">
          <span class="ver-card__num">v${l.version}</span>
          <span class="ver-tag ${i === 0 ? 'ver-tag--latest' : 'ver-tag--old'}">${i === 0 ? 'آخرین نسخه' : 'قدیمی'}</span>
          ${l.mandatory ? '<span class="ver-tag ver-tag--force">اجباری</span>' : ''}
        </div>
        <div class="ver-card__meta">
          <span><span class="material-icons-outlined">event</span>${l.date || '—'}</span>
          <span><span class="material-icons-outlined">desktop_windows</span>${l.platform}</span>
          <span><span class="material-icons-outlined">inventory_2</span>${l.fileName} (${fmtSize(l.size)})</span>
        </div>
        ${l.changelog ? `<div class="ver-card__log">${l.changelog}</div>` : ''}
      </div>
      <button class="ver-card__del" data-lid="${l.id}" title="حذف"><span class="material-icons-outlined">delete</span></button>
    </div>
  `).join('');

  list.querySelectorAll('.ver-card__del').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lid = Number(btn.dataset.lid);
      const l = LAUNCHERS.find((x) => x.id === lid);
      if (l && confirm(`نسخه v${l.version} حذف شود؟`)) {
        LAUNCHERS = LAUNCHERS.filter((x) => x.id !== lid);
        renderLaunchers();
      }
    });
  });
}

function initLauncher() {
  const form = document.getElementById('launcher-form');
  const fileInput = document.getElementById('l-file-input');

  document.getElementById('l-file-add').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    draftSetup = { name: file.name, size: file.size };
    document.getElementById('l-file-name').textContent = file.name;
    document.getElementById('l-file-size').textContent = fmtSize(file.size);
    document.getElementById('l-file-info').hidden = false;
    document.getElementById('l-file-add').hidden = true;
  });
  document.getElementById('l-file-del').addEventListener('click', () => {
    draftSetup = null;
    fileInput.value = '';
    document.getElementById('l-file-info').hidden = true;
    document.getElementById('l-file-add').hidden = false;
  });

  const mand = document.getElementById('l-mandatory');
  const mandHint = document.getElementById('l-mandatory-hint');
  mand.addEventListener('change', () => {
    mandHint.textContent = mand.checked
      ? 'فعال: کاربر برای استفاده باید حتماً آپدیت کند'
      : 'غیرفعال: کاربر می‌تواند بعداً آپدیت کند';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const version = document.getElementById('l-version').value.trim();
    if (!draftSetup) { alert('لطفاً فایل ستاپ لانچر را انتخاب کنید.'); return; }
    LAUNCHERS.unshift({
      id: Date.now(),
      version,
      date: document.getElementById('l-date').value.trim(),
      platform: document.getElementById('l-platform').value,
      fileName: draftSetup.name,
      size: draftSetup.size,
      mandatory: mand.checked,
      changelog: document.getElementById('l-changelog').value.trim(),
    });
    resetLauncherForm();
    mandHint.textContent = 'غیرفعال: کاربر می‌تواند بعداً آپدیت کند';
    renderLaunchers();
  });

  document.getElementById('launcher-reset').addEventListener('click', resetLauncherForm);
  renderLaunchers();
}

// ============================================
// سرورها — افزودن/حذف و نمایش وضعیت
// ============================================
let SERVERS = [
  { id: 1, name: 'سرور دانلود تهران', host: 'cdn-thr.x100.gg', type: 'دانلود', location: 'تهران، ایران', status: 'online', ping: 18, uptime: 99.9 },
  { id: 2, name: 'سرور بازی فرانکفورت', host: 'eu1.x100.gg', type: 'بازی', location: 'فرانکفورت، آلمان', status: 'online', ping: 62, uptime: 99.5 },
  { id: 3, name: 'تحریم‌شکن اصلی', host: 'shecan-1.x100.gg', type: 'تحریم‌شکن', location: 'آلمان', status: 'degraded', ping: 140, uptime: 97.2 },
  { id: 4, name: 'سرور دانلود مشهد', host: 'cdn-mhd.x100.gg', type: 'دانلود', location: 'مشهد، ایران', status: 'down', ping: 0, uptime: 84.1 },
];

const SRV_STATUS_LABEL = { online: 'آنلاین', down: 'قطع', degraded: 'کند' };

function renderServers() {
  document.getElementById('servers-count').textContent = faNum(SERVERS.length);

  // آمار بالا
  const up = SERVERS.filter((s) => s.status === 'online').length;
  const deg = SERVERS.filter((s) => s.status === 'degraded').length;
  const down = SERVERS.filter((s) => s.status === 'down').length;
  document.getElementById('server-stats').innerHTML = `
    <div class="server-stat server-stat--up"><div class="server-stat__num">${faNum(up)}</div><div class="server-stat__lbl">آنلاین</div></div>
    <div class="server-stat server-stat--deg"><div class="server-stat__num">${faNum(deg)}</div><div class="server-stat__lbl">کند</div></div>
    <div class="server-stat server-stat--down"><div class="server-stat__num">${faNum(down)}</div><div class="server-stat__lbl">قطع</div></div>
  `;

  const list = document.getElementById('servers-list');
  if (!SERVERS.length) {
    list.innerHTML = '<div class="empty-state">هنوز سروری اضافه نشده است</div>';
    return;
  }
  list.innerHTML = SERVERS.map((s) => `
    <div class="srv-card" data-sid="${s.id}">
      <span class="srv-led srv-led--${s.status}" title="${SRV_STATUS_LABEL[s.status]}"></span>
      <div class="srv-info">
        <div class="srv-info__name">${s.name}</div>
        <div class="srv-info__host">${s.host}${s.location ? ' • ' + s.location : ''}</div>
      </div>
      <span class="srv-type-chip">${s.type}</span>
      <div class="srv-meta">
        <div class="srv-meta__item">
          <div class="srv-meta__val srv-meta__val--${s.status}">${SRV_STATUS_LABEL[s.status]}</div>
          <div class="srv-meta__lbl">وضعیت</div>
        </div>
        <div class="srv-meta__item">
          <div class="srv-meta__val">${s.status === 'down' ? '—' : faNum(s.ping) + 'ms'}</div>
          <div class="srv-meta__lbl">پینگ</div>
        </div>
        <div class="srv-meta__item">
          <div class="srv-meta__val">${faNum(s.uptime)}٪</div>
          <div class="srv-meta__lbl">آپ‌تایم</div>
        </div>
      </div>
      <button class="srv-del" data-sid="${s.id}" title="حذف سرور"><span class="material-icons-outlined">delete</span></button>
    </div>
  `).join('');

  list.querySelectorAll('.srv-del').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sid = Number(btn.dataset.sid);
      const s = SERVERS.find((x) => x.id === sid);
      if (s && confirm(`سرور «${s.name}» حذف شود؟`)) {
        SERVERS = SERVERS.filter((x) => x.id !== sid);
        renderServers();
      }
    });
  });
}

function initServers() {
  const form = document.getElementById('server-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    SERVERS.unshift({
      id: Date.now(),
      name: document.getElementById('s-name').value.trim(),
      host: document.getElementById('s-host').value.trim(),
      type: document.getElementById('s-type').value,
      location: document.getElementById('s-location').value.trim(),
      status: 'online',
      ping: 20 + (SERVERS.length * 7) % 90,
      uptime: 100,
    });
    form.reset();
    renderServers();
  });
  document.getElementById('server-reset').addEventListener('click', () => form.reset());

  // بررسی وضعیت — شبیه‌سازی پینگ مجدد
  document.getElementById('servers-refresh').addEventListener('click', () => {
    SERVERS.forEach((s, i) => {
      if (s.status === 'down') return; // قطع، قطع می‌ماند تا دستی
      // نوسان پینگ و وضعیت بر اساس آپ‌تایم
      const jitter = ((Date.now() / 1000 + i * 13) % 50) | 0;
      s.ping = 15 + jitter;
      s.status = s.ping > 120 ? 'degraded' : 'online';
    });
    renderServers();
  });

  renderServers();
}

// ============================================
// انتشار — محتوای منتشرشده در لانچر
// ============================================
const PUB_KINDS = {
  home: ['بنر هیرو', 'بازی ویژه', 'خبر / اعلان', 'تخفیف'],
  game: ['بنر صفحهٔ بازی', 'آپدیت بازی', 'رویداد', 'تخفیف'],
};
const PUB_TITLE = { home: 'انتشار محتوا در خانهٔ لانچر', game: 'انتشار محتوا در صفحهٔ بازی' };
const PUB_LIST_LABEL = { home: 'محتوای خانه', game: 'محتوای بازی‌ها' };
let PUBLICATIONS = [
  { id: 1, target: 'home', kind: 'بنر هیرو', game: 'Counter-Strike 2', title: 'فصل جدید CS2 آغاز شد', subtitle: 'آماده، نشانه‌گیری، برد', desc: 'بتل‌پس فصل سوم با اسکین‌های جدید و نقشهٔ بازطراحی‌شده.', media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=240&fit=crop' }], live: true, date: '۲۵ خرداد ۱۴۰۴' },
  { id: 2, target: 'home', kind: 'تخفیف', game: 'Diablo IV', title: 'حراج تابستانهٔ x100', subtitle: 'فقط تا پایان هفته', desc: 'تا ۵۰٪ تخفیف روی بازی‌های منتخب فروشگاه.', media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=240&fit=crop' }], live: false, date: '۲۰ خرداد ۱۴۰۴' },
  { id: 3, target: 'game', kind: 'آپدیت بازی', game: '', title: 'آپدیت ۱.۴ منتشر شد', desc: 'بهبود سیستم ضدتقلب و رفع باگ‌های شبکه.', media: [], live: true, date: '۱۸ خرداد ۱۴۰۴' },
];
let pubTarget = 'home';
let pubDraftMedia = [];

function pubFillSelects() {
  document.getElementById('pub-kind').innerHTML = PUB_KINDS[pubTarget].map((k) => `<option>${k}</option>`).join('');
  const gameOpts = GAMES.map((g) => `<option>${g.name}</option>`).join('');
  const noGame = (pubTarget === 'game') ? '' : '<option value="">— بدون بازی —</option>';
  document.getElementById('pub-game').innerHTML = noGame + gameOpts;
}

function pubRenderDraftMedia() {
  const grid = document.getElementById('pub-media-grid');
  grid.innerHTML = pubDraftMedia.map((m, i) => `
    <div class="media-thumb" data-mi="${i}">
      <img src="${m.url}" alt=""><span class="media-thumb__badge"><span class="material-icons-outlined">image</span>عکس</span>
      ${i === 0 ? '<span class="media-thumb__cover">کاور</span>' : ''}
      <button type="button" class="media-thumb__del" data-mi="${i}"><span class="material-icons-outlined">close</span></button>
    </div>
  `).join('');
  grid.querySelectorAll('.media-thumb__del').forEach((btn) => {
    btn.addEventListener('click', () => { pubDraftMedia.splice(Number(btn.dataset.mi), 1); pubRenderDraftMedia(); });
  });
}

function pubResetForm() {
  document.getElementById('pub-form').reset();
  document.getElementById('pub-live').checked = true;
  document.getElementById('pub-live-hint').textContent = 'فعال: بلافاصله در لانچر نمایش داده می‌شود';
  pubDraftMedia = [];
  pubRenderDraftMedia();
}

function setPubTarget(t) {
  pubTarget = t;
  document.querySelectorAll('.admin-nav__subitem').forEach((s) => s.classList.toggle('admin-nav__subitem--active', s.dataset.pub === t));

  // سه بوم جداگانه: خانه / بازی / نوتیفیکیشن
  const isNotif = (t === 'notif');
  document.getElementById('pub-notif').hidden = !isNotif;
  document.getElementById('pub-home-canvas').hidden = (t !== 'home');
  document.getElementById('pub-game-canvas').hidden = (t !== 'game');
  document.getElementById('pub-layout').hidden = true;

  if (isNotif) { renderNotifications(); return; }
  if (t === 'game') { renderGameBanners(); return; }
  renderHomeBanners(); // حالت خانه
}

// ============================================
// بنر صفحهٔ بازی‌ها — افزودن/حذف بازی‌ها
// ============================================
const GAME_GENRES = ['استراتژی', 'MOBA', 'فانتزی', 'اسپرت', 'اکشن', 'نقش‌آفرینی', 'تیراندازی', 'بتل‌رویال', 'ماجراجویی', 'ترسناک'];
const GB_SHOTS_MIN = 3;
const GB_SHOTS_MAX = 6;
let gameBanners = [
  { id: 1, name: 'DOTA 2', suggest: 'چون بازی‌های استراتژی و فانتزی بازی کردی', genres: ['استراتژی', 'MOBA', 'فانتزی', 'اسپرت'], free: true, price: '', img: '', shots: [], open: false },
];
let gameBannerSeq = 2;
let dragGameBannerId = null;

function gbShotsHTML(b) {
  return (b.shots || []).map((url, si) => `
    <div class="media-thumb" data-si="${si}">
      <img src="${url}" alt="">
      <button type="button" class="media-thumb__del" data-si="${si}"><span class="material-icons-outlined">close</span></button>
    </div>`).join('');
}

function gameBannerCardHTML(b, i) {
  const genres = b.genres || [];
  return `
  <div class="bnr-card ${b.open ? 'bnr-card--open' : ''}" data-gbid="${b.id}">
    <div class="bnr-card__head">
      <span class="bnr-card__drag" title="بکشید تا ترتیب عوض شود"><span class="material-icons-outlined">drag_indicator</span></span>
      <button type="button" class="bnr-card__toggle">
        <span class="bnr-card__num">${faNum(i + 1)}</span>
        <span class="material-icons-outlined bnr-card__chevron">expand_more</span>
        <span class="bnr-card__thumb">${b.img ? `<img src="${b.img}" alt="">` : '<span class="material-icons-outlined">image</span>'}</span>
        <span class="bnr-card__title">${b.name || 'بازی بدون عنوان'}</span>
      </button>
      <button type="button" class="bnr-card__del" title="حذف بنر"><span class="material-icons-outlined">delete</span></button>
    </div>
    <div class="bnr-card__body">
      <input type="file" class="gb-img-input" accept="image/*" hidden>
      <div class="bnr-stage ${b.img ? 'bnr-stage--has-img' : ''}" ${b.img ? `style="background-image:url('${b.img}')"` : ''}>
        <div class="bnr-stage__upload">
          <button type="button" class="bnr-stage__upload-btn"><span class="material-icons-outlined">photo_camera</span>${b.img ? 'تغییر عکس' : 'افزودن عکس بنر'}</button>
          <div class="bnr-stage__hint">رزولوشن عکس بنر باید ۱۲۸۰×۷۲۰ باشد</div>
        </div>
        <div class="bnr-stage__content">
          <div class="bnr-stage__title gb-name" contenteditable="true" data-ph="اسم بازی">${b.name || ''}</div>
          <div class="gb-suggest-row"><span class="gb-suggest-label">پیشنهاد شده:</span> <span class="gb-suggest" contenteditable="true" data-ph="چرا این بازی پیشنهاد می‌شود؟">${b.suggest || ''}</span></div>
          <div class="gb-stage-genres">${genres.map((g) => `<span class="gb-genre-chip">${g}</span>`).join('')}</div>
          <div class="gb-stage-price">${b.free ? 'رایگان' : (b.price ? faNum(b.price) + ' تومان' : 'قیمت تعیین نشده')}</div>
        </div>
      </div>

      <div class="field"><span>ژانرها (چند انتخاب)</span>
        <div class="notif-tagpick gb-genres">
          ${GAME_GENRES.map((g) => `<label class="tag-check ${genres.includes(g) ? 'tag-check--on' : ''}"><input type="checkbox" value="${g}" ${genres.includes(g) ? 'checked' : ''}><span class="material-icons-outlined">sell</span>${g}</label>`).join('')}
        </div>
      </div>

      <label class="toggle-field">
        <input type="checkbox" class="gb-free" ${b.free ? 'checked' : ''}>
        <span class="toggle-switch"></span>
        <span class="toggle-label"><b>رایگان</b><small>اگر غیرفعال شود، قیمت بازی را وارد کنید</small></span>
      </label>
      <label class="field gb-price-field" ${b.free ? 'hidden' : ''}><span>قیمت (تومان)</span><input type="text" class="gb-price" value="${b.price || ''}" placeholder="مثلاً ۲۵۰٬۰۰۰"></label>

      <div class="form-section__title">عکس‌های محیط بازی (۳ تا ۶)</div>
      <div class="media-uploader">
        <input type="file" class="gb-shots-input" accept="image/*" multiple hidden>
        <button type="button" class="media-add-btn gb-shots-add"><span class="material-icons-outlined">add_photo_alternate</span>افزودن عکس محیط</button>
        <div class="media-grid gb-shots-grid">${gbShotsHTML(b)}</div>
      </div>
      <div class="banner-hint gb-shots-hint"></div>
    </div>
  </div>`;
}

function renderGameBanners() {
  document.getElementById('game-banner-count').textContent = faNum(gameBanners.length);
  const wrap = document.getElementById('game-banner-cards');
  if (!gameBanners.length) {
    wrap.innerHTML = '<div class="empty-state" style="padding:30px">هنوز بنری اضافه نشده — روی «افزودن بنر بازی» بزنید</div>';
    return;
  }
  wrap.innerHTML = gameBanners.map((b, i) => gameBannerCardHTML(b, i)).join('');
  gameBanners.forEach((b) => bindGameBannerCard(b));
}

function gbUpdateShotsHint(card, b) {
  const hint = card.querySelector('.gb-shots-hint');
  const n = (b.shots || []).length;
  if (n < GB_SHOTS_MIN) { hint.textContent = `حداقل ${faNum(GB_SHOTS_MIN)} عکس لازم است (الان ${faNum(n)}).`; hint.classList.add('banner-hint--warn'); }
  else if (n >= GB_SHOTS_MAX) { hint.textContent = `به حداکثر ${faNum(GB_SHOTS_MAX)} عکس رسیدید.`; hint.classList.remove('banner-hint--warn'); }
  else { hint.textContent = `${faNum(n)} عکس انتخاب شده (تا ${faNum(GB_SHOTS_MAX)} مجاز).`; hint.classList.remove('banner-hint--warn'); }
}

function bindGameBannerCard(b) {
  const card = document.querySelector(`.bnr-card[data-gbid="${b.id}"]`);
  if (!card) return;

  // درگ برای تغییر ترتیب
  const drag = card.querySelector('.bnr-card__drag');
  if (drag) {
    drag.addEventListener('mousedown', () => card.setAttribute('draggable', 'true'));
    drag.addEventListener('mouseup', () => card.removeAttribute('draggable'));
  }
  card.addEventListener('dragstart', (e) => { dragGameBannerId = b.id; card.classList.add('bnr-card--dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(b.id)); } catch (_) {} });
  card.addEventListener('dragend', () => { card.classList.remove('bnr-card--dragging'); card.removeAttribute('draggable'); document.querySelectorAll('.bnr-card--dragover').forEach((c) => c.classList.remove('bnr-card--dragover')); dragGameBannerId = null; });
  card.addEventListener('dragover', (e) => { if (dragGameBannerId === null || dragGameBannerId === b.id) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; card.classList.add('bnr-card--dragover'); });
  card.addEventListener('dragleave', () => card.classList.remove('bnr-card--dragover'));
  card.addEventListener('drop', (e) => {
    e.preventDefault(); card.classList.remove('bnr-card--dragover');
    if (dragGameBannerId === null || dragGameBannerId === b.id) return;
    const from = gameBanners.findIndex((x) => x.id === dragGameBannerId);
    const to = gameBanners.findIndex((x) => x.id === b.id);
    dragGameBannerId = null;
    if (from === -1 || to === -1) return;
    const [moved] = gameBanners.splice(from, 1);
    gameBanners.splice(to, 0, moved);
    renderGameBanners();
  });

  card.querySelector('.bnr-card__toggle').addEventListener('click', () => { b.open = !b.open; card.classList.toggle('bnr-card--open', b.open); });
  card.querySelector('.bnr-card__del').addEventListener('click', () => { if (confirm('این بنر بازی حذف شود؟')) { gameBanners = gameBanners.filter((x) => x.id !== b.id); renderGameBanners(); } });

  // اسم بازی و متن پیشنهاد (ویرایش روی بنر)
  const nameEl = card.querySelector('.gb-name');
  nameEl.addEventListener('input', () => { if (!nameEl.textContent.trim()) nameEl.innerHTML = ''; b.name = nameEl.textContent.trim(); card.querySelector('.bnr-card__title').textContent = b.name || 'بازی بدون عنوان'; });
  const sugEl = card.querySelector('.gb-suggest');
  sugEl.addEventListener('input', () => { if (!sugEl.textContent.trim()) sugEl.innerHTML = ''; b.suggest = sugEl.textContent.trim(); });

  // آپلود عکس بنر
  const imgInput = card.querySelector('.gb-img-input');
  const stage = card.querySelector('.bnr-stage');
  const upBtn = card.querySelector('.bnr-stage__upload-btn');
  upBtn.addEventListener('click', () => imgInput.click());
  imgInput.addEventListener('change', () => {
    const f = imgInput.files[0]; if (!f) return;
    b.img = URL.createObjectURL(f);
    stage.classList.add('bnr-stage--has-img'); stage.style.backgroundImage = `url('${b.img}')`;
    upBtn.lastChild.textContent = 'تغییر عکس';
    card.querySelector('.bnr-card__thumb').innerHTML = `<img src="${b.img}" alt="">`;
  });

  // ژانرها (چک‌باکس) — به‌روزرسانی زندهٔ چیپ‌های روی بنر
  const stageGenres = card.querySelector('.gb-stage-genres');
  card.querySelectorAll('.gb-genres input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      cb.closest('.tag-check').classList.toggle('tag-check--on', cb.checked);
      b.genres = Array.from(card.querySelectorAll('.gb-genres input:checked')).map((x) => x.value);
      stageGenres.innerHTML = b.genres.map((g) => `<span class="gb-genre-chip">${g}</span>`).join('');
    });
  });

  // رایگان / قیمت
  const free = card.querySelector('.gb-free');
  const priceField = card.querySelector('.gb-price-field');
  const priceInput = card.querySelector('.gb-price');
  const stagePrice = card.querySelector('.gb-stage-price');
  const refreshPrice = () => { stagePrice.textContent = b.free ? 'رایگان' : (b.price ? faNum(b.price) + ' تومان' : 'قیمت تعیین نشده'); };
  free.addEventListener('change', () => { b.free = free.checked; priceField.hidden = b.free; refreshPrice(); });
  priceInput.addEventListener('input', () => { b.price = priceInput.value.trim(); refreshPrice(); });

  // عکس‌های محیط بازی
  const shotsInput = card.querySelector('.gb-shots-input');
  const shotsGrid = card.querySelector('.gb-shots-grid');
  const renderShots = () => {
    shotsGrid.innerHTML = gbShotsHTML(b);
    shotsGrid.querySelectorAll('.media-thumb__del').forEach((btn) => btn.addEventListener('click', () => { b.shots.splice(Number(btn.dataset.si), 1); renderShots(); }));
    gbUpdateShotsHint(card, b);
  };
  card.querySelector('.gb-shots-add').addEventListener('click', () => shotsInput.click());
  shotsInput.addEventListener('change', () => {
    b.shots = b.shots || [];
    Array.from(shotsInput.files).forEach((f) => { if (b.shots.length < GB_SHOTS_MAX) b.shots.push(URL.createObjectURL(f)); });
    shotsInput.value = '';
    renderShots();
  });
  renderShots();
}

function initGameBanners() {
  document.getElementById('game-banner-toggle').addEventListener('click', () => {
    document.getElementById('game-banner-acc').classList.toggle('acc--open');
  });
  document.getElementById('game-banner-add').addEventListener('click', () => {
    gameBanners.push({ id: gameBannerSeq++, name: '', suggest: '', genres: [], free: true, price: '', img: '', shots: [], open: true });
    document.getElementById('game-banner-acc').classList.add('acc--open');
    renderGameBanners();
  });

  // راهنمای اطلاعات (باز/بسته با کلیک، بستن با کلیک بیرون)
  const gInfoBtn = document.getElementById('game-banner-info');
  const gInfoPop = document.getElementById('game-banner-info-pop');
  if (gInfoBtn && gInfoPop) {
    gInfoBtn.addEventListener('click', (e) => { e.stopPropagation(); gInfoPop.hidden = !gInfoPop.hidden; });
    document.addEventListener('click', (e) => {
      if (!gInfoPop.hidden && !gInfoPop.contains(e.target) && !gInfoBtn.contains(e.target)) gInfoPop.hidden = true;
    });
  }

  renderGameBanners();
}

// ============================================
// بنر خانه — کارت‌های آکاردئونی با مشخصات کامل
// ============================================
let homeBanners = [];
let homeBannerSeq = 1;
let dragBannerId = null;
const BANNER_MIN = 3;
const BANNER_MAX = 7;

// مسیرهای ممکن برای دکمهٔ روی بنر
const BNR_BTN_ACTIONS = {
  game: 'صفحهٔ بازی',
  url: 'لینک / وب‌پیج',
  social: 'شبکهٔ اجتماعی',
  tournament: 'بخش تورنومنت',
  stream: 'بخش استریم',
};

function bannerBtnTargetHTML(b) {
  if (b.btnActionType === 'game') {
    const opts = GAMES.map((g) => `<option ${b.btnActionValue === g.name ? 'selected' : ''}>${g.name}</option>`).join('');
    return `<label class="field"><span>بازی مقصد</span><select class="bnr-btn-value">${opts}</select></label>`;
  }
  if (b.btnActionType === 'url') {
    return `<label class="field"><span>آدرس لینک</span><input type="text" class="bnr-btn-value" value="${b.btnActionValue || ''}" placeholder="https://example.com"></label>`;
  }
  if (b.btnActionType === 'social') {
    return `<label class="field"><span>لینک شبکهٔ اجتماعی</span><input type="text" class="bnr-btn-value" value="${b.btnActionValue || ''}" placeholder="https://instagram.com/yourpage"></label>`;
  }
  return ''; // تورنومنت / استریم نیازی به مقدار اضافه ندارند
}

function bindBannerBtnTarget(b, card) {
  const t = card.querySelector('.bnr-btn-value');
  if (!t) { b.btnActionValue = ''; return; }
  if (t.tagName === 'SELECT') {
    b.btnActionValue = t.value;
    t.addEventListener('change', () => { b.btnActionValue = t.value; });
  } else {
    t.addEventListener('input', () => { b.btnActionValue = t.value; });
  }
}

function bannerCardHTML(b, i) {
  return `
  <div class="bnr-card ${b.open ? 'bnr-card--open' : ''}" data-bid="${b.id}">
    <div class="bnr-card__head">
      <span class="bnr-card__drag" title="بکشید تا ترتیب عوض شود"><span class="material-icons-outlined">drag_indicator</span></span>
      <button type="button" class="bnr-card__toggle">
        <span class="bnr-card__num">${faNum(i + 1)}</span>
        <span class="material-icons-outlined bnr-card__chevron">expand_more</span>
        <span class="bnr-card__thumb">${b.img ? `<img src="${b.img}" alt="">` : '<span class="material-icons-outlined">image</span>'}</span>
        <span class="bnr-card__title">${b.title || 'بنر بدون عنوان'}</span>
      </button>
      <button type="button" class="bnr-card__del" title="حذف بنر"><span class="material-icons-outlined">delete</span></button>
    </div>
    <div class="bnr-card__body">
      <input type="file" class="bnr-img-input" accept="image/*" hidden>

      <!-- پیش‌نمایش زندهٔ بنر — عنوان/زیرعنوان/متن مستقیم روی همین عکس ویرایش می‌شوند -->
      <div class="bnr-stage ${b.img ? 'bnr-stage--has-img' : ''}" ${b.img ? `style="background-image:url('${b.img}')"` : ''}>
        <div class="bnr-stage__upload">
          <button type="button" class="bnr-stage__upload-btn"><span class="material-icons-outlined">photo_camera</span>${b.img ? 'تغییر عکس' : 'افزودن عکس'}</button>
          <div class="bnr-stage__hint">رزولوشن عکس آپلودی باید ۱۲۸۰×۷۲۰ باشد</div>
        </div>
        <div class="bnr-stage__content">
          <div class="bnr-stage__title" contenteditable="true" data-ph="عنوان بنر">${b.title || ''}</div>
          <div class="bnr-stage__subtitle" contenteditable="true" data-ph="زیرعنوان / شعار">${b.subtitle || ''}</div>
          <div class="bnr-stage__text" contenteditable="true" data-ph="متن توضیحات بنر...">${b.text || ''}</div>
          <button type="button" class="bnr-stage__cta" ${b.hasButton ? '' : 'hidden'}>${b.btnLabel || 'مشاهده'} <span>←</span></button>
        </div>
      </div>

      <!-- تنظیمات دکمهٔ روی بنر -->
      <label class="toggle-field">
        <input type="checkbox" class="bnr-has-btn" ${b.hasButton ? 'checked' : ''}>
        <span class="toggle-switch"></span>
        <span class="toggle-label">
          <b>دکمه دارد</b>
          <small>اگر فعال شود، روی بنر یک دکمه نمایش داده می‌شود</small>
        </span>
      </label>
      <div class="bnr-btn-fields" ${b.hasButton ? '' : 'hidden'}>
        <div class="field-row">
          <label class="field"><span>نام دکمه</span><input type="text" class="bnr-btn-label" value="${b.btnLabel || ''}" placeholder="مثلاً مشاهده"></label>
          <label class="field"><span>مسیر دکمه (بعد از کلیک)</span>
            <select class="bnr-btn-action-type">${Object.entries(BNR_BTN_ACTIONS).map(([k, v]) => `<option value="${k}" ${b.btnActionType === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
          </label>
        </div>
        <div class="bnr-btn-target">${bannerBtnTargetHTML(b)}</div>
      </div>
    </div>
  </div>`;
}

function renderHomeBanners() {
  document.getElementById('home-banner-count').textContent = faNum(homeBanners.length);
  const addBtn = document.getElementById('home-banner-add');
  if (addBtn) addBtn.disabled = homeBanners.length >= BANNER_MAX;
  const wrap = document.getElementById('home-banner-cards');
  if (!homeBanners.length) {
    wrap.innerHTML = '<div class="empty-state" style="padding:30px">هنوز بنری اضافه نشده — روی «افزودن بنر» بزنید</div>';
    return;
  }
  wrap.innerHTML = homeBanners.map((b, i) => bannerCardHTML(b, i)).join('');
  homeBanners.forEach((b) => bindBannerCard(b));
}

function bindBannerCard(b) {
  const card = document.querySelector(`.bnr-card[data-bid="${b.id}"]`);
  if (!card) return;

  // درگ برای تغییر ترتیب — فقط از طریق دستگیره فعال می‌شود
  const drag = card.querySelector('.bnr-card__drag');
  if (drag) {
    drag.addEventListener('mousedown', () => card.setAttribute('draggable', 'true'));
    drag.addEventListener('mouseup', () => card.removeAttribute('draggable'));
  }
  card.addEventListener('dragstart', (e) => {
    dragBannerId = b.id;
    card.classList.add('bnr-card--dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', String(b.id)); } catch (_) {}
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('bnr-card--dragging');
    card.removeAttribute('draggable');
    document.querySelectorAll('.bnr-card--dragover').forEach((c) => c.classList.remove('bnr-card--dragover'));
    dragBannerId = null;
  });
  card.addEventListener('dragover', (e) => {
    if (dragBannerId === null || dragBannerId === b.id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    card.classList.add('bnr-card--dragover');
  });
  card.addEventListener('dragleave', () => card.classList.remove('bnr-card--dragover'));
  card.addEventListener('drop', (e) => {
    e.preventDefault();
    card.classList.remove('bnr-card--dragover');
    if (dragBannerId === null || dragBannerId === b.id) return;
    const from = homeBanners.findIndex((x) => x.id === dragBannerId);
    const to = homeBanners.findIndex((x) => x.id === b.id);
    dragBannerId = null;
    if (from === -1 || to === -1) return;
    const [moved] = homeBanners.splice(from, 1);
    homeBanners.splice(to, 0, moved);
    renderHomeBanners(); // شماره‌ها بعد از جابه‌جایی به‌روز می‌شوند
  });

  card.querySelector('.bnr-card__toggle').addEventListener('click', () => {
    b.open = !b.open;
    card.classList.toggle('bnr-card--open', b.open);
  });
  card.querySelector('.bnr-card__del').addEventListener('click', () => {
    if (homeBanners.length <= BANNER_MIN) { showBannerHint(`حداقل ${faNum(BANNER_MIN)} بنر باید وجود داشته باشد.`, true); return; }
    if (confirm('این بنر حذف شود؟')) {
      homeBanners = homeBanners.filter((x) => x.id !== b.id);
      renderHomeBanners();
    }
  });

  // ویرایش زندهٔ متن‌ها مستقیم روی بنر (contenteditable)
  const titleEl = card.querySelector('.bnr-stage__title');
  titleEl.addEventListener('input', () => {
    if (!titleEl.textContent.trim()) titleEl.innerHTML = '';
    b.title = titleEl.textContent.trim();
    card.querySelector('.bnr-card__title').textContent = b.title || 'بنر بدون عنوان';
  });
  const subEl = card.querySelector('.bnr-stage__subtitle');
  subEl.addEventListener('input', () => { if (!subEl.textContent.trim()) subEl.innerHTML = ''; b.subtitle = subEl.textContent.trim(); });
  const textEl = card.querySelector('.bnr-stage__text');
  textEl.addEventListener('input', () => { if (!textEl.textContent.trim()) textEl.innerHTML = ''; b.text = textEl.textContent.trim(); });

  // تنظیمات دکمهٔ روی بنر
  const hasBtn = card.querySelector('.bnr-has-btn');
  const btnFields = card.querySelector('.bnr-btn-fields');
  const cta = card.querySelector('.bnr-stage__cta');
  const btnLabelInput = card.querySelector('.bnr-btn-label');
  const actionTypeSel = card.querySelector('.bnr-btn-action-type');
  const targetWrap = card.querySelector('.bnr-btn-target');
  hasBtn.addEventListener('change', () => {
    b.hasButton = hasBtn.checked;
    btnFields.hidden = !b.hasButton;
    if (cta) cta.hidden = !b.hasButton;
  });
  btnLabelInput.addEventListener('input', () => {
    b.btnLabel = btnLabelInput.value;
    if (cta) cta.firstChild.textContent = (b.btnLabel || 'مشاهده') + ' ';
  });
  // مسیر دکمه (منوی کشویی) + فیلد مقصد وابسته
  actionTypeSel.addEventListener('change', () => {
    b.btnActionType = actionTypeSel.value;
    b.btnActionValue = '';
    targetWrap.innerHTML = bannerBtnTargetHTML(b);
    bindBannerBtnTarget(b, card);
  });
  bindBannerBtnTarget(b, card);

  // آپلود عکس بنر روی همان استیج (بدون رندر مجدد تا متن‌ها حفظ شوند)
  const fileInput = card.querySelector('.bnr-img-input');
  const stage = card.querySelector('.bnr-stage');
  const uploadBtn = card.querySelector('.bnr-stage__upload-btn');
  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (!f) return;
    b.img = URL.createObjectURL(f);
    stage.classList.add('bnr-stage--has-img');
    stage.style.backgroundImage = `url('${b.img}')`;
    uploadBtn.lastChild.textContent = 'تغییر عکس';
    card.querySelector('.bnr-card__thumb').innerHTML = `<img src="${b.img}" alt="">`;
  });
}

function showBannerHint(msg, warn) {
  const el = document.getElementById('home-banner-hint');
  if (!el) return;
  el.textContent = msg || `می‌توانید بین ${faNum(BANNER_MIN)} تا ${faNum(BANNER_MAX)} بنر داشته باشید.`;
  el.classList.toggle('banner-hint--warn', !!warn);
}

function initHomeBanners() {
  // حداقل ۳ بنر به‌صورت پیش‌فرض موجود باشد
  if (!homeBanners.length) {
    for (let k = 0; k < BANNER_MIN; k++) {
      homeBanners.push({ id: homeBannerSeq++, img: '', title: '', subtitle: '', text: '', hasButton: true, btnLabel: 'مشاهده', btnActionType: 'game', btnActionValue: '', open: false });
    }
  }
  document.getElementById('home-banner-toggle').addEventListener('click', () => {
    document.getElementById('home-banner-acc').classList.toggle('acc--open');
  });
  document.getElementById('home-banner-add').addEventListener('click', () => {
    if (homeBanners.length >= BANNER_MAX) { showBannerHint(`حداکثر ${faNum(BANNER_MAX)} بنر می‌توانید اضافه کنید.`, true); return; }
    homeBanners.push({ id: homeBannerSeq++, img: '', title: '', subtitle: '', text: '', hasButton: true, btnLabel: 'مشاهده', btnActionType: 'game', btnActionValue: '', open: true });
    document.getElementById('home-banner-acc').classList.add('acc--open');
    renderHomeBanners();
    showBannerHint();
  });

  // راهنمای اطلاعات (باز/بسته با کلیک، بستن با کلیک بیرون)
  const infoBtn = document.getElementById('home-banner-info');
  const infoPop = document.getElementById('home-banner-info-pop');
  if (infoBtn && infoPop) {
    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      infoPop.hidden = !infoPop.hidden;
    });
    document.addEventListener('click', (e) => {
      if (!infoPop.hidden && !infoPop.contains(e.target) && !infoBtn.contains(e.target)) {
        infoPop.hidden = true;
      }
    });
  }

  renderHomeBanners();
  showBannerHint();
}

function renderPublications() {
  const rows = PUBLICATIONS.filter((p) => p.target === pubTarget);
  document.getElementById('pub-list-head').innerHTML =
    `${PUB_LIST_LABEL[pubTarget]} <span class="badge-count">${faNum(rows.length)}</span>`;
  const list = document.getElementById('pub-list');
  if (!rows.length) {
    list.innerHTML = '<div class="empty-state">هنوز محتوایی منتشر نشده است</div>';
    return;
  }
  list.innerHTML = rows.map((p) => {
    const cover = p.media && p.media[0];
    return `
    <div class="pub-card" data-pid="${p.id}">
      <div class="pub-card__cover">${cover ? `<img src="${cover.url}" alt="">` : '<span class="material-icons-outlined">campaign</span>'}</div>
      <div class="pub-card__body">
        <div class="pub-card__top">
          <span class="pub-card__kind">${p.kind}</span>
          <span class="pub-status ${p.live ? 'pub-status--live' : 'pub-status--draft'}">${p.live ? 'منتشرشده' : 'پیش‌نویس'}</span>
        </div>
        <div class="pub-card__title">${p.title}</div>
        ${p.subtitle ? `<div class="pub-card__subtitle">${p.subtitle}</div>` : ''}
        ${p.game ? `<div class="pub-card__game"><span class="material-icons-outlined">sports_esports</span>${p.game}</div>` : ''}
        ${p.desc ? `<div class="pub-card__desc">${p.desc}</div>` : ''}
        <div class="pub-card__meta"><span class="material-icons-outlined">schedule</span>${p.date}</div>
      </div>
      <div class="pub-card__actions">
        <button class="icon-btn" data-action="toggle" title="${p.live ? 'لغو انتشار' : 'انتشار'}"><span class="material-icons-outlined">${p.live ? 'visibility_off' : 'publish'}</span></button>
        <button class="icon-btn icon-btn--del" data-action="del" title="حذف"><span class="material-icons-outlined">delete</span></button>
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pid = Number(btn.closest('.pub-card').dataset.pid);
      const p = PUBLICATIONS.find((x) => x.id === pid);
      if (!p) return;
      if (btn.dataset.action === 'toggle') {
        p.live = !p.live;
        renderPublications();
      } else if (btn.dataset.action === 'del') {
        if (confirm(`محتوای «${p.title}» حذف شود؟`)) {
          PUBLICATIONS = PUBLICATIONS.filter((x) => x.id !== pid);
          renderPublications();
        }
      }
    });
  });
}

// ============================================
// انتشار پیام / نوتیفیکیشن
// ============================================
// نوع پیام (تک‌انتخابی — آیکون و رنگ) و تگ‌ها (چندانتخابی)
const NOTIF_TYPES = {
  warning: { label: 'هشدار', icon: 'warning',  color: 'var(--red)' },
  news:    { label: 'خبری',  icon: 'campaign', color: 'var(--primary)' },
  reward:  { label: 'جایزه', icon: 'redeem',   color: 'var(--green)' },
};
const NOTIF_TAG_LIST = { tournament: 'تورنومنت', stream: 'استریم', general: 'پیام کلی' };
const NOTIF_WINDOWS = { all: 0, h1: 3600e3, h12: 12 * 3600e3, d1: 24 * 3600e3, w1: 7 * 24 * 3600e3, mo1: 30 * 24 * 3600e3 };
const _notifNow = Date.now();
let NOTIFICATIONS = [
  { id: 1, scope: 'public', userName: '', title: 'فصل جدید آغاز شد', text: 'فصل سوم با جوایز و رویدادهای ویژه شروع شد — همین حالا وارد شوید!', type: 'news', tags: ['tournament'], ts: _notifNow - 40 * 60 * 1000 },
  { id: 5, scope: 'public', userName: '', title: 'استریم ویژهٔ آخر هفته', text: 'پنجشنبه ساعت ۲۱ منتظرتان هستیم.', type: 'news', tags: ['stream'], ts: _notifNow - 2 * 3600 * 1000 },
  { id: 2, scope: 'private', userId: 3, userName: 'آرش کریمی', userHandle: '@ArashGG', userPhone: '0901 887 6655', title: 'جایزهٔ شما آماده است', text: '۵۰۰ سکهٔ X به حساب شما اضافه شد.', type: 'reward', tags: ['general'], ts: _notifNow - 8 * 3600 * 1000 },
  { id: 6, scope: 'private', userId: 8, userName: 'پیمان شریفی', userHandle: '@NightWolf_IR', userPhone: '0991 445 6677', title: 'تأیید پروفایل', text: 'اطلاعات حساب شما با موفقیت تأیید شد.', type: 'news', tags: [], ts: _notifNow - 5 * 3600 * 1000 },
  { id: 3, scope: 'public', userName: '', title: 'به‌روزرسانی لانچر', text: 'نسخهٔ ۱.۴ لانچر منتشر شد؛ همین حالا آپدیت کنید.', type: 'news', tags: ['general'], ts: _notifNow - 3 * 24 * 3600 * 1000 },
  { id: 4, scope: 'private', userId: 11, userName: 'مریم اکبری', userHandle: '@MaryGamer', userPhone: '0922 556 7788', title: 'هشدار امنیتی', text: 'ورود ناشناس به حساب شما شناسایی شد.', type: 'warning', tags: [], ts: _notifNow - 12 * 24 * 3600 * 1000 },
];
let notifScope = 'public';
let notifTargetId = null;
let notifHistTab = 'public';
let notifTimeFilter = 'all';
let notifTypeFilter = 'all';
let notifSearch = '';
let notifTagFilter = 'all';
let pendingNotif = null;   // پیام در انتظار تأیید در پاپ‌آپ
let editingNotifId = null;

function relativeTime(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'هم‌اکنون';
  if (m < 60) return `${faNum(m)} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${faNum(h)} ساعت پیش`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${faNum(d)} روز پیش`;
  return `${faNum(Math.floor(d / 30))} ماه پیش`;
}

function fmtSchedule(v) {
  if (!v) return '';
  const [d, t] = v.split('T');
  return `${faNum((d || '').replace(/-/g, '/'))} ساعت ${faNum(t || '')}`;
}

// تگ‌های چندانتخابی (چک‌باکس) در فرم/ویرایش
function renderTagChecks(containerId, selected) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  const sel = selected || [];
  wrap.innerHTML = Object.keys(NOTIF_TAG_LIST).map((k) => `
    <label class="tag-check ${sel.includes(k) ? 'tag-check--on' : ''}">
      <input type="checkbox" value="${k}" ${sel.includes(k) ? 'checked' : ''}>
      <span class="material-icons-outlined">sell</span>${NOTIF_TAG_LIST[k]}
    </label>`).join('');
  wrap.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', () => cb.closest('.tag-check').classList.toggle('tag-check--on', cb.checked));
  });
}
function getCheckedTags(containerId) {
  return Array.from(document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`)).map((cb) => cb.value);
}

function setNotifTagFilter(tag) {
  notifTagFilter = tag;
  renderNotifTagChips();
  renderNotifications();
}

function renderNotifTagChips() {
  const wrap = document.getElementById('notif-tag-chips');
  if (!wrap) return;
  const chip = (key, label) => `<button type="button" class="notif-chip ${notifTagFilter === key ? 'notif-chip--active' : ''}" data-tag="${key}">${label}</button>`;
  wrap.innerHTML = chip('all', 'همه') + Object.keys(NOTIF_TAG_LIST).map((k) => chip(k, NOTIF_TAG_LIST[k])).join('');
  wrap.querySelectorAll('[data-tag]').forEach((b) => b.addEventListener('click', () => setNotifTagFilter(b.dataset.tag)));
}

function resetNotifForm() {
  document.getElementById('notif-form').reset();
  notifScope = 'public';
  notifTargetId = null;
  document.querySelectorAll('.notif-scope__btn').forEach((b) => b.classList.toggle('notif-scope__btn--active', b.dataset.scope === 'public'));
  document.getElementById('notif-target').hidden = true;
  document.getElementById('notif-schedule-field').hidden = true;
  renderTagChecks('notif-tags', []);
  renderNotifUserList('');
}

function setNotifHistTab(tab) {
  notifHistTab = tab;
  notifTagFilter = 'all';
  document.querySelectorAll('.notif-htab').forEach((t) => t.classList.toggle('notif-htab--active', t.dataset.htab === tab));
  renderNotifTagChips();
  renderNotifications();
}

function renderNotifUserList(q) {
  const list = document.getElementById('notif-user-list');
  if (!list) return;
  const query = enNum((q || '').trim().toLowerCase());
  const qDigits = query.replace(/\D/g, '');
  const rows = USERS.filter((u) => {
    if (!query) return true;
    const handle = u.handle.toLowerCase();
    const byText = u.name.toLowerCase().includes(query) || handle.includes(query) || handle.replace('@', '').includes(query);
    const byPhone = qDigits.length >= 2 && enNum(u.phone).replace(/\D/g, '').includes(qDigits);
    return byText || byPhone;
  });
  list.innerHTML = rows.slice(0, 8).map((u) => `
    <button type="button" class="notif-user ${notifTargetId === u.id ? 'notif-user--active' : ''}" data-uid="${u.id}">
      <img src="${u.avatar}" alt="">
      <div class="notif-user__meta">
        <div class="notif-user__name">${u.name}</div>
        <div class="notif-user__handle">${u.handle} <span class="notif-user__phone">${u.phone}</span></div>
      </div>
      ${notifTargetId === u.id ? '<span class="material-icons-outlined">check_circle</span>' : ''}
    </button>
  `).join('') || '<div class="empty-state" style="padding:18px">کاربری یافت نشد</div>';
  list.querySelectorAll('[data-uid]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const uid = Number(btn.dataset.uid);
      notifTargetId = (notifTargetId === uid) ? null : uid;
      renderNotifUserList(document.getElementById('notif-user-search').value);
    });
  });
}

function renderNotifications() {
  const list = document.getElementById('notif-history');
  if (!list) return;
  const win = NOTIF_WINDOWS[notifTimeFilter] || 0;
  const cutoff = win ? Date.now() - win : 0;
  const q = enNum(notifSearch.trim().toLowerCase());
  const qDigits = q.replace(/\D/g, '');
  const matchSearch = (n) => {
    if (!q) return true;
    if ((n.title || '').toLowerCase().includes(q)) return true;
    if ((n.text || '').toLowerCase().includes(q)) return true;
    // برای پیام خصوصی: نام، نام کاربری و شمارهٔ تلفن گیرنده هم جستجو می‌شود
    if (n.scope === 'private') {
      if ((n.userName || '').toLowerCase().includes(q)) return true;
      const h = (n.userHandle || '').toLowerCase();
      if (h.includes(q) || h.replace('@', '').includes(q)) return true;
      if (qDigits.length >= 2 && enNum(n.userPhone || '').replace(/\D/g, '').includes(qDigits)) return true;
    }
    return false;
  };
  const matchType = (n) => notifTypeFilter === 'all' || n.type === notifTypeFilter;
  const base = (n) => (!cutoff || n.ts >= cutoff) && matchSearch(n) && matchType(n);
  const pub = NOTIFICATIONS.filter((n) => n.scope === 'public' && base(n));
  const prv = NOTIFICATIONS.filter((n) => n.scope === 'private' && base(n));
  document.getElementById('notif-count-public').textContent = faNum(pub.length);
  document.getElementById('notif-count-private').textContent = faNum(prv.length);
  let rows = notifHistTab === 'public' ? pub : prv;
  if (notifTagFilter !== 'all') rows = rows.filter((n) => (n.tags || []).includes(notifTagFilter));
  if (!rows.length) {
    list.innerHTML = '<div class="empty-state">پیامی با این فیلترها پیدا نشد</div>';
    return;
  }
  list.innerHTML = rows.map((n) => {
    const ty = NOTIF_TYPES[n.type] || NOTIF_TYPES.news;
    const tagBadges = (n.tags || []).map((t) => `<span class="notif-tag-badge">${NOTIF_TAG_LIST[t] || t}</span>`).join('');
    return `
    <div class="notif-item">
      <span class="notif-item__icon material-icons-outlined" style="color:${ty.color}">${ty.icon}</span>
      <div class="notif-item__body">
        <div class="notif-item__top">
          <span class="notif-item__title">${n.title}</span>
          <span class="notif-type-badge" style="color:${ty.color}">${ty.label}</span>
          ${n.scope === 'public'
            ? '<span class="notif-scope-badge notif-scope-badge--pub">عمومی</span>'
            : `<span class="notif-scope-badge notif-scope-badge--prv">خصوصی</span><button type="button" class="notif-recipient" data-uid="${n.userId}" title="مشاهدهٔ پروفایل کاربر"><span class="material-icons-outlined">account_circle</span>${n.userName}</button>`}
        </div>
        ${tagBadges ? `<div class="notif-item__tags">${tagBadges}</div>` : ''}
        <div class="notif-item__text">${n.text}</div>
        ${n.scheduledAt
          ? `<div class="notif-item__date notif-item__date--sched"><span class="material-icons-outlined">schedule_send</span>زمان‌بندی: ${fmtSchedule(n.scheduledAt)}</div>`
          : `<div class="notif-item__date"><span class="material-icons-outlined">schedule</span>${relativeTime(n.ts)}</div>`}
      </div>
      <div class="notif-item__actions">
        <button class="icon-btn" data-act="edit" data-nid="${n.id}" title="ویرایش"><span class="material-icons-outlined">edit</span></button>
        <button class="icon-btn" data-act="resend" data-nid="${n.id}" title="ارسال مجدد"><span class="material-icons-outlined">send</span></button>
        <button class="icon-btn icon-btn--del" data-act="del" data-nid="${n.id}" title="حذف"><span class="material-icons-outlined">delete</span></button>
      </div>
    </div>`;
  }).join('');
  list.querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.nid);
      const n = NOTIFICATIONS.find((x) => x.id === id);
      if (!n) return;
      if (btn.dataset.act === 'del') {
        NOTIFICATIONS = NOTIFICATIONS.filter((x) => x.id !== id);
        renderNotifications();
      } else if (btn.dataset.act === 'edit') {
        openNotifEdit(n);
      } else if (btn.dataset.act === 'resend') {
        openNotifPreview({ scope: n.scope, userId: n.userId, userName: n.userName, userHandle: n.userHandle, userPhone: n.userPhone, title: n.title, text: n.text, type: n.type, tags: (n.tags || []).slice() }, false);
      }
    });
  });
  // کلیک روی نام گیرنده → باز شدن مودال جزئیات کاربر
  list.querySelectorAll('.notif-recipient').forEach((btn) => {
    btn.addEventListener('click', () => {
      const uid = Number(btn.dataset.uid);
      if (uid) openUserModal(uid);
    });
  });
}

// پاپ‌آپ پیش‌نمایش/تأیید ارسال
function openNotifPreview(data, fromForm) {
  pendingNotif = Object.assign({}, data, { fromForm: !!fromForm });
  const ty = NOTIF_TYPES[data.type] || NOTIF_TYPES.news;
  const tags = data.tags || [];
  const tagBadges = tags.map((t) => `<span class="notif-tag-badge">${NOTIF_TAG_LIST[t] || t}</span>`).join('');
  document.getElementById('notif-preview-body').innerHTML = `
    <div class="notif-item">
      <span class="notif-item__icon material-icons-outlined" style="color:${ty.color}">${ty.icon}</span>
      <div class="notif-item__body">
        <div class="notif-item__top">
          <span class="notif-item__title">${data.title || '(بدون عنوان)'}</span>
          <span class="notif-type-badge" style="color:${ty.color}">${ty.label}</span>
          <span class="notif-scope-badge ${data.scope === 'public' ? 'notif-scope-badge--pub' : 'notif-scope-badge--prv'}">${data.scope === 'public' ? 'عمومی' : 'خصوصی: ' + data.userName}</span>
        </div>
        ${tagBadges ? `<div class="notif-item__tags">${tagBadges}</div>` : ''}
        <div class="notif-item__text">${data.text || ''}</div>
      </div>
    </div>
    <div class="notif-preview__meta">
      <span><b>مخاطب:</b> ${data.scope === 'public' ? 'همهٔ کاربران' : data.userName}</span>
      <span><b>نوع:</b> ${ty.label}</span>
      <span><b>تگ‌ها:</b> ${tags.length ? tags.map((t) => NOTIF_TAG_LIST[t]).join('، ') : '—'}</span>
      <span><b>زمان ارسال:</b> ${data.scheduledAt ? fmtSchedule(data.scheduledAt) : 'فوری'}</span>
    </div>`;
  document.getElementById('notif-preview-modal').hidden = false;
}
function closeNotifPreview() {
  document.getElementById('notif-preview-modal').hidden = true;
  pendingNotif = null;
}
function confirmNotifSend() {
  if (!pendingNotif) return;
  const d = pendingNotif;
  NOTIFICATIONS.unshift({ id: Date.now(), scope: d.scope, userId: d.userId || null, userName: d.userName, userHandle: d.userHandle || '', userPhone: d.userPhone || '', title: d.title, text: d.text, type: d.type, tags: (d.tags || []).slice(), scheduledAt: d.scheduledAt || '', ts: Date.now() });
  const scope = d.scope;
  const fromForm = d.fromForm;
  closeNotifPreview();
  if (fromForm) resetNotifForm();
  notifTimeFilter = 'all';
  notifTypeFilter = 'all';
  const tf = document.getElementById('notif-time-filter');
  if (tf) tf.value = 'all';
  const tyf = document.getElementById('notif-type-filter');
  if (tyf) tyf.value = 'all';
  setNotifHistTab(scope); // به تب همان نوع برو و رندر کن
}

// مودال ویرایش پیام در تاریخچه
function openNotifEdit(n) {
  editingNotifId = n.id;
  document.getElementById('notif-edit-title').value = n.title;
  document.getElementById('notif-edit-text').value = n.text;
  document.getElementById('notif-edit-type').value = n.type;
  renderTagChecks('notif-edit-tags', n.tags || []);
  document.getElementById('notif-edit-modal').hidden = false;
}
function closeNotifEdit() {
  document.getElementById('notif-edit-modal').hidden = true;
  editingNotifId = null;
}

function initNotif() {
  // انتخاب مخاطب در فرم (عمومی / خصوصی)
  document.querySelectorAll('.notif-scope__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      notifScope = btn.dataset.scope;
      document.querySelectorAll('.notif-scope__btn').forEach((b) => b.classList.toggle('notif-scope__btn--active', b === btn));
      document.getElementById('notif-target').hidden = (notifScope !== 'private');
    });
  });

  // جستجو و انتخاب بازیکن (پیام خصوصی)
  const search = document.getElementById('notif-user-search');
  search.addEventListener('input', () => renderNotifUserList(search.value));

  // تیک زمان‌بندی — نمایش/مخفی فیلد زمان
  const schedToggle = document.getElementById('notif-schedule-toggle');
  schedToggle.addEventListener('change', () => {
    document.getElementById('notif-schedule-field').hidden = !schedToggle.checked;
  });

  // ارسال — به‌جای ارسال مستقیم، پاپ‌آپ پیش‌نمایش باز می‌شود
  document.getElementById('notif-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (notifScope === 'private' && !notifTargetId) { alert('لطفاً یک بازیکن را انتخاب کنید.'); return; }
    const scheduled = schedToggle.checked;
    const schedAt = document.getElementById('notif-schedule-at').value;
    if (scheduled && !schedAt) { alert('لطفاً زمان ارسال را انتخاب کنید.'); return; }
    const u = notifScope === 'private' ? USERS.find((x) => x.id === notifTargetId) : null;
    openNotifPreview({
      scope: notifScope,
      userId: u ? u.id : null,
      userName: u ? u.name : '',
      userHandle: u ? u.handle : '',
      userPhone: u ? u.phone : '',
      title: document.getElementById('notif-title').value.trim(),
      text: document.getElementById('notif-text').value.trim(),
      type: document.getElementById('notif-type').value,
      tags: getCheckedTags('notif-tags'),
      scheduledAt: scheduled ? schedAt : '',
    }, true);
  });
  document.getElementById('notif-reset').addEventListener('click', resetNotifForm);

  // تب‌های تاریخچه (عمومی / خصوصی)
  document.querySelectorAll('.notif-htab').forEach((t) => t.addEventListener('click', () => setNotifHistTab(t.dataset.htab)));

  // فیلتر زمانی تاریخچه
  document.getElementById('notif-time-filter').addEventListener('change', (e) => {
    notifTimeFilter = e.target.value;
    renderNotifications();
  });
  document.getElementById('notif-type-filter').addEventListener('change', (e) => {
    notifTypeFilter = e.target.value;
    renderNotifications();
  });

  // جستجو در عنوان/متن تاریخچه
  const histSearch = document.getElementById('notif-search');
  histSearch.addEventListener('input', () => { notifSearch = histSearch.value; renderNotifications(); });

  // پاپ‌آپ پیش‌نمایش/تأیید ارسال
  document.getElementById('notif-preview-confirm').addEventListener('click', confirmNotifSend);
  document.getElementById('notif-preview-cancel').addEventListener('click', closeNotifPreview);
  document.getElementById('notif-preview-close').addEventListener('click', closeNotifPreview);
  document.getElementById('notif-preview-modal').addEventListener('click', (e) => { if (e.target.id === 'notif-preview-modal') closeNotifPreview(); });

  // مودال ویرایش
  document.getElementById('notif-edit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = NOTIFICATIONS.find((x) => x.id === editingNotifId);
    if (n) {
      n.title = document.getElementById('notif-edit-title').value.trim();
      n.text = document.getElementById('notif-edit-text').value.trim();
      n.type = document.getElementById('notif-edit-type').value;
      n.tags = getCheckedTags('notif-edit-tags');
    }
    closeNotifEdit();
    renderNotifications();
  });
  document.getElementById('notif-edit-cancel').addEventListener('click', closeNotifEdit);
  document.getElementById('notif-edit-close').addEventListener('click', closeNotifEdit);
  document.getElementById('notif-edit-modal').addEventListener('click', (e) => { if (e.target.id === 'notif-edit-modal') closeNotifEdit(); });

  renderTagChecks('notif-tags', []);
  renderNotifUserList('');
  renderNotifTagChips();
  renderNotifications();
}

function initPublish() {
  // جابه‌جایی بین خانه/لانچر/بازی‌ها از طریق منوی کشویی سایدبار انجام می‌شود

  // آپلود تصویر بنر
  const mediaInput = document.getElementById('pub-media-input');
  document.getElementById('pub-media-add').addEventListener('click', () => mediaInput.click());
  mediaInput.addEventListener('change', () => {
    Array.from(mediaInput.files).forEach((file) => pubDraftMedia.push({ type: 'image', url: URL.createObjectURL(file) }));
    mediaInput.value = '';
    pubRenderDraftMedia();
  });

  // متن راهنمای تاگل انتشار
  const live = document.getElementById('pub-live');
  const liveHint = document.getElementById('pub-live-hint');
  live.addEventListener('change', () => {
    liveHint.textContent = live.checked
      ? 'فعال: بلافاصله در لانچر نمایش داده می‌شود'
      : 'غیرفعال: به‌صورت پیش‌نویس ذخیره می‌شود';
  });

  // ثبت محتوا
  document.getElementById('pub-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const game = pubTarget === 'home' ? document.getElementById('pub-game').value : '';
    PUBLICATIONS.unshift({
      id: Date.now(),
      target: pubTarget,
      kind: document.getElementById('pub-kind').value,
      game,
      title: document.getElementById('pub-title').value.trim(),
      subtitle: pubTarget === 'home' ? document.getElementById('pub-subtitle').value.trim() : '',
      desc: document.getElementById('pub-desc').value.trim(),
      media: pubDraftMedia.slice(),
      live: live.checked,
      date: 'هم‌اکنون',
    });
    pubResetForm();
    renderPublications();
  });

  document.getElementById('pub-reset').addEventListener('click', pubResetForm);

  setPubTarget('home');
}

// ============================================
// تراکنش — سکه بر اساس میزان بازی (Play Reward)
// ============================================
let COIN_SETTINGS = { coinsPerInterval: 10, intervalMinutes: 30, coinsPerSession: 5, dailyCap: 200 };
const coinDailyEarned = {}; // userId → سکهٔ کسب‌شدهٔ امروز (برای سقف روزانه)
const COIN_GAMES = ['DOTA 2', 'Counter-Strike 2', 'VALORANT', 'PUBG', 'Apex Legends', 'Rainbow Six Siege'];
let COIN_TX = [
  { id: 1, userId: 1,  name: 'احسان رضایی', game: 'DOTA 2',          minutes: 95,  coinsEarned: 35,  totalCoins: 1480000, capped: false, date: '۴۵ دقیقه پیش' },
  { id: 2, userId: 3,  name: 'آرش کریمی',  game: 'VALORANT',         minutes: 40,  coinsEarned: 15,  totalCoins: 540000,  capped: false, date: '۲ ساعت پیش' },
  { id: 3, userId: 8,  name: 'پیمان شریفی', game: 'Counter-Strike 2', minutes: 25,  coinsEarned: 5,   totalCoins: 67000,   capped: false, date: '۳ ساعت پیش' },
  { id: 4, userId: 11, name: 'مریم اکبری', game: 'Apex Legends',     minutes: 130, coinsEarned: 200, totalCoins: 1100000, capped: true,  date: 'دیروز' },
];
let coinTxSeq = 5;

function readCoinSettings() {
  return {
    coinsPerInterval: Math.max(0, parseInt(document.getElementById('cs-perInterval').value, 10) || 0),
    intervalMinutes: Math.max(1, parseInt(document.getElementById('cs-interval').value, 10) || 1),
    coinsPerSession: Math.max(0, parseInt(document.getElementById('cs-perSession').value, 10) || 0),
    dailyCap: Math.max(0, parseInt(document.getElementById('cs-dailyCap').value, 10) || 0),
  };
}

function computeSessionCoins(minutes) {
  const s = COIN_SETTINGS;
  return Math.floor(minutes / Math.max(1, s.intervalMinutes)) * s.coinsPerInterval + s.coinsPerSession;
}

function renderCoinRule() {
  const el = document.getElementById('coin-rule');
  if (!el) return;
  const s = COIN_SETTINGS;
  el.innerHTML = `هر <b>${faNum(s.intervalMinutes)}</b> دقیقه = <b>${faNum(s.coinsPerInterval)}</b> سکه، به‌علاوهٔ <b>${faNum(s.coinsPerSession)}</b> سکهٔ پایه برای هر نشست · سقف روزانه <b>${faNum(s.dailyCap)}</b> سکه`;
}

function renderCoinTx() {
  renderCoinRule();
  const list = document.getElementById('coin-tx-list');
  if (!list) return;
  document.getElementById('coin-tx-count').textContent = faNum(COIN_TX.length);

  const totalDistributed = COIN_TX.reduce((s, t) => s + t.coinsEarned, 0);
  const statsEl = document.getElementById('coin-stats');
  if (statsEl) statsEl.innerHTML = `
    <div class="coin-stat"><div class="coin-stat__num">${faPrice(totalDistributed)}</div><div class="coin-stat__lbl">کل سکهٔ توزیع‌شده</div></div>
    <div class="coin-stat"><div class="coin-stat__num">${faNum(COIN_TX.length)}</div><div class="coin-stat__lbl">تعداد نشست‌ها</div></div>
    <div class="coin-stat"><div class="coin-stat__num">${faNum(COIN_TX.filter((t) => t.capped).length)}</div><div class="coin-stat__lbl">به سقف روزانه رسیده</div></div>`;

  if (!COIN_TX.length) { list.innerHTML = '<div class="empty-state">هنوز تراکنشی ثبت نشده است</div>'; return; }
  list.innerHTML = COIN_TX.map((t) => `
    <div class="coin-tx">
      <span class="coin-tx__icon material-icons-outlined">paid</span>
      <div class="coin-tx__body">
        <div class="coin-tx__top"><span class="coin-tx__user">${t.name}</span><span class="coin-tx__game">${t.game}</span></div>
        <div class="coin-tx__meta"><span class="material-icons-outlined">timer</span>${faNum(t.minutes)} دقیقه<span class="material-icons-outlined">schedule</span>${t.date}</div>
      </div>
      <div class="coin-tx__amount">
        <span class="coin-tx__earned">+${faPrice(t.coinsEarned)}</span>
        ${t.capped ? '<span class="coin-tx__cap">سقف روزانه</span>' : ''}
      </div>
    </div>`).join('');
}

function initCoins() {
  ['cs-perInterval', 'cs-interval', 'cs-perSession', 'cs-dailyCap'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', () => { COIN_SETTINGS = readCoinSettings(); renderCoinRule(); });
  });

  document.getElementById('coin-settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    COIN_SETTINGS = readCoinSettings();
    renderCoinRule();
    alert('تنظیمات سکه ذخیره شد.');
  });

  // شبیه‌سازی گزارش نشست بازی توسط کلاینت → محاسبهٔ سکه سمت سرور
  document.getElementById('coin-simulate')?.addEventListener('click', () => {
    COIN_SETTINGS = readCoinSettings();
    const u = USERS[Math.floor(Math.random() * USERS.length)];
    const game = COIN_GAMES[Math.floor(Math.random() * COIN_GAMES.length)];
    const minutes = 10 + Math.floor(Math.random() * 120);
    let earned = computeSessionCoins(minutes);
    const already = coinDailyEarned[u.id] || 0;
    const room = Math.max(0, COIN_SETTINGS.dailyCap - already);
    const capped = earned > room;
    earned = Math.min(earned, room);
    coinDailyEarned[u.id] = already + earned;
    u.coins = (u.coins || 0) + earned;
    COIN_TX.unshift({ id: coinTxSeq++, userId: u.id, name: u.name, game, minutes, coinsEarned: earned, totalCoins: u.coins, capped, date: 'هم‌اکنون' });
    renderCoinTx();
    renderOverview();
  });

  renderCoinTx();
}

// ============================================
function bootDashboard() {
  renderOverview();
  renderUsers();
  renderGames();
  renderLaunchers();
  renderServers();
  renderPublications();
}

document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initNav();
  initUsers();
  initGames();
  initLauncher();
  initServers();
  initPublish();
  initGameBanners();
  initHomeBanners();
  initNotif();
  initAvatarReviews();
  initCoins();
});
