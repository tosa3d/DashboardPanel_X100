/* ============================================
   App — Renderers & Interactions
   ============================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ============================================
// Window Controls (Electron IPC)
// ============================================
function initWindowControls() {
  if (!window.windowAPI) return; // برای حالت browser ساده هم کار کنه
  $('#win-min')?.addEventListener('click', () => window.windowAPI.minimize());
  $('#win-max')?.addEventListener('click', () => window.windowAPI.toggleMaximize());
  $('#win-close')?.addEventListener('click', () => window.windowAPI.close());

  const maxIcon = $('#win-max .material-symbols-outlined');
  window.windowAPI.onMaximizeChange((isMax) => {
    if (maxIcon) maxIcon.textContent = isMax ? 'filter_none' : 'check_box_outline_blank';
  });
}

// ============================================
// Page Router
// ============================================
const ROUTES = {
  home: 'home',
  connection: 'connection',
  games: 'games',
  'game-detail': 'game-detail',
  tournaments: 'tournaments',
  // بقیه فعلاً به placeholder میرن
  shop: 'dev-video',
  streaming: 'dev-video',
  community: 'community',
  downloads: 'downloads',
  profile: 'profile',
  settings: 'placeholder',
};

function showPage(pageName, { resetRoot = false, communityTab = null } = {}) {
  const target = ROUTES[pageName] || 'placeholder';
  $$('.page').forEach((p) => p.classList.remove('page--active'));
  const page = $(`.page[data-page="${target}"]`);
  if (page) page.classList.add('page--active');
  if (resetRoot) resetPageRoot(pageName, { communityTab });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetPageRoot(pageName, { communityTab = null } = {}) {
  const target = ROUTES[pageName] || 'placeholder';
  const page = $(`.page[data-page="${target}"]`);
  if (!page) return;

  if (pageName === 'tournaments') {
    showMatchesPane();
    const scroller = page.querySelector('.tour-page');
    if (scroller) scroller.scrollTop = 0;
  }

  if (pageName === 'community') {
    ['comm-search-overlay', 'comm-req-overlay', 'comm-leave-popup'].forEach((id) => {
      const overlay = document.getElementById(id);
      if (overlay) overlay.hidden = true;
    });
    const tabId = communityTab || 'posts';
    page.querySelector(`.comm-tab[data-ctab="${tabId}"]`)?.click();
    if (tabId === 'posts') {
      page.querySelector('.posts-nav-item[data-pnav="home"]')?.click();
      page.querySelector('.prof-tab[data-ptab="posts"]')?.click();
    }
  }
}

// ============================================
// Sidebar Navigation
// ============================================
function initSidebar() {
  const items = $$('#sidebar-nav .nav-item');
  items.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      items.forEach((i) => i.classList.remove('nav-item--active'));
      item.classList.add('nav-item--active');
      const route = item.dataset.route;
      // اگه sub-item جامعه کاربری بود، قبل از showPage تب رو مشخص کن
      if (item.dataset.commtab) {
        const communityPage = document.querySelector('.page[data-page="community"]');
        if (communityPage) communityPage.dataset.pendingTab = item.dataset.commtab;
      }
      showPage(route, { resetRoot: true, communityTab: item.dataset.commtab || null });
    });
  });
}

// ============================================
// Games Page
// ============================================
const gamesState = {
  search: '',
  genre: 'all',
  connection: 'all',
  subscription: 'all',
};

// ============================================
// Featured Banner (Steam-style)
// ============================================
const featuredState = {
  gameIndex: 0,
  thumbIndex: -1, // -1 = main art, 0-3 = screenshot
};

function renderFeaturedBanner() {
  const game = AppData.featuredGames[featuredState.gameIndex];

  // Main image
  const mainImg = $('#feat-main-img');
  if (mainImg) {
    const src = featuredState.thumbIndex === -1
      ? game.img
      : game.screenshots[featuredState.thumbIndex];
    mainImg.src = src;
    mainImg.alt = game.title;
  }

  // Title
  const title = $('#feat-title');
  if (title) title.textContent = game.title;

  // Thumbnails
  const thumbsWrap = $('#feat-thumbs');
  if (thumbsWrap) {
    thumbsWrap.innerHTML = game.screenshots.map((s, i) => `
      <div class="feat-banner__thumb ${i === featuredState.thumbIndex ? 'feat-banner__thumb--active' : ''}" data-idx="${i}">
        <img src="${s}" alt="">
      </div>
    `).join('');

    $$('.feat-banner__thumb', thumbsWrap).forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const idx = Number(thumb.dataset.idx);
        featuredState.thumbIndex = idx === featuredState.thumbIndex ? -1 : idx;
        renderFeaturedBanner();
      });
    });
  }

  // Recommendation text
  const rec = $('#feat-rec');
  if (rec) rec.innerHTML = `<em>پیشنهاد شده</em> ${game.rec}`;

  // Tags
  const tags = $('#feat-tags');
  if (tags) tags.innerHTML = game.tags.map((t) => `<span class="feat-banner__tag">${t}</span>`).join('');

  // Subscription badge
  const sub = $('#feat-sub');
  if (sub) sub.textContent = game.subscription;

  // Active dot
  $$('.feat-banner__dot').forEach((dot, i) => {
    dot.classList.toggle('feat-banner__dot--active', i === featuredState.gameIndex);
  });
}

function initFeaturedBanner() {
  const games = AppData.featuredGames;

  // Build dots
  const dotsWrap = $('#feat-dots');
  if (dotsWrap) {
    dotsWrap.innerHTML = games.map((_, i) => `
      <button class="feat-banner__dot" data-idx="${i}" aria-label="بازی ${i + 1}"></button>
    `).join('');

    $$('.feat-banner__dot', dotsWrap).forEach((dot) => {
      dot.addEventListener('click', () => {
        featuredState.gameIndex = Number(dot.dataset.idx);
        featuredState.thumbIndex = -1;
        renderFeaturedBanner();
      });
    });
  }

  // چرخش خودکار هر ۵ ثانیه — با تعامل دستی تایمر ریست می‌شه
  let featAutoTimer = null;
  function restartFeatAuto() {
    clearInterval(featAutoTimer);
    featAutoTimer = setInterval(() => {
      featuredState.gameIndex = (featuredState.gameIndex + 1) % games.length;
      featuredState.thumbIndex = -1;
      renderFeaturedBanner();
    }, 5000);
  }

  // Prev / Next arrows
  $('#feat-prev')?.addEventListener('click', () => {
    featuredState.gameIndex = (featuredState.gameIndex - 1 + games.length) % games.length;
    featuredState.thumbIndex = -1;
    renderFeaturedBanner();
    restartFeatAuto();
  });

  $('#feat-next')?.addEventListener('click', () => {
    featuredState.gameIndex = (featuredState.gameIndex + 1) % games.length;
    featuredState.thumbIndex = -1;
    renderFeaturedBanner();
    restartFeatAuto();
  });

  // Initial render
  renderFeaturedBanner();
  restartFeatAuto();
}


function renderDropdowns() {
  ['genre', 'connection', 'subscription'].forEach((key) => {
    const dropdown = $(`.dropdown[data-filter="${key}"]`);
    if (!dropdown) return;
    const menu = $('.dropdown__menu', dropdown);
    menu.innerHTML = AppData.filterOptions[key].map((opt) => `
      <div class="dropdown__item ${opt.id === 'all' ? 'dropdown__item--selected' : ''}" data-value="${opt.id}">
        <span>${opt.label}</span>
      </div>
    `).join('');
  });
}

function initDropdowns() {
  const dropdowns = $$('.dropdown');

  // Close on outside click
  document.addEventListener('click', (e) => {
    dropdowns.forEach((d) => {
      if (!d.contains(e.target)) d.classList.remove('dropdown--open');
    });
  });

  dropdowns.forEach((dropdown) => {
    const btn = $('.dropdown__btn', dropdown);
    const labelEl = $('.dropdown__label', dropdown);
    const filterKey = dropdown.dataset.filter;
    const defaultLabel = labelEl.textContent;
    // Store original label for reset
    dropdown.dataset.originalLabel = defaultLabel;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = dropdown.classList.contains('dropdown--open');
      dropdowns.forEach((d) => d.classList.remove('dropdown--open'));
      if (!wasOpen) dropdown.classList.add('dropdown--open');
    });

    $$('.dropdown__item', dropdown).forEach((item) => {
      item.addEventListener('click', () => {
        $$('.dropdown__item', dropdown).forEach((i) => i.classList.remove('dropdown__item--selected'));
        item.classList.add('dropdown__item--selected');
        const value = item.dataset.value;
        const text = $('span', item).textContent;

        gamesState[filterKey] = value;

        if (value === 'all') {
          labelEl.textContent = defaultLabel;
          dropdown.classList.remove('dropdown--active');
        } else {
          labelEl.textContent = text;
          dropdown.classList.add('dropdown--active');
        }

        dropdown.classList.remove('dropdown--open');
        updateClearFiltersBtn();
        renderGames();
      });
    });
  });
}

function updateClearFiltersBtn() {
  const btn = $('#clear-filters');
  if (!btn) return;
  const hasFilter =
    gamesState.genre !== 'all' ||
    gamesState.connection !== 'all' ||
    gamesState.subscription !== 'all' ||
    gamesState.search.trim() !== '';
  btn.hidden = !hasFilter;
}

function clearAllFilters() {
  gamesState.genre = 'all';
  gamesState.connection = 'all';
  gamesState.subscription = 'all';
  gamesState.search = '';

  // Reset search input
  const searchInput = $('#games-search');
  if (searchInput) searchInput.value = '';

  // Reset all dropdowns
  $$('.dropdown').forEach((dropdown) => {
    const labelEl = $('.dropdown__label', dropdown);
    const defaultLabel = dropdown.dataset.defaultLabel || labelEl?.textContent;
    $$('.dropdown__item', dropdown).forEach((item) => {
      item.classList.toggle('dropdown__item--selected', item.dataset.value === 'all');
    });
    // Restore original label from data attribute
    const originalLabel = dropdown.dataset.originalLabel;
    if (labelEl && originalLabel) labelEl.textContent = originalLabel;
    dropdown.classList.remove('dropdown--active', 'dropdown--open');
  });

  // Restore featured banner to first game / main art
  featuredState.thumbIndex = -1;
  renderFeaturedBanner();

  updateClearFiltersBtn();
  renderGames();
}

// ── helper: تبدیل آنلاین به عدد برای مرتب‌سازی ──
function parseOnlineCount(str = '') {
  const n = parseFloat(str);
  if (str.includes('M')) return n * 1_000_000;
  if (str.includes('K')) return n * 1_000;
  return n || 0;
}

// ── رندر یک ردیف افقی از بازی‌ها ──
function renderSectionRow(rowId, games, emptyMsg = '') {
  const row = $(`#${rowId}`);
  if (!row) return;

  if (!games || games.length === 0) {
    row.innerHTML = `
      <div class="gs-empty">
        <span class="material-symbols-outlined">sports_esports</span>
        <span>${emptyMsg}</span>
      </div>`;
    return;
  }

  row.innerHTML = games.map((g) => `
    <div class="game-poster">
      <div class="game-poster__frame">
        <div class="game-poster__gradient"></div>
        <img src="${g.img}" alt="${g.name}">
        <button class="gs-add-btn" data-game-name="${g.name}" data-game-img="${g.img}" title="نصب و رفتن به صفحه بازی">
          <span class="material-symbols-outlined">add</span>
        </button>
      </div>
      <span class="game-poster__name">${g.name}</span>
    </div>
  `).join('');

  // دکمه +
  $$('.gs-add-btn', row).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.dataset.gameName;
      const img  = btn.dataset.gameImg;
      const game = buildInstallGame(name, img);

      if (!gameInstallStates[game.id] || gameInstallStates[game.id] === 'none') {
        // مودال مسیر نصب رو نشون بده
        // بعد از تأیید: برو صفحه بازی + شروع دانلود
        showInstallModal(game, () => showGameDetail(name));
      } else {
        // اگه قبلاً نصب/دانلود شده فقط ببر صفحه بازی
        showGameDetail(name);
      }
    });
  });

  window._refreshGameClicks?.();
}

// ── بازی‌های من: نصب‌شده + در حال دانلود، با دکمه حذف ──
function renderMyGamesSection() {
  const row = $('#gs-mine-row');
  if (!row) return;

  const downloading = dlState.active.map((g) => ({
    id: g.id, name: g.name, img: g.img, _downloading: true, _status: g.status,
  }));
  const queued = dlState.queue.map((g) => ({
    id: g.id, name: g.name, img: g.img, _queued: true,
  }));
  const all = [...downloading, ...queued, ...dlState.installed];

  if (all.length === 0) {
    row.innerHTML = `
      <div class="gs-empty">
        <span class="material-symbols-outlined">sports_esports</span>
        <span>هنوز بازی نصب یا اضافه نشده</span>
      </div>`;
    return;
  }

  row.innerHTML = all.map((g) => `
    <div class="game-poster">
      <div class="game-poster__frame">
        <div class="game-poster__gradient"></div>
        ${g._downloading ? `<span class="gs-downloading-badge">در حال دانلود</span>` : ''}
        ${g._queued ? `<span class="gs-downloading-badge" style="color:var(--color-on-surface-variant)">در صف</span>` : ''}
        <img src="${g.img}" alt="${g.name}">
        <button class="gs-add-btn gs-add-btn--uninstall"
                data-game-id="${g.id}"
                data-game-name="${g.name}"
                data-downloading="${!!g._downloading}"
                title="حذف بازی">
          <span class="material-symbols-outlined">delete_outline</span>
        </button>
      </div>
      <span class="game-poster__name">${g.name}</span>
    </div>
  `).join('');

  $$('.gs-add-btn--uninstall', row).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id            = btn.dataset.gameId;
      const name          = btn.dataset.gameName;
      const isDownloading = btn.dataset.downloading === 'true';

      showConfirm({
        title:    isDownloading ? 'لغو دانلود؟' : `حذف ${name}؟`,
        body:     isDownloading
          ? `دانلود «${name}» لغو می‌شود و فایل‌های دانلود‌شده پاک می‌شوند.`
          : `«${name}» از سیستم شما حذف می‌شود. برای بازی مجدد باید دوباره دانلود کنید.`,
        yesLabel: isDownloading ? 'بله، لغو شود' : 'حذف کامل',
        onYes: () => {
          dlState.active    = dlState.active.filter((g) => g.id !== id);
          dlState.queue     = dlState.queue.filter((g) => g.id !== id);
          dlState.installed = dlState.installed.filter((g) => g.id !== id);
          gameInstallStates[id] = 'none';
          dlRenderActive();
          dlRenderQueue();
          dlRenderInstalled();
          gdRefreshCTA();
          renderMyGamesSection();
        },
      });
    });
  });

  window._refreshGameClicks?.();
}

// ── رندر چهار سکشن ──
function renderGameSections() {
  renderMyGamesSection();

  // سرور اختصاصی
  const dedicated = AppData.allGames.filter((g) => g.connection === 'dedicated');
  renderSectionRow('gs-dedicated-row', dedicated);

  // جدیدترین — آخرین ۸ تا از لیست (ترتیب معکوس)
  const newest = [...AppData.allGames].reverse().slice(0, 8);
  renderSectionRow('gs-new-row', newest);

  // بازی‌های برتر — بر اساس آنلاین
  const top = [...AppData.allGames]
    .sort((a, b) => parseOnlineCount(b.online) - parseOnlineCount(a.online))
    .slice(0, 8);
  renderSectionRow('gs-top-row', top);
}

// ── رندر گرید فیلتر‌شده ──
function renderGames() {
  const grid        = $('#games-grid');
  const empty       = $('#games-empty');
  const filterSec   = $('#games-filter-section');
  const sectionWrap = $('#games-sections-wrap');
  if (!grid) return;

  const hasFilter =
    gamesState.genre !== 'all' ||
    gamesState.connection !== 'all' ||
    gamesState.subscription !== 'all' ||
    gamesState.search.trim() !== '';

  // toggle بین سکشن‌ها و گرید فیلتر
  if (filterSec)   filterSec.hidden   = !hasFilter;
  if (sectionWrap) sectionWrap.hidden =  hasFilter;

  if (!hasFilter) return;   // سکشن‌ها هستن، گرید لازم نیست

  const filtered = AppData.allGames.filter((g) => {
    if (gamesState.genre       !== 'all' && g.genre       !== gamesState.genre)       return false;
    if (gamesState.connection  !== 'all' && g.connection  !== gamesState.connection)  return false;
    if (gamesState.subscription !== 'all' && g.subscription !== gamesState.subscription) return false;
    if (gamesState.search) {
      const q = gamesState.search.toLowerCase().trim();
      if (q && !g.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  grid.innerHTML = filtered.map((g) => `
    <div class="game-poster">
      <div class="game-poster__frame">
        <div class="game-poster__gradient"></div>
        <span class="game-poster__online">${g.online} آنلاین</span>
        <img src="${g.img}" alt="${g.name}">
      </div>
      <span class="game-poster__name">${g.name}</span>
    </div>
  `).join('');

  window._refreshGameClicks?.();
}

function initGamesSearch() {
  const input = $('#games-search');
  if (!input) return;
  input.addEventListener('input', () => {
    gamesState.search = input.value;
    updateClearFiltersBtn();
    renderGames();
  });
}

function initGamesPage() {
  initFeaturedBanner();
  renderDropdowns();
  initDropdowns();
  initGamesSearch();

  // Clear filters button
  const clearBtn = $('#clear-filters');
  if (clearBtn) clearBtn.addEventListener('click', clearAllFilters);

  renderGameSections();   // سکشن‌های دسته‌بندی
  renderGames();          // گرید فیلتر (پنهانه تا فیلتر فعال بشه)
}

// ============================================
// Connection Page Interactions
// ============================================
// اشتراک فعلی تحریم‌شکن
const SUB_TIERS = {
  free:   { name: 'رایگان',  color: '#9aa6ad' },
  bronze: { name: 'برنزی',   color: '#cd7f32' },
  silver: { name: 'نقره‌ای', color: '#c0c0c0' },
  gold:   { name: 'طلایی',   color: '#ffd700' },
};
let currentTier = 'free';

function renderSubscription() {
  const t = SUB_TIERS[currentTier];
  const icon = document.getElementById('shecan-account-icon');
  const tierLbl = document.getElementById('shecan-account-tier');
  if (icon) icon.style.color = t.color;
  if (tierLbl) tierLbl.textContent = t.name;

  // دکمه ارتقا فقط وقتی پایین‌تر از طلایی باشیم
  const up = document.getElementById('shecan-upgrade-btn');
  if (up) up.hidden = (currentTier === 'gold');

  // علامت‌گذاری کارت فعال
  document.querySelectorAll('.sub-card').forEach((c) => {
    const active = c.dataset.tier === currentTier;
    c.classList.toggle('sub-card--active', active);
    const buy = c.querySelector('.sub-card__buy');
    if (buy) { buy.textContent = active ? 'اشتراک فعلی' : 'خرید'; buy.disabled = active; }
  });
}

function initSubscription() {
  // ارتقا → اسکرول به سکشن خرید
  document.getElementById('shecan-upgrade-btn')?.addEventListener('click', () => {
    document.getElementById('sub-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  // خرید هر پک
  document.querySelectorAll('.sub-card__buy').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tier = btn.closest('.sub-card').dataset.tier;
      if (tier === currentTier) return;
      if (confirm(`اشتراک «${SUB_TIERS[tier].name}» فعال شود؟`)) {
        currentTier = tier;
        renderSubscription();
      }
    });
  });
  renderSubscription();
}

function initConnectionPage() {
  // دکمه اتصال تحریم شکن
  const btn      = $('#shecan-connect-btn');
  const btnIcon  = $('#shecan-btn-icon');
  const btnLabel = $('#shecan-btn-label');
  let shecanOn   = true;

  // هر دو دکمه هدر
  const hBtns  = ['#header-shecan-btn', '#header-shecan-btn2'].map((s) => $(s)).filter(Boolean);
  const hTexts = ['#header-shecan-text', '#header-shecan-text2'].map((s) => $(s)).filter(Boolean);

  // دکمه اتصال هدر (سبز = متصل، قرمز = قطع)
  const hdrConnBtn  = $('#hdr-connection-btn');
  const hdrConnIcon = $('#hdr-connection-icon');

  function setShecanState(on) {
    shecanOn = on;

    // کارت اتصال
    if (btn) {
      btn.className        = on ? 'shecan__connect-btn shecan__connect-btn--on' : 'shecan__connect-btn shecan__connect-btn--off';
      if (btnIcon)  btnIcon.textContent  = on ? 'check_circle' : 'wifi_off';
      if (btnLabel) btnLabel.textContent = on ? 'متصل به تحریم شکن' : 'اتصال به تحریم شکن';
    }

    // هر دو دکمه هدر
    hBtns.forEach((b) => {
      b.className = on ? 'header-shecan-btn header-shecan-btn--on' : 'header-shecan-btn header-shecan-btn--off';
    });
    hTexts.forEach((t) => {
      t.textContent = on ? 'متصل به تحریم شکن' : 'اتصال به تحریم شکن';
    });

    // دکمه اتصال هدر
    if (hdrConnBtn)  hdrConnBtn.className = on ? 'btn btn--success' : 'btn btn--danger';
    if (hdrConnIcon) hdrConnIcon.textContent = on ? 'link' : 'link_off';
  }

  // hover + کلیک هر دو دکمه هدر
  hBtns.forEach((hBtn, i) => {
    hBtn.addEventListener('mouseenter', () => {
      if (!shecanOn) return;
      hTexts[i].textContent = 'قطع اتصال';
    });
    hBtn.addEventListener('mouseleave', () => {
      if (!shecanOn) return;
      hTexts[i].textContent = 'متصل به تحریم شکن';
    });
    hBtn.addEventListener('click', () => setShecanState(!shecanOn));
  });

  // ── Dropdown انتخاب سرویس ──
  const svcWrap = $('#shecan-service-wrap');
  const svcBtn  = $('#shecan-service-btn');
  const svcMenu = $('#shecan-service-menu');
  const svcName = $('#shecan-service-name');
  const svcChev = $('#shecan-service-chev');

  if (svcBtn && svcMenu) {
    svcBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !svcMenu.hidden;
      svcMenu.hidden = open;
      if (svcChev) svcChev.className = open
        ? 'material-symbols-outlined shecan__service-chev'
        : 'material-symbols-outlined shecan__service-chev shecan__service-chev--open';
    });

    $$('.shecan__service-item', svcMenu).forEach((item) => {
      item.addEventListener('click', () => {
        $$('.shecan__service-item', svcMenu).forEach((i) => i.classList.remove('shecan__service-item--active'));
        item.classList.add('shecan__service-item--active');
        if (svcName) svcName.textContent = item.dataset.svc;
        svcMenu.hidden = true;
        if (svcChev) svcChev.classList.remove('shecan__service-chev--open');
      });
    });

    document.addEventListener('click', () => {
      svcMenu.hidden = true;
      if (svcChev) svcChev.classList.remove('shecan__service-chev--open');
    });
  }

  if (btn) {
    // hover: وقتی متصله نشون بده «قطع اتصال»
    btn.addEventListener('mouseenter', () => {
      if (!shecanOn) return;
      btnIcon.textContent  = 'power_settings_new';
      btnLabel.textContent = 'قطع اتصال';
    });
    btn.addEventListener('mouseleave', () => {
      if (!shecanOn) return;
      btnIcon.textContent  = 'check_circle';
      btnLabel.textContent = 'متصل به تحریم شکن';
    });
    btn.addEventListener('click', () => setShecanState(!shecanOn));
  }

  // ── Dropdown سرویس تست شبکه ──
  const svcField = $('#conn-svc-field');
  const svcMenu2 = $('#conn-svc-menu');
  const svcVal   = $('#conn-svc-name');

  if (svcField && svcMenu2) {
    svcField.addEventListener('click', (e) => {
      e.stopPropagation();
      svcMenu2.hidden = !svcMenu2.hidden;
    });
    $$('.net-select__option', svcMenu2).forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        $$('.net-select__option', svcMenu2).forEach((o) => o.classList.remove('net-select__option--active'));
        opt.classList.add('net-select__option--active');
        if (svcVal) svcVal.textContent = opt.dataset.svc;
        svcMenu2.hidden = true;
      });
    });
    document.addEventListener('click', () => { svcMenu2.hidden = true; });
  }

  // Start test button — animation feedback
  const startBtn = $('#conn-start-test');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      const original = startBtn.textContent;
      startBtn.disabled = true;
      startBtn.textContent = 'در حال تست...';
      const arc = $('.gauge__arc');
      const needle = $('.gauge__needle');
      let progress = 0;
      const interval = setInterval(() => {
        progress += 1;
        const offset = 250 - (progress * 2.5);
        const angle = -90 + (progress * 1.8);
        if (arc) arc.setAttribute('stroke-dashoffset', offset);
        if (needle) needle.setAttribute('transform', `rotate(${angle} 100 110)`);
        if (progress >= 100) {
          clearInterval(interval);
          startBtn.disabled = false;
          startBtn.textContent = original;
        }
      }, 20);
    });
  }
}

// ============================================
// Hero Thumbnails
// ============================================
// تبدیل ارقام به فارسی
const faNum = (s) => String(s).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

// ============================================
// ورود با OTP (شماره موبایل + کد پیامک) و سپس اسپلش
// ============================================
function initOtpLogin() {
  const screen = document.getElementById('otp-screen');
  const splash = document.getElementById('app-splash');
  if (!screen) { if (splash) splash.classList.remove('splash--pending'); return; }

  const stepPhone = document.getElementById('otp-step-phone');
  const stepPass = document.getElementById('otp-step-pass');
  const stepCode = document.getElementById('otp-step-code');
  const passInput = document.getElementById('otp-pass-input');
  const passErr = document.getElementById('otp-pass-err');
  const passPhone = document.getElementById('otp-pass-phone');
  const phoneInput = document.getElementById('otp-phone-input');
  const phoneErr = document.getElementById('otp-phone-err');

  function showStep(el) {
    [stepPhone, stepPass, stepCode].forEach((s) => { if (s) s.hidden = (s !== el); });
  }
  const codeErr = document.getElementById('otp-code-err');
  const digits = Array.from(document.querySelectorAll('.otp-digit'));
  const phoneDisplay = document.getElementById('otp-phone-display');
  const resendBtn = document.getElementById('otp-resend-btn');
  const timerEl = document.getElementById('otp-timer');
  let timerId = null;

  // فقط رقم در شماره
  phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, '');
    phoneErr.hidden = true;
  });

  function startTimer() {
    let t = 30;
    resendBtn.disabled = true;
    clearInterval(timerId);
    const fmt = (n) => faNum(String(n).padStart(2, '0'));
    timerEl.textContent = `۰۰:${fmt(t)}`;
    timerEl.hidden = false;
    timerId = setInterval(() => {
      t -= 1;
      timerEl.textContent = `۰۰:${fmt(Math.max(t, 0))}`;
      if (t <= 0) { clearInterval(timerId); resendBtn.disabled = false; timerEl.hidden = true; }
    }, 1000);
  }

  function phoneLabel() {
    const phone = phoneInput.value.trim();
    return phone ? '۰' + faNum(phone) : 'شمارهٔ شما';
  }

  // رفتن به صفحهٔ کد پیامک (رمز موقت)
  function gotoCode() {
    phoneDisplay.textContent = phoneLabel();
    showStep(stepCode);
    digits.forEach((d) => (d.value = ''));
    codeErr.hidden = true;
    startTimer();
    setTimeout(() => digits[0].focus(), 50);
  }

  // دکمهٔ «ورود» مرحلهٔ شماره — تصمیم بر اساس کاربر جدید/قدیمی
  function onPhoneSubmit() {
    const phone = phoneInput.value.trim();
    if (phone) {
      // کاربر قدیمی (رمز دارد) → ورود با رمز عبور
      passPhone.textContent = phoneLabel();
      passInput.value = '';
      passErr.hidden = true;
      showStep(stepPass);
      setTimeout(() => passInput.focus(), 50);
    } else {
      // کاربر جدید (رمز ندارد) → فقط رمز موقت (کد پیامک)
      gotoCode();
    }
  }

  document.getElementById('otp-send-btn').addEventListener('click', onPhoneSubmit);
  phoneInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') onPhoneSubmit(); });

  // مرحلهٔ رمز عبور
  function passLogin() {
    if (!passInput.value) { passErr.hidden = false; return; } // حالت توسعه: هر رمزی قبول
    clearInterval(timerId);
    screen.classList.add('otp-screen--hidden');
    runSplashThenApp(splash);
  }
  document.getElementById('otp-pass-login').addEventListener('click', passLogin);
  passInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') passLogin(); });
  passInput.addEventListener('input', () => { passErr.hidden = true; });
  document.getElementById('otp-use-otp').addEventListener('click', gotoCode); // ورود با رمز موقت
  document.getElementById('otp-pass-back').addEventListener('click', () => showStep(stepPhone));

  // ورودی‌های کد — پرش خودکار
  digits.forEach((d, i) => {
    d.addEventListener('input', () => {
      d.value = d.value.replace(/\D/g, '').slice(0, 1);
      codeErr.hidden = true;
      if (d.value && i < digits.length - 1) digits[i + 1].focus();
    });
    d.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !d.value && i > 0) digits[i - 1].focus();
      if (e.key === 'Enter') verify();
    });
    d.addEventListener('paste', (e) => {
      e.preventDefault();
      const txt = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, digits.length);
      txt.split('').forEach((ch, k) => { if (digits[k]) digits[k].value = ch; });
      if (digits[txt.length - 1]) digits[Math.min(txt.length, digits.length) - 1].focus();
    });
  });

  function verify() {
    // حالت توسعه: بدون کد هم تأیید کار می‌کند
    clearInterval(timerId);
    screen.classList.add('otp-screen--hidden');
    runSplashThenApp(splash);
  }
  document.getElementById('otp-verify-btn').addEventListener('click', verify);

  resendBtn.addEventListener('click', () => { if (!resendBtn.disabled) startTimer(); });
  document.getElementById('otp-back-btn').addEventListener('click', () => {
    clearInterval(timerId);
    // اگر کاربر قدیمی است (شماره دارد) برگرد به رمز عبور، وگرنه به شماره
    showStep(phoneInput.value.trim() ? stepPass : stepPhone);
  });
}

function runSplashThenApp(splash) {
  if (!splash) return;
  splash.classList.remove('splash--pending'); // نمایش + شروع انیمیشن نور
  setTimeout(() => splash.classList.add('splash--hidden'), 3000);
  setTimeout(() => splash.remove(), 3700);
}

// ============================================
// تنظیم رمز عبور (پاپ‌اپ، با کد تأیید پیامکی)
// ============================================
function initSetPassword() {
  const modal = document.getElementById('pass-modal');
  if (!modal) return;
  const currentP = document.getElementById('pass-current');
  const newP = document.getElementById('pass-new');
  const confirmP = document.getElementById('pass-confirm');
  const otpBtn = document.getElementById('pass-use-otp');
  const otpWrap = document.getElementById('pass-otp-wrap');
  const codeInput = document.getElementById('pass-code');
  const sendBtn = document.getElementById('pass-send');
  const submitBtn = document.getElementById('pass-submit');
  const err = document.getElementById('pass-err');
  const currentWrap = document.getElementById('pass-current-wrap');
  const confirmWrap = document.getElementById('pass-confirm-wrap');
  const savedPasswordKey = 'x100_current_password';
  let currentPassword = localStorage.getItem(savedPasswordKey) || 'X100@1234';
  let otpMode = false;
  let otpCode = '';
  let otpVerified = false;
  let otpTimer = null;

  function showErr(m) { err.textContent = m; err.hidden = false; }
  function clearErr() { err.hidden = true; }
  function isStrongPassword(p) {
    return p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
  }
  function refreshSubmitState() {
    submitBtn.disabled = otpMode
      ? !(otpVerified && newP.value)
      : !(currentP.value && newP.value && confirmP.value);
  }
  function setOtpMode(on) {
    otpMode = on;
    otpVerified = false;
    otpCode = '';
    codeInput.value = '';
    currentWrap.hidden = on;
    confirmWrap.hidden = on;
    otpWrap.hidden = !on;
    otpBtn.textContent = on ? 'تغییر با رمز فعلی' : 'تغییر رمز با OTP';
    refreshSubmitState();
  }
  function startOtpTimer() {
    let left = 30;
    sendBtn.disabled = true;
    sendBtn.textContent = `ارسال مجدد (${faNum(left)})`;
    clearInterval(otpTimer);
    otpTimer = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(otpTimer);
        sendBtn.disabled = false;
        sendBtn.textContent = 'ارسال کد';
        return;
      }
      sendBtn.textContent = `ارسال مجدد (${faNum(left)})`;
    }, 1000);
  }

  function open() {
    currentP.value = '';
    newP.value = '';
    confirmP.value = '';
    codeInput.value = '';
    otpCode = '';
    otpVerified = false;
    submitBtn.disabled = true;
    clearErr();
    setOtpMode(false);
    modal.hidden = false;
    setTimeout(() => currentP.focus(), 50);
  }
  function close() { modal.hidden = true; }

  document.getElementById('profile-set-pass')?.addEventListener('click', open);
  document.getElementById('pass-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  otpBtn.addEventListener('click', () => setOtpMode(!otpMode));

  // چشم نمایش/مخفی رمز
  modal.querySelectorAll('.pass-eye').forEach((btn) => {
    btn.addEventListener('click', () => {
      const inp = document.getElementById(btn.dataset.eye);
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      btn.querySelector('.material-symbols-outlined').textContent = show ? 'visibility_off' : 'visibility';
    });
  });

  [currentP, newP, confirmP].forEach((input) => {
    input.addEventListener('input', () => {
      clearErr();
      refreshSubmitState();
    });
  });

  codeInput.addEventListener('input', () => {
    codeInput.value = codeInput.value.replace(/\D/g, '');
    otpVerified = codeInput.value.length === 6 && codeInput.value === otpCode;
    refreshSubmitState();
  });

  sendBtn.addEventListener('click', () => {
    clearErr();
    if (!otpMode && currentP.value !== currentPassword) { showErr('رمز عبور فعلی اشتباه است.'); return; }
    otpCode = '123456';
    otpVerified = false;
    codeInput.value = '';
    codeInput.focus();
    alert('کد OTP برای تغییر رمز ارسال شد');
    startOtpTimer();
  });

  submitBtn.addEventListener('click', () => {
    clearErr();
    if (!otpMode && currentP.value !== currentPassword) { showErr('رمز عبور فعلی اشتباه است.'); return; }
    if (!isStrongPassword(newP.value)) { showErr('رمز جدید باید حداقل ۸ کاراکتر و شامل حروف و عدد باشد.'); return; }
    if (!otpMode && newP.value === currentP.value) { showErr('رمز جدید نباید با رمز فعلی یکسان باشد.'); return; }
    if (!otpMode && newP.value !== confirmP.value) { showErr('عدم تطابق'); return; }
    if (!otpVerified) { showErr('کد OTP معتبر نیست.'); return; }
    currentPassword = newP.value;
    localStorage.setItem(savedPasswordKey, currentPassword);
    close();
    alert('رمز عبور با موفقیت تغییر یافت');
  });
}

// ============================================
// کراپر دایره‌ای عکس پروفایل (مثل تلگرام/اینستا)
// ============================================
function initAvatarCropper() {
  const modal = document.getElementById('crop-modal');
  const stage = document.getElementById('crop-stage');
  const img = document.getElementById('crop-img');
  const zoom = document.getElementById('crop-zoom');
  if (!modal || !stage || !img || !zoom) return;

  const STAGE = 300, OUT = 512;
  let iw = 0, ih = 0, baseScale = 1, scale = 1, tx = 0, ty = 0;
  let dragging = false, sx = 0, sy = 0, doneCb = null;

  function clamp() {
    const w = iw * scale, h = ih * scale;
    tx = Math.min(0, Math.max(STAGE - w, tx));
    ty = Math.min(0, Math.max(STAGE - h, ty));
  }
  function apply() {
    img.style.width = (iw * scale) + 'px';
    img.style.height = (ih * scale) + 'px';
    img.style.left = tx + 'px';
    img.style.top = ty + 'px';
  }
  function openWith(file, cb) {
    doneCb = cb;
    const url = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      iw = probe.naturalWidth; ih = probe.naturalHeight;
      baseScale = Math.max(STAGE / iw, STAGE / ih);
      scale = baseScale;
      zoom.value = 1;
      img.src = url;
      tx = (STAGE - iw * scale) / 2;
      ty = (STAGE - ih * scale) / 2;
      clamp(); apply();
      modal.hidden = false;
    };
    probe.src = url;
  }
  window.__openAvatarCropper = openWith;

  stage.addEventListener('pointerdown', (e) => {
    dragging = true; sx = e.clientX - tx; sy = e.clientY - ty;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    tx = e.clientX - sx; ty = e.clientY - sy;
    clamp(); apply();
  });
  const endDrag = () => { dragging = false; };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  zoom.addEventListener('input', () => {
    const c = STAGE / 2;
    const prev = scale;
    scale = baseScale * parseFloat(zoom.value);
    const k = scale / prev;
    tx = c - (c - tx) * k;
    ty = c - (c - ty) * k;
    clamp(); apply();
  });

  function close() { modal.hidden = true; }
  document.getElementById('crop-cancel').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.getElementById('crop-confirm').addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = OUT; canvas.height = OUT;
    const ctx = canvas.getContext('2d');
    const r = OUT / STAGE;
    ctx.drawImage(img, tx * r, ty * r, iw * scale * r, ih * scale * r);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    close();
    if (doneCb) doneCb(dataUrl);
  });
}

// ============================================
// تب تورنومنت — بنر، لیست، جزئیات، ثبت‌نام، تیم
// ============================================
const TOUR_HERO = [
  { kind: 'tournament', title: 'قهرمانی بزرگ x100', game: 'Counter-Strike 2', prize: '۵۰٬۰۰۰٬۰۰۰ تومان', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&h=420&fit=crop', tag: 'تورنومنت ویژه' },
  { kind: 'news', title: 'فصل جدید لیگ دوتا ۲ آغاز شد', game: 'Dota 2', img: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1000&h=420&fit=crop', tag: 'اخبار' },
  { kind: 'tournament', title: 'کاپ والورانت رمضان', game: 'Valorant', prize: '۲۰٬۰۰۰٬۰۰۰ تومان', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1000&h=420&fit=crop', tag: 'تورنومنت ویژه' },
];

const TOURNAMENTS = [
  { id: 1, name: 'قهرمانی بزرگ x100', game: 'Counter-Strike 2', region: 'ایران', type: 'team', teamSize: 5, status: 'open', entry: 'ticket', ticketPrice: '۱۵۰٬۰۰۰ تومان', prize: '۵۰٬۰۰۰٬۰۰۰ تومان', joined: 48, max: 64, date: '۱۰ تیر ۱۴۰۴', format: 'BO3 حذفی', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=220&fit=crop', desc: 'بزرگ‌ترین تورنومنت CS2 ایران با جوایز نقدی سنگین و پخش زنده.' },
  { id: 2, name: 'کاپ هفتگی والورانت', game: 'Valorant', region: 'ایران', type: 'team', teamSize: 5, status: 'open', entry: 'free', prize: '۵٬۰۰۰٬۰۰۰ تومان', joined: 22, max: 32, date: '۵ تیر ۱۴۰۴', format: 'BO1 حذفی', img: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=220&fit=crop', desc: 'تورنومنت رایگان هفتگی والورانت برای همهٔ بازیکنان.' },
  { id: 3, name: 'مسابقات انفرادی دوتا ۲', game: 'Dota 2', region: 'آسیا', type: 'solo', status: 'live', entry: 'ticket', ticketPrice: '۸۰٬۰۰۰ تومان', prize: '۱۰٬۰۰۰٬۰۰۰ تومان', joined: 64, max: 64, date: 'در حال برگزاری', format: 'BO3', img: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=220&fit=crop', desc: 'مسابقات تک‌نفرهٔ دوتا ۲ سطح آسیا.' },
  { id: 4, name: 'لیگ پاییزی PUBG', game: 'PUBG', region: 'ایران', type: 'team', teamSize: 4, status: 'soon', entry: 'free', prize: '۸٬۰۰۰٬۰۰۰ تومان', joined: 0, max: 25, date: '۲۰ تیر ۱۴۰۴', format: 'امتیازی', img: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=220&fit=crop', desc: 'لیگ تیمی PUBG با سیستم امتیازی در چند مرحله.' },
  { id: 5, name: 'جام قهرمانان CS2', game: 'Counter-Strike 2', region: 'اروپا', type: 'team', teamSize: 5, status: 'ended', entry: 'ticket', ticketPrice: '۲۰۰٬۰۰۰ تومان', prize: '۱۰۰٬۰۰۰٬۰۰۰ تومان', joined: 32, max: 32, date: '۱ خرداد ۱۴۰۴', format: 'BO5 فینال', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=220&fit=crop', desc: 'جام بین‌المللی که با قهرمانی تیم Aurora به پایان رسید.' },
];

const TOUR_STATUS = {
  open: { label: 'در حال ثبت‌نام', cls: 'open' },
  live: { label: 'در حال برگزاری', cls: 'live' },
  soon: { label: 'در انتظار برگزاری', cls: 'soon' },
  ended: { label: 'برگزار شده', cls: 'ended' },
};

// تورنومنت‌های موجود = رسمی؛ افزودن تورنومنت‌های ساختهٔ کاربران
TOURNAMENTS.forEach((t) => { if (t.official === undefined) t.official = true; });
TOURNAMENTS.push(
  { id: 101, official: false, creator: 'ArashGG', name: 'مسابقهٔ دوستانهٔ دوتا', game: 'Dota 2', region: 'ایران', type: 'team', teamSize: 5, status: 'open', entry: 'free', prize: '۵۰۰٬۰۰۰ تومان', joined: 6, max: 16, date: '۸ تیر ۱۴۰۴', format: 'BO1', img: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=220&fit=crop', desc: 'مسابقهٔ دوستانه که توسط ArashGG برگزار می‌شود.' },
  { id: 102, official: false, creator: 'SaraPlay', name: 'کاپ شبانهٔ والورانت', game: 'Valorant', region: 'ایران', type: 'team', teamSize: 5, status: 'open', entry: 'ticket', ticketPrice: '۵۰٬۰۰۰ تومان', prize: '۱٬۰۰۰٬۰۰۰ تومان', joined: 10, max: 16, date: '۱۲ تیر ۱۴۰۴', format: 'BO1 حذفی', img: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=220&fit=crop', desc: 'مسابقهٔ شبانه برای گیمرهای والورانت، میزبان SaraPlay.' },
  { id: 103, official: false, creator: 'MiladPro', name: 'لیگ محلی CS2', game: 'Counter-Strike 2', region: 'ایران', type: 'team', teamSize: 5, status: 'soon', entry: 'free', prize: 'مدال افتخار', joined: 0, max: 8, date: '۲۵ تیر ۱۴۰۴', format: 'BO3', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=220&fit=crop', desc: 'لیگ دوستانهٔ CS2 بین تیم‌های محلی.' },
  { id: 104, official: false, creator: 'Zirak90', name: 'مسابقهٔ انفرادی PUBG', game: 'PUBG', region: 'ایران', type: 'solo', status: 'open', entry: 'free', prize: '۳۰۰٬۰۰۰ تومان', joined: 18, max: 50, date: '۱۵ تیر ۱۴۰۴', format: 'امتیازی', img: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=220&fit=crop', desc: 'مسابقهٔ سولوی PUBG برای همه.' },
);

// وضعیت تیم کاربر (mock)
let myTeam = null; // { name, desc, members:[{name,role,avatar}] }
const registeredTours = new Set();
const registrationRecords = new Map();
let userWalletCoins = 1480;
let registrationState = null;

function initTournaments() {
  initTourHero();
  renderMyTeam();
  renderRails();
  renderLiveMatches();
  initTeamBuilder();

  // پر کردن فیلتر بازی (صفحهٔ همه + نوار بالای سکشن‌ها)
  const gamesOpts = '<option value="all">بازی: همه</option>' + [...new Set(TOURNAMENTS.map((t) => t.game))].map((g) => `<option>${g}</option>`).join('');
  const gameSel = document.getElementById('tour-filter-game');
  if (gameSel) gameSel.innerHTML = gamesOpts;
  const mGameSel = document.getElementById('m-filter-game');
  if (mGameSel) mGameSel.innerHTML = gamesOpts;

  // فیلتر/سرچ نوار بالای سکشن‌ها → رفرش ریل‌ها
  ['m-search', 'm-filter-game', 'm-filter-status'].forEach((id) => {
    const el = document.getElementById(id);
    el?.addEventListener('input', renderRails);
    el?.addEventListener('change', renderRails);
  });

  // «مشاهده همه» → باز کردن صفحهٔ همه با اسکوپ مربوطه
  document.querySelectorAll('.tour-seeall').forEach((btn) => {
    btn.addEventListener('click', () => openAllPane(btn.dataset.scope));
  });
  document.getElementById('tour-all-back')?.addEventListener('click', showMatchesPane);
  ['tour-search', 'tour-filter-scope', 'tour-filter-game', 'tour-filter-type', 'tour-filter-status'].forEach((id) => {
    const el = document.getElementById(id);
    el?.addEventListener('input', renderAllList);
    el?.addEventListener('change', renderAllList);
  });

  // بازگشت از صفحهٔ ساخت تیم به مسابقات
  document.getElementById('tb-back')?.addEventListener('click', showMatchesPane);
  document.getElementById('tour-registrations-back')?.addEventListener('click', showMatchesPane);
  document.getElementById('tour-registrations-filter')?.addEventListener('change', renderRegisteredTournaments);

  // بستن مودال با ضربدر یا کلیک روی پس‌زمینه؛ handlerهای inline توسط CSP مسدود می‌شوند.
  ['tour-detail-modal', 'tour-registration-modal', 'team-modal', 'tb-popup'].forEach((id) => {
    const overlay = document.getElementById(id);
    overlay?.addEventListener('click', (e) => {
      const clickedClose = e.target.closest('.tmodal__close');
      if (e.target === overlay || (clickedClose && overlay.contains(clickedClose))) {
        closeTournamentOverlay(overlay);
      }
    });
  });
  renderWallet();
}

function closeTournamentOverlay(overlay) {
  if (!overlay) return;
  overlay.hidden = true;
  if (overlay.id === 'tour-registration-modal') registrationState = null;
}

function showTourPane(name) {
  document.querySelectorAll('.tour-pane').forEach((p) => { p.hidden = (p.dataset.tpane !== name); });
}
function showTeamPane() { showTourPane('team'); }
function showMatchesPane() { showTourPane('matches'); }
function showRegistrationsPane() { showTourPane('registrations'); renderRegisteredTournaments(); }

// ── مسابقات زندهٔ مهم (۲ بنر، ۱۶:۹) ──
const LIVE_MATCHES = [
  {
    game: 'Dota 2', tournament: 'قهرمانی بزرگ x100 — فینال',
    bg: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=700&h=394&fit=crop',
    streamLive: true, viewers: '۲٬۴۰۰',
    teamA: { name: 'Aurora', logo: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aurora&backgroundColor=0a4a52', players: [{ n: 'Sajjad', s: 'da1' }, { n: 'Kian', s: 'da2' }, { n: 'Pooya', s: 'da3' }, { n: 'Hossein', s: 'da4' }, { n: 'Amir', s: 'da5' }] },
    teamB: { name: 'Blaze', logo: 'https://api.dicebear.com/7.x/bottts/svg?seed=Blaze&backgroundColor=5a1a1a', players: [{ n: 'Danial', s: 'db1' }, { n: 'Sina', s: 'db2' }, { n: 'Erfan', s: 'db3' }, { n: 'Yasin', s: 'db4' }, { n: 'Mehdi', s: 'db5' }] },
  },
  {
    game: 'Counter-Strike 2', tournament: 'کاپ CS2 — نیمه‌نهایی',
    bg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=700&h=394&fit=crop',
    streamLive: false,
    teamA: { name: 'Nightmare', logo: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nightmare&backgroundColor=2a1a4a', players: [{ n: 'Reza', s: 'ca1' }, { n: 'Ali', s: 'ca2' }, { n: 'Kaveh', s: 'ca3' }, { n: 'Nima', s: 'ca4' }, { n: 'Saeed', s: 'ca5' }] },
    teamB: { name: 'Phoenix', logo: 'https://api.dicebear.com/7.x/bottts/svg?seed=Phoenix&backgroundColor=5a3a0a', players: [{ n: 'Arman', s: 'cb1' }, { n: 'Milad', s: 'cb2' }, { n: 'Behzad', s: 'cb3' }, { n: 'Omid', s: 'cb4' }, { n: 'Vahid', s: 'cb5' }] },
  },
];

function liveSideHTML(team) {
  return `
    <div class="live-side">
      <span class="av-tip" data-name="${team.name}" data-profile><img class="live-side__logo" src="${team.logo}" alt=""></span>
      <span class="live-side__name">${team.name}</span>
      <div class="live-roster">${team.players.map((p) => `<span class="av-tip" data-name="${p.n}" data-profile><img src="https://i.pravatar.cc/40?u=${p.s}" alt=""></span>`).join('')}</div>
    </div>`;
}

function renderLiveMatches() {
  const wrap = document.getElementById('tour-live');
  if (!wrap) return;
  wrap.innerHTML = LIVE_MATCHES.map((m, i) => `
    <div class="live-card" style="background-image:url('${m.bg}')">
      <div class="live-card__shade"></div>
      <span class="live-card__game">${m.game}</span>
      <span class="live-card__badge"><span class="live-dot"></span>در حال اجرا</span>
      <div class="live-card__body">
        <div class="live-card__matchup">
          ${liveSideHTML(m.teamA)}
          <span class="live-vs">VS</span>
          ${liveSideHTML(m.teamB)}
        </div>
        <div class="live-card__foot">
          <span class="live-card__tour">${m.tournament}</span>
          <button class="live-watch ${m.streamLive ? '' : 'live-watch--off'}" data-live="${i}" ${m.streamLive ? '' : 'disabled'}>
            <span class="material-symbols-outlined">${m.streamLive ? 'live_tv' : 'videocam_off'}</span>
            ${m.streamLive ? `مشاهدهٔ استریم${m.viewers ? ' · ' + m.viewers : ''}` : 'استریم در دسترس نیست'}
          </button>
        </div>
      </div>
    </div>`).join('');
  wrap.querySelectorAll('.live-watch:not([disabled])').forEach((b) => b.addEventListener('click', () => {
    alert('در حال اتصال به استریم زنده... (به‌زودی به پخش‌کنندهٔ ما وصل می‌شود)');
  }));
  // کلیک روی آواتار → پروفایل بازیکن
  wrap.querySelectorAll('[data-profile]').forEach((el) => el.addEventListener('click', () => showPage('profile')));
}

// ── صفحهٔ مشاهده همه ──
function openAllPane(scope) {
  const scopeSel = document.getElementById('tour-filter-scope');
  if (scopeSel) scopeSel.value = scope || 'all';
  document.getElementById('tour-all-title').textContent =
    scope === 'official' ? 'تورنومنت‌های رسمی' : scope === 'user' ? 'تورنومنت‌های دیگر' : 'همهٔ تورنومنت‌ها';
  showTourPane('all');
  renderAllList();
}

function renderAllList() {
  const q = (document.getElementById('tour-search')?.value || '').trim().toLowerCase();
  const scope = document.getElementById('tour-filter-scope')?.value || 'all';
  const fGame = document.getElementById('tour-filter-game')?.value || 'all';
  const fType = document.getElementById('tour-filter-type')?.value || 'all';
  const fStatus = document.getElementById('tour-filter-status')?.value || 'all';

  const rows = TOURNAMENTS.filter((t) => {
    const mq = !q || t.name.toLowerCase().includes(q) || t.game.toLowerCase().includes(q) || (t.creator || '').toLowerCase().includes(q);
    const mScope = scope === 'all' || (scope === 'official' ? t.official : !t.official);
    return mq && mScope && (fGame === 'all' || t.game === fGame) && (fType === 'all' || t.type === fType) && (fStatus === 'all' || t.status === fStatus);
  });

  const list = document.getElementById('tour-all-list');
  const empty = document.getElementById('tour-all-empty');
  document.getElementById('tour-count').textContent = `${faNum(rows.length)} تورنومنت`;
  if (!rows.length) { list.innerHTML = ''; empty.hidden = false; return; }
  empty.hidden = true;
  list.innerHTML = rows.map(tourCardHTML).join('');
  list.querySelectorAll('.tour-card').forEach((card) => {
    const tid = Number(card.dataset.tid);
    card.querySelector('[data-act="detail"]').addEventListener('click', () => openTourDetail(tid));
    card.querySelector('[data-act="join"]').addEventListener('click', (e) => { if (!e.currentTarget.disabled) openTournamentRegistration(tid); });
  });
}

function renderRegisteredTournaments() {
  const list = document.getElementById('tour-registrations-list');
  const empty = document.getElementById('tour-registrations-empty');
  const count = document.getElementById('tour-registrations-count');
  if (!list || !empty || !count) return;
  const filter = document.getElementById('tour-registrations-filter')?.value || 'all';
  const registered = TOURNAMENTS.filter((t) => registrationRecords.has(t.id));
  const rows = registered.filter((t) => filter === 'all'
    || (filter === 'upcoming' && (t.status === 'open' || t.status === 'soon'))
    || (filter === 'ended' && t.status === 'ended'));
  count.textContent = rows.length ? `${faNum(rows.length)} ثبت‌نام` : '';
  if (!rows.length) {
    list.innerHTML = '';
    empty.hidden = false;
    empty.textContent = registered.length ? 'تورنومنتی با این فیلتر یافت نشد' : 'هنوز در تورنومنتی ثبت‌نام نکرده‌ای';
    return;
  }
  empty.hidden = true;
  list.innerHTML = rows.map((t) => {
    const record = registrationRecords.get(t.id);
    const team = tbFindTeam(record.teamId);
    const status = TOUR_STATUS[t.status];
    return `
      <article class="tour-manage-card">
        <div class="tour-manage-card__cover" style="background-image:url('${t.img}')"><span class="tour-status tour-status--${status.cls}">${status.label}</span></div>
        <div class="tour-manage-card__body">
          <div class="tour-manage-card__top"><div><span class="tour-manage-card__game">${t.game}</span><h3>${t.name}</h3></div><span class="tour-manage-card__date"><span class="material-symbols-outlined">calendar_month</span>${t.date}</span></div>
          <div class="tour-manage-card__info"><span><span class="material-symbols-outlined">shield</span>${team?.name || 'تیم انتخاب‌شده'}</span><span><span class="material-symbols-outlined">${record.cost ? 'account_balance_wallet' : 'verified'}</span>${record.cost ? `${faNum(record.cost)} X پرداخت شده` : 'ثبت‌نام رایگان'}</span></div>
          <div class="tour-manage-card__players"><span>ترکیب ثبت‌شده</span><div>${record.memberNames.map((name) => `<b>${name}</b>`).join('')}</div></div>
          <button class="tour-btn tour-btn--ghost" data-registration-detail="${t.id}">مشاهده جزئیات</button>
        </div>
      </article>`;
  }).join('');
  list.querySelectorAll('[data-registration-detail]').forEach((button) => button.addEventListener('click', () => openTourDetail(Number(button.dataset.registrationDetail))));
}

// ============================================
// ساخت تیم — صفحهٔ اختصاصی با ۵ اسلات و دعوت دوستان
// ============================================
const FRIENDS = [
  { name: 'ArashGG', sub: 'Diablo IV', avatar: 'https://i.pravatar.cc/60?u=arash', online: true },
  { name: 'SaraPlay', sub: 'Dota 2', avatar: 'https://i.pravatar.cc/60?u=sara', online: true },
  { name: 'NightWolf_IR', sub: 'آنلاین', avatar: 'https://i.pravatar.cc/60?u=wolf7', online: true },
  { name: 'MiladPro', sub: 'آفلاین', avatar: 'https://i.pravatar.cc/60?u=milad88', online: false },
  { name: 'GhostSniper', sub: 'آفلاین', avatar: 'https://i.pravatar.cc/60?u=ghost', online: false },
  { name: 'Zirak90', sub: 'آفلاین', avatar: 'https://i.pravatar.cc/60?u=zirak9', online: false },
];
const ME = { name: 'شما', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop' };

let tbTeams = [];
let tbTeamSeq = 1;

function tbGames() { return [...new Set(TOURNAMENTS.map((t) => t.game))]; }
function tbFindTeam(id) { return tbTeams.find((t) => t.id === id); }

function makeTeam() {
  return {
    id: tbTeamSeq++,
    name: '',
    game: tbGames()[0] || '',
    members: [{ captain: true, name: ME.name, avatar: ME.avatar }],
    sent: [],
    incoming: [
      { name: 'KavehX', avatar: 'https://i.pravatar.cc/60?u=kaveh' },
      { name: 'RezaT', avatar: 'https://i.pravatar.cc/60?u=reza' },
    ],
    matches: [
      { result: 'win', opponent: 'Team Blaze', tournament: 'کاپ هفتگی والورانت', members: ['شما', 'ArashGG', 'SaraPlay'], date: '۲ تیر ۱۴۰۴' },
      { result: 'loss', opponent: 'Aurora', tournament: 'قهرمانی بزرگ x100', members: ['شما', 'MiladPro'], date: '۲۸ خرداد ۱۴۰۴' },
      { result: 'win', opponent: 'Nightmare', tournament: 'کاپ هفتگی والورانت', members: ['شما', 'NightWolf_IR', 'GhostSniper'], date: '۲۰ خرداد ۱۴۰۴' },
    ],
    open: true,
  };
}

function initTeamBuilder() {
  document.getElementById('tb-add-team')?.addEventListener('click', openCreateTeamPopup);

  const gameSel = document.getElementById('tb-filter-game');
  if (gameSel) gameSel.innerHTML = '<option value="all">بازی: همه</option>' + tbGames().map((g) => `<option>${g}</option>`).join('');
  document.getElementById('tb-search')?.addEventListener('input', renderTeams);
  gameSel?.addEventListener('change', renderTeams);

  renderTeams();
}

function openCreateTeamPopup() {
  const gameOpts = tbGames().map((g) => `<option>${g}</option>`).join('');
  document.getElementById('tb-popup-body').innerHTML = `
    <button class="tmodal__close" aria-label="بستن"><span class="material-symbols-outlined">close</span></button>
    <div class="tmodal__pad">
      <h2 class="tmodal__title">ساخت تیم جدید</h2>
      <p class="tmodal__desc">نام تیم و بازی را وارد کن</p>
      <label class="tfield"><span>نام تیم (حداقل ۳ کاراکتر)</span><input type="text" id="ct-name" maxlength="50" placeholder="مثلاً Team Aurora"></label>
      <label class="tfield"><span>انتخاب بازی</span><select id="ct-game">${gameOpts}</select></label>
      <div class="tfield-err" id="ct-err" hidden></div>
      <button class="tour-btn tour-btn--primary tmodal__cta" id="ct-create">ساخت تیم</button>
    </div>`;
  document.getElementById('tb-popup').hidden = false;
  setTimeout(() => document.getElementById('ct-name')?.focus(), 50);
  document.getElementById('ct-create').addEventListener('click', () => {
    const name = document.getElementById('ct-name').value.trim();
    const err = document.getElementById('ct-err');
    if (name.length < 3) { err.textContent = 'نام تیم باید حداقل ۳ کاراکتر باشد'; err.hidden = false; return; }
    const team = makeTeam();
    team.name = name;
    team.game = document.getElementById('ct-game').value;
    tbTeams.unshift(team);
    document.getElementById('tb-popup').hidden = true;
    // تیم جدید نباید پشت فیلتر یا جستجوی قبلی پنهان بماند.
    const search = document.getElementById('tb-search');
    const gameFilter = document.getElementById('tb-filter-game');
    if (search) search.value = '';
    if (gameFilter) gameFilter.value = 'all';
    renderTeams(team.id);
    renderMyTeam();
  });
}

function renderTeams(revealTeamId = null) {
  const wrap = document.getElementById('tb-teams');
  const empty = document.getElementById('tb-empty');
  if (!wrap) return;
  const q = (document.getElementById('tb-search')?.value || '').trim().toLowerCase();
  const fGame = document.getElementById('tb-filter-game')?.value || 'all';
  const rows = tbTeams.filter((t) => {
    const mq = !q || (t.name || '').toLowerCase().includes(q);
    return mq && (fGame === 'all' || t.game === fGame);
  });
  if (!rows.length) {
    wrap.innerHTML = '';
    if (empty) { empty.hidden = false; empty.textContent = tbTeams.length ? 'تیمی با این فیلتر یافت نشد' : 'هنوز تیمی نساختی — روی «افزودن تیم جدید» بزن'; }
    return;
  }
  if (empty) empty.hidden = true;
  wrap.innerHTML = rows.map((t) => teamAccordionHTML(t)).join('');
  rows.forEach((t) => bindTeamAccordion(t));
  if (revealTeamId) {
    const createdCard = wrap.querySelector(`.tb-team[data-team="${revealTeamId}"]`);
    createdCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    createdCard?.classList.add('tb-team--new');
    setTimeout(() => createdCard?.classList.remove('tb-team--new'), 900);
  }
}

function teamAccordionHTML(t) {
  const count = t.members.length;
  const gameOpts = tbGames().map((g) => `<option ${g === t.game ? 'selected' : ''}>${g}</option>`).join('');
  return `
  <div class="tb-team ${t.open ? 'tb-team--open' : ''}" data-team="${t.id}">
    <div class="tb-team__head">
      <button type="button" class="tb-team__toggle">
        <span class="material-symbols-outlined tb-team__chev">expand_more</span>
        <span class="material-symbols-outlined tb-team__shield">shield</span>
        <span class="tb-team__name">${t.name || 'تیم بدون نام'}</span>
        <span class="tb-team__game">${t.game}</span>
        <span class="tb-team__count">${faNum(count)} نفر</span>
      </button>
      <button type="button" class="tb-team__del" data-del title="حذف تیم"><span class="material-symbols-outlined">delete</span></button>
    </div>
    <div class="tb-team__body">
      <div class="tb-team__top">
        <div class="tb-form">
          <label class="tfield"><span>نام تیم</span><input type="text" class="tb-name" maxlength="50" value="${(t.name || '').replace(/"/g,'&quot;')}" placeholder="مثلاً Team Aurora"></label>
          <label class="tfield"><span>انتخاب بازی</span><select class="tb-game">${gameOpts}</select></label>
        </div>
        <div class="tb-team__reqs">
          <button class="tour-btn tour-btn--ghost" data-incoming><span class="material-symbols-outlined">inbox</span>دریافتی <span class="tb-badge">${faNum(t.incoming.length)}</span></button>
          <button class="tour-btn tour-btn--ghost" data-sent><span class="material-symbols-outlined">outbox</span>ارسالی <span class="tb-badge">${faNum(t.sent.length)}</span></button>
          <button class="tour-btn tour-btn--ghost" data-history><span class="material-symbols-outlined">history</span>تاریخچه بازی‌ها</button>
        </div>
      </div>
      <div class="tb__roster-title">اعضای تیم</div>
      <div class="tb-slots">${slotsHTML(t)}</div>
    </div>
  </div>`;
}

function slotsHTML(t) {
  const cells = t.members.map((s, i) => `
    <div class="tb-slot tb-slot--filled ${s.captain ? 'tb-slot--captain' : ''}">
      <img class="tb-slot__avatar" src="${s.avatar}" alt="">
      <div class="tb-slot__name">${s.name}</div>
      ${s.captain ? '<span class="tb-slot__role">کاپیتن</span>' : `<span class="tb-slot__role ${s.status === 'pending' ? 'tb-slot__role--pending' : 'tb-slot__role--joined'}">${s.status === 'pending' ? 'در انتظار' : 'عضو'}</span>`}
      ${s.captain ? '' : `<button class="tb-slot__remove" data-rm="${i}"><span class="material-symbols-outlined">close</span></button>`}
    </div>`);
  // همیشه یک خانهٔ + در انتها برای افزودن نامحدود
  cells.push(`<button class="tb-slot tb-slot--empty" data-add><span class="material-symbols-outlined tb-slot__plus">add</span><span class="tb-slot__hint">دعوت هم‌تیمی</span></button>`);
  return cells.join('');
}

function bindTeamAccordion(t) {
  const card = document.querySelector(`.tb-team[data-team="${t.id}"]`);
  if (!card) return;
  card.querySelector('.tb-team__toggle').addEventListener('click', () => {
    t.open = !t.open; card.classList.toggle('tb-team--open', t.open);
  });
  card.querySelector('[data-del]').addEventListener('click', () => {
    if (confirm(`تیم «${t.name || 'بدون نام'}» حذف شود؟`)) { tbTeams = tbTeams.filter((x) => x.id !== t.id); renderTeams(); renderMyTeam(); }
  });
  card.querySelector('.tb-name').addEventListener('input', (e) => {
    t.name = e.target.value; card.querySelector('.tb-team__name').textContent = t.name || 'تیم بدون نام'; renderMyTeam();
  });
  card.querySelector('.tb-game').addEventListener('change', (e) => {
    t.game = e.target.value; card.querySelector('.tb-team__game').textContent = t.game;
  });
  card.querySelector('[data-incoming]').addEventListener('click', () => openIncomingPopup(t.id));
  card.querySelector('[data-sent]').addEventListener('click', () => openSentPopup(t.id));
  card.querySelector('[data-history]').addEventListener('click', () => openHistoryPopup(t.id));
  bindSlotHandlers(t, card);
}

function bindSlotHandlers(t, card) {
  card.querySelector('[data-add]')?.addEventListener('click', () => openFriendPicker(t.id));
  card.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => {
    const i = Number(b.dataset.rm); const removed = t.members[i];
    if (removed) t.sent = t.sent.filter((x) => x.name !== removed.name);
    t.members.splice(i, 1); refreshTeamCard(t);
  }));
}

function refreshTeamCard(t) {
  const card = document.querySelector(`.tb-team[data-team="${t.id}"]`);
  if (!card) return;
  card.querySelector('.tb-slots').innerHTML = slotsHTML(t);
  card.querySelector('.tb-team__count').textContent = `${faNum(t.members.length)} نفر`;
  card.querySelector('[data-incoming] .tb-badge').textContent = faNum(t.incoming.length);
  card.querySelector('[data-sent] .tb-badge').textContent = faNum(t.sent.length);
  bindSlotHandlers(t, card);
}

function tbClosePopup() { document.getElementById('tb-popup').hidden = true; }

function openFriendPicker(teamId) {
  const t = tbFindTeam(teamId); if (!t) return;
  const inTeam = new Set(t.members.map((s) => s.name));
  const available = FRIENDS.filter((f) => !inTeam.has(f.name));
  document.getElementById('tb-popup-body').innerHTML = `
    <button class="tmodal__close" aria-label="بستن"><span class="material-symbols-outlined">close</span></button>
    <div class="tmodal__pad">
      <h2 class="tmodal__title">دعوت هم‌تیمی</h2>
      <p class="tmodal__desc">یکی از دوستانت را برای ارسال درخواست انتخاب کن</p>
      <div class="tb-friends">
        ${available.length ? available.map((f) => `
          <button class="tb-friend" data-name="${f.name}">
            <img src="${f.avatar}" alt="">
            <div class="tb-friend__info"><span class="tb-friend__name">${f.name}</span><span class="tb-friend__sub">${f.sub}</span></div>
            <span class="tb-friend__dot ${f.online ? 'is-on' : ''}"></span>
            <span class="tb-friend__add"><span class="material-symbols-outlined">person_add</span></span>
          </button>`).join('') : '<div class="req-empty"><span class="material-symbols-outlined">group_off</span><span>دوستی برای دعوت باقی نمانده</span></div>'}
      </div>
    </div>`;
  document.getElementById('tb-popup').hidden = false;
  document.querySelectorAll('.tb-friend').forEach((b) => b.addEventListener('click', () => {
    const f = FRIENDS.find((x) => x.name === b.dataset.name);
    const status = Math.random() < 0.45 ? 'pending' : 'joined';
    t.members.push({ name: f.name, avatar: f.avatar, status });
    if (status === 'pending') t.sent.push({ name: f.name, avatar: f.avatar });
    refreshTeamCard(t); tbClosePopup();
  }));
}

function openIncomingPopup(teamId) {
  const t = tbFindTeam(teamId); if (!t) return;
  document.getElementById('tb-popup-body').innerHTML = `
    <button class="tmodal__close" aria-label="بستن"><span class="material-symbols-outlined">close</span></button>
    <div class="tmodal__pad">
      <h2 class="tmodal__title">درخواست‌های دریافتی</h2>
      <p class="tmodal__desc">بازیکنانی که می‌خواهند به «${t.name || 'تیم'}» بپیوندند</p>
      <div class="team-requests" id="tb-inc-list">
        ${t.incoming.length ? t.incoming.map((r, i) => `
          <div class="team-req"><img src="${r.avatar}" alt=""><span class="team-req__name">${r.name}</span>
            <button class="team-req__ok" data-acc="${i}">قبول</button><button class="team-req__no" data-rej="${i}">رد</button></div>`).join('') : '<div class="req-empty"><span class="material-symbols-outlined">inbox</span><span>درخواستی نداری</span></div>'}
      </div>
    </div>`;
  document.getElementById('tb-popup').hidden = false;
  document.querySelectorAll('#tb-inc-list [data-acc]').forEach((b) => b.addEventListener('click', () => {
    const r = t.incoming[Number(b.dataset.acc)];
    t.members.push({ name: r.name, avatar: r.avatar, status: 'joined' });
    t.incoming.splice(Number(b.dataset.acc), 1);
    refreshTeamCard(t); openIncomingPopup(teamId);
  }));
  document.querySelectorAll('#tb-inc-list [data-rej]').forEach((b) => b.addEventListener('click', () => {
    t.incoming.splice(Number(b.dataset.rej), 1); refreshTeamCard(t); openIncomingPopup(teamId);
  }));
}

function openSentPopup(teamId) {
  const t = tbFindTeam(teamId); if (!t) return;
  document.getElementById('tb-popup-body').innerHTML = `
    <button class="tmodal__close" aria-label="بستن"><span class="material-symbols-outlined">close</span></button>
    <div class="tmodal__pad">
      <h2 class="tmodal__title">درخواست‌های ارسالی</h2>
      <p class="tmodal__desc">دعوت‌هایی که فرستادی و در انتظار پاسخ‌اند</p>
      <div class="team-requests" id="tb-snt-list">
        ${t.sent.length ? t.sent.map((r, i) => `
          <div class="team-req"><img src="${r.avatar}" alt=""><span class="team-req__name">${r.name}</span>
            <span class="team-chip__st" style="margin-left:8px">در انتظار</span><button class="team-req__no" data-cancel="${i}">لغو</button></div>`).join('') : '<div class="req-empty"><span class="material-symbols-outlined">outbox</span><span>درخواستی ارسال نشده</span></div>'}
      </div>
    </div>`;
  document.getElementById('tb-popup').hidden = false;
  document.querySelectorAll('#tb-snt-list [data-cancel]').forEach((b) => b.addEventListener('click', () => {
    const r = t.sent[Number(b.dataset.cancel)];
    const si = t.members.findIndex((s) => s && !s.captain && s.name === r.name);
    if (si !== -1) t.members.splice(si, 1);
    t.sent.splice(Number(b.dataset.cancel), 1);
    refreshTeamCard(t); openSentPopup(teamId);
  }));
}

function openHistoryPopup(teamId) {
  const t = tbFindTeam(teamId); if (!t) return;
  const wins = t.matches.filter((m) => m.result === 'win').length;
  const losses = t.matches.filter((m) => m.result === 'loss').length;
  document.getElementById('tb-popup-body').innerHTML = `
    <button class="tmodal__close" aria-label="بستن"><span class="material-symbols-outlined">close</span></button>
    <div class="tmodal__pad">
      <h2 class="tmodal__title">تاریخچهٔ بازی‌های ${t.name || 'تیم'}</h2>
      <p class="tmodal__desc">${faNum(wins)} برد • ${faNum(losses)} باخت</p>
      <div class="match-list">
        ${t.matches.length ? t.matches.map((m) => `
          <div class="match-row match-row--${m.result}">
            <span class="match-res">${m.result === 'win' ? 'برد' : 'باخت'}</span>
            <div class="match-info">
              <div class="match-vs">در مقابل <b>${m.opponent}</b></div>
              <div class="match-tour"><span class="material-symbols-outlined">emoji_events</span>${m.tournament} • ${m.date}</div>
              <div class="match-members">اعضای شرکت‌کننده: ${m.members.map((n) => `<span class="match-chip">${n}</span>`).join('')}</div>
            </div>
          </div>`).join('') : '<div class="req-empty"><span class="material-symbols-outlined">history</span><span>هنوز بازی‌ای ثبت نشده</span></div>'}
      </div>
    </div>`;
  document.getElementById('tb-popup').hidden = false;
}

// ── بنر چرخشی ──
let tourHeroIdx = 0, tourHeroTimer = null;
function initTourHero() {
  const slides = document.getElementById('tour-hero-slides');
  const dots = document.getElementById('tour-hero-dots');
  if (!slides) return;
  slides.innerHTML = TOUR_HERO.map((h, i) => `
    <div class="tour-hero__slide ${i === 0 ? 'is-active' : ''}" style="background-image:url('${h.img}')">
      <div class="tour-hero__shade"></div>
      <div class="tour-hero__content">
        <span class="tour-hero__tag tour-hero__tag--${h.kind}">${h.tag}</span>
        <h2 class="tour-hero__title">${h.title}</h2>
        <div class="tour-hero__meta">
          <span><span class="material-symbols-outlined">sports_esports</span>${h.game}</span>
          ${h.prize ? `<span><span class="material-symbols-outlined">emoji_events</span>${h.prize}</span>` : ''}
        </div>
      </div>
    </div>`).join('');
  dots.innerHTML = TOUR_HERO.map((_, i) => `<button class="tour-hero__dot ${i === 0 ? 'is-active' : ''}" data-i="${i}"></button>`).join('');

  function go(i) {
    tourHeroIdx = (i + TOUR_HERO.length) % TOUR_HERO.length;
    slides.querySelectorAll('.tour-hero__slide').forEach((s, k) => s.classList.toggle('is-active', k === tourHeroIdx));
    dots.querySelectorAll('.tour-hero__dot').forEach((d, k) => d.classList.toggle('is-active', k === tourHeroIdx));
  }
  function restart() { clearInterval(tourHeroTimer); tourHeroTimer = setInterval(() => go(tourHeroIdx + 1), 5000); }
  document.getElementById('tour-hero-next').addEventListener('click', () => { go(tourHeroIdx + 1); restart(); });
  document.getElementById('tour-hero-prev').addEventListener('click', () => { go(tourHeroIdx - 1); restart(); });
  dots.querySelectorAll('.tour-hero__dot').forEach((d) => d.addEventListener('click', () => { go(Number(d.dataset.i)); restart(); }));
  restart();
}

// ── لیست تورنومنت‌ها ──
function tourCardHTML(t) {
  const st = TOUR_STATUS[t.status];
  const reg = registeredTours.has(t.id);
  const unavailable = !canRegisterForTournament(t) || reg;
  const joinLabel = reg ? 'ثبت‌نام شده ✓' : t.joined >= t.max ? 'ظرفیت تکمیل' : (t.status === 'open' ? 'ثبت‌نام' : 'ثبت‌نام بسته');
  return `
    <div class="tour-card" data-tid="${t.id}">
      <div class="tour-card__cover" style="background-image:url('${t.img}')">
        <span class="tour-status tour-status--${st.cls}">${st.label}</span>
        <span class="tour-entry ${t.entry === 'free' ? 'tour-entry--free' : 'tour-entry--paid'}">
          <span class="material-symbols-outlined">${t.entry === 'free' ? 'check_circle' : 'confirmation_number'}</span>
          ${t.entry === 'free' ? 'رایگان' : 'تیکتی'}
        </span>
      </div>
      <div class="tour-card__body">
        <div class="tour-card__name">${t.name}</div>
        <div class="tour-card__meta">
          <span><span class="material-symbols-outlined">sports_esports</span>${t.game}</span>
          <span><span class="material-symbols-outlined">${t.type === 'team' ? 'groups' : 'person'}</span>${t.type === 'team' ? `تیمی (${faNum(t.teamSize)} نفره)` : 'انفرادی'}</span>
          ${t.creator ? `<span><span class="material-symbols-outlined">person</span>میزبان: ${t.creator}</span>` : `<span><span class="material-symbols-outlined">public</span>${t.region}</span>`}
        </div>
        <div class="tour-card__row">
          <span class="tour-card__prize"><span class="material-symbols-outlined">emoji_events</span>${t.prize}</span>
          <span class="tour-card__slots">${faNum(t.joined)}/${faNum(t.max)}</span>
        </div>
        <div class="tour-card__actions">
          <button class="tour-btn tour-btn--ghost" data-act="detail">جزئیات</button>
          <button class="tour-btn tour-btn--primary" data-act="join" ${unavailable ? 'disabled' : ''}>
            ${joinLabel}
          </button>
        </div>
      </div>
    </div>`;
}

function renderRails() {
  const q = (document.getElementById('m-search')?.value || '').trim().toLowerCase();
  const fGame = document.getElementById('m-filter-game')?.value || 'all';
  const fStatus = document.getElementById('m-filter-status')?.value || 'all';
  const match = (t) => {
    const mq = !q || t.name.toLowerCase().includes(q) || t.game.toLowerCase().includes(q);
    return mq && (fGame === 'all' || t.game === fGame) && (fStatus === 'all' || t.status === fStatus);
  };
  const order = { open: 1, soon: 2, live: 3, ended: 4 };
  const byStatus = (a, b) => (order[a.status] || 9) - (order[b.status] || 9);
  renderRail('tour-rail-official', TOURNAMENTS.filter((t) => t.official && match(t)).sort(byStatus));
  renderRail('tour-rail-user', TOURNAMENTS.filter((t) => !t.official && match(t)).sort(byStatus));
}

function renderRail(id, rows) {
  const rail = document.getElementById(id);
  if (!rail) return;
  if (!rows.length) { rail.innerHTML = '<div class="tour-empty">تورنومنتی موجود نیست</div>'; return; }
  rail.innerHTML = rows.map(tourCardHTML).join('');
  rail.querySelectorAll('.tour-card').forEach((card) => {
    const tid = Number(card.dataset.tid);
    card.querySelector('[data-act="detail"]').addEventListener('click', () => openTourDetail(tid));
    card.querySelector('[data-act="join"]').addEventListener('click', (e) => { if (!e.currentTarget.disabled) openTournamentRegistration(tid); });
  });
}

// ── جزئیات تورنومنت ──
function openTourDetail(tid) {
  const t = TOURNAMENTS.find((x) => x.id === tid);
  if (!t) return;
  const st = TOUR_STATUS[t.status];
  const reg = registeredTours.has(tid);
  document.getElementById('tour-detail-body').innerHTML = `
    <button class="tmodal__close" aria-label="بستن"><span class="material-symbols-outlined">close</span></button>
    <div class="tmodal__cover" style="background-image:url('${t.img}')">
      <span class="tour-status tour-status--${st.cls}">${st.label}</span>
    </div>
    <div class="tmodal__pad">
      <h2 class="tmodal__title">${t.name}</h2>
      <p class="tmodal__desc">${t.desc}</p>
      <div class="tmodal__grid">
        <div class="tmodal__item"><span>بازی</span><b>${t.game}</b></div>
        <div class="tmodal__item"><span>نوع</span><b>${t.type === 'team' ? `تیمی (${faNum(t.teamSize)} نفره)` : 'انفرادی'}</b></div>
        <div class="tmodal__item"><span>منطقه</span><b>${t.region}</b></div>
        <div class="tmodal__item"><span>فرمت</span><b>${t.format}</b></div>
        <div class="tmodal__item"><span>تاریخ</span><b>${t.date}</b></div>
        <div class="tmodal__item"><span>شرکت‌کننده</span><b>${faNum(t.joined)} / ${faNum(t.max)}</b></div>
        <div class="tmodal__item"><span>جایزه</span><b style="color:var(--color-accent-gold,#ffd700)">${t.prize}</b></div>
        <div class="tmodal__item"><span>ورودی</span><b>${t.entry === 'free' ? 'رایگان' : 'تیکت — ' + t.ticketPrice}</b></div>
      </div>
      <button class="tour-btn tour-btn--primary tmodal__cta" ${!canRegisterForTournament(t) || reg ? 'disabled' : ''} id="tmodal-join">
        ${reg ? 'ثبت‌نام شده ✓' : t.joined >= t.max ? 'ظرفیت تکمیل شده' : (t.status === 'open' ? 'شروع ثبت‌نام' : 'ثبت‌نام بسته')}
      </button>
    </div>`;
  document.getElementById('tour-detail-modal').hidden = false;
  document.getElementById('tmodal-join')?.addEventListener('click', (e) => {
    if (!e.currentTarget.disabled) {
      document.getElementById('tour-detail-modal').hidden = true;
      openTournamentRegistration(tid);
    }
  });
}

// ── ثبت‌نام در تورنومنت: مرور شرایط، انتخاب اعضا و پرداخت از کیف پول ──
function renderWallet() {
  const wallet = document.getElementById('user-currency');
  if (wallet) wallet.textContent = faNum(userWalletCoins);
}

function canRegisterForTournament(t) {
  return t.status === 'open' && t.joined < t.max;
}

function registrationMemberCount(t) {
  return t.type === 'team' ? t.teamSize : 1;
}

function registrationCost(t) {
  if (t.entry === 'free') return 0;
  const toman = Number(String(t.ticketPrice || '')
    .replace(/[۰-۹]/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
    .replace(/[^\d]/g, ''));
  return Number.isFinite(toman) ? Math.ceil(toman / 1000) : 0;
}

function activeTeamMembers(team) {
  return team.members.filter((member) => member.captain || member.status === 'joined');
}

function matchingTeams(t) {
  return tbTeams.filter((team) => team.game === t.game);
}

function closeTournamentRegistration() {
  const modal = document.getElementById('tour-registration-modal');
  if (modal) modal.hidden = true;
  registrationState = null;
}

function openTournamentRegistration(tid) {
  const t = TOURNAMENTS.find((x) => x.id === tid);
  if (!t) return;
  if (registeredTours.has(tid)) { alert('قبلاً در این تورنومنت ثبت‌نام کرده‌اید.'); return; }
  if (!canRegisterForTournament(t)) {
    alert(t.joined >= t.max ? 'ظرفیت این تورنومنت تکمیل شده است.' : 'ثبت‌نام این تورنومنت در دسترس نیست.');
    return;
  }
  registrationState = { tid, step: 1, teamId: null, memberNames: [], message: '' };
  document.getElementById('tour-registration-modal').hidden = false;
  renderTournamentRegistration();
}

function registrationRules(t) {
  const teamRule = t.type === 'team'
    ? `باید دقیقاً ${faNum(t.teamSize)} بازیکن تأییدشده از یک تیم ${t.game} انتخاب شوند.`
    : 'برای این مسابقه فقط یک بازیکن تأییدشده از یکی از تیم‌های شما انتخاب می‌شود.';
  return [
    'حضور و آماده‌بودن بازیکنان ۱۵ دقیقه پیش از شروع مسابقه الزامی است.',
    teamRule,
    `حساب کاربری بازی انتخاب‌شده باید برای ${t.game} معتبر و آمادهٔ رقابت باشد.`,
    'رعایت قوانین بازی جوانمردانه و تصمیم داوران تورنومنت الزامی است.',
  ];
}

function registrationProgress(step) {
  return `
    <div class="reg-progress" aria-label="مرحله ${faNum(step)} از ۲">
      <span class="reg-progress__step ${step === 1 ? 'is-active' : 'is-done'}"><i>۱</i>بررسی</span>
      <span class="reg-progress__line ${step === 2 ? 'is-done' : ''}"></span>
      <span class="reg-progress__step ${step === 2 ? 'is-active' : ''}"><i>۲</i>ترکیب و پرداخت</span>
    </div>`;
}

function renderTournamentRegistration() {
  const t = TOURNAMENTS.find((x) => x.id === registrationState?.tid);
  const body = document.getElementById('tour-registration-body');
  if (!t || !body) { closeTournamentRegistration(); return; }
  if (registrationState.step === 'success') { renderRegistrationSuccess(t, body); return; }
  if (registrationState.step === 1) renderRegistrationOverview(t, body);
  else renderRegistrationRoster(t, body);
}

function renderRegistrationOverview(t, body) {
  const cost = registrationCost(t);
  const participantLabel = t.type === 'team' ? `تیمی، ${faNum(t.teamSize)} نفره` : 'انفرادی، ۱ نفر';
  body.innerHTML = `
    <button class="tmodal__close" id="reg-close" aria-label="بستن"><span class="material-symbols-outlined">close</span></button>
    <div class="reg-hero" style="background-image:url('${t.img}')"><div class="reg-hero__shade"></div><span class="reg-hero__badge">ثبت‌نام تورنومنت</span><div class="reg-hero__title">${t.name}</div></div>
    <div class="tmodal__pad reg-pad">
      ${registrationProgress(1)}
      <h2 class="tmodal__title">شرایط و جزئیات ثبت‌نام</h2>
      <p class="tmodal__desc">پیش از انتخاب ترکیب، اطلاعات مسابقه و قوانین زیر را مرور و تأیید کن.</p>
      <div class="reg-facts">
        <div class="reg-fact"><span class="material-symbols-outlined">calendar_month</span><div><small>تاریخ برگزاری</small><b>${t.date}</b></div></div>
        <div class="reg-fact"><span class="material-symbols-outlined">emoji_events</span><div><small>جوایز</small><b>${t.prize}</b></div></div>
        <div class="reg-fact"><span class="material-symbols-outlined">groups</span><div><small>نوع مسابقه</small><b>${participantLabel}</b></div></div>
        <div class="reg-fact"><span class="material-symbols-outlined">schema</span><div><small>فرمت</small><b>${t.format}</b></div></div>
      </div>
      <section class="reg-rules"><h3><span class="material-symbols-outlined">gavel</span>قوانین ثبت‌نام</h3><ul>${registrationRules(t).map((rule) => `<li>${rule}</li>`).join('')}</ul></section>
      <div class="reg-cost ${cost ? 'reg-cost--paid' : ''}">
        <span class="material-symbols-outlined">${cost ? 'account_balance_wallet' : 'verified'}</span>
        <div><small>${cost ? 'هزینه ثبت‌نام از کیف پول لانچر' : 'هزینه ثبت‌نام'}</small><b>${cost ? `${faNum(cost)} X <em>(${t.ticketPrice})</em>` : 'رایگان'}</b></div>
        <span class="reg-cost__wallet">موجودی: <strong>${faNum(userWalletCoins)} X</strong></span>
      </div>
      <button class="tour-btn tour-btn--primary tmodal__cta reg-next" id="reg-next">تأیید شرایط و انتخاب ترکیب <span class="material-symbols-outlined">arrow_back</span></button>
    </div>`;
  document.getElementById('reg-close').addEventListener('click', closeTournamentRegistration);
  document.getElementById('reg-next').addEventListener('click', () => {
    registrationState.step = 2;
    registrationState.message = '';
    renderTournamentRegistration();
  });
}

function renderRegistrationRoster(t, body) {
  const teams = matchingTeams(t);
  const required = registrationMemberCount(t);
  const selectedTeam = teams.find((team) => team.id === registrationState.teamId) || null;
  if (!selectedTeam) registrationState.memberNames = [];
  const selectedNames = new Set(registrationState.memberNames);
  const cost = registrationCost(t);
  const selectionReady = selectedTeam && selectedNames.size === required;
  const canPay = selectionReady && (!cost || userWalletCoins >= cost);
  const paymentLabel = cost ? `پرداخت ${faNum(cost)} X و ثبت‌نام` : 'تأیید ثبت‌نام رایگان';
  const teamOptions = teams.length ? `
    <div class="reg-team-options">${teams.map((team) => {
      const activeCount = activeTeamMembers(team).length;
      return `<button class="reg-team-option ${team.id === registrationState.teamId ? 'is-selected' : ''}" data-reg-team="${team.id}">
        <span class="material-symbols-outlined">shield</span><span class="reg-team-option__name">${team.name || 'تیم بدون نام'}</span>
        <span class="reg-team-option__meta">${faNum(activeCount)} عضو تأییدشده</span>
        <span class="material-symbols-outlined reg-team-option__check">check_circle</span>
      </button>`;
    }).join('')}</div>` : `
      <div class="reg-empty-team"><span class="material-symbols-outlined">group_off</span><b>تیم سازگار پیدا نشد</b><p>برای ${t.game} هنوز تیمی نساخته‌ای. ابتدا تیم بساز و اعضای موردنظرت را تأیید کن.</p><button class="tour-btn tour-btn--ghost" id="reg-manage-teams">مدیریت تیم‌ها</button></div>`;
  const roster = selectedTeam ? `
    <section class="reg-roster">
      <div class="reg-roster__head"><div><h3>انتخاب بازیکنان</h3><p>دقیقاً ${faNum(required)} نفر را از «${selectedTeam.name || 'تیم بدون نام'}» انتخاب کن.</p></div><strong class="${selectedNames.size === required ? 'is-ready' : ''}">${faNum(selectedNames.size)} از ${faNum(required)} نفر</strong></div>
      <div class="reg-player-grid">${selectedTeam.members.map((member) => {
        const active = member.captain || member.status === 'joined';
        const selected = selectedNames.has(member.name);
        return `<button class="reg-player ${selected ? 'is-selected' : ''} ${!active ? 'is-pending' : ''}" data-reg-member="${member.name}" ${active ? '' : 'disabled'}>
          <img src="${member.avatar}" alt=""><span class="reg-player__name">${member.name}</span><small>${member.captain ? 'کاپیتن' : active ? 'عضو تأییدشده' : 'در انتظار تأیید'}</small><span class="material-symbols-outlined reg-player__check">${selected ? 'check_circle' : 'radio_button_unchecked'}</span>
        </button>`;
      }).join('')}</div>
    </section>` : '';
  const message = registrationState.message || (!cost || userWalletCoins >= cost ? '' : `موجودی کیف پول برای پرداخت ${faNum(cost)} X کافی نیست.`);
  body.innerHTML = `
    <button class="tmodal__close" id="reg-close" aria-label="بستن"><span class="material-symbols-outlined">close</span></button>
    <div class="tmodal__pad reg-pad reg-pad--roster">
      ${registrationProgress(2)}
      <div class="reg-step-head"><div><span class="reg-step-head__game">${t.game}</span><h2 class="tmodal__title">ترکیب مسابقه را انتخاب کن</h2><p class="tmodal__desc">این مسابقه ${t.type === 'team' ? `${faNum(required)} نفره است` : 'انفرادی است'}؛ سپس ${cost ? 'هزینه را از کیف پول لانچر پرداخت کن.' : 'ثبت‌نام را نهایی کن.'}</p></div></div>
      <section class="reg-team-section"><h3><span class="material-symbols-outlined">groups</span>انتخاب تیم ${t.type === 'team' ? '' : 'مبدأ'}</h3>${teamOptions}</section>
      ${roster}
      <div class="reg-payment-summary"><div><span>هزینه ثبت‌نام</span><b>${cost ? `${faNum(cost)} X` : 'رایگان'}</b></div><div><span>موجودی پس از ثبت‌نام</span><b>${faNum(Math.max(0, userWalletCoins - cost))} X</b></div></div>
      <div class="reg-action-error" ${message ? '' : 'hidden'}>${message}</div>
      <div class="reg-actions"><button class="tour-btn tour-btn--ghost" id="reg-back">بازگشت</button><button class="tour-btn tour-btn--primary" id="reg-pay" ${canPay ? '' : 'disabled'}>${paymentLabel}<span class="material-symbols-outlined">${cost ? 'lock' : 'check_circle'}</span></button></div>
    </div>`;
  document.getElementById('reg-close').addEventListener('click', closeTournamentRegistration);
  document.getElementById('reg-back').addEventListener('click', () => { registrationState.step = 1; registrationState.message = ''; renderTournamentRegistration(); });
  document.querySelectorAll('[data-reg-team]').forEach((button) => button.addEventListener('click', () => {
    registrationState.teamId = Number(button.dataset.regTeam);
    registrationState.memberNames = [];
    registrationState.message = '';
    renderTournamentRegistration();
  }));
  document.querySelectorAll('[data-reg-member]').forEach((button) => button.addEventListener('click', () => {
    const name = button.dataset.regMember;
    const next = new Set(registrationState.memberNames);
    if (next.has(name)) {
      next.delete(name);
    } else if (next.size < required) {
      next.add(name);
    } else {
      registrationState.message = `برای این تورنومنت فقط ${faNum(required)} بازیکن می‌توانی انتخاب کنی.`;
      renderTournamentRegistration();
      return;
    }
    registrationState.memberNames = [...next];
    registrationState.message = '';
    renderTournamentRegistration();
  }));
  document.getElementById('reg-manage-teams')?.addEventListener('click', () => {
    closeTournamentRegistration();
    showTeamPane();
    const filter = document.getElementById('tb-filter-game');
    if (filter) filter.value = t.game;
    renderTeams();
  });
  document.getElementById('reg-pay').addEventListener('click', () => completeTournamentRegistration(t));
}

function completeTournamentRegistration(t) {
  const selectedTeam = tbFindTeam(registrationState?.teamId);
  const required = registrationMemberCount(t);
  const activeNames = new Set(selectedTeam ? activeTeamMembers(selectedTeam).map((member) => member.name) : []);
  const validSelection = registrationState?.memberNames?.length === required
    && registrationState.memberNames.every((name) => activeNames.has(name));
  const cost = registrationCost(t);
  if (!canRegisterForTournament(t) || registeredTours.has(t.id)) {
    registrationState.message = 'وضعیت تورنومنت تغییر کرده است؛ دوباره تلاش کن.';
  } else if (!selectedTeam || selectedTeam.game !== t.game || !validSelection) {
    registrationState.message = `باید دقیقاً ${faNum(required)} بازیکن تأییدشده از یک تیم ${t.game} انتخاب کنی.`;
  } else if (userWalletCoins < cost) {
    registrationState.message = 'موجودی کیف پول برای پرداخت هزینه ثبت‌نام کافی نیست.';
  } else {
    userWalletCoins -= cost;
    registeredTours.add(t.id);
    registrationRecords.set(t.id, { teamId: selectedTeam.id, memberNames: [...registrationState.memberNames], cost, registeredAt: new Date() });
    t.joined = Math.min(t.max, t.joined + 1);
    renderWallet();
    renderRails();
    if (!document.querySelector('.tour-pane[data-tpane="all"]').hidden) renderAllList();
    if (!document.querySelector('.tour-pane[data-tpane="registrations"]').hidden) renderRegisteredTournaments();
    registrationState.step = 'success';
    renderTournamentRegistration();
    return;
  }
  renderTournamentRegistration();
}

function renderRegistrationSuccess(t, body) {
  const record = registrationRecords.get(t.id);
  body.innerHTML = `
    <button class="tmodal__close" id="reg-close" aria-label="بستن"><span class="material-symbols-outlined">close</span></button>
    <div class="reg-success">
      <div class="reg-success__icon"><span class="material-symbols-outlined">check_circle</span></div>
      <span class="reg-success__eyebrow">ثبت‌نام با موفقیت انجام شد</span>
      <h2 class="tmodal__title">برای «${t.name}» آماده‌ای!</h2>
      <p class="tmodal__desc">ترکیب انتخاب‌شده ثبت شد و جزئیات بعدی از طریق نوتیفیکیشن لانچر ارسال می‌شود.</p>
      <div class="reg-success__card"><span class="material-symbols-outlined">groups</span><div><small>بازیکنان ثبت‌شده</small><b>${record.memberNames.join('، ')}</b></div></div>
      <div class="reg-success__card"><span class="material-symbols-outlined">account_balance_wallet</span><div><small>${record.cost ? 'موجودی کیف پول پس از پرداخت' : 'هزینه ثبت‌نام'}</small><b>${record.cost ? `${faNum(userWalletCoins)} X` : 'رایگان'}</b></div></div>
      <button class="tour-btn tour-btn--primary tmodal__cta" id="reg-done">متوجه شدم</button>
    </div>`;
  document.getElementById('reg-close').addEventListener('click', closeTournamentRegistration);
  document.getElementById('reg-done').addEventListener('click', closeTournamentRegistration);
}

// ── تیم من ──
function renderMyTeam() {
  const wrap = document.getElementById('tour-myteam');
  if (!wrap) return;
  if (!tbTeams.length) {
    wrap.innerHTML = `
      <div class="myteam myteam--empty">
        <div class="myteam__icon"><span class="material-symbols-outlined">groups</span></div>
        <div class="myteam__text">
          <div class="myteam__title">هنوز تیمی نداری</div>
          <div class="myteam__sub">برای شرکت در تورنومنت‌های تیمی، تیم خود را بساز</div>
        </div>
        <div class="myteam__actions">
          <button class="tour-btn tour-btn--primary" id="myteam-create"><span class="material-symbols-outlined">add</span>ساخت تیم</button>
          <button class="tour-btn tour-btn--ghost" id="myteam-manage-tours"><span class="material-symbols-outlined">manage_accounts</span>مدیریت تورنومنت‌ها</button>
        </div>
      </div>`;
    document.getElementById('myteam-create').addEventListener('click', () => { showTeamPane(); if (!tbTeams.length) document.getElementById('tb-add-team')?.click(); });
    document.getElementById('myteam-manage-tours').addEventListener('click', showRegistrationsPane);
  } else {
    const names = tbTeams.map((t) => t.name || 'بدون نام').join('، ');
    wrap.innerHTML = `
      <div class="myteam">
        <div class="myteam__icon myteam__icon--has"><span class="material-symbols-outlined">shield</span></div>
        <div class="myteam__text">
          <div class="myteam__title">تیم‌های من <span class="myteam__cap">${faNum(tbTeams.length)} تیم</span></div>
          <div class="myteam__sub">${names}</div>
        </div>
        <div class="myteam__actions">
          <button class="tour-btn tour-btn--ghost" id="myteam-manage"><span class="material-symbols-outlined">settings</span>مدیریت تیم‌ها</button>
          <button class="tour-btn tour-btn--primary" id="myteam-manage-tours"><span class="material-symbols-outlined">manage_accounts</span>مدیریت تورنومنت‌ها</button>
        </div>
      </div>`;
    document.getElementById('myteam-manage').addEventListener('click', showTeamPane);
    document.getElementById('myteam-manage-tours').addEventListener('click', showRegistrationsPane);
  }
}

// ── مودال تیم ──
const SUGGEST_PLAYERS = ['ArashGG', 'SaraPlay', 'MiladPro', 'GhostSniper', 'NightWolf_IR', 'Zirak90'];
function openTeamModal() {
  const body = document.getElementById('team-modal-body');
  if (!myTeam) {
    body.innerHTML = `
      <button class="tmodal__close" aria-label="بستن"><span class="material-symbols-outlined">close</span></button>
      <div class="tmodal__pad">
        <h2 class="tmodal__title">ساخت تیم جدید</h2>
        <label class="tfield"><span>نام تیم (۳ تا ۵۰ کاراکتر، منحصربه‌فرد)</span><input type="text" id="team-name" maxlength="50" placeholder="مثلاً Team Aurora"></label>
        <label class="tfield"><span>توضیح تیم (اختیاری)</span><textarea id="team-desc" rows="2" placeholder="دربارهٔ تیم..."></textarea></label>
        <div class="tfield-err" id="team-name-err" hidden></div>
        <button class="tour-btn tour-btn--primary tmodal__cta" id="team-create-btn">ساخت تیم و کاپیتن شدن</button>
      </div>`;
    document.getElementById('team-create-btn').addEventListener('click', () => {
      const name = document.getElementById('team-name').value.trim();
      const err = document.getElementById('team-name-err');
      if (name.length < 3) { err.textContent = 'نام تیم باید حداقل ۳ کاراکتر باشد'; err.hidden = false; return; }
      myTeam = { name, desc: document.getElementById('team-desc').value.trim(), members: [{ name: 'شما', role: 'captain', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop' }], invites: [], requests: [{ name: 'GhostSniper', avatar: 'https://i.pravatar.cc/60?u=ghost' }] };
      renderMyTeam();
      openTeamModal();
    });
  } else {
    body.innerHTML = teamManageHTML();
    bindTeamManage();
  }
  document.getElementById('team-modal').hidden = false;
}

function teamManageHTML() {
  const t = myTeam;
  return `
    <button class="tmodal__close" aria-label="بستن"><span class="material-symbols-outlined">close</span></button>
    <div class="tmodal__pad">
      <div class="team-head">
        <div class="team-head__badge"><span class="material-symbols-outlined">shield</span></div>
        <div><h2 class="tmodal__title" style="margin:0">${t.name}</h2><p class="tmodal__desc" style="margin:2px 0 0">${t.desc || 'بدون توضیح'}</p></div>
      </div>

      <div class="team-sec__title">اعضای تیم (${faNum(t.members.length)})</div>
      <div class="team-members">
        ${t.members.map((m, i) => `
          <div class="team-member">
            <img src="${m.avatar}" alt="">
            <span class="team-member__name">${m.name}</span>
            ${m.role === 'captain' ? '<span class="team-member__cap">کاپیتن</span>' : `<button class="team-member__kick" data-kick="${i}" title="حذف از تیم"><span class="material-symbols-outlined">person_remove</span></button>`}
          </div>`).join('')}
      </div>

      <div class="team-sec__title">دعوت بازیکن جدید</div>
      <div class="team-invite">
        <select id="team-invite-sel">${SUGGEST_PLAYERS.filter((p) => !t.members.some((m) => m.name === p)).map((p) => `<option>${p}</option>`).join('') || '<option value="">بازیکن دیگری نیست</option>'}</select>
        <button class="tour-btn tour-btn--primary" id="team-invite-btn">ارسال دعوت</button>
      </div>
      ${t.invites.length ? `<div class="team-pending">${t.invites.map((n) => `<span class="team-chip">${n} <span class="team-chip__st">در انتظار</span></span>`).join('')}</div>` : ''}

      ${t.requests.length ? `
      <div class="team-sec__title">درخواست‌های پیوستن (${faNum(t.requests.length)})</div>
      <div class="team-requests">
        ${t.requests.map((r, i) => `
          <div class="team-req">
            <img src="${r.avatar}" alt=""><span class="team-req__name">${r.name}</span>
            <button class="team-req__ok" data-acc="${i}">قبول</button>
            <button class="team-req__no" data-rej="${i}">رد</button>
          </div>`).join('')}
      </div>` : ''}

      <button class="tour-btn tour-btn--danger tmodal__cta" id="team-leave-btn">حذف تیم</button>
    </div>`;
}

function bindTeamManage() {
  const t = myTeam;
  document.getElementById('team-invite-btn')?.addEventListener('click', () => {
    const sel = document.getElementById('team-invite-sel');
    if (sel && sel.value) { t.invites.push(sel.value); openTeamModal(); }
  });
  document.querySelectorAll('[data-kick]').forEach((b) => b.addEventListener('click', () => {
    t.members.splice(Number(b.dataset.kick), 1); renderMyTeam(); openTeamModal();
  }));
  document.querySelectorAll('[data-acc]').forEach((b) => b.addEventListener('click', () => {
    const r = t.requests.splice(Number(b.dataset.acc), 1)[0];
    t.members.push({ name: r.name, role: 'member', avatar: r.avatar });
    renderMyTeam(); openTeamModal();
  }));
  document.querySelectorAll('[data-rej]').forEach((b) => b.addEventListener('click', () => {
    t.requests.splice(Number(b.dataset.rej), 1); openTeamModal();
  }));
  document.getElementById('team-leave-btn')?.addEventListener('click', () => {
    if (confirm('تیم حذف شود؟ این عمل قابل بازگشت نیست.')) { myTeam = null; renderMyTeam(); document.getElementById('team-modal').hidden = true; }
  });
}

function initHeroThumbs() {
  const thumbs = $$('#hero-thumbs .hero-thumb');
  const heroBgImg  = document.getElementById('hero-bg-img');
  const heroTitle  = document.getElementById('hero-title');
  const heroSub    = document.getElementById('hero-subtitle');
  const heroDesc   = document.getElementById('hero-desc');
  const heroCta    = document.getElementById('hero-cta-group');
  const heroCtaLbl = document.getElementById('hero-cta-label');

  function activateThumb(thumb) {
    // active state
    thumbs.forEach((t) => {
      t.classList.remove('hero-thumb--active');
      const corner = $('.badge--corner', t);
      if (corner) corner.remove();
    });
    thumb.classList.add('hero-thumb--active');
    const frame = $('.hero-thumb__frame', thumb);
    if (frame) {
      const badge = document.createElement('span');
      badge.className = 'badge badge--corner';
      badge.textContent = 'Selected';
      frame.appendChild(badge);
    }

    // update hero banner
    const thumbImg = thumb.querySelector('img');
    if (heroBgImg && thumbImg) {
      heroBgImg.style.opacity = '0';
      heroBgImg.src = thumbImg.src;
      heroBgImg.onload = () => { heroBgImg.style.opacity = '1'; };
    }
    if (heroTitle)  heroTitle.textContent  = thumb.dataset.title   || '';
    if (heroSub)    heroSub.textContent    = thumb.dataset.subtitle || '';
    if (heroDesc)   heroDesc.textContent   = thumb.dataset.desc     || '';

    // دکمهٔ مشاهده فقط روی بنرهایی که data-cta="1" دارند
    if (heroCta) {
      const hasCta = thumb.dataset.cta === '1';
      heroCta.style.display = hasCta ? '' : 'none';
      if (hasCta && heroCtaLbl) heroCtaLbl.textContent = thumb.dataset.ctaLabel || 'مشاهده';
    }
  }

  // چرخش خودکار هر ۵ ثانیه — کلیک دستی تایمر رو ریست می‌کنه
  let heroAutoTimer = null;
  function restartHeroAuto() {
    clearInterval(heroAutoTimer);
    heroAutoTimer = setInterval(() => {
      const current = thumbs.findIndex((t) => t.classList.contains('hero-thumb--active'));
      const next = thumbs[(current + 1) % thumbs.length];
      if (next) activateThumb(next);
    }, 5000);
  }

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      activateThumb(thumb);
      restartHeroAuto();
    });
  });

  if (thumbs.length) restartHeroAuto();
}

// ============================================
// Renderers
// ============================================
function renderContinueGames() {
  const grid = $('#continue-games');
  if (!grid) return;
  grid.innerHTML = AppData.continueGames.map((g) => `
    <div class="game-card">
      <div class="game-card__thumb">
        <img src="${g.img}" alt="${g.name}">
      </div>
      <div class="flex flex-col gap-3">
        <span class="game-card__title">${g.name}</span>
        <div class="game-card__meta">
          <span class="game-card__online">${g.online} آنلاین</span>
          <button class="btn btn--soft btn--xs">اجرا</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderStreamCard(s) {
  return `
    <div class="stream-card-sm">
      <div class="stream-card-sm__avatar"><img src="${s.avatar}" alt=""></div>
      <div class="stream-card-sm__info">
        <div class="stream-card-sm__header">
          <span class="stream-card-sm__name">${s.user}</span>
          <span class="badge badge--live">LIVE</span>
        </div>
        <span class="stream-card-sm__game">${s.game}</span>
      </div>
    </div>
  `;
}

function renderStreams() {
  const right = $('#streams-right');
  const left = $('#streams-left');
  if (right) right.innerHTML = AppData.streamsRight.map(renderStreamCard).join('');
  if (left) left.innerHTML = AppData.streamsLeft.map(renderStreamCard).join('');
}

function renderTournaments(filter = 'all') {
  const grid = $('#tournaments-grid');
  if (!grid) return;
  const items = filter === 'all'
    ? AppData.tournaments
    : AppData.tournaments.filter((t) => t.game === filter);
  grid.innerHTML = items.map((t) => `
    <div class="tournament-card">
      <div class="tournament-card__media">
        <img src="${t.img}" alt="${t.title}">
        <span class="badge badge--live badge--live-pulse tournament-card__badge">LIVE</span>
        <div class="tournament-card__overlay"></div>
        <h4 class="tournament-card__title">${t.title}</h4>
      </div>
      <div class="tournament-card__body">
        <div class="tournament-card__meta">
          <span>${t.teams}</span>
          <span class="tournament-card__prize">${t.prize}</span>
        </div>
        <button class="btn btn--soft btn--block">ثبت‌نام</button>
      </div>
    </div>
  `).join('');
}

function renderMatchmaking() {
  const grid = $('#matchmaking-grid');
  if (!grid) return;
  grid.innerHTML = AppData.matchmaking.map((m) => `
    <div class="match-card">
      <img src="${m.img}" alt="${m.name}">
      <div class="match-card__overlay"></div>
      <div class="match-card__tag-left">مچ‌میکینگ</div>
      <div class="match-card__tag-right">
        <span class="material-symbols-outlined" style="font-size:12px">bolt</span>
        پینگ پایین
      </div>
      <div class="match-card__footer">
        <h4 class="match-card__title">${m.name}</h4>
        <button class="btn btn--primary btn--block">بزن بریم</button>
      </div>
    </div>
  `).join('');
}

function renderLeaderboard() {
  const list = $('#leaderboard-list');
  if (!list) return;
  list.innerHTML = AppData.leaderboard.map((p) => `
    <div class="leaderboard-row">
      <div class="leaderboard-row__left">
        <span class="leaderboard-row__rank">${p.rank}</span>
        <div class="leaderboard-row__avatar"><img src="${p.avatar}" alt=""></div>
        <span class="leaderboard-row__name">${p.name}</span>
      </div>
      <span class="leaderboard-row__score">${p.score}</span>
    </div>
  `).join('') + `
    <button class="btn btn--ghost" style="margin-top: var(--space-2)">
      مشاهده همه بازیکن‌ها
    </button>
  `;
}

// ============================================
// Tabs (Chips)
// ============================================
function initTabs(containerSel, onChange) {
  const container = $(containerSel);
  if (!container) return;
  const chips = $$('.chip', container);
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('chip--active'));
      chip.classList.add('chip--active');
      onChange?.(chip.dataset.tab);
    });
  });
}

// ============================================
// Game Detail Page
// ============================================

const gdState = { idx: 0, game: null };   // game: بازی فعلی که داره نمایش داده میشه

function gdPickRandom() {
  const list = AppData.gameDetails;
  return list[Math.floor(Math.random() * list.length)];
}

// اسم بازی رو از داخل هر نوع کارت پیدا می‌کنه
function gdGetNameFromEl(el) {
  const sel = [
    '.game-tile__name',
    '.game-card__title',
    '.game-poster__name',
    '.match-card__title',
  ];
  for (const s of sel) {
    const found = $(s, el);
    if (found) return found.textContent.trim();
  }
  return '';
}

// اسم رو به آبجکت gameDetails مپ می‌کنه (شامل aliases)
function gdFindByName(name) {
  if (!name) return null;
  const n = name.toLowerCase().trim();
  return AppData.gameDetails.find((g) =>
    g.name.toLowerCase() === n ||
    g.nameFa === name ||
    (g.aliases || []).some((a) => a.toLowerCase() === n)
  ) || null;
}

function gdUpdateViewer() {
  const g = gdState.game;
  const img = $('#gd-main-img');
  if (img) {
    img.src = g.screenshots[gdState.idx];
    img.alt = g.name;
  }
  $$('.gd-media__thumb').forEach((t, i) => {
    t.classList.toggle('gd-media__thumb--active', i === gdState.idx);
  });
}

function gdRenderThumbs() {
  const g = gdState.game;
  const wrap = $('#gd-thumbs');
  if (!wrap) return;
  wrap.innerHTML = g.screenshots.map((src, i) => `
    <div class="gd-media__thumb ${i === 0 ? 'gd-media__thumb--active' : ''}" data-idx="${i}">
      <img src="${src}" alt="">
    </div>
  `).join('');
  $$('.gd-media__thumb', wrap).forEach((thumb) => {
    thumb.addEventListener('click', () => {
      gdState.idx = Number(thumb.dataset.idx);
      gdUpdateViewer();
    });
  });
}

function showGameDetail(gameName = '') {
  gdState.game = gdFindByName(gameName) || gdPickRandom();
  const g = gdState.game;
  gdState.idx = 0;

  // Title
  const title = $('#gd-title');
  if (title) title.textContent = g.name;

  // Screenshots viewer
  gdRenderThumbs();
  gdUpdateViewer();

  // Cover / key art
  const cover = $('#gd-cover');
  if (cover) { cover.src = g.coverImg; cover.alt = g.name; }

  // Description
  const desc = $('#gd-desc');
  if (desc) desc.textContent = g.desc;

  // Meta rows (Steam-style: label → value)
  const meta = $('#gd-meta');
  if (meta) {
    meta.innerHTML = [
      { key: 'بررسی‌های اخیر',  val: g.recentReview, cls: 'gd-meta-row__val--positive' },
      { key: 'مجموع بررسی‌ها',  val: g.totalReview,  cls: 'gd-meta-row__val--positive' },
      { key: 'تاریخ عرضه',      val: g.releaseDate },
      { key: 'توسعه‌دهنده',     val: g.developer,    cls: 'gd-meta-row__val--highlight' },
      { key: 'ناشر',            val: g.publisher,    cls: 'gd-meta-row__val--highlight' },
    ].map(({ key, val, cls = '' }) => `
      <div class="gd-meta-row">
        <span class="gd-meta-row__key">${key}:</span>
        <span class="gd-meta-row__val ${cls}">${val}</span>
      </div>
    `).join('');
  }

  // About tab — description + version
  const aboutDesc = $('#gd-about-desc');
  if (aboutDesc) aboutDesc.textContent = g.desc;
  const aboutVer = $('#gd-about-version');
  if (aboutVer) aboutVer.textContent = g.version;
  const aboutVerDate = $('#gd-about-version-date');
  if (aboutVerDate) aboutVerDate.textContent = g.versionDate ? `(${g.versionDate})` : '';

  // Tags
  const tags = $('#gd-tags');
  if (tags) {
    tags.innerHTML = g.tags.map((t) => `<span class="gd-info__tag">${t}</span>`).join('');
  }

  // CTA — بر اساس وضعیت نصب
  gdRefreshCTA();

  // Reset tabs to first (about)
  resetGdTabs();

  showPage('game-detail');
}

// Track which page we came from so Back can return there
let _prevPage = 'home';

function initGdTabs() {
  const tabs   = $$('.gd-tab');
  const panels = $$('.gd-tab-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t)   => t.classList.remove('gd-tab--active'));
      panels.forEach((p) => p.classList.remove('gd-tab-panel--active'));
      tab.classList.add('gd-tab--active');
      const panel = $(`.gd-tab-panel[data-panel="${tab.dataset.tab}"]`);
      if (panel) panel.classList.add('gd-tab-panel--active');
    });
  });
}

function resetGdTabs() {
  $$('.gd-tab').forEach((t)   => t.classList.remove('gd-tab--active'));
  $$('.gd-tab-panel').forEach((p) => p.classList.remove('gd-tab-panel--active'));
  const firstTab   = $('.gd-tab[data-tab="about"]');
  const firstPanel = $('.gd-tab-panel[data-panel="about"]');
  if (firstTab)   firstTab.classList.add('gd-tab--active');
  if (firstPanel) firstPanel.classList.add('gd-tab-panel--active');
}

function initGameDetailPage() {
  initGdTabs();

  // دکمه نصب / اجرا / لغو
  $('#gd-play-btn')?.addEventListener('click', () => {
    const game   = gdState.game;
    if (!game) return;
    const status = gameInstallStates[game.id] || 'none';

    if (status === 'none') {
      showInstallModal(game);

    } else if (status === 'downloading') {
      showPage('downloads');
    }
    // installed → اجرا (mock)
  });

  // دکمه مکث / ادامه
  $('#gd-pause-btn')?.addEventListener('click', () => {
    const game = gdState.game;
    if (!game) return;
    const active = dlState.active.find((g) => g.id === game.id);
    if (!active) return;
    active.status = active.status === 'paused' ? 'downloading' : 'paused';
    gdUpdatePauseBtn();
    dlRenderActive();   // آپدیت صفحه دانلودها هم
  });

  // دکمه حذف بازی
  $('#gd-uninstall-btn')?.addEventListener('click', () => {
    const game = gdState.game;
    if (!game) return;
    showConfirm({
      title:    `حذف ${game.name}؟`,
      body:     `بازی از سیستم شما حذف می‌شود. برای بازی مجدد باید دوباره دانلود کنید.`,
      yesLabel: 'حذف کامل',
      onYes: () => {
        gameInstallStates[game.id] = 'none';
        dlState.installed = dlState.installed.filter((g) => g.id !== game.id);
        dlRenderInstalled();
        renderSectionRow('gs-mine-row', dlState.installed, 'هنوز بازی نصب یا اضافه نشده');
        gdRefreshCTA();
      },
    });
  });

  // Prev / Next arrows
  $('#gd-prev')?.addEventListener('click', () => {
    const len = gdState.game?.screenshots.length || 1;
    gdState.idx = (gdState.idx - 1 + len) % len;
    gdUpdateViewer();
  });
  $('#gd-next')?.addEventListener('click', () => {
    const len = gdState.game?.screenshots.length || 1;
    gdState.idx = (gdState.idx + 1) % len;
    gdUpdateViewer();
  });

  // Back button
  $('#gd-back')?.addEventListener('click', () => {
    showPage(_prevPage);
  });

  // Wire clicks on EVERY game tile / game card / game poster
  function addGameClickListeners() {
    ['.game-tile', '.game-card', '.game-poster', '.match-card'].forEach((sel) => {
      $$(sel).forEach((el) => {
        if (el.dataset.gameDetailBound === 'true') return;
        el.dataset.gameDetailBound = 'true';
        el.addEventListener('click', () => {
          const activePage = $('.page--active');
          _prevPage = activePage ? activePage.dataset.page : 'home';
          const name = gdGetNameFromEl(el);   // اسم رو از کارت میخونه
          showGameDetail(name);               // اگه پیدا نشه random میده
        });
      });
    });
  }

  addGameClickListeners();
  window._refreshGameClicks = addGameClickListeners;
}


// ============================================
// Modals — Install + Confirm
// ============================================

// نگه‌داری وضعیت بازی‌ها: 'none' | 'downloading' | 'installed'
const gameInstallStates = {};   // { [gameId]: 'none'|'downloading'|'installed' }

/* ── Confirm Dialog (generic) ── */
function showConfirm({ title, body, yesLabel, yesClass = '', onYes }) {
  const overlay = $('#confirm-dialog');
  $('#confirm-title').textContent = title;
  $('#confirm-body').textContent  = body;
  const yesBtn = $('#confirm-yes');
  yesBtn.textContent  = yesLabel;
  yesBtn.className    = `btn btn--primary ${yesClass}`;
  overlay.hidden = false;

  const close = () => { overlay.hidden = true; };
  $('#confirm-no').onclick  = close;
  yesBtn.onclick = () => { close(); onYes(); };
}

