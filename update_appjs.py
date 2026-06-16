with open(r'C:\Ehsan\Shekan Luncher\App\renderer\scripts\app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix ROUTES community
content = content.replace("  community: 'placeholder',", "  community: 'community',")

# 2. Find the full initChatPanel function and replace it
import re

# Find start and end of initChatPanel
start_marker = "// Chat Panel — Discord-style\n// ============================================\nfunction initChatPanel() {"
# Find the closing brace of initChatPanel - it ends before "document.addEventListener('DOMContentLoaded'"
end_marker = "\ndocument.addEventListener('DOMContentLoaded'"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx == -1:
    print("ERROR: Could not find initChatPanel start")
    exit(1)
if end_idx == -1:
    print("ERROR: Could not find DOMContentLoaded")
    exit(1)

old_block = content[start_idx:end_idx]

new_functions = r"""// Friends Panel
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
  const commViewMap = { akhabar: 'comv-akhabar', posts: 'comv-posts', community: 'comv-community' };

  function switchCommTab(tabId) {
    commTabs.forEach(t => t.classList.remove('comm-tab--active'));
    const t = [...commTabs].find(t => t.dataset.ctab === tabId);
    if (t) t.classList.add('comm-tab--active');
    page.querySelectorAll('.comm-view').forEach(v => { v.hidden = true; });
    const view = document.getElementById(commViewMap[tabId]);
    if (view) view.hidden = false;
    if (tabId === 'community') {
      const firstServer = page.querySelector('.dsc-server:not(.dsc-server--add)');
      if (firstServer && !firstServer.classList.contains('dsc-server--active')) firstServer.click();
      else switchChannel('crules');
    }
  }
  commTabs.forEach(t => t.addEventListener('click', () => switchCommTab(t.dataset.ctab)));

  // ── Voice meta ──
  const voiceMeta = {
    cv2:  { name: 'اتاق ۲ نفره',     cap: '۰ از ۲ نفر',   users: [] },
    cv5a: { name: 'اتاق ۵ نفره • ۱', cap: '۳ از ۵ نفر',   users: ['ArashGG','SaraPlay','NightWolf'] },
    cv20: { name: 'اتاق ۲۰ نفره',    cap: '۷ از ۲۰ نفر',  users: ['ProGamer_Ali','Zirak90','GhostSniper','MiladPro','ArashGG','SaraPlay','NightWolf'] },
  };

  const chPanelMap = {
    crules:      'comm-rules',
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
  const serverBtns = page.querySelectorAll('.dsc-server');
  serverBtns.forEach(s => {
    s.addEventListener('click', () => {
      serverBtns.forEach(b => b.classList.remove('dsc-server--active'));
      s.classList.add('dsc-server--active');
      const nameEl = document.getElementById('comm-game-name');
      if (nameEl && s.title) nameEl.textContent = s.title;
      switchChannel('crules');
    });
  });

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
}
"""

content = content[:start_idx] + new_functions + content[end_idx:]

# 3. Update DOMContentLoaded to call new functions
content = content.replace('  initChatPanel();', '  initFriendsPanel();\n  initCommunityPage();')

with open(r'C:\Ehsan\Shekan Luncher\App\renderer\scripts\app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
# Verify
import subprocess
result = subprocess.run(['python', '-c',
    "import re; c=open(r'C:\\Ehsan\\Shekan Luncher\\App\\renderer\\scripts\\app.js',encoding='utf-8').read();"
    "print('community: community' in c);"
    "print('initFriendsPanel' in c);"
    "print('initCommunityPage' in c);"
    "print('initChatPanel' in c);"
    "print('initFriendsPanel()' in c and 'initCommunityPage()' in c)"
], capture_output=True, text=True)
print(result.stdout)
print(result.stderr)
