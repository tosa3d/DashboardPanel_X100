/* ══════════════════════════════════════════
   x100 — Installer Wizard Logic
   ══════════════════════════════════════════ */

'use strict';

// ─── Utilities ────────────────────────────────────────────────────────────────

function toPersianNum(n) {
  return String(Math.round(n)).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

function $(id) { return document.getElementById(id); }

// ─── Step navigation ──────────────────────────────────────────────────────────

let currentStep = 1;

function goToStep(step) {
  // Update sidebar steps
  document.querySelectorAll('.sidebar__step').forEach((el) => {
    const s = parseInt(el.dataset.step, 10);
    el.classList.remove('sidebar__step--active', 'sidebar__step--done');
    const numEl = el.querySelector('.sidebar__step-num');

    if (s < step) {
      el.classList.add('sidebar__step--done');
      numEl.textContent = '✓';
    } else {
      numEl.textContent = toPersianNum(s);
      if (s === step) el.classList.add('sidebar__step--active');
    }
  });

  // Show/hide panels
  for (let i = 1; i <= 7; i++) {
    const p = $(`panel-${i}`);
    if (p) p.hidden = (i !== step);
  }

  // Step-specific on-enter hooks
  if (step === 6) {
    // فقط ری‌ست UI — کاربر خودش دکمه بررسی رو می‌زنه
    setTimeout(() => resetCheckBtn(), 100);
  }
  if (step === 7) {
    // Reset tabs to General
    document.querySelectorAll('.config-tab').forEach((t) => t.classList.remove('config-tab--active'));
    document.querySelector('.config-tab[data-tab="general"]').classList.add('config-tab--active');
    document.querySelectorAll('.config-panel').forEach((p) => p.hidden = true);
    $('tab-general').hidden = false;
  }

  currentStep = step;
}

// ─── Step 1 – OTP ─────────────────────────────────────────────────────────────

const phoneInput      = $('phone-input');
const sendOtpBtn      = $('send-otp-btn');
const otpPhoneStep    = $('otp-phone-step');
const otpCodeStep     = $('otp-code-step');
const otpPhoneDisplay = $('otp-phone-display');
const verifyOtpBtn    = $('verify-otp-btn');
const changePhoneBtn  = $('change-phone-btn');
const resendBtn       = $('resend-btn');
const otpTimerWrap    = $('otp-timer-wrap');
const otpCountdown    = $('otp-countdown');
const otpBoxes        = document.querySelectorAll('.otp-box');

let otpTimerId = null;

// Format phone number as user types (auto insert dashes for readability)
phoneInput.addEventListener('input', () => {
  // Only keep digits
  let val = phoneInput.value.replace(/\D/g, '').slice(0, 11);
  phoneInput.value = val;
  phoneInput.classList.remove('field__input--err');
});

sendOtpBtn.addEventListener('click', () => {
  const phone = phoneInput.value.trim();
  if (!/^09\d{9}$/.test(phone)) {
    phoneInput.classList.add('field__input--err');
    phoneInput.focus();
    return;
  }
  otpPhoneDisplay.textContent = phone;
  otpPhoneStep.hidden = true;
  otpCodeStep.hidden  = false;
  otpBoxes[0].focus();
  startOtpCountdown();
});

function startOtpCountdown() {
  let sec = 60;
  otpTimerWrap.hidden = false;
  resendBtn.hidden    = true;
  otpCountdown.textContent = toPersianNum(sec);

  if (otpTimerId) clearInterval(otpTimerId);
  otpTimerId = setInterval(() => {
    sec--;
    if (sec <= 0) {
      clearInterval(otpTimerId);
      otpTimerWrap.hidden = true;
      resendBtn.hidden    = false;
    } else {
      otpCountdown.textContent = toPersianNum(sec);
    }
  }, 1000);
}

// OTP box behaviour: auto-advance, backspace, paste
otpBoxes.forEach((box, i) => {
  box.addEventListener('input', (e) => {
    const digit = e.target.value.replace(/\D/g, '');
    e.target.value = digit.slice(-1); // only last digit
    if (digit) {
      box.classList.add('otp-box--filled');
      box.classList.remove('otp-box--err');
      if (i < otpBoxes.length - 1) otpBoxes[i + 1].focus();
    } else {
      box.classList.remove('otp-box--filled');
    }
  });

  box.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !box.value && i > 0) {
      otpBoxes[i - 1].value = '';
      otpBoxes[i - 1].classList.remove('otp-box--filled');
      otpBoxes[i - 1].focus();
    }
  });

  box.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData)
      .getData('text').replace(/\D/g, '').slice(0, 6);
    [...text].forEach((ch, idx) => {
      if (otpBoxes[idx]) {
        otpBoxes[idx].value = ch;
        otpBoxes[idx].classList.add('otp-box--filled');
      }
    });
    const nextFocus = Math.min(text.length, otpBoxes.length - 1);
    otpBoxes[nextFocus].focus();
  });
});