// مکان‌های Steam Library (mock — در واقع از libraryfolders.vdf خونده میشه)
const steamLibraries = [
  { path: 'C:\\Program Files (x86)\\Steam', freeGB: 48  },
  { path: 'D:\\SteamLibrary',               freeGB: 450 },
  { path: 'E:\\Games',                      freeGB: 200 },
];

let _installSelectedLib = 0;   // index of selected library

/* ── Install Modal ──
   onConfirmExtra: تابع اضافه‌ای که بعد از تأیید اجرا میشه (اختیاری)
*/
function showInstallModal(game, onConfirmExtra = null) {
  const sizeMap = { cs2: 35, apex: 56, dota2: 15 };
  const sizeGB  = sizeMap[game.id] || 12;

  const modal = $('#install-modal');
  $('#install-modal-img').src          = game.coverImg;
  $('#install-modal-name').textContent = game.name;
  $('#install-modal-meta').textContent = `رایگان  •  ${sizeGB} GB`;

  // رندر لیست مکان‌ها
  _installSelectedLib = 0;
  renderInstallLocations(game);

  modal.hidden = false;

  $('#install-modal-close').onclick  = () => { modal.hidden = true; };
  $('#install-modal-cancel').onclick = () => { modal.hidden = true; };
  $('#install-modal-confirm').onclick = () => {
    modal.hidden = true;
    startInstallFlow(game, steamLibraries[_installSelectedLib].path, false);
    if (onConfirmExtra) onConfirmExtra();
    // هیچ‌وقت به صفحه دانلودها نمیره — کاربر خودش از سایدبار میره
  };
}

