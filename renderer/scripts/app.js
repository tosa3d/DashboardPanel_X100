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
  // بقیه فعلاً به placeholder میرن
  shop: 'placeholder',
  tournaments: 'placeholder',
  streaming: 'placeholder',
  community: 'community',
  downloads: 'downloads',
  profile: 'profile',
  settings: 'placeholder',
};

function showPage(pageName) {
  const target = ROUTES[pageName] || 'placeholder';
  $$('.page').forEach((p) => p.classList.remove('page--active'));
  const page = $(`.page[data-page="${target}"]`);
  if (page) page.classList.add('page--active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
      showPage(route);
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
function initHeroThumbs() {
  const thumbs = $$('#hero-thumbs .hero-thumb');
  const heroBgImg  = document.getElementById('hero-bg-img');
  const heroTitle  = document.getElementById('hero-title');
  const heroSub    = document.getElementById('hero-subtitle');
  const heroDesc   = document.getElementById('hero-desc');

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

  // Navigate
  $$('.page').forEach((p) => p.classList.remove('page--active'));
  const page = $(`.page[data-page="game-detail"]`);
  if (page) page.classList.add('page--active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
    $$('.page').forEach((p) => p.classList.remove('page--active'));
    const prev = $(`.page[data-page="${_prevPage}"]`);
    if (prev) prev.classList.add('page--active');
  });

  // Wire clicks on EVERY game tile / game card / game poster
  function addGameClickListeners() {
    ['.game-tile', '.game-card', '.game-poster', '.match-card'].forEach((sel) => {
      $$(sel).forEach((el) => {
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

  saveBtn.addEventListener('click', () => {
    const nickname = nicknameInput.value.trim();

    // Require non-empty value
    if (!nickname) {
      nicknameInput.focus();
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
  document.getElementById('hdr-avatar-btn')?.addEventListener('click', () => showPage('profile'));
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
  initGamesPage();
  initDownloadsPage();
  initProfilePage();
  initModals();
  initGameDetailPage();   // wires all static tiles
  // re-wire after dynamic content is in the DOM
  window._refreshGameClicks?.();
});