verifyOtpBtn.addEventListener('click', () => {
  const code = [...otpBoxes].map((b) => b.value).join('');
  if (code.length < 6) {
    // Shake all incomplete boxes
    otpBoxes.forEach((b) => {
      if (!b.value) {
        b.classList.add('otp-box--err');
        setTimeout(() => b.classList.remove('otp-box--err'), 400);
      }
    });
    otpBoxes.find((b) => !b.value)?.focus();
    return;
  }
  // Prototype: any 6-digit code works
  if (otpTimerId) clearInterval(otpTimerId);
  goToStep(2);
  $('username-input').focus();
});

changePhoneBtn.addEventListener('click', () => {
  if (otpTimerId) clearInterval(otpTimerId);
  otpBoxes.forEach((b) => { b.value = ''; b.classList.remove('otp-box--filled', 'otp-box--err'); });
  otpCodeStep.hidden  = true;
  otpPhoneStep.hidden = false;
  phoneInput.focus();
});

resendBtn.addEventListener('click', () => {
  otpBoxes.forEach((b) => { b.value = ''; b.classList.remove('otp-box--filled', 'otp-box--err'); });
  startOtpCountdown();
  otpBoxes[0].focus();
});

// ─── Step 2 – Username ────────────────────────────────────────────────────────

const usernameInput      = $('username-input');
const usernameStatusIcon = $('username-status-icon');
const ruleLength         = $('rule-length');
const ruleChars          = $('rule-chars');
const ruleAvailable      = $('rule-available');
const ruleAvailableText  = $('rule-available-text');
const nextFrom2          = $('next-from-2');
const backFrom2          = $('back-from-2');

// Simulated taken usernames
const TAKEN = ['admin', 'test', 'user', 'steam', 'gamer', 'bokhar', 'bokharpa', 'ehsan1'];

let checkTimer = null;

function setRule(el, state) {
  el.classList.remove('rule--ok', 'rule--fail');
  const icon = el.querySelector('.rule__icon');
  if (state === 'ok')   { el.classList.add('rule--ok');   icon.textContent = 'check_circle'; }
  else if (state === 'fail') { el.classList.add('rule--fail'); icon.textContent = 'cancel'; }
  else                  { icon.textContent = 'radio_button_unchecked'; }
}

function setStatusIcon(state) {
  usernameStatusIcon.className = 'field__status-icon material-icons-round';
  if (state === 'ok')     { usernameStatusIcon.classList.add('field__status-icon--ok');   usernameStatusIcon.textContent = 'check_circle'; }
  else if (state === 'fail') { usernameStatusIcon.classList.add('field__status-icon--fail'); usernameStatusIcon.textContent = 'cancel'; }
  else if (state === 'load') { usernameStatusIcon.classList.add('field__status-icon--load'); usernameStatusIcon.textContent = 'hourglass_top'; }
  else                    { usernameStatusIcon.textContent = ''; }
}