function renderInstallLocations(game) {
  const wrap = $('#install-modal-locations');
  const pathEl = $('#install-modal-final-path');
  if (!wrap) return;

  wrap.innerHTML = steamLibraries.map((lib, i) => {
    const isLow  = lib.freeGB < 50;
    const isSel  = i === _installSelectedLib;
    return `
      <div class="install-modal__loc ${isSel ? 'install-modal__loc--selected' : ''}" data-lib-idx="${i}">
        <div class="install-modal__loc-radio"></div>
        <span class="install-modal__loc-path">${lib.path}</span>
        <span class="install-modal__loc-free ${isLow ? 'install-modal__loc-free--low' : ''}">
          ${lib.freeGB} GB خالی
        </span>
      </div>
    `;
  }).join('');

  $$('.install-modal__loc', wrap).forEach((row) => {
    row.addEventListener('click', () => {
      _installSelectedLib = Number(row.dataset.libIdx);
      renderInstallLocations(game);
    });
  });

  // مسیر نهایی
  const selPath = steamLibraries[_installSelectedLib].path;
  if (pathEl) pathEl.textContent = `${selPath}\\BokharizGames\\${game.name}\\`;
}

// تبدیل داده allGames به فرمت قابل استفاده در install
function buildInstallGame(name, img) {
  const found = gdFindByName(name);
  if (found) return found;
  const id = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  return { id, name, coverImg: img };
}

