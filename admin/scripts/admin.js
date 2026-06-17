/* ============================================
   پنل مدیریت x100 — منطق داشبورد
   ============================================ */

const ADMIN_CREDS = { user: 'admin', pass: 'admin123' };

// تبدیل عدد به فارسی
const faNum = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
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
const VIEW_TITLE = { overview: 'داشبورد', users: 'کاربران', games: 'انتشار بازی', launcher: 'لانچر', servers: 'سرورها', publish: 'انتشار محتوا' };
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

  // والد «انتشار» — باز/بسته کردن منوی کشویی
  const parent = document.querySelector('.admin-nav__parent');
  if (parent) {
    const sub = parent.nextElementSibling;
    parent.addEventListener('click', () => {
      const open = sub.hidden;
      sub.hidden = !open;
      parent.classList.toggle('admin-nav__parent--open', open);
    });
  }

  // زیرگزینه‌های انتشار (خانه / لانچر / صفحهٔ بازی‌ها)
  document.querySelectorAll('.admin-nav__subitem').forEach((sub) => {
    sub.addEventListener('click', () => {
      clearActive();
      showView('publish');
      setPubTarget(sub.dataset.pub); // زیرگزینهٔ فعال را هم خودش ست می‌کند
    });
  });
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
  document.getElementById('pub-form-title').textContent = PUB_TITLE[t];
  document.getElementById('pub-subtitle-field').hidden = (t !== 'home'); // زیرعنوان فقط در انتشار خانه
  document.getElementById('pub-game-field').hidden = (t === 'game');     // بازی مرتبط فقط در انتشار خانه
  // فرم انتشار فقط در حالت خانه؛ در صفحهٔ بازی‌ها فقط لیست نمایش داده می‌شود
  document.getElementById('pub-form-panel').hidden = (t === 'game');
  document.getElementById('pub-layout').classList.toggle('games-layout--single', t === 'game');
  // سکشن بنر صفحهٔ بازی‌ها فقط در حالت بازی
  document.getElementById('pub-banner-section').hidden = (t !== 'game');
  if (t === 'game') renderBannerGames();
  // بخش خانه آکاردئون بنر را نشان می‌دهد؛ لیست/فرم قدیمی در هر دو حالت مخفی است
  document.getElementById('pub-home-canvas').hidden = (t !== 'home');
  document.getElementById('pub-layout').hidden = true;
  pubFillSelects();
  pubResetForm();
  renderPublications();
}

// ============================================
// بنر صفحهٔ بازی‌ها — افزودن/حذف بازی‌ها
// ============================================
let bannerGames = [1]; // شناسهٔ بازی‌های افزوده‌شده به بنر (پیش‌فرض: CS2)

function renderBannerGames() {
  const wrap = document.getElementById('banner-games');
  const items = bannerGames.map((id) => GAMES.find((g) => g.id === id)).filter(Boolean);
  document.getElementById('banner-count').textContent = faNum(items.length);
  if (!items.length) {
    wrap.innerHTML = '<div class="empty-state">هنوز بازی‌ای به بنر اضافه نشده — روی «افزودن بازی به بنر» بزنید</div>';
    return;
  }
  wrap.innerHTML = items.map((g) => {
    const cover = (g.media && g.media[0]) ? g.media[0].url : '';
    return `
    <div class="banner-game" data-gid="${g.id}">
      <img class="banner-game__cover" src="${cover}" alt="">
      <div class="banner-game__info">
        <div class="banner-game__name">${g.name}</div>
        <div class="banner-game__genre">${g.genre}</div>
      </div>
      <button class="banner-game__del" data-gid="${g.id}" title="حذف از بنر"><span class="material-icons-outlined">close</span></button>
    </div>`;
  }).join('');
  wrap.querySelectorAll('.banner-game__del').forEach((btn) => {
    btn.addEventListener('click', () => {
      bannerGames = bannerGames.filter((id) => id !== Number(btn.dataset.gid));
      renderBannerGames();
    });
  });
}

function openGamePicker() {
  const grid = document.getElementById('picker-grid');
  const available = GAMES.filter((g) => !bannerGames.includes(g.id));
  if (!available.length) {
    grid.innerHTML = '<div class="empty-state">همهٔ بازی‌ها قبلاً به بنر اضافه شده‌اند</div>';
  } else {
    grid.innerHTML = available.map((g) => {
      const cover = (g.media && g.media[0]) ? g.media[0].url : '';
      return `
      <button class="picker-card" data-gid="${g.id}">
        <img src="${cover}" alt="">
        <div class="picker-card__name">${g.name}</div>
        <div class="picker-card__genre">${g.genre}</div>
        <span class="picker-card__add"><span class="material-icons-outlined">add_circle</span></span>
      </button>`;
    }).join('');
    grid.querySelectorAll('.picker-card').forEach((card) => {
      card.addEventListener('click', () => {
        bannerGames.push(Number(card.dataset.gid));
        renderBannerGames();
        openGamePicker(); // به‌روزرسانی لیست انتخاب
      });
    });
  }
  document.getElementById('game-picker').hidden = false;
}

// ============================================
// بنر خانه — کارت‌های آکاردئونی با مشخصات کامل
// ============================================
let homeBanners = [];
let homeBannerSeq = 1;
let dragBannerId = null;
const BANNER_MIN = 3;
const BANNER_MAX = 7;

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
        <label class="field"><span>نام دکمه</span><input type="text" class="bnr-btn-label" value="${b.btnLabel || ''}" placeholder="مثلاً مشاهده"></label>
        <label class="field"><span>عملکرد دکمه (فانکشن)</span><input type="text" class="bnr-btn-action" value="${b.btnAction || ''}" placeholder="مثلاً openGame('valorant') یا https://..."></label>
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
  const btnActionInput = card.querySelector('.bnr-btn-action');
  hasBtn.addEventListener('change', () => {
    b.hasButton = hasBtn.checked;
    btnFields.hidden = !b.hasButton;
    if (cta) cta.hidden = !b.hasButton;
  });
  btnLabelInput.addEventListener('input', () => {
    b.btnLabel = btnLabelInput.value;
    if (cta) cta.firstChild.textContent = (b.btnLabel || 'مشاهده') + ' ';
  });
  btnActionInput.addEventListener('input', () => { b.btnAction = btnActionInput.value; });

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
      homeBanners.push({ id: homeBannerSeq++, img: '', title: '', subtitle: '', text: '', hasButton: true, btnLabel: 'مشاهده', btnAction: '', open: false });
    }
  }
  document.getElementById('home-banner-toggle').addEventListener('click', () => {
    document.getElementById('home-banner-acc').classList.toggle('acc--open');
  });
  document.getElementById('home-banner-add').addEventListener('click', () => {
    if (homeBanners.length >= BANNER_MAX) { showBannerHint(`حداکثر ${faNum(BANNER_MAX)} بنر می‌توانید اضافه کنید.`, true); return; }
    homeBanners.push({ id: homeBannerSeq++, img: '', title: '', subtitle: '', text: '', hasButton: true, btnLabel: 'مشاهده', btnAction: '', open: true });
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

function initBanner() {
  document.getElementById('banner-add-btn').addEventListener('click', openGamePicker);
  document.getElementById('game-picker-close').addEventListener('click', () => {
    document.getElementById('game-picker').hidden = true;
  });
  document.getElementById('game-picker').addEventListener('click', (e) => {
    if (e.target.id === 'game-picker') document.getElementById('game-picker').hidden = true;
  });
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
  initBanner();
  initHomeBanners();
});