usernameInput.addEventListener('input', () => {
  const val = usernameInput.value.trim();
  const lenOk   = val.length >= 5;
  const charsOk = val.length > 0 && /^[a-zA-Z0-9_]+$/.test(val);

  setRule(ruleLength,    val.length === 0 ? 'idle' : lenOk   ? 'ok' : 'fail');
  setRule(ruleChars,     val.length === 0 ? 'idle' : charsOk ? 'ok' : 'fail');
  setRule(ruleAvailable, 'idle');
  ruleAvailableText.textContent = 'تکراری نباشد';
  setStatusIcon('');
  nextFrom2.disabled = true;

  if (lenOk && charsOk) {
    setStatusIcon('load');
    ruleAvailableText.textContent = 'در حال بررسی...';
    if (checkTimer) clearTimeout(checkTimer);
    checkTimer = setTimeout(() => {
      const taken = TAKEN.includes(val.toLowerCase());
      if (taken) {
        setRule(ruleAvailable, 'fail');
        ruleAvailableText.textContent = 'این نام کاربری قبلاً گرفته شده';
        setStatusIcon('fail');
        nextFrom2.disabled = true;
      } else {
        setRule(ruleAvailable, 'ok');
        ruleAvailableText.textContent = 'این نام کاربری در دسترس است ✓';
        setStatusIcon('ok');
        nextFrom2.disabled = false;
      }
    }, 850);
  }
});

nextFrom2.addEventListener('click', () => {
  if (!nextFrom2.disabled) goToStep(3);
});

backFrom2.addEventListener('click', () => goToStep(1));

// ─── Step 3 – Installation Setup ──────────────────────────────────────────────

const backFrom3  = $('back-from-3');
const installBtn = $('install-btn');
const cancelBtn  = $('cancel-btn');
const helpBtn    = $('help-btn');
const browseBtn  = $('browse-btn');
const installPath = $('install-path');

const MOCK_PATHS = [
  'C:\\Program Files\\BokharPaz',
  'D:\\Games\\BokharPaz',
  'D:\\BokharPaz',
  'E:\\Gaming\\BokharPaz',
];
const MOCK_FREE = ['۱۲۰ گیگابایت', '۴۵۰ گیگابایت', '۳۲۰ گیگابایت', '۱.۲ ترابایت'];
let browseIdx = 1; // start cycling from second path on click

backFrom3.addEventListener('click', () => goToStep(2));