function startInstallFlow(game, installPath, goToDownloads = true) {
  // وضعیت بازی رو به downloading تغییر بده
  gameInstallStates[game.id] = 'downloading';
  gdRefreshCTA();

  // بازی رو به لیست دانلود فعال اضافه کن
  const sizeMap = { cs2: 35, apex: 56, dota2: 15 };
  const sizeGB  = sizeMap[game.id] || 12;

  // تموم شدن بین ۱ تا ۳ دقیقه (interval هر ۲ ثانیه)
  const durationSec    = 60 + Math.random() * 120;          // 60–180 ثانیه
  const ticksNeeded    = Math.ceil(durationSec / 2);         // تعداد tick
  const incrementPerTick = sizeGB / ticksNeeded;             // پیشرفت واقعی هر tick

  // سرعت نمایشی واقع‌نما (50–150 MB/s)
  const displaySpeedMBs = parseFloat((Math.random() * 100 + 50).toFixed(1));
  const minutesLeft     = Math.round(durationSec / 60);

  dlState.active.push({
    id:               game.id,
    name:             game.name,
    img:              game.coverImg,
    totalGB:          sizeGB,
    downloadedGB:     0,
    speedMBs:         displaySpeedMBs,
    minutesLeft,
    _incrementPerTick: incrementPerTick,   // پیشرفت داخلی واقعی
    status:           'downloading',
  });
  dlRenderActive();
  renderMyGamesSection();   // فوری در «بازی‌های من» ظاهر میشه

  if (goToDownloads) showPage('downloads');
}

