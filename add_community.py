with open(r'C:\Ehsan\Shekan Luncher\App\renderer\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

community_page = """

<!-- PAGE: COMMUNITY -->
<div class="page" data-page="community">
  <div class="comm-page">

    <div class="comm-tabbar">
      <button class="comm-tab comm-tab--active" data-ctab="akhabar">
        <span class="material-symbols-outlined">newspaper</span>اخبار
      </button>
      <button class="comm-tab" data-ctab="posts">
        <span class="material-symbols-outlined">feed</span>پست‌ها
      </button>
      <button class="comm-tab" data-ctab="community">
        <span class="material-symbols-outlined">groups</span>کامیونیتی
      </button>
    </div>

    <div class="comm-view" id="comv-akhabar">
      <div class="comm-feed scrollbar-thin">
        <div class="feed-item">
          <div class="feed-item__header feed-item__header--news">
            <span class="feed-tag feed-tag--event">ایونت</span><span class="feed-time">2 ساعت پیش</span>
          </div>
          <div class="feed-title">🎉 رویداد تابستانه x100 آغاز شد!</div>
          <div class="feed-body">از امروز تا پایان تابستان بازی‌های منتخب تخفیف 30 درصد دارن. وارد شو و بازی کن!</div>
          <div class="feed-actions">
            <button class="feed-btn feed-btn--like" data-id="cn1"><span class="material-symbols-outlined">thumb_up</span><span>125</span></button>
            <button class="feed-btn feed-btn--dislike" data-id="cn1"><span class="material-symbols-outlined">thumb_down</span><span>4</span></button>
            <button class="feed-btn feed-btn--cmt" data-target="ccmt-n1"><span class="material-symbols-outlined">chat</span><span>18 کامنت</span></button>
          </div>
          <div class="feed-comments" id="ccmt-n1" hidden>
            <div class="feed-comment"><img src="https://i.pravatar.cc/24?u=31" alt=""><div><b>ArashGG</b><p>عالیه! 🙌</p></div></div>
            <div class="feed-cmt-input"><input type="text" placeholder="کامنت بذار..."><button><span class="material-symbols-outlined">send</span></button></div>
          </div>
        </div>
        <div class="feed-item">
          <div class="feed-item__header feed-item__header--news">
            <span class="feed-tag feed-tag--update">آپدیت بازی</span><span class="feed-time">دیروز</span>
          </div>
          <div class="feed-title">🎮 Diablo IV — پچ 2.1.0 منتشر شد</div>
          <div class="feed-body">باگ‌های مهم سیزن رفع شدن. باس جدید اضافه شده. بالانس کلاس‌ها تغییر کرده.</div>
          <div class="feed-actions">
            <button class="feed-btn feed-btn--like" data-id="cn2"><span class="material-symbols-outlined">thumb_up</span><span>89</span></button>
            <button class="feed-btn feed-btn--dislike" data-id="cn2"><span class="material-symbols-outlined">thumb_down</span><span>2</span></button>
            <button class="feed-btn feed-btn--cmt" data-target="ccmt-n2"><span class="material-symbols-outlined">chat</span><span>12 کامنت</span></button>
          </div>
          <div class="feed-comments" id="ccmt-n2" hidden>
            <div class="feed-comment"><img src="https://i.pravatar.cc/24?u=33" alt=""><div><b>NightWolf</b><p>بالاخره! 😅</p></div></div>
            <div class="feed-cmt-input"><input type="text" placeholder="کامنت بذار..."><button><span class="material-symbols-outlined">send</span></button></div>
          </div>
        </div>
        <div class="feed-item">
          <div class="feed-item__header feed-item__header--news">
            <span class="feed-tag feed-tag--newgame">بازی جدید</span><span class="feed-time">3 روز پیش</span>
          </div>
          <div class="feed-title">🆕 CS2 به لانچر x100 اضافه شد!</div>
          <div class="feed-body">CS2 رسماً در کاتالوگ x100 اضافه شده. حالا مستقیم از لانچر باز کن.</div>
          <div class="feed-actions">
            <button class="feed-btn feed-btn--like" data-id="cn3"><span class="material-symbols-outlined">thumb_up</span><span>203</span></button>
            <button class="feed-btn feed-btn--dislike" data-id="cn3"><span class="material-symbols-outlined">thumb_down</span><span>8</span></button>
            <button class="feed-btn feed-btn--cmt" data-target="ccmt-n3"><span class="material-symbols-outlined">chat</span><span>31 کامنت</span></button>
          </div>
          <div class="feed-comments" id="ccmt-n3" hidden>
            <div class="feed-comment"><img src="https://i.pravatar.cc/24?u=34" alt=""><div><b>GhostSniper</b><p>دقیقاً همینو میخواستم! 💯</p></div></div>
            <div class="feed-cmt-input"><input type="text" placeholder="کامنت بذار..."><button><span class="material-symbols-outlined">send</span></button></div>
          </div>
        </div>
      </div>
    </div>

    <div class="comm-view" id="comv-posts" hidden>
      <div class="comm-feed scrollbar-thin">
        <div class="feed-item">
          <div class="feed-item__header">
            <div class="feed-avatar-wrap"><img class="feed-avatar" src="https://i.pravatar.cc/40?u=ehsan99" alt=""><span class="feed-badge feed-badge--creator">کریتور</span></div>
            <div class="feed-meta"><span class="feed-author">احسان <span class="feed-verify">✓</span></span><span class="feed-time">1 ساعت پیش</span></div>
            <span class="feed-tag feed-tag--stream">استریم</span>
          </div>
          <div class="feed-body">فردا ساعت 8 شب استریم Diablo IV دارم! 🔴</div>
          <div class="feed-image">
            <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=260&fit=crop" alt="استریم">
            <div class="feed-image__badge"><span class="material-symbols-outlined">live_tv</span> LIVE فردا 8 شب</div>
          </div>
          <div class="feed-actions">
            <button class="feed-btn feed-btn--like" data-id="cp1"><span class="material-symbols-outlined">thumb_up</span><span>56</span></button>
            <button class="feed-btn feed-btn--dislike" data-id="cp1"><span class="material-symbols-outlined">thumb_down</span><span>0</span></button>
            <button class="feed-btn feed-btn--cmt" data-target="ccmt-p1"><span class="material-symbols-outlined">chat</span><span>7 کامنت</span></button>
          </div>
          <div class="feed-comments" id="ccmt-p1" hidden>
            <div class="feed-comment"><img src="https://i.pravatar.cc/24?u=41" alt=""><div><b>ArashGG</b><p>حتماً میام! 👾</p></div></div>
            <div class="feed-cmt-input"><input type="text" placeholder="کامنت بذار..."><button><span class="material-symbols-outlined">send</span></button></div>
          </div>
        </div>
        <div class="feed-item">
          <div class="feed-item__header">
            <div class="feed-avatar-wrap"><img class="feed-avatar" src="https://i.pravatar.cc/40?u=ghost51" alt=""><span class="feed-badge feed-badge--creator">کریتور</span></div>
            <div class="feed-meta"><span class="feed-author">GhostSniper</span><span class="feed-time">3 ساعت پیش</span></div>
            <span class="feed-tag feed-tag--clip">کلیپ</span>
          </div>
          <div class="feed-body">وقتی 5 ساعت grind می‌کنی یه legendary بیفته و trash باشه 💀😭</div>
          <div class="feed-video">
            <div class="feed-video__thumb">
              <img src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=300&fit=crop" alt="کلیپ">
              <div class="feed-video__overlay"><div class="feed-video__play-btn"><span class="material-symbols-outlined">play_arrow</span></div><div class="feed-video__duration">0:14</div></div>
            </div>
            <video class="feed-video__player" hidden controls playsinline preload="none">
              <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4">
            </video>
          </div>
          <div class="feed-actions">
            <button class="feed-btn feed-btn--like" data-id="cp2"><span class="material-symbols-outlined">thumb_up</span><span>148</span></button>
            <button class="feed-btn feed-btn--dislike" data-id="cp2"><span class="material-symbols-outlined">thumb_down</span><span>3</span></button>
            <button class="feed-btn feed-btn--cmt" data-target="ccmt-p2"><span class="material-symbols-outlined">chat</span><span>24 کامنت</span></button>
          </div>
          <div class="feed-comments" id="ccmt-p2" hidden>
            <div class="feed-comment"><img src="https://i.pravatar.cc/24?u=52" alt=""><div><b>MiladPro</b><p>😂 دقیقاً</p></div></div>
            <div class="feed-cmt-input"><input type="text" placeholder="کامنت بذار..."><button><span class="material-symbols-outlined">send</span></button></div>
          </div>
        </div>
        <div class="feed-item">
          <div class="feed-item__header">
            <div class="feed-avatar-wrap"><img class="feed-avatar" src="https://i.pravatar.cc/40?u=sara77" alt=""><span class="feed-badge feed-badge--creator">کریتور</span></div>
            <div class="feed-meta"><span class="feed-author">SaraPlay <span class="feed-verify">✓</span></span><span class="feed-time">6 ساعت پیش</span></div>
            <span class="feed-tag feed-tag--newgame">اسکرین‌شات</span>
          </div>
          <div class="feed-body">بالاخره به Ancient رسیدم تو Dota 2! 🎉 💜</div>
          <div class="feed-image"><img src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&h=280&fit=crop" alt="Dota 2"></div>
          <div class="feed-actions">
            <button class="feed-btn feed-btn--like" data-id="cp3"><span class="material-symbols-outlined">thumb_up</span><span>342</span></button>
            <button class="feed-btn feed-btn--dislike" data-id="cp3"><span class="material-symbols-outlined">thumb_down</span><span>0</span></button>
            <button class="feed-btn feed-btn--cmt" data-target="ccmt-p3"><span class="material-symbols-outlined">chat</span><span>51 کامنت</span></button>
          </div>
          <div class="feed-comments" id="ccmt-p3" hidden>
            <div class="feed-comment"><img src="https://i.pravatar.cc/24?u=62" alt=""><div><b>ArashGG</b><p>🎊 تبریک!</p></div></div>
            <div class="feed-cmt-input"><input type="text" placeholder="کامنت بذار..."><button><span class="material-symbols-outlined">send</span></button></div>
          </div>
        </div>
      </div>
    </div>

    <div class="comm-view comm-view--discord" id="comv-community" hidden>
      <div class="dsc-servers">
        <button class="dsc-server dsc-server--active" data-server="diablo" title="Diablo IV">D4</button>
        <button class="dsc-server" data-server="dota" title="Dota 2">DT</button>
        <button class="dsc-server" data-server="cs" title="CS2">CS</button>
        <button class="dsc-server" data-server="pubg" title="PUBG">PG</button>
        <button class="dsc-server" data-server="lol" title="LoL">LoL</button>
        <div class="dsc-server-sep"></div>
        <button class="dsc-server dsc-server--add" title="بیشتر"><span class="material-symbols-outlined">add</span></button>
      </div>
      <div class="dsc-channels">
        <div class="dsc-channels__head"><span class="dsc-game-name" id="comm-game-name">Diablo IV</span></div>
        <div class="dsc-online"><span class="dsc-online__dot"></span><span>243 نفر آنلاین</span></div>
        <div class="dsc-cat-label">کانال‌های متنی</div>
        <button class="dsc-ch dsc-ch--active" data-ch="crules"><span class="material-symbols-outlined">gavel</span>قوانین</button>
        <button class="dsc-ch" data-ch="cnews"><span class="material-symbols-outlined">campaign</span>تازه‌ها</button>
        <button class="dsc-ch" data-ch="ctutorial"><span class="material-symbols-outlined">school</span>آموزش</button>
        <button class="dsc-ch" data-ch="cfreechat"><span class="material-symbols-outlined">chat_bubble</span>چت روم آزاد</button>
        <button class="dsc-ch" data-ch="cfindplayer"><span class="material-symbols-outlined">person_search</span>پیدا کردن پلیر</button>
        <div class="dsc-cat-label" style="margin-top:8px">ویس چت</div>
        <button class="dsc-ch dsc-ch--voice" data-ch="cv2"><span class="material-symbols-outlined">volume_up</span><span class="dsc-ch__name">اتاق 2 نفره</span><span class="dsc-voice-cnt">0/2</span></button>
        <button class="dsc-ch dsc-ch--voice" data-ch="cv5a"><span class="material-symbols-outlined">volume_up</span><span class="dsc-ch__name">اتاق 5 نفره - 1</span><span class="dsc-voice-cnt dsc-voice-cnt--used">3/5</span></button>
        <button class="dsc-ch dsc-ch--voice" data-ch="cv20"><span class="material-symbols-outlined">volume_up</span><span class="dsc-ch__name">اتاق 20 نفره</span><span class="dsc-voice-cnt dsc-voice-cnt--used">7/20</span></button>
      </div>
      <div class="dsc-content">
        <div class="dsc-panel" id="comm-rules"><div class="dsc-panel__head"><span class="material-symbols-outlined">gavel</span>قوانین</div><div class="dsc-panel__body scrollbar-thin"><h3>قوانین جامعه x100</h3><ol><li>احترام الزامی است.</li><li>تبلیغات ممنوع است.</li><li>چیت = بن دائمی.</li></ol></div></div>
        <div class="dsc-panel" id="comm-news" hidden><div class="dsc-panel__head"><span class="material-symbols-outlined">campaign</span>تازه‌ها</div><div class="dsc-panel__body scrollbar-thin"><div class="news-card"><div class="news-card__meta"><span class="news-card__tag">بازی</span><span class="news-card__date">18 خرداد</span></div><div class="news-card__title">سیزن 8 Diablo IV 🔥</div></div></div></div>
        <div class="dsc-panel dsc-panel--tut" id="comm-tutorial" hidden><div class="dsc-panel__head"><span class="material-symbols-outlined">school</span>آموزش</div><div class="dsc-tut-wrap"><div class="dsc-tut-nav"><button class="tut-nav-item tut-nav-item--active" data-tut="ci">نصب</button><button class="tut-nav-item" data-tut="cn">شبکه</button></div><div class="dsc-tut-content scrollbar-thin"><div class="tut-page" id="tut-ci">نصب x100 — فایل را دانلود کنید.</div><div class="tut-page" id="tut-cn" hidden>تنظیمات شبکه — سرویس مناسب را انتخاب کنید.</div></div></div></div>
        <div class="dsc-panel dsc-panel--chat" id="comm-freechat" hidden><div class="dsc-panel__head"><span class="material-symbols-outlined">chat_bubble</span>چت روم آزاد</div><div class="dsc-messages scrollbar-thin" id="comm-chat-messages"><div class="chat-msg"><img class="chat-msg__avatar" src="https://i.pravatar.cc/32?u=1" alt=""><div class="chat-msg__body"><span class="chat-msg__name">ArashGG</span><p class="chat-msg__text">کسی Diablo بازی می‌کنه؟ 🔥</p></div></div></div><div class="dsc-input-row"><input class="dsc-input" id="comm-chat-input" type="text" placeholder="پیام بنویس..."><button class="dsc-send-btn" id="comm-chat-send"><span class="material-symbols-outlined">send</span></button></div></div>
        <div class="dsc-panel dsc-panel--chat" id="comm-findplayer" hidden><div class="dsc-panel__head"><span class="material-symbols-outlined">person_search</span>پیدا کردن پلیر</div><div class="dsc-messages scrollbar-thin"><div class="chat-msg"><img class="chat-msg__avatar" src="https://i.pravatar.cc/32?u=10" alt=""><div class="chat-msg__body"><span class="chat-msg__name">ProGamer_Ali</span><p class="chat-msg__text">دنبال پلیر ranked هستم 🎮</p></div></div></div><div class="dsc-input-row"><input class="dsc-input" type="text" placeholder="دنبال چه پلیری؟"><button class="dsc-send-btn"><span class="material-symbols-outlined">send</span></button></div></div>
        <div class="dsc-panel" id="comm-voice" hidden><div class="dsc-panel__head"><span class="material-symbols-outlined">volume_up</span><span id="comm-voice-title">ویس چت</span></div><div class="dsc-panel__body"><div class="voice-card"><div class="voice-card__icon"><span class="material-symbols-outlined">headset_mic</span></div><div class="voice-card__info"><div class="voice-card__name" id="comm-voice-name">اتاق</div><div class="voice-card__cap" id="comm-voice-cap">0 نفر</div></div><button class="btn btn--primary">ورود</button></div><div class="voice-users" id="comm-voice-users"></div></div></div>
      </div>
    </div>

  </div>
</div>
"""

content = content.replace('\n</main>', community_page + '\n</main>')

with open(r'C:\Ehsan\Shekan Luncher\App\renderer\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

lines = content.split('\n')
hits = [(i+1, l) for i,l in enumerate(lines) if any(x in l for x in ['data-page="community"','comv-akhabar','comm-tabbar','comm-view--discord'])]
for ln, l in hits[:15]:
    print(f'{ln}: {l.strip()[:80]}')
