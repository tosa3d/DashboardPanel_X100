const params = new URLSearchParams(location.search);
const uid = params.get('uid') || 'friend';
const name = params.get('name') || uid;
const histories = {
  arash: [['them', 'سلام! دیشب بازی کردی؟'], ['me', 'نه، بیرون بودم متأسفانه'], ['them', 'سیزن جدید شروع شده خیلی باحاله']],
  sara: [['them', 'تورنومنت این آخر هفته میای؟'], ['me', 'آره قطعاً! ساعت چنده؟'], ['them', 'ساعت ۸ شب']],
};
document.getElementById('chat-name').textContent = name;
document.getElementById('chat-status').textContent = params.get('status') === 'online' ? 'آنلاین' : (params.get('game') || 'آفلاین');
document.getElementById('chat-avatar').src = `https://i.pravatar.cc/48?u=${uid}`;
document.title = `چت با ${name}`;
const messages = document.getElementById('chat-messages');
function addMessage(from, text) {
  const message = document.createElement('div');
  message.className = `native-message ${from === 'me' ? 'me' : ''}`;
  message.textContent = text;
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}
(histories[uid] || []).forEach(([from, text]) => addMessage(from, text));
function send() {
  const input = document.getElementById('chat-input');
  if (!input.value.trim()) return;
  addMessage('me', input.value.trim());
  input.value = '';
}
document.getElementById('chat-send').addEventListener('click', send);
document.getElementById('chat-input').addEventListener('keydown', event => { if (event.key === 'Enter') send(); });
document.querySelector('[data-minimize]').addEventListener('click', () => window.windowAPI.minimizeFloating());
document.querySelector('[data-close]').addEventListener('click', () => window.windowAPI.closeFloating());