/* ── نمایش زنده سرعت + درصد کنار دکمه دانلود ── */
function gdRefreshDlInfo() {
  const game   = gdState.game;
  const dlInfo = $('#gd-dl-info');
  if (!dlInfo || !game) return;

  const active = dlState.active.find((g) => g.id === game.id);
  if (!active) { dlInfo.hidden = true; return; }

  const pct = Math.min(100, Math.round((active.downloadedGB / active.totalGB) * 100));
  dlInfo.hidden = false;
  const speedEl = $('#gd-dl-speed');
  const pctEl   = $('#gd-dl-pct');
  if (speedEl) speedEl.textContent = `↓ ${active.speedMBs} MB/s`;
  if (pctEl)   pctEl.textContent   = `${pct}%`;
  gdUpdatePauseBtn();
}

/* ── بروزرسانی دکمه CTA صفحه بازی ── */
function gdRefreshCTA() {
  const game         = gdState.game;
  const btn          = $('#gd-play-btn');
  const icon         = $('#gd-cta-icon');
  const label        = $('#gd-cta-label');
  const uninstallBtn = $('#gd-uninstall-btn');
  if (!btn || !uninstallBtn) return;

  // پیش‌فرض: ریست کامل
  btn.className       = 'gd-play-btn';
  btn.disabled        = false;
  uninstallBtn.hidden = true;
  const pauseBtn = $('#gd-pause-btn');
  if (pauseBtn) pauseBtn.hidden = true;
  const dlInfo = $('#gd-dl-info');
  if (dlInfo) dlInfo.hidden = true;

  if (!game) return;
  const status = gameInstallStates[game.id] || 'none';

  if (status === 'none') {
    icon.textContent  = 'download';
    label.textContent = 'نصب بازی';

  } else if (status === 'downloading') {
    // دکمه راست: صفحه دانلود
    btn.classList.add('gd-play-btn--downloading');
    icon.textContent  = 'open_in_new';
    label.textContent = 'صفحه دانلود';

    // دکمه چپ: مکث / ادامه
    if (pauseBtn) {
      pauseBtn.hidden = false;
      gdUpdatePauseBtn();
    }

    gdRefreshDlInfo();

  } else if (status === 'installed') {
    btn.classList.add('gd-play-btn--installed');
    icon.textContent    = 'play_arrow';
    label.textContent   = 'اجرای بازی';
    uninstallBtn.hidden = false;
  }
}