cancelBtn.addEventListener('click', () => {
  if (window.confirm('آیا از لغو نصب اطمینان دارید؟')) {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;
                  font-family:var(--font,Vazirmatn,sans-serif);color:#666;font-size:14px;direction:rtl;">
        نصب لغو شد. این پنجره را ببندید.
      </div>`;
  }
});

helpBtn.addEventListener('click', () => {
  alert('صفحه راهنما (FAQ/Wiki) در نسخه نهایی باز می‌شود.\n\nدر این پروتوتایپ این دکمه شبیه‌سازی شده است.');
});

browseBtn.addEventListener('click', () => {
  installPath.value = MOCK_PATHS[browseIdx % MOCK_PATHS.length];
  $('disk-free').textContent = MOCK_FREE[browseIdx % MOCK_FREE.length];
  browseIdx++;
});

installBtn.addEventListener('click', () => {
  goToStep(4);
  startDownloadSimulation();
});

// ─── Step 4 – Download + Install Simulation ───────────────────────────────────

function startDownloadSimulation() {
  const TOTAL_MB  = 450;
  const TICK_MS   = 300;

  // Elements — Phase 1 (Download)
  const fill         = $('dl-fill');
  const pctEl        = $('dl-pct');
  const speedEl      = $('dl-speed');
  const sizeEl       = $('dl-size');
  const phase1Badge  = $('dl-phase1-badge');
  const phase1Icon   = $('dl-phase1-icon');

  // Elements — Phase 2 (Install)
  const phaseInstall = $('dl-phase-install');
  const installFill  = $('install-fill');
  const installPct   = $('install-pct');
  const installStatus= $('install-status');
  const phase2Badge  = $('dl-phase2-badge');
  const phase2Icon   = $('dl-phase2-icon');

  // Shared
  const statusText   = $('dl-status-text');
  const mainTitle    = $('dl-main-title');
  const dlLog        = $('dl-log');
  const doneArea     = $('dl-done-area');
  const launchBtn    = $('launch-btn');

  function addLog(text, cls) {
    const item = document.createElement('div');
    item.className = `dl-log__item dl-log__item--${cls}`;
    item.textContent = text;
    dlLog.appendChild(item);
    dlLog.scrollTop = dlLog.scrollHeight;
  }

  // ── Phase 1: Download ────────────────────────────────────────────────────────
  const dlDuration = 5 + Math.random() * 2;                // 5–7 ثانیه برای پروتوتایپ
  const dlSpeed    = parseFloat((TOTAL_MB / dlDuration).toFixed(1));
  const dlInc      = (TOTAL_MB / dlDuration) * (TICK_MS / 1000);
  let   dlMB       = 0;
  let   dlLogIdx   = 0;
  let   dlDone     = false;

  const DL_LOGS = [
    { at:  4, text: '✔ اتصال به سرور x100 برقرار شد',          cls: 'done'   },
    { at: 12, text: '▶ دریافت فایل‌های اصلی لانچر (core.pak)...',  cls: 'active' },
    { at: 25, text: '✔ فایل‌های اصلی دریافت شدند',                 cls: 'done'   },
    { at: 35, text: '▶ دریافت کتابخانه‌های گرافیکی (DirectX)...',  cls: 'active' },
    { at: 52, text: '✔ بسته‌های DirectX دریافت شدند',              cls: 'done'   },
    { at: 60, text: '▶ دریافت ماژول‌های شبکه و VPN...',            cls: 'active' },
    { at: 75, text: '✔ ماژول‌های شبکه دریافت شدند',                cls: 'done'   },
    { at: 85, text: '▶ دریافت بسته‌های زبان فارسی...',             cls: 'active' },
    { at: 97, text: '✔ دانلود تمام فایل‌ها کامل شد',              cls: 'done'   },
  ];

  const dlTimer = setInterval(() => {
    dlMB = Math.min(dlMB + dlInc, TOTAL_MB);
    const pct = (dlMB / TOTAL_MB) * 100;

    fill.style.width   = pct.toFixed(2) + '%';
    pctEl.textContent  = toPersianNum(pct) + '٪';
    speedEl.textContent = dlSpeed + ' MB/s';
    sizeEl.textContent  = dlMB.toFixed(0) + ' / ' + TOTAL_MB + ' MB';

    if      (pct < 25) statusText.textContent = 'در حال دریافت فایل‌های اصلی لانچر...';
    else if (pct < 55) statusText.textContent = 'در حال دریافت کتابخانه‌های گرافیکی...';
    else if (pct < 78) statusText.textContent = 'در حال دریافت ماژول‌های شبکه...';
    else               statusText.textContent = 'در حال اتمام دانلود...';

    while (dlLogIdx < DL_LOGS.length && pct >= DL_LOGS[dlLogIdx].at) {
      addLog(DL_LOGS[dlLogIdx].text, DL_LOGS[dlLogIdx].cls);
      dlLogIdx++;
    }

    if (dlMB >= TOTAL_MB && !dlDone) {
      dlDone = true;
      clearInterval(dlTimer);

      // Phase 1 → Done state
      fill.style.width    = '100%';
      pctEl.textContent   = '۱۰۰٪';
      speedEl.textContent = '—';
      phase1Badge.textContent = '✔ کامل شد';
      phase1Badge.className   = 'dl-phase__badge dl-phase__badge--done';
      phase1Icon.textContent  = 'check_circle';
      phase1Icon.style.color  = 'var(--green)';

      statusText.textContent = 'دانلود کامل شد — در حال شروع نصب لانچر...';
      addLog('─────────────────────────────────', 'active');

      // Phase 2 activation after short pause
      setTimeout(() => startInstallPhase(), 900);
    }
  }, TICK_MS);

  // ── Phase 2: Install ─────────────────────────────────────────────────────────
  function startInstallPhase() {
    // Activate install phase card
    phaseInstall.classList.remove('dl-phase--pending');
    phaseInstall.classList.add('dl-phase--active');
    phase2Badge.textContent = 'در حال نصب';
    phase2Badge.className   = 'dl-phase__badge dl-phase__badge--installing';
    phase2Icon.textContent  = 'settings';

    mainTitle.textContent  = 'در حال نصب لانچر';
    statusText.textContent = 'در حال استخراج و نصب فایل‌های لانچر...';

    const INSTALL_DUR = 3 + Math.random() * 2;              // 3–5 ثانیه برای پروتوتایپ
    const installInc  = 100 / (INSTALL_DUR / (TICK_MS / 1000));
    let   installVal  = 0;
    let   installLogIdx = 0;

    const INSTALL_LOGS = [
      { at:  6, text: '▶ استخراج فایل‌های لانچر به مسیر نصب...',  cls: 'active' },
      { at: 18, text: '✔ فایل‌های اصلی استخراج شدند',              cls: 'done'   },
      { at: 28, text: '▶ ثبت مسیرها در رجیستری ویندوز...',         cls: 'active' },
      { at: 40, text: '✔ تنظیمات سیستم اعمال شد',                  cls: 'done'   },
      { at: 52, text: '▶ نصب DirectX Components...',               cls: 'active' },
      { at: 65, text: '✔ کتابخانه‌های گرافیکی نصب شدند',          cls: 'done'   },
      { at: 74, text: '▶ پیکربندی ماژول تحریم‌شکن...',             cls: 'active' },
      { at: 83, text: '✔ ماژول شبکه پیکربندی شد',                  cls: 'done'   },
      { at: 89, text: '▶ ایجاد میانبر دسکتاپ و استارت منو...',    cls: 'active' },
      { at: 95, text: '✔ میانبرها ایجاد شدند',                     cls: 'done'   },
      { at: 98, text: '✔ راستی‌آزمایی یکپارچگی فایل‌ها',          cls: 'done'   },
    ];

    const INSTALL_STATUS = [
      [0,  'در حال استخراج فایل‌ها...'],
      [28, 'در حال ثبت در رجیستری...'],
      [50, 'در حال نصب کتابخانه‌ها...'],
      [74, 'در حال پیکربندی ماژول شبکه...'],
      [89, 'در حال ایجاد میانبرها...'],
      [96, 'در حال نهایی‌سازی...'],
    ];

    const installTimer = setInterval(() => {
      installVal = Math.min(installVal + installInc, 100);

      installFill.style.width  = installVal.toFixed(2) + '%';
      installPct.textContent   = toPersianNum(installVal) + '٪';

      // Update inline + header status
      for (let i = INSTALL_STATUS.length - 1; i >= 0; i--) {
        if (installVal >= INSTALL_STATUS[i][0]) {
          installStatus.textContent = INSTALL_STATUS[i][1];
          statusText.textContent    = INSTALL_STATUS[i][1];
          break;
        }
      }

      while (installLogIdx < INSTALL_LOGS.length && installVal >= INSTALL_LOGS[installLogIdx].at) {
        addLog(INSTALL_LOGS[installLogIdx].text, INSTALL_LOGS[installLogIdx].cls);
        installLogIdx++;
      }

      // Completed
      if (installVal >= 100) {
        clearInterval(installTimer);
        installFill.style.width = '100%';
        installPct.textContent  = '۱۰۰٪';

        phase2Badge.textContent = '✔ نصب شد';
        phase2Badge.className   = 'dl-phase__badge dl-phase__badge--done';
        phase2Icon.textContent  = 'check_circle';
        phase2Icon.style.color  = 'var(--green)';
        phaseInstall.classList.remove('dl-phase--active');

        mainTitle.textContent   = 'نصب کامل شد';
        statusText.textContent  = 'x100 با موفقیت روی سیستم شما نصب شد!';
        installStatus.textContent = 'نصب کامل شد ✔';

        setTimeout(() => {
          addLog('✔ نصب x100 با موفقیت به پایان رسید', 'done');
          doneArea.hidden = false;
        }, 600);
      }
    }, TICK_MS);
  }

  launchBtn.addEventListener('click', () => goToStep(5));
}

// ─── Step 5 – Onboarding ──────────────────────────────────────────────────────

$('next-from-5').addEventListener('click', () => goToStep(6));
// مرحله ۴ نصب تمام شده — بازگشت فقط view رو نشون می‌ده بدون re-run
$('back-from-5').addEventListener('click', () => {
  for (let i = 1; i <= 7; i++) {
    const p = $(`panel-${i}`);
    if (p) p.hidden = (i !== 4);
  }
  document.querySelectorAll('.sidebar__step').forEach((el) => {
    const s = parseInt(el.dataset.step, 10);
    el.classList.remove('sidebar__step--active', 'sidebar__step--done');
    const numEl = el.querySelector('.sidebar__step-num');
    if (s < 4) { el.classList.add('sidebar__step--done'); numEl.textContent = '✓'; }
    else if (s === 4) { el.classList.add('sidebar__step--active'); numEl.textContent = toPersianNum(4); }
    else { numEl.textContent = toPersianNum(s); }
  });
  currentStep = 4;
});

// ─── Step 6 – Steam Check & Install ───────────────────────────────────────────

let _scenario = 'a'; // پروتوتایپ: پیش‌فرض Steam نصب است

// ── ری‌ست دکمه بررسی به حالت اولیه ──
function resetCheckBtn() {
  const btn = $('check-steam-btn');
  btn.className = 'btn btn--check btn--full';
  btn.disabled  = false;
  $('check-btn-icon').className   = 'material-icons-round';
  $('check-btn-icon').textContent = 'search';
  $('check-btn-text').textContent = 'بررسی Steam';
  $('steam-card-meta').textContent = 'وضعیت: بررسی نشده';
  $('steam-card-badge').textContent = 'ناشناخته';
  $('steam-card-badge').className   = 'steam-card__badge steam-card__badge--unknown';
  $('steam-path-row').hidden         = true;
  $('steam-missing-actions').hidden  = true;
  $('connect-steam-btn').disabled    = true;
}

// ── اجرای بررسی Steam ──
function runSteamCheck() {
  const btn     = $('check-steam-btn');
  const btnIcon = $('check-btn-icon');
  const btnText = $('check-btn-text');

  // حالت در حال بررسی
  btn.disabled  = true;
  btn.className = 'btn btn--check btn--full btn--check--checking';
  btnIcon.className   = 'material-icons-round spin';
  btnIcon.textContent = 'refresh';
  btnText.textContent = 'در حال بررسی...';

  $('steam-missing-actions').hidden = true;
  $('steam-path-row').hidden        = true;
  $('connect-steam-btn').disabled   = true;

  // شبیه‌سازی بررسی ۱.۵ ثانیه‌ای
  setTimeout(() => {
    btn.disabled  = false;
    btnIcon.className = 'material-icons-round';

    if (_scenario === 'a') {
      // ✔ Steam پیدا شد
      btn.className           = 'btn btn--check btn--full btn--check--found';
      btnIcon.textContent     = 'check_circle';
      btnText.textContent     = 'Steam یافت شد ✓';
      $('steam-card-meta').textContent  = 'نسخه: Build 1715681 | آخرین به‌روزرسانی: اردیبهشت ۱۴۰۳';
      $('steam-card-badge').textContent = '✓ نصب شده';
      $('steam-card-badge').className   = 'steam-card__badge steam-card__badge--found';
      $('steam-path-val').textContent   = 'C:\\Program Files (x86)\\Steam';
      $('steam-path-row').hidden        = false;
      $('steam-missing-actions').hidden = true;
      $('connect-steam-btn').disabled   = false;

    } else {
      // ✗ Steam نصب نیست
      btn.className           = 'btn btn--check btn--full btn--check--missing';
      btnIcon.textContent     = 'close';
      btnText.textContent     = 'Steam یافت نشد';
      $('steam-card-meta').textContent  = 'Steam روی این سیستم نصب نیست';
      $('steam-card-badge').textContent = '✗ نصب نشده';
      $('steam-card-badge').className   = 'steam-card__badge steam-card__badge--missing';
      $('steam-path-row').hidden        = true;
      $('steam-missing-actions').hidden = false;
      $('connect-steam-btn').disabled   = true;
    }
  }, 1500);
}

$('check-steam-btn').addEventListener('click', runSteamCheck);

// ── باز کردن مودال نصب Steam ──
$('install-steam-btn').addEventListener('click', () => {
  // ری‌ست مودال
  $('modal-dl-fill').style.width  = '0%';
  $('modal-dl-pct').textContent   = '۰٪';
  $('modal-dl-speed').textContent = '— MB/s';
  $('modal-dl-size').textContent  = '0 / 3.2 MB';
  $('modal-dl-badge').textContent = 'در حال دانلود';
  $('modal-dl-badge').className   = 'dl-phase__badge dl-phase__badge--active';
  $('modal-done-area').hidden     = true;
  $('modal-status-text').textContent = 'در حال دانلود SteamSetup.exe از سرور x100...';

  $('steam-modal').hidden = false;
  startSteamModalDownload();
});

function startSteamModalDownload() {
  const TOTAL_MB = 3.2;
  const DL_DUR   = 1.5 + Math.random() * 1; // 1.5–2.5 ثانیه برای پروتوتایپ
  const SPEED    = parseFloat((TOTAL_MB / DL_DUR).toFixed(2));
  const TICK     = 300;
  const INC      = (TOTAL_MB / DL_DUR) * (TICK / 1000);
  let   dl       = 0;
  let   dlDone   = false;

  const dlTimer = setInterval(() => {
    dl = Math.min(dl + INC, TOTAL_MB);
    const pct = (dl / TOTAL_MB) * 100;

    $('modal-dl-fill').style.width  = pct.toFixed(2) + '%';
    $('modal-dl-pct').textContent   = toPersianNum(pct) + '٪';
    $('modal-dl-speed').textContent = SPEED + ' MB/s';
    $('modal-dl-size').textContent  = dl.toFixed(1) + ' / ' + TOTAL_MB + ' MB';

    if (dl >= TOTAL_MB && !dlDone) {
      dlDone = true;
      clearInterval(dlTimer);

      $('modal-dl-fill').style.width  = '100%';
      $('modal-dl-pct').textContent   = '۱۰۰٪';
      $('modal-dl-speed').textContent = '—';
      $('modal-dl-badge').textContent = '✔ کامل شد';
      $('modal-dl-badge').className   = 'dl-phase__badge dl-phase__badge--done';
      $('modal-status-text').textContent = 'دانلود کامل شد — ویزارد نصب Steam را اجرا کنید.';

      setTimeout(() => { $('modal-done-area').hidden = false; }, 400);
    }
  }, TICK);
}

// دکمه اجرای SteamSetup
document.addEventListener('click', (e) => {
  if (e.target.closest('#modal-run-btn')) {
    alert('SteamSetup.exe در حال اجرا است...\n\nویزارد نصب Steam باز می‌شود.\nپس از اتمام نصب، به x100 برگردید و دکمه "بررسی Steam" را بزنید.');
    $('steam-modal').hidden = true;
    // سناریو رو روی "found" می‌ذاریم (فرض: کاربر نصب کرد)
    _scenario = 'a';
    $('scenario-a-btn').classList.add('proto-btn--active');
    $('scenario-b-btn').classList.remove('proto-btn--active');
    resetCheckBtn();
  }
  if (e.target.closest('#modal-close-btn')) {
    $('steam-modal').hidden = true;
    resetCheckBtn();
  }
});

// تغییر سناریوی پروتوتایپ
window.setScenario = function (s) {
  _scenario = s;
  $('scenario-a-btn').classList.toggle('proto-btn--active', s === 'a');
  $('scenario-b-btn').classList.toggle('proto-btn--active', s === 'b');
  if (currentStep === 6) resetCheckBtn();
};

$('connect-steam-btn').addEventListener('click', () => goToStep(7));
$('back-from-6').addEventListener('click', () => goToStep(5));

// ─── Step 7 – Steam Account Connect ───────────────────────────────────────────

// Tab switching
document.querySelectorAll('.config-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.config-tab').forEach((t) => t.classList.remove('config-tab--active'));
    tab.classList.add('config-tab--active');
    document.querySelectorAll('.config-panel').forEach((p) => { p.hidden = true; });
    $(`tab-${tab.dataset.tab}`).hidden = false;
  });
});

// Auth method selection
document.querySelectorAll('.auth-method').forEach((method) => {
  method.addEventListener('click', () => {
    document.querySelectorAll('.auth-method').forEach((m) => {
      m.classList.remove('auth-method--selected');
      m.querySelector('.auth-method__check').textContent = '';
    });
    method.classList.add('auth-method--selected');
    method.querySelector('.auth-method__check').textContent = 'check_circle';

    const sel = method.dataset.method;
    document.querySelectorAll('.auth-detail').forEach((d) => { d.hidden = true; });
    $(`auth-detail-${sel}`).hidden = false;
  });
});

// Web Login — Authenticate button
$('authenticate-btn').addEventListener('click', () => {
  const btn    = $('authenticate-btn');
  const status = $('auth-web-status');
  btn.disabled = true;
  btn.innerHTML = '<span class="material-icons-round spin">refresh</span> در حال اتصال به Steam...';

  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="17" height="17"><path fill="currentColor" d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0z"/></svg> Authenticate with Steam`;
    status.hidden = false;
    status.className = 'auth-status auth-status--ok';
    status.innerHTML = '<span class="material-icons-round">check_circle</span> اکانت Steam با موفقیت متصل شد — Ehsan_Gaming';
  }, 2500);
});

// API Key submit
$('api-key-submit').addEventListener('click', () => {
  const key    = $('api-key-input').value.trim();
  const status = $('auth-api-status');
  status.hidden = false;
  if (key.length < 20) {
    status.className = 'auth-status auth-status--err';
    status.innerHTML = '<span class="material-icons-round">error</span> کلید API معتبر نیست — باید ۳۲ کاراکتر باشد';
  } else {
    status.className = 'auth-status auth-status--ok';
    status.innerHTML = '<span class="material-icons-round">check_circle</span> کلید API تایید شد — حساب متصل شد';
  }
});

// Navigation
$('back-from-7').addEventListener('click', () => goToStep(6));

$('skip-auth-btn').addEventListener('click', () => {
  alert('می‌توانید بعداً از تنظیمات x100 اکانت Steam خود را متصل کنید.');
});

$('finish-btn').addEventListener('click', () => {
  alert('🎮 x100 در حال راه‌اندازی است!\n\n(در نسخه واقعی لانچر اجرا می‌شود)');
});

// ─── Init ─────────────────────────────────────────────────────────────────────

goToStep(1);
phoneInput.focus();