// آپدیت آیکون و متن دکمه مکث بر اساس وضعیت فعلی
function gdUpdatePauseBtn() {
  const game = gdState.game;
  if (!game) return;
  const active = dlState.active.find((g) => g.id === game.id);
  const pauseIcon  = $('#gd-pause-icon');
  const pauseLabel = $('#gd-pause-label');
  if (!pauseIcon || !pauseLabel) return;
  const isPaused = active?.status === 'paused';
  pauseIcon.textContent  = isPaused ? 'play_arrow' : 'pause';
  pauseLabel.textContent = isPaused ? 'ادامه' : 'مکث';
}

function initModals() {
  // کلیک خارج از مودال = بستن
  ['install-modal', 'confirm-dialog'].forEach((id) => {
    const overlay = $(`#${id}`);
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.hidden = true;
    });
  });
}


// ============================================
// Downloads Page
// ============================================
const dlState = {
  active: JSON.parse(JSON.stringify(AppData.downloadsPage.active)),   // deep clone for mutation
  queue:  JSON.parse(JSON.stringify(AppData.downloadsPage.queue)),
  installed: AppData.downloadsPage.installed,
};

let _dlInterval = null;   // progress simulation interval

function dlFormatGB(gb) {
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(gb * 1024).toFixed(0)} MB`;
}

function dlRenderActive() {
  const list  = $('#dl-active-list');
  const count = $('#dl-active-count');
  if (!list) return;

  count.textContent = dlState.active.length || '';
  count.hidden = dlState.active.length === 0;

  list.innerHTML = dlState.active.map((g, i) => {
    const pct      = Math.min(100, Math.round((g.downloadedGB / g.totalGB) * 100));
    const isPaused = g.status === 'paused';
    const isInstalling = g.status === 'installing';
    return `
      <div class="dl-card dl-card--active ${isPaused ? 'dl-card--paused' : ''}" data-active-idx="${i}">
        <div class="dl-card__thumb"><img src="${g.img}" alt="${g.name}"></div>
        <div class="dl-card__body">
          <div class="dl-card__row">
            <span class="dl-card__name">${g.name}</span>
            <div class="dl-card__actions">
              ${isInstalling ? `<span class="badge badge--primary" style="font-size:11px">در حال نصب...</span>` : `
              <button class="btn btn--icon dl-pause-btn" title="${isPaused ? 'ادامه' : 'مکث'}">
                <span class="material-symbols-outlined">${isPaused ? 'play_arrow' : 'pause'}</span>
              </button>`}
              <button class="btn btn--icon btn--icon-danger dl-cancel-btn" title="لغو">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
          <div class="dl-progress">
            <div class="dl-progress__bar">
              <div class="dl-progress__fill ${isPaused ? 'dl-progress__fill--paused' : ''}"
                   style="width:${pct}%"></div>
            </div>
            <span class="dl-progress__pct">${pct}%</span>
          </div>
          <div class="dl-card__meta">
            <span>${dlFormatGB(g.downloadedGB)} / ${dlFormatGB(g.totalGB)}</span>
            ${!isPaused && !isInstalling ? `<span class="dl-card__speed">↓ ${g.speedMBs} MB/s</span>` : ''}
            ${isPaused ? `<span style="color:var(--color-on-surface-variant);opacity:.55">متوقف شده</span>` : ''}
            ${!isPaused && !isInstalling ? `<span class="dl-card__eta">~${g.minutesLeft} دقیقه</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('') || `<p style="color:var(--color-on-surface-variant);font-size:var(--fs-body-sm);padding:var(--space-4) 0;opacity:.55">دانلود فعالی وجود ندارد</p>`;

  // Wire pause/resume/cancel
  $$('.dl-pause-btn', list).forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.closest('.dl-card').dataset.activeIdx);
      const g = dlState.active[idx];
      g.status = g.status === 'paused' ? 'downloading' : 'paused';
      dlRenderActive();
    });
  });
  $$('.dl-cancel-btn', list).forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx  = Number(btn.closest('.dl-card').dataset.activeIdx);
      const game = dlState.active[idx];
      showConfirm({
        title:    'لغو دانلود؟',
        body:     `دانلود «${game.name}» لغو می‌شود و فایل‌های دانلود‌شده پاک می‌شوند.`,
        yesLabel: 'بله، لغو شود',
        onYes: () => {
          gameInstallStates[game.id] = 'none';
          gdRefreshCTA();
          dlState.active.splice(idx, 1);
          dlRenderActive();
          renderMyGamesSection();
          if (dlState.active.length === 0) dlStartFromQueue();
        },
      });
    });
  });
}

function dlRenderQueue() {
  const list  = $('#dl-queue-list');
  const count = $('#dl-queue-count');
  if (!list) return;

  count.textContent = dlState.queue.length || '';
  count.hidden = dlState.queue.length === 0;

  list.innerHTML = dlState.queue.map((g, i) => `
    <div class="dl-card" data-queue-idx="${i}">
      <div class="dl-card__thumb"><img src="${g.img}" alt="${g.name}"></div>
      <div class="dl-card__body">
        <div class="dl-card__row">
          <span class="dl-card__name">${g.name}</span>
          <div class="dl-card__actions">
            <span class="badge" style="font-size:11px;opacity:.6">در صف</span>
            <button class="btn btn--icon dl-queue-remove" title="حذف از صف">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        <div class="dl-card__meta">
          <span>${dlFormatGB(g.totalGB)}</span>
        </div>
      </div>
    </div>
  `).join('') || `<p style="color:var(--color-on-surface-variant);font-size:var(--fs-body-sm);padding:var(--space-4) 0;opacity:.55">صف خالی است</p>`;

  $$('.dl-queue-remove', list).forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.dl-card');
      if (!card) return;
      const idx  = Number(card.dataset.queueIdx);
      const game = dlState.queue[idx];
      if (!game) return;
      if (game.id) gameInstallStates[game.id] = 'none';
      dlState.queue.splice(idx, 1);
      dlRenderQueue();
      renderMyGamesSection();
      gdRefreshCTA();
    });
  });
}

function dlRenderInstalled() {
  const list  = $('#dl-installed-list');
  const count = $('#dl-installed-count');
  if (!list) return;

  count.textContent = dlState.installed.length || '';

  list.innerHTML = dlState.installed.map((g) => `
    <div class="dl-card">
      <div class="dl-card__thumb"><img src="${g.img}" alt="${g.name}"></div>
      <div class="dl-card__body">
        <div class="dl-card__row">
          <span class="dl-card__name">${g.name}</span>
          <div class="dl-card__actions">
            ${g.hasUpdate ? `
              <span class="dl-update-badge">
                <span class="material-symbols-outlined">system_update_alt</span>
                آپدیت ${g.updateSizeMB} MB
              </span>` : ''}
            <button class="btn btn--primary btn--xs">
              <span class="material-symbols-outlined" style="font-size:15px">play_arrow</span>
              اجرا
            </button>
            <button class="btn btn--icon btn--icon-lg" title="بیشتر">
              <span class="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>
        <div class="dl-card__meta">
          <span>v${g.version}</span>
          <span>•</span>
          <span>${dlFormatGB(g.sizeGB)}</span>
          ${g.hasUpdate ? `<span style="color:#f59e0b">• آپدیت موجود</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function dlStartFromQueue() {
  if (dlState.queue.length === 0) return;
  const next = dlState.queue.shift();
  next.downloadedGB = 0;
  next.speedMBs     = (Math.random() * 4 + 1).toFixed(1) * 1;
  next.minutesLeft  = Math.round((next.totalGB * 1024) / (next.speedMBs * 60));
  next.status       = 'downloading';
  dlState.active.push(next);
  dlRenderActive();
  dlRenderQueue();
}

function initDownloadsPage() {
  dlRenderActive();
  dlRenderQueue();
  dlRenderInstalled();

  // Simulate download progress (mock)
  _dlInterval = setInterval(() => {
    dlState.active.forEach((g) => {
      if (g.status !== 'downloading') return;
      const inc = g._incrementPerTick ?? (g.speedMBs / 1024 * 2);
      g.downloadedGB = Math.min(g.totalGB, +(g.downloadedGB + inc).toFixed(4));
      const remaining = g.totalGB - g.downloadedGB;
      g.minutesLeft = Math.max(0, Math.round((remaining / inc) * 2 / 60));
      if (g.downloadedGB >= g.totalGB) {
        g.status = 'installing';
        setTimeout(() => {
          gameInstallStates[g.id] = 'installed';
          gdRefreshCTA();
          dlState.installed.unshift({ id: g.id, name: g.name, img: g.img, version: '1.0.0', sizeGB: g.totalGB, hasUpdate: false });
          dlState.active = dlState.active.filter((a) => a.id !== g.id);
          dlRenderActive();
          dlRenderInstalled();
          renderMyGamesSection();
          dlStartFromQueue();
        }, 3000);
      }
    });
    if (dlState.active.some((g) => g.status === 'downloading')) {
      dlRenderActive();
      gdRefreshDlInfo();   // آپدیت زنده روی صفحه بازی
    }
  }, 2000);
}


// ============================================
// Profile Page
// ============================================
function initProfilePage() {
  const saveBtn      = $('#profile-save');
  const nicknameInput = $('#profile-nickname');
  const toast        = $('#profile-toast');
  const displayName  = $('#profile-display-name');

  if (!saveBtn || !nicknameInput) return;

  // Restore previously saved nickname
  const saved = localStorage.getItem('shekan_nickname') || '';
  if (saved) {
    nicknameInput.value = saved;
    if (displayName) displayName.textContent = saved;
  }

  // نام کاربری به‌صورت پیش‌فرض فریز (فقط‌خواندنی) است؛ با آیکون مداد قابل ویرایش می‌شود
  const editBtn = $('#profile-nickname-edit');
  const setFrozen = (frozen) => {
    nicknameInput.readOnly = frozen;
    nicknameInput.classList.toggle('profile-form__input--frozen', frozen);
    if (editBtn) {
      const ic = editBtn.querySelector('.material-symbols-outlined');
      if (ic) ic.textContent = frozen ? 'edit' : 'lock_open';
      editBtn.classList.toggle('profile-form__edit--active', !frozen);
      editBtn.title = frozen ? 'ویرایش نام کاربری' : 'قفل کردن';
    }
    if (!frozen) { nicknameInput.focus(); nicknameInput.select(); }
  };
  setFrozen(true);
  if (editBtn) editBtn.addEventListener('click', () => setFrozen(nicknameInput.readOnly !== true ? true : false));

  saveBtn.addEventListener('click', () => {
    const nickname = nicknameInput.value.trim();

    // Require non-empty value
    if (!nickname) {
      setFrozen(false);
      nicknameInput.classList.add('profile-form__input--error');
      nicknameInput.addEventListener('input', () =>
        nicknameInput.classList.remove('profile-form__input--error'),
        { once: true }
      );
      return;
    }

    // Persist
    localStorage.setItem('shekan_nickname', nickname);

    // Update displayed name in card
    if (displayName) displayName.textContent = nickname;

    // پس از ذخیره دوباره فریز شود
    setFrozen(true);

    // Show toast, hide after 2.5s
    if (toast) {
      toast.hidden = false;
      clearTimeout(toast._hideTimer);
      toast._hideTimer = setTimeout(() => { toast.hidden = true; }, 2500);
    }
  });
}


// ============================================
// Boot
// ============================================
// ============================================
// Friends Panel
// ============================================
function initFriendsPanel() {
  const btn      = document.getElementById('hdr-friends-btn');
  const panel    = document.getElementById('friends-panel');
  const closeBtn = document.getElementById('friends-panel-close');
  if (!btn || !panel) return;

  function openPanel()  { panel.classList.add('is-open'); }
  function closePanel() { panel.classList.remove('is-open'); }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.contains('is-open') ? closePanel() : openPanel();
  });
  if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closePanel(); });

  document.addEventListener('click', (e) => {
    if (panel.classList.contains('is-open') && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      closePanel();
    }
  });

  // ── sub-tab switching ──
  const frFtabs = panel.querySelectorAll('.fr-ftab');
  const frListMap = { online: 'fr-list-online', all: 'fr-list-all', pending: 'fr-list-pending', add: 'fr-list-add' };

  function switchFrTab(ft) {
    frFtabs.forEach(b => b.classList.remove('fr-ftab--active'));
    const activeBtn = [...frFtabs].find(b => b.dataset.ft === ft);
    if (activeBtn) activeBtn.classList.add('fr-ftab--active');
    Object.values(frListMap).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.hidden = true;
    });
    const list = document.getElementById(frListMap[ft]);
    if (list) list.hidden = false;
  }
  frFtabs.forEach(b => b.addEventListener('click', () => switchFrTab(b.dataset.ft)));

  // ── DM history ──
  const dmHistory = {
    arash: [
      { from: 'them', text: 'سلام! دیشب بازی کردی؟', time: '۱۰:۴۲' },
      { from: 'me',   text: 'نه، بیرون بودم متأسفانه', time: '۱۰:۴۵' },
      { from: 'them', text: 'حیف! سیزن جدید شروع شده خیلی باحاله', time: '۱۰:۴۶' },
      { from: 'me',   text: 'امشب میپیچم بهت بریم 🔥', time: '۱۰:۴۸' },
      { from: 'them', text: 'باشه منتظرم 👊', time: '۱۰:۴۸' },
    ],
    sara: [
      { from: 'them', text: 'هی! تورنومنت این آخر هفته میای؟', time: 'دیروز' },
      { from: 'me',   text: 'آره قطعاً! ساعت چنده؟', time: 'دیروز' },
      { from: 'them', text: 'ساعت ۸ شب', time: 'دیروز' },
    ],
    nightwolf: [
      { from: 'me',   text: 'سلام! خوبی؟', time: '۲ روز پیش' },
      { from: 'them', text: 'سلام! عالیم. تو چطوری؟', time: '۲ روز پیش' },
    ],
    milad: [
      { from: 'them', text: 'کلیپ جدیدمو دیدی؟', time: '۳ روز پیش' },
      { from: 'me',   text: 'آره خیلی باحال بود!', time: '۳ روز پیش' },
    ],
  };

  let activeDmUid = null;

  function openDm(uid) {
    activeDmUid = uid;
    const item = panel.querySelector(`.fr-item[data-uid="${uid}"]`);
    if (!item) return;
    const name   = item.dataset.name || uid;
    const status = item.dataset.status === 'online' ? 'آنلاین' : (item.dataset.game || 'آفلاین');
    const isOnline = item.dataset.status === 'online';

    const ava    = document.getElementById('fr-dm-ava');
    const dot    = document.getElementById('fr-dm-dot');
    const nameEl = document.getElementById('fr-dm-name');
    const statEl = document.getElementById('fr-dm-status');
    const msgsEl = document.getElementById('fr-dm-messages');
    const welcome = document.getElementById('fr-welcome');
    const dmEl   = document.getElementById('fr-dm');

    if (ava)    ava.src = `https://i.pravatar.cc/40?u=${uid}`;
    if (dot)    { dot.className = 'fr-dm-dot' + (isOnline ? ' fr-dm-dot--online' : ''); }
    if (nameEl) nameEl.textContent = name;
    if (statEl) statEl.textContent = status;
    if (welcome) welcome.hidden = true;
    if (dmEl)   dmEl.hidden = false;

    // Render messages
    if (msgsEl) {
      const history = dmHistory[uid] || [];
      msgsEl.innerHTML = history.map(m => `
        <div class="fr-dm-msg ${m.from === 'me' ? 'fr-dm-msg--me' : ''}">
          ${m.from !== 'me' ? `<img class="fr-dm-msg-ava" src="https://i.pravatar.cc/28?u=${uid}" alt="">` : ''}
          <div class="fr-dm-msg-body">
            <div class="fr-dm-msg-text">${m.text}</div>
            <div class="fr-dm-msg-time">${m.time}</div>
          </div>
        </div>`).join('');
      setTimeout(() => { msgsEl.scrollTop = msgsEl.scrollHeight; }, 60);
    }
  }

  // Open DM on friend item click
  panel.addEventListener('click', (e) => {
    const item = e.target.closest('.fr-item[data-uid]');
    if (item && !e.target.closest('.fr-item__actions')) {
      openDm(item.dataset.uid);
    }
    // Accept/decline pending
    const acceptBtn = e.target.closest('.fr-item__accept');
    if (acceptBtn) {
      const li = acceptBtn.closest('.fr-item');
      if (li) li.remove();
    }
    const declineBtn = e.target.closest('.fr-item__decline');
    if (declineBtn) {
      const li = declineBtn.closest('.fr-item');
      if (li) li.remove();
    }
  });

  // Close DM
  const dmCloseBtn = document.getElementById('fr-dm-close');
  if (dmCloseBtn) {
    dmCloseBtn.addEventListener('click', () => {
      const dmEl = document.getElementById('fr-dm');
      const welcome = document.getElementById('fr-welcome');
      if (dmEl) dmEl.hidden = true;
      if (welcome) welcome.hidden = false;
      activeDmUid = null;
    });
  }

  // Send DM
  const dmInput = document.getElementById('fr-dm-input');
  const dmSend  = document.getElementById('fr-dm-send');
  function sendDm() {
    if (!dmInput || !dmInput.value.trim()) return;
    const text = dmInput.value.trim();
    const msgsEl = document.getElementById('fr-dm-messages');
    if (msgsEl) {
      const div = document.createElement('div');
      div.className = 'fr-dm-msg fr-dm-msg--me';
      div.innerHTML = `<div class="fr-dm-msg-body"><div class="fr-dm-msg-text">${text}</div><div class="fr-dm-msg-time">همین الان</div></div>`;
      msgsEl.appendChild(div);
      msgsEl.scrollTop = msgsEl.scrollHeight;
      // Store
      if (activeDmUid) {
        if (!dmHistory[activeDmUid]) dmHistory[activeDmUid] = [];
        dmHistory[activeDmUid].push({ from: 'me', text, time: 'همین الان' });
      }
    }
    dmInput.value = '';
    dmInput.focus();
  }
  if (dmSend)  dmSend.addEventListener('click', sendDm);
  if (dmInput) dmInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendDm(); });

  // Add friend search
  const addInput  = document.getElementById('fr-add-input');
  const addSubmit = document.getElementById('fr-add-submit');
  const addResults = document.getElementById('fr-add-results');
  const mockUsers = [
    { uid: 'kz99', name: 'KZplayer99', game: 'CS2' },
    { uid: 'reza1', name: 'RezaGamer', game: 'FIFA' },
    { uid: 'nader7', name: 'NaderX7', game: 'Valorant' },
    { uid: 'dark9', name: 'DarkHorse9', game: 'Dota 2' },
  ];
  function doAddSearch() {
    if (!addInput || !addResults) return;
    const q = addInput.value.trim().toLowerCase();
    addResults.innerHTML = '<div class="fr-add-loading">در حال جستجو...</div>';
    setTimeout(() => {
      const results = q ? mockUsers.filter(u => u.name.toLowerCase().includes(q) || u.uid.includes(q)) : mockUsers;
      if (!results.length) { addResults.innerHTML = '<div class="fr-add-empty">کسی پیدا نشد</div>'; return; }
      addResults.innerHTML = '';
      results.forEach(u => {
        const el = document.createElement('div');
        el.className = 'fr-add-result';
        el.innerHTML = `
          <img src="https://i.pravatar.cc/36?u=${u.uid}" alt="">
          <div class="fr-add-result__info"><div class="fr-add-result__name">${u.name}</div><div class="fr-add-result__game">${u.game}</div></div>
          <button class="fr-add-result__btn btn btn--primary btn--sm">افزودن</button>`;
        addResults.appendChild(el);
      });
    }, 500);
  }
  if (addSubmit) addSubmit.addEventListener('click', doAddSearch);
  if (addInput)  addInput.addEventListener('keydown', e => { if (e.key === 'Enter') doAddSearch(); });
}

// Community Page
// ============================================
function initCommunityPage() {
  const page = document.querySelector('.page[data-page="community"]');
  if (!page) return;

  // ── Main tab switching (اخبار / پست‌ها / کامیونیتی) ──
  const commTabs = page.querySelectorAll('.comm-tab');
  const commViewMap = { posts: 'comv-posts', community: 'comv-community' };

  function switchCommTab(tabId) {
    commTabs.forEach(t => t.classList.remove('comm-tab--active'));
    const t = [...commTabs].find(t => t.dataset.ctab === tabId);
    if (t) t.classList.add('comm-tab--active');
    page.querySelectorAll('.comm-view').forEach(v => { v.hidden = true; });
    const view = document.getElementById(commViewMap[tabId]);
    if (view) view.hidden = false;
    if (tabId === 'community') {
      // همیشه overlay های سرچ و درخواست رو ببند
      const srchOv = document.getElementById('comm-search-overlay');
      const reqOv  = document.getElementById('comm-req-overlay');
      const lpop   = document.getElementById('comm-leave-popup');
      if (srchOv) srchOv.hidden = true;
      if (reqOv)  reqOv.hidden  = true;
      if (lpop)   lpop.hidden   = true;
      // activate first built-in server if none active
      const activeServer = page.querySelector('.dsc-server--active[data-server]');
      if (!activeServer) {
        const first = page.querySelector('.dsc-server--builtin');
        if (first) { first.classList.add('dsc-server--active'); const nEl = document.getElementById('comm-game-name'); if (nEl) nEl.textContent = first.title; }
      }
      switchChannel('crules');
    }
  }
  commTabs.forEach(t => t.addEventListener('click', () => switchCommTab(t.dataset.ctab)));

  // ── Community info card data ──
  const commInfoData = {
    x100:   { abbr:'X', color:'#c0392b', type:'جامعه رسمی', verified:true,  level:'۱۰', xp:'۱۸٬۵۰۰', xpMax:'۲۵٬۰۰۰', xpPct:74, members:'۸۵٬۳۲۰', online:'۳٬۴۵۰' },
    trade:  { abbr:'TR', color:'#27ae60', type:'بازار رسمی', verified:true,  level:'۸',  xp:'۹٬۲۰۰',  xpMax:'۱۵٬۰۰۰', xpPct:61, members:'۳۲٬۱۰۰', online:'۱٬۲۸۰' },
    diablo: { abbr:'D4', color:'#8b0000', type:'جامعه بازی', verified:true,  level:'۵',  xp:'۲٬۴۵۰',  xpMax:'۵٬۰۰۰',  xpPct:49, members:'۱۲٬۴۵۰', online:'۲۴۳' },
    dota:   { abbr:'DT', color:'#c0392b', type:'جامعه بازی', verified:false, level:'۴',  xp:'۱٬۸۰۰',  xpMax:'۴٬۰۰۰',  xpPct:45, members:'۸٬۹۴۰',  online:'۱۱۲' },
    cs:     { abbr:'CS', color:'#e67e22', type:'جامعه بازی', verified:true,  level:'۷',  xp:'۶٬۷۰۰',  xpMax:'۱۰٬۰۰۰', xpPct:67, members:'۲۱٬۰۰۰', online:'۵۶۸' },
    pubg:   { abbr:'PG', color:'#f39c12', type:'کلن خصوصی',  verified:false, level:'۳',  xp:'۹۸۰',    xpMax:'۲٬۰۰۰',  xpPct:49, members:'۳٬۲۰۰',  online:'۴۵' },
    lol:    { abbr:'LoL',color:'#1abc9c', type:'جامعه بازی', verified:true,  level:'۶',  xp:'۴٬۱۰۰',  xpMax:'۷٬۰۰۰',  xpPct:58, members:'۳۴٬۵۰۰', online:'۸۹۱' },
  };

  function updateCommInfoCard(serverId, serverTitle) {
    const data = commInfoData[serverId] || { abbr: (serverTitle||'?').slice(0,3), color:'#333', type:'جامعه', verified:false, level:'۱', xp:'۰', xpMax:'۱٬۰۰۰', xpPct:0, members:'--', online:'--' };
    const el = id => document.getElementById(id);
    const nameEl = el('comm-game-name'); if (nameEl) nameEl.textContent = serverTitle || serverId;
    const ava = el('comm-info-avatar'); if (ava) { ava.textContent = data.abbr; ava.style.background = data.color; }
    const verify = el('comm-info-verify'); if (verify) verify.style.display = data.verified ? '' : 'none';
    const type = el('comm-info-type'); if (type) type.textContent = data.type;
    const level = el('comm-info-level'); if (level) level.textContent = data.level;
    const xp = el('comm-info-xp'); if (xp) xp.textContent = data.xp;
    const xpMax = el('comm-info-xp-max'); if (xpMax) xpMax.textContent = data.xpMax;
    const xpFill = el('comm-info-xp-fill'); if (xpFill) xpFill.style.width = data.xpPct + '%';
    const members = el('comm-info-members'); if (members) members.textContent = data.members;
    const online = el('comm-info-online'); if (online) online.textContent = data.online;
  }

  // ── Reset tab when page becomes active (از data-pending-tab میخونه اگه از سایدبار اومده) ──
  const observer = new MutationObserver(() => {
    if (page.classList.contains('page--active')) {
      const pending = page.dataset.pendingTab || 'posts';
      delete page.dataset.pendingTab;
      switchCommTab(pending);
    }
  });
  observer.observe(page, { attributes: true, attributeFilter: ['class'] });

  // ── Voice meta ──
  const voiceMeta = {
    cv2:  { name: 'اتاق ۲ نفره',     cap: '۰ از ۲ نفر',   users: [] },
    cv5a: { name: 'اتاق ۵ نفره • ۱', cap: '۳ از ۵ نفر',   users: ['ArashGG','SaraPlay','NightWolf'] },
    cv20: { name: 'اتاق ۲۰ نفره',    cap: '۷ از ۲۰ نفر',  users: ['ProGamer_Ali','Zirak90','GhostSniper','MiladPro','ArashGG','SaraPlay','NightWolf'] },
  };

  const chPanelMap = {
    crules:      'comm-rules',
    cakhabar:    'comm-akhabar',
    cnews:       'comm-news',
    ctutorial:   'comm-tutorial',
    cfreechat:   'comm-freechat',
    cfindplayer: 'comm-findplayer',
    cv2: 'comm-voice', cv5a: 'comm-voice', cv20: 'comm-voice',
  };

  // ── Switch channel ──
  const chBtns = page.querySelectorAll('.dsc-ch');
  function switchChannel(chId) {
    chBtns.forEach(b => b.classList.remove('dsc-ch--active'));
    const active = [...chBtns].find(b => b.dataset.ch === chId);
    if (active) active.classList.add('dsc-ch--active');
    page.querySelectorAll('.dsc-panel').forEach(p => { p.hidden = true; });
    const panelId = chPanelMap[chId];
    if (panelId) { const p = document.getElementById(panelId); if (p) p.hidden = false; }
    // Voice room
    if (voiceMeta[chId]) {
      const m = voiceMeta[chId];
      const titleEl = document.getElementById('comm-voice-title');
      const nameEl  = document.getElementById('comm-voice-name');
      const capEl   = document.getElementById('comm-voice-cap');
      const usersEl = document.getElementById('comm-voice-users');
      if (titleEl) titleEl.textContent = m.name;
      if (nameEl)  nameEl.textContent  = m.name;
      if (capEl)   capEl.textContent   = m.cap;
      if (usersEl) {
        usersEl.innerHTML = m.users.length === 0
          ? '<div class="voice-user voice-user--empty"><span class="material-symbols-outlined">person_add</span><span>اتاق خالی</span></div>'
          : m.users.slice(0, 8).map((u, i) =>
              `<div class="voice-user"><img src="https://i.pravatar.cc/28?u=${20+i}" alt=""><span>${u}</span><span class="material-symbols-outlined voice-mic${i%3===1?' voice-mic--off':''}">${i%3===1?'mic_off':'mic'}</span></div>`
            ).join('');
      }
    }
    if (chId === 'cfreechat') {
      const msgs = document.getElementById('comm-chat-messages');
      if (msgs) setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 60);
    }
  }
  chBtns.forEach(b => b.addEventListener('click', () => switchChannel(b.dataset.ch)));

  // ── Switch server/game ──
  const serversContainer = page.querySelector('.dsc-servers');
  function getAllServerBtns() {
    return serversContainer ? [...serversContainer.querySelectorAll('.dsc-server[data-server]')] : [];
  }
  serversContainer && serversContainer.addEventListener('click', e => {
    const s = e.target.closest('.dsc-server[data-server]');
    if (!s) return;
    getAllServerBtns().forEach(b => b.classList.remove('dsc-server--active'));
    s.classList.add('dsc-server--active');
    updateCommInfoCard(s.dataset.server, s.title);
    switchChannel('crules');
  });

  // init card for default active server
  const initActive = page.querySelector('.dsc-server--active[data-server]');
  if (initActive) updateCommInfoCard(initActive.dataset.server, initActive.title);

  // ── Leave community button + popup ──
  const leaveBtn      = document.getElementById('comm-leave-btn');
  const leavePopup    = document.getElementById('comm-leave-popup');
  const leaveNameEl   = document.getElementById('comm-leave-name');
  const leaveConfirm  = document.getElementById('comm-leave-confirm');
  const leaveCancel   = document.getElementById('comm-leave-cancel');

  function doLeave() {
    const active = serversContainer && serversContainer.querySelector('.dsc-server--active');
    if (!active) return;
    const cid = active.dataset.server;
    if (leavePopup) leavePopup.hidden = true;
    joinState[cid] = 'none';
    removeServerIcon(cid);
    // activate first built-in server
    const first = serversContainer.querySelector('.dsc-server--builtin');
    if (first) {
      page.querySelectorAll('.dsc-server').forEach(b => b.classList.remove('dsc-server--active'));
      first.classList.add('dsc-server--active');
      const nEl = document.getElementById('comm-game-name');
      if (nEl) nEl.textContent = first.title;
      switchChannel('crules');
    }
  }

  if (leaveBtn) {
    leaveBtn.addEventListener('click', () => {
      const active = serversContainer && serversContainer.querySelector('.dsc-server--active');
      if (!active) return;
      // built-in servers cannot be left
      if (active.dataset.builtin === 'true') {
        leaveBtn.classList.add('dsc-server--leave-shake');
        setTimeout(() => leaveBtn.classList.remove('dsc-server--leave-shake'), 600);
        return;
      }
      const name = active.title || active.dataset.server;
      if (leaveNameEl) leaveNameEl.textContent = name;
      if (leavePopup) leavePopup.hidden = false;
    });
  }
  if (leaveConfirm) leaveConfirm.addEventListener('click', doLeave);
  if (leaveCancel)  leaveCancel.addEventListener('click', () => { if (leavePopup) leavePopup.hidden = true; });
  // close on backdrop click
  if (leavePopup) {
    leavePopup.addEventListener('click', e => {
      if (e.target === leavePopup) leavePopup.hidden = true;
    });
  }

  // ── Tutorial sub-nav ──
  const tutItems = page.querySelectorAll('.tut-nav-item');
  tutItems.forEach(t => {
    t.addEventListener('click', () => {
      tutItems.forEach(n => n.classList.remove('tut-nav-item--active'));
      t.classList.add('tut-nav-item--active');
      page.querySelectorAll('.tut-page').forEach(p => { p.hidden = true; });
      const tp = document.getElementById('tut-' + t.dataset.tut);
      if (tp) tp.hidden = false;
    });
  });

  // ── Like / dislike / comments / video ──
  const likeState = {};
  page.addEventListener('click', (e) => {
    // Video play button
    const videoOverlay = e.target.closest('.feed-video__overlay');
    if (videoOverlay) {
      const container = videoOverlay.closest('.feed-video');
      const thumb  = container.querySelector('.feed-video__thumb');
      const player = container.querySelector('.feed-video__player');
      if (thumb && player) {
        thumb.style.display = 'none';
        player.hidden = false;
        player.focus();
        player.play().catch(() => {});
      }
      return;
    }

    const likeBtn    = e.target.closest('.feed-btn--like');
    const dislikeBtn = e.target.closest('.feed-btn--dislike');
    const cmtBtn     = e.target.closest('.feed-btn--cmt');
    const cmtSend    = e.target.closest('.feed-cmt-input button');

    if (likeBtn) {
      const id = likeBtn.dataset.id;
      if (!likeState[id]) likeState[id] = {};
      const s = likeState[id];
      const countEl = likeBtn.querySelector('span:last-child');
      const cur = parseInt(countEl.textContent.replace(/[^0-9]/g, '')) || 0;
      if (s.liked) { s.liked = false; likeBtn.classList.remove('active'); countEl.textContent = cur - 1; }
      else {
        s.liked = true; likeBtn.classList.add('active'); countEl.textContent = cur + 1;
        if (s.disliked) {
          s.disliked = false;
          const db = likeBtn.closest('.feed-actions').querySelector('.feed-btn--dislike');
          if (db) { db.classList.remove('active'); const dc = db.querySelector('span:last-child'); if (dc) dc.textContent = Math.max(0, parseInt(dc.textContent.replace(/[^0-9]/g,''))||0) - 1; }
        }
      }
    }
    if (dislikeBtn) {
      const id = dislikeBtn.dataset.id;
      if (!likeState[id]) likeState[id] = {};
      const s = likeState[id];
      const countEl = dislikeBtn.querySelector('span:last-child');
      const cur = parseInt(countEl.textContent.replace(/[^0-9]/g, '')) || 0;
      if (s.disliked) { s.disliked = false; dislikeBtn.classList.remove('active'); countEl.textContent = Math.max(0, cur - 1); }
      else {
        s.disliked = true; dislikeBtn.classList.add('active'); countEl.textContent = cur + 1;
        if (s.liked) {
          s.liked = false;
          const lb = dislikeBtn.closest('.feed-actions').querySelector('.feed-btn--like');
          if (lb) { lb.classList.remove('active'); const lc = lb.querySelector('span:last-child'); if (lc) lc.textContent = Math.max(0, parseInt(lc.textContent.replace(/[^0-9]/g,''))||0) - 1; }
        }
      }
    }
    if (cmtBtn) {
      const target = document.getElementById(cmtBtn.dataset.target);
      if (target) { target.hidden = !target.hidden; if (!target.hidden) target.querySelector('input')?.focus(); }
    }
    if (cmtSend) {
      const row = cmtSend.closest('.feed-cmt-input');
      const inp = row?.querySelector('input');
      const comments = cmtSend.closest('.feed-comments');
      if (inp && inp.value.trim() && comments) {
        const div = document.createElement('div');
        div.className = 'feed-comment';
        div.innerHTML = `<img src="https://i.pravatar.cc/24?u=me" alt=""><div><b>احسان</b><p>${inp.value.trim()}</p></div>`;
        comments.insertBefore(div, row);
        inp.value = '';
      }
    }
  });

  // ── Freechat send ──
  const chatInput = document.getElementById('comm-chat-input');
  const chatSend  = document.getElementById('comm-chat-send');
  const chatMsgs  = document.getElementById('comm-chat-messages');
  function sendChatMsg() {
    if (!chatInput || !chatInput.value.trim()) return;
    const text = chatInput.value.trim();
    const msg = document.createElement('div');
    msg.className = 'chat-msg chat-msg--me';
    msg.innerHTML = `<div class="chat-msg__body"><span class="chat-msg__name">احسان</span><p class="chat-msg__text">${text}</p></div>`;
    if (chatMsgs) { chatMsgs.appendChild(msg); chatMsgs.scrollTop = chatMsgs.scrollHeight; }
    chatInput.value = '';
  }
  if (chatSend)  chatSend.addEventListener('click', sendChatMsg);
  if (chatInput) chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMsg(); });

  // ══════════════════════════════════════════
  // ██  COMMUNITY SEARCH
  // ══════════════════════════════════════════
  const communitiesDB = [
    {
      id: 'diablo', name: 'Diablo IV', abbr: 'D4', color: '#8b0000',
      type: 'public', members: '۱٬۲۴۵', online: '۲۴۳',
      desc: 'کامیونیتی رسمی Diablo IV در لانچر x100. مباحث بازی، راهنماها و چالش‌های فصلی.',
      banner: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=80&fit=crop',
      admins: ['u1','u2','u3'], adminNames: ['EhsanX','SaraPlay','ArashGG'],
    },
    {
      id: 'dota', name: 'Dota 2 Iran', abbr: 'DT', color: '#c0392b',
      type: 'public', members: '۸۹۴', online: '۱۱۲',
      desc: 'بزرگترین کامیونیتی Dota 2 ایران. تیم‌سازی، آموزش و تورنومنت هفتگی.',
      banner: 'https://images.unsplash.com/photo-1542751110-97427bbecfd6?w=400&h=80&fit=crop',
      admins: ['u4','u5'], adminNames: ['NightWolf','MiladPro'],
    },
    {
      id: 'cs', name: 'CS2 Persian', abbr: 'CS', color: '#e67e22',
      type: 'public', members: '۲٬۱۰۰', online: '۵۶۸',
      desc: 'کامیونیتی CS2 فارسی‌زبانان. پیدا کردن تیم، آموزش ایمو و نقشه‌های custom.',
      banner: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=80&fit=crop',
      admins: ['u6','u7','u8'], adminNames: ['GhostSniper','Zirak90','ProGamer_Ali'],
    },
    {
      id: 'pubg', name: 'PUBG Clan', abbr: 'PG', color: '#f39c12',
      type: 'private', members: '۳۲۰', online: '۴۵',
      desc: 'کلن خصوصی PUBG. ورود فقط با دعوت‌نامه. تورنومنت هفتگی داخلی.',
      banner: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=80&fit=crop',
      admins: ['u9','u10'], adminNames: ['DarkKing','XFighter99'],
    },
    {
      id: 'lol', name: 'LoL Iran', abbr: 'LoL', color: '#1abc9c',
      type: 'public', members: '۳٬۴۵۰', online: '۸۹۱',
      desc: 'جامعه لیگ آف لجندز ایران. راهنماهای ایمو، تیربازی و بازی رنکد.',
      banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=80&fit=crop',
      admins: ['u11'], adminNames: ['AriaStar'],
    },
    {
      id: 'val', name: 'Valorant FA', abbr: 'VL', color: '#e74c3c',
      type: 'public', members: '۱٬۷۸۰', online: '۳۲۴',
      desc: 'کامیونیتی فارسی Valorant. آموزش ایجنت‌ها، تاکتیک‌های تیمی و ماچ‌های رنکد.',
      banner: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&h=80&fit=crop',
      admins: ['u12','u13'], adminNames: ['VortexPlayer','CyberAce'],
    },
    {
      id: 'wow', name: 'WoW Persia', abbr: 'WoW', color: '#8e44ad',
      type: 'private', members: '۵۶۰', online: '۸۸',
      desc: 'گیلد رسمی World of Warcraft فارسی. Raid هفتگی و مباحث تخصصی کلاس.',
      banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=80&fit=crop',
      admins: ['u14'], adminNames: ['WizardKing'],
    },
    {
      id: 'ow', name: 'Overwatch 2 IR', abbr: 'OW', color: '#2980b9',
      type: 'public', members: '۶۴۰', online: '۹۷',
      desc: 'کامیونیتی Overwatch 2 ایران. انتخاب هیرو، استراتژی و تیم‌سازی برای رنکد.',
      banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=80&fit=crop',
      admins: ['u15','u16'], adminNames: ['SkyHunter','BlazeFire'],
    },
    {
      id: 'apex', name: 'Apex Legends FA', abbr: 'AX', color: '#e74c3c',
      type: 'public', members: '۴۸۰', online: '۶۱',
      desc: 'کامیونیتی Apex Legends فارسی. اسکواد‌بازی، ایونت‌ها و تورنومنت ماهانه.',
      banner: 'https://images.unsplash.com/photo-1580327332925-a10e6cb11baa?w=400&h=80&fit=crop',
      admins: ['u17'], adminNames: ['ApexPro99'],
    },
    {
      id: 'gta', name: 'GTA Online IR', abbr: 'GTA', color: '#27ae60',
      type: 'public', members: '۱٬۱۲۰', online: '۲۰۴',
      desc: 'کامیونیتی GTA Online ایران. Crew رسمی، مأموریت‌ها و رویدادهای ویژه.',
      banner: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=400&h=80&fit=crop',
      admins: ['u18','u19'], adminNames: ['CrimeKing','DriftMaster'],
    },
  ];

  // Join/request state per community
  const joinState = {};

  function renderCommunityCard(comm) {
    const state = joinState[comm.id] || 'none'; // none | joined | requested
    let btnClass, btnIcon, btnLabel;
    if (state === 'joined') {
      btnClass = 'csearch-card__join-btn--joined';
      btnIcon  = 'check_circle';
      btnLabel = 'عضو هستی';
    } else if (state === 'requested') {
      btnClass = 'csearch-card__join-btn--requested';
      btnIcon  = 'schedule';
      btnLabel = 'لغو درخواست';
    } else if (comm.type === 'private') {
      btnClass = 'csearch-card__join-btn--private';
      btnIcon  = 'lock';
      btnLabel = 'درخواست عضویت';
    } else {
      btnClass = 'csearch-card__join-btn--public';
      btnIcon  = 'group_add';
      btnLabel = 'عضو شو';
    }

    const adminsHtml = comm.admins.slice(0, 3).map((uid, i) =>
      `<img class="csearch-card__admin-ava" src="https://i.pravatar.cc/22?u=${uid}" title="${comm.adminNames[i] || ''}" alt="">`
    ).join('');

    const card = document.createElement('div');
    card.className = 'csearch-card';
    card.dataset.cid = comm.id;
    card.innerHTML = `
      <div class="csearch-card__banner">
        <div class="csearch-card__banner-bg" style="background-image:url('${comm.banner}')"></div>
        <div class="csearch-card__banner-grad"></div>
      </div>
      <div class="csearch-card__body">
        <div class="csearch-card__icon" style="background:${comm.color}">${comm.abbr}</div>
        <div class="csearch-card__info">
          <div class="csearch-card__name">${comm.name}</div>
          <div class="csearch-card__meta">
            <span class="csearch-card__type csearch-card__type--${comm.type}">${comm.type === 'private' ? '🔒 خصوصی' : '🌐 عمومی'}</span>
            <span class="csearch-card__meta-sep">·</span>
            <span>${comm.members} عضو</span>
            <span class="csearch-card__meta-sep">·</span>
            <span style="color:#22c55e">${comm.online} آنلاین</span>
          </div>
          <div class="csearch-card__desc">${comm.desc}</div>
        </div>
      </div>
      <div class="csearch-card__footer">
        <div class="csearch-card__admins">
          <span class="csearch-card__admins-label">ادمین‌ها</span>
          ${adminsHtml}
        </div>
        <button class="csearch-card__join-btn ${btnClass}" data-cid="${comm.id}" data-type="${comm.type}">
          <span class="material-symbols-outlined" style="font-size:15px">${btnIcon}</span>${btnLabel}
        </button>
      </div>`;
    return card;
  }

  function renderSearchResults(query) {
    const resultsEl = document.getElementById('comm-search-results');
    if (!resultsEl) return;
    resultsEl.innerHTML = '';

    const q = (query || '').trim().toLowerCase();
    const filtered = q
      ? communitiesDB.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.abbr.toLowerCase().includes(q) ||
          c.desc.includes(q)
        )
      : communitiesDB;

    if (!filtered.length) {
      resultsEl.innerHTML = `
        <div class="comm-search-empty">
          <span class="material-symbols-outlined">search_off</span>
          <span>کامیونیتی‌ای با این نام پیدا نشد</span>
        </div>`;
      return;
    }

    const label = document.createElement('div');
    label.className = 'comm-search-label';
    label.textContent = q ? `نتایج جستجو برای "${query}"` : 'کامیونیتی‌های پیشنهادی';
    resultsEl.appendChild(label);

    filtered.forEach(comm => {
      resultsEl.appendChild(renderCommunityCard(comm));
    });
  }

  // ── Add / remove server icon in dsc-servers ──
  function addServerIcon(comm) {
    const joinedContainer = document.getElementById('dsc-servers-joined');
    const sep = document.getElementById('dsc-sep-joined');
    if (!joinedContainer) return;
    if (joinedContainer.querySelector(`[data-server="${comm.id}"]`)) return;

    // show separator if this is the first joined community
    if (sep && joinedContainer.children.length === 0) sep.hidden = false;

    const btn = document.createElement('button');
    btn.className = 'dsc-server dsc-server--joined';
    btn.dataset.server = comm.id;
    btn.title = comm.name;
    btn.style.background = comm.color;
    btn.style.color = '#fff';
    btn.textContent = comm.abbr;
    btn.style.transform = 'scale(0)';
    btn.style.transition = 'transform 0.22s cubic-bezier(.34,1.4,.64,1)';
    joinedContainer.appendChild(btn);
    requestAnimationFrame(() => { btn.style.transform = 'scale(1)'; });
    btn.addEventListener('click', () => {
      page.querySelectorAll('.dsc-server').forEach(b => b.classList.remove('dsc-server--active'));
      btn.classList.add('dsc-server--active');
      updateCommInfoCard(comm.id, comm.name);
      switchChannel('crules');
    });
  }

  function removeServerIcon(cid) {
    const joinedContainer = document.getElementById('dsc-servers-joined');
    const sep = document.getElementById('dsc-sep-joined');
    if (!joinedContainer) return;
    const btn = joinedContainer.querySelector(`[data-server="${cid}"]`);
    if (!btn) return;
    btn.style.transform = 'scale(0)';
    btn.style.transition = 'transform 0.2s ease';
    setTimeout(() => {
      btn.remove();
      // hide separator if no more joined communities
      if (sep && joinedContainer.children.length === 0) sep.hidden = true;
    }, 220);
  }

  // Handle join/request button clicks
  function handleSearchOverlayClick(e) {
    const joinBtn = e.target.closest('.csearch-card__join-btn');
    if (!joinBtn) return;
    const cid  = joinBtn.dataset.cid;
    const type = joinBtn.dataset.type;
    const state = joinState[cid] || 'none';
    const comm  = communitiesDB.find(c => c.id === cid);

    if (state === 'joined') {
      // leave → remove icon
      joinState[cid] = 'none';
      removeServerIcon(cid);
    } else if (state === 'requested') {
      // cancel request
      joinState[cid] = 'none';
    } else if (type === 'public') {
      // join → add icon
      joinState[cid] = 'joined';
      if (comm) addServerIcon(comm);
    } else {
      // private → send request
      joinState[cid] = 'requested';
    }

    // Re-render just this card
    const card = joinBtn.closest('.csearch-card');
    if (card && comm) {
      card.replaceWith(renderCommunityCard(comm));
    }
  }

  // Wire up search overlay
  const searchOverlay  = document.getElementById('comm-search-overlay');
  const searchOpenBtn  = document.getElementById('comm-server-search-btn');
  const searchBackBtn  = document.getElementById('comm-search-back');
  const searchInp      = document.getElementById('comm-search-inp');
  const searchClear    = document.getElementById('comm-search-clear');
  const searchResults  = document.getElementById('comm-search-results');

  function openSearchOverlay() {
    if (!searchOverlay) return;
    searchOverlay.hidden = false;
    renderSearchResults('');
    if (searchInp) setTimeout(() => searchInp.focus(), 80);
  }
  function closeSearchOverlay() {
    if (!searchOverlay) return;
    searchOverlay.hidden = true;
    if (searchInp) searchInp.value = '';
    if (searchClear) searchClear.hidden = true;
  }

  if (searchOpenBtn) searchOpenBtn.addEventListener('click', openSearchOverlay);
  if (searchBackBtn) searchBackBtn.addEventListener('click', closeSearchOverlay);

  if (searchInp) {
    searchInp.addEventListener('input', () => {
      const q = searchInp.value.trim();
      if (searchClear) searchClear.hidden = !q;
      renderSearchResults(q);
    });
    searchInp.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeSearchOverlay();
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInp) { searchInp.value = ''; searchInp.focus(); }
      searchClear.hidden = true;
      renderSearchResults('');
    });
  }
  if (searchResults) {
    searchResults.addEventListener('click', handleSearchOverlayClick);
  }

  // ══════════════════════════════════════════
  // ██  MEMBERSHIP REQUESTS
  // ══════════════════════════════════════════

  // درخواست‌های دریافتی (کسانی که میخوان به کامیونیتی ما بپیوندن)
  let incomingReqs = [
    { id: 'ir1', uid: 'kz99',   name: 'KZplayer99', comm: 'Diablo IV', commColor: '#8b0000', commAbbr: 'D4', time: '۵ دقیقه پیش' },
    { id: 'ir2', uid: 'reza1',  name: 'RezaGamer',  comm: 'CS2 Persian', commColor: '#e67e22', commAbbr: 'CS', time: '۲۲ دقیقه پیش' },
    { id: 'ir3', uid: 'nader7', name: 'NaderX7',    comm: 'Diablo IV', commColor: '#8b0000', commAbbr: 'D4', time: '۱ ساعت پیش' },
  ];

  // درخواست‌های ارسالی (ما درخواست دادیم به کامیونیتی خصوصی)
  let outgoingReqs = [
    { id: 'or1', comm: 'PUBG Clan',   commColor: '#f39c12', commAbbr: 'PG',  desc: 'در انتظار تأیید ادمین', time: '۱ روز پیش' },
    { id: 'or2', comm: 'WoW Persia',  commColor: '#8e44ad', commAbbr: 'WoW', desc: 'در انتظار تأیید ادمین', time: '۳ روز پیش' },
  ];

  function updateReqBadge() {
    const badge = document.getElementById('comm-req-badge');
    const cnt   = document.getElementById('req-incoming-cnt');
    const n = incomingReqs.length;
    if (badge) { badge.textContent = n > 0 ? n : ''; badge.style.display = n > 0 ? '' : 'none'; }
    if (cnt)   cnt.textContent = n;
  }

  function renderRequests(tab) {
    const body = document.getElementById('comm-req-body');
    if (!body) return;
    body.innerHTML = '';

    if (tab === 'incoming') {
      if (!incomingReqs.length) {
        body.innerHTML = `<div class="req-empty"><span class="material-symbols-outlined">mark_email_read</span><span>درخواست دریافتی وجود ندارد</span></div>`;
        return;
      }
      incomingReqs.forEach(r => {
        const card = document.createElement('div');
        card.className = 'req-card';
        card.dataset.rid = r.id;
        card.innerHTML = `
          <img class="req-card__avatar" src="https://i.pravatar.cc/42?u=${r.uid}" alt="">
          <div class="req-card__info">
            <div class="req-card__name">${r.name}</div>
            <div class="req-card__meta">درخواست عضویت در <b>${r.comm}</b></div>
            <div class="req-card__time">${r.time}</div>
          </div>
          <div class="req-card__actions">
            <button class="req-card__accept" data-rid="${r.id}" data-action="accept">
              <span class="material-symbols-outlined">check</span>تأیید
            </button>
            <button class="req-card__decline" data-rid="${r.id}" data-action="decline">
              <span class="material-symbols-outlined">close</span>رد
            </button>
          </div>`;
        body.appendChild(card);
      });
    } else {
      if (!outgoingReqs.length) {
        body.innerHTML = `<div class="req-empty"><span class="material-symbols-outlined">outgoing_mail</span><span>درخواست ارسالی وجود ندارد</span></div>`;
        return;
      }
      outgoingReqs.forEach(r => {
        const card = document.createElement('div');
        card.className = 'req-card';
        card.dataset.rid = r.id;
        card.innerHTML = `
          <div class="req-card__comm-icon" style="background:${r.commColor}">${r.commAbbr}</div>
          <div class="req-card__info">
            <div class="req-card__name">${r.comm}</div>
            <div class="req-card__meta">${r.desc}</div>
            <div class="req-card__time">${r.time}</div>
          </div>
          <div class="req-card__actions">
            <button class="req-card__cancel" data-rid="${r.id}" data-action="cancel">
              <span class="material-symbols-outlined">cancel</span>لغو
            </button>
          </div>`;
        body.appendChild(card);
      });
    }
  }

  // Tab switching
  let activeReqTab = 'incoming';
  const reqOverlay  = document.getElementById('comm-req-overlay');
  const reqOpenBtn  = document.getElementById('comm-req-btn');
  const reqBackBtn  = document.getElementById('comm-req-back');
  const reqBody     = document.getElementById('comm-req-body');
  const reqTabBtns  = reqOverlay ? reqOverlay.querySelectorAll('.comm-req-tab') : [];

  function openReqOverlay() {
    if (!reqOverlay) return;
    // close search if open
    if (searchOverlay && !searchOverlay.hidden) searchOverlay.hidden = true;
    reqOverlay.hidden = false;
    renderRequests(activeReqTab);
  }
  function closeReqOverlay() {
    if (reqOverlay) reqOverlay.hidden = true;
  }

  if (reqOpenBtn) reqOpenBtn.addEventListener('click', openReqOverlay);
  if (reqBackBtn) reqBackBtn.addEventListener('click', closeReqOverlay);

  reqTabBtns.forEach(t => {
    t.addEventListener('click', () => {
      reqTabBtns.forEach(b => b.classList.remove('comm-req-tab--active'));
      t.classList.add('comm-req-tab--active');
      activeReqTab = t.dataset.rtab;
      renderRequests(activeReqTab);
    });
  });

  // Handle accept / decline / cancel
  if (reqBody) {
    reqBody.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const rid    = btn.dataset.rid;
      const action = btn.dataset.action;

      if (action === 'accept' || action === 'decline') {
        incomingReqs = incomingReqs.filter(r => r.id !== rid);
        updateReqBadge();
        renderRequests('incoming');
      } else if (action === 'cancel') {
        outgoingReqs = outgoingReqs.filter(r => r.id !== rid);
        // sync with joinState
        const comm = outgoingReqs.find(r => r.id === rid);
        renderRequests('outgoing');
      }
    });
  }

  updateReqBadge();

  // ── Posts sidebar: suggested users + feed tabs ──
  const suggestedUsers = [
    { id: 'su1', name: 'Shroud',        sub: 'FPS Pro',          avatar: 'https://i.pravatar.cc/40?u=shroud1' },
    { id: 'su2', name: 'Ninja',         sub: 'Fortnite Legend',  avatar: 'https://i.pravatar.cc/40?u=ninja2' },
    { id: 'su3', name: 'PokiGamer',     sub: 'Variety Streamer', avatar: 'https://i.pravatar.cc/40?u=poki3' },
    { id: 'su4', name: 'ScreaM',        sub: 'CS2 Ace King',     avatar: 'https://i.pravatar.cc/40?u=scream4' },
    { id: 'su5', name: 'MrxGameIR',     sub: 'ایرانی کریتور',   avatar: 'https://i.pravatar.cc/40?u=mrx5' },
  ];
  const followState = {};

  function renderSuggestedUsers() {
    const list = document.getElementById('posts-suggest-list');
    if (!list) return;
    list.innerHTML = suggestedUsers.map(u => {
      const isFollowing = !!followState[u.id];
      return `<div class="posts-suggest-item" data-uid="${u.id}">
        <img class="posts-suggest-item__avatar" src="${u.avatar}" alt="${u.name}">
        <div class="posts-suggest-item__info">
          <span class="posts-suggest-item__name">${u.name}</span>
          <span class="posts-suggest-item__sub">${u.sub}</span>
        </div>
        <button class="posts-suggest-follow-btn${isFollowing ? ' posts-suggest-follow-btn--following' : ''}" data-fuid="${u.id}">
          ${isFollowing ? 'دنبال می‌کنی' : 'دنبال کردن'}
        </button>
      </div>`;
    }).join('');
  }

  const suggestList = document.getElementById('posts-suggest-list');
  if (suggestList) {
    renderSuggestedUsers();
    suggestList.addEventListener('click', e => {
      const btn = e.target.closest('.posts-suggest-follow-btn');
      if (!btn) return;
      const uid = btn.dataset.fuid;
      followState[uid] = !followState[uid];
      renderSuggestedUsers();
    });
  }

  // Posts friends column tabs
  const pfTabBtns = document.querySelectorAll('.pf-tab[data-pftab]');
  const pfList    = document.querySelector('.pf-list');
  pfTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pfTabBtns.forEach(b => b.classList.remove('pf-tab--active'));
      btn.classList.add('pf-tab--active');
      const tab = btn.dataset.pftab;
      if (!pfList) return;
      pfList.querySelectorAll('.pf-friend').forEach(f => {
        const isOffline = f.classList.contains('pf-friend--offline');
        if (tab === 'online')  f.hidden = isOffline;
        else if (tab === 'all') f.hidden = false;
        else f.hidden = true; // pending — placeholder
      });
      pfList.querySelectorAll('.pf-section-label').forEach(l => {
        l.hidden = (tab === 'pending');
      });
    });
  });

  // Posts nav items — خانه / پروفایل / گشت‌وگذار
  const postsView = document.getElementById('comv-posts');
  if (postsView) {
    const feedHome    = document.getElementById('posts-feed-home');
    const feedProfile = document.getElementById('posts-feed-profile');
    const feedExplore = document.getElementById('posts-feed-explore');
    const feedLabel   = document.getElementById('posts-feed-label');

    const allFeeds = [feedHome, feedProfile, feedExplore].filter(Boolean);

    function showFeed(which, label) {
      allFeeds.forEach(f => { f.hidden = true; });
      if (which) which.hidden = false;
      if (feedLabel) feedLabel.textContent = label;
    }

    const navItems = postsView.querySelectorAll('.posts-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('posts-nav-item--active'));
        item.classList.add('posts-nav-item--active');
        const nav = item.dataset.pnav;
        if (nav === 'profile') {
          showFeed(feedProfile, 'صفحه شخصی');
        } else if (nav === 'explore') {
          showFeed(feedExplore, 'گشت‌وگذار');
        } else {
          showFeed(feedHome, 'خانه');
        }
      });
    });

    // تب‌های صفحه شخصی (پست / محتوا / فروشگاه)
    const profTabs = postsView.querySelectorAll('.prof-tab');
    const profPanes = postsView.querySelectorAll('.prof-tabpane');
    profTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        profTabs.forEach(t => t.classList.remove('prof-tab--active'));
        tab.classList.add('prof-tab--active');
        const target = tab.dataset.ptab;
        profPanes.forEach(p => { p.hidden = (p.dataset.ptabpane !== target); });
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initWindowControls();
  initSidebar();

  // دکمه‌های هدر
  document.getElementById('hdr-downloads-btn')?.addEventListener('click', () => showPage('downloads'));
  document.getElementById('hdr-connection-btn')?.addEventListener('click', () => {
    showPage('connection');
    // active state در سایدبار هم آپدیت شه
    document.querySelectorAll('#sidebar-nav .nav-item').forEach(i => i.classList.remove('nav-item--active'));
    document.querySelector('#sidebar-nav [data-route="connection"]')?.classList.add('nav-item--active');
  });

  // آواتار هدر → صفحه پروفایل
  // ورود با OTP، سپس اسپلش لودینگ
  initOtpLogin();

  document.getElementById('hdr-avatar-btn')?.addEventListener('click', () => showPage('profile'));

  initAvatarCropper();

  // همگام‌سازی همهٔ آواتارهای کاربر با عکس نهایی
  function applyUserAvatar(src) {
    document.querySelectorAll('#prof-avatar-img, #profile-avatar-img, .app-header__avatar img')
      .forEach((el) => { el.src = src; });
  }

  // آپلود عکس پروفایل (صفحهٔ شخصی شبکهٔ اجتماعی)
  const profAvatarBtn = document.getElementById('prof-avatar-upload-btn');
  const profAvatarInput = document.getElementById('prof-avatar-input');
  profAvatarBtn?.addEventListener('click', () => profAvatarInput?.click());
  profAvatarInput?.addEventListener('change', () => {
    const f = profAvatarInput.files[0];
    if (f) window.__openAvatarCropper(f, applyUserAvatar);
    profAvatarInput.value = '';
  });

  // آپلود عکس صفحهٔ پروفایل (از آواتار هدر)
  const profCardBtn = document.getElementById('profile-avatar-upload-btn');
  const profCardInput = document.getElementById('profile-avatar-input');
  profCardBtn?.addEventListener('click', () => profCardInput?.click());
  profCardInput?.addEventListener('change', () => {
    const f = profCardInput.files[0];
    if (f) window.__openAvatarCropper(f, applyUserAvatar);
    profCardInput.value = '';
  });

  initSetPassword();

  // خروج از حساب کاربری (دکمهٔ بالا-چپ صفحهٔ پروفایل)
  document.getElementById('profile-logout-btn')?.addEventListener('click', () => {
    if (confirm('از حساب کاربری خارج می‌شوید؟')) {
      window.location.reload();
    }
  });

  initFriendsPanel();
  initCommunityPage();
  initHeroThumbs();

  renderContinueGames();
  renderStreams();
  renderTournaments();
  renderMatchmaking();
  renderLeaderboard();

  initTabs('#tournament-tabs', (tab) => renderTournaments(tab));
  initTabs('#leaderboard-tabs', () => {/* mock: می‌تونه فیلتر کنه */});

  initConnectionPage();
  initSubscription();
  initTournaments();
  initGamesPage();
  initDownloadsPage();
  initProfilePage();
  initModals();
  initGameDetailPage();   // wires all static tiles
  // re-wire after dynamic content is in the DOM
  window._refreshGameClicks?.();
});
