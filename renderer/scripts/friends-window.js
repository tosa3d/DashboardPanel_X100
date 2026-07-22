const friends = [
  { uid: 'arash', name: 'ArashGG', game: 'Diablo IV', status: 'online' },
  { uid: 'sara', name: 'SaraPlay', game: 'Dota 2', status: 'online' },
  { uid: 'nightwolf', name: 'NightWolf_IR', game: 'آنلاین', status: 'online' },
  { uid: 'milad', name: 'MiladPro', game: '۲ ساعت پیش', status: 'offline' },
  { uid: 'ghost', name: 'GhostSniper', game: 'دیروز', status: 'offline' },
  { uid: 'zirak', name: 'Zirak90', game: '۳ روز پیش', status: 'offline' },
];

const list = document.getElementById('friend-list');
let filter = 'online';
function render() {
  const query = document.getElementById('friend-search').value.trim().toLowerCase();
  list.innerHTML = '';
  friends.filter(friend => (filter === 'all' || friend.status === filter) && friend.name.toLowerCase().includes(query)).forEach(friend => {
    const row = document.createElement('button');
    row.className = 'friend-row';
    row.innerHTML = `<span class="avatar-wrap"><img src="https://i.pravatar.cc/48?u=${friend.uid}" alt=""><i class="${friend.status}"></i></span><span><strong>${friend.name}</strong><small>${friend.game}</small></span><span class="material-symbols-outlined chat-icon">chat</span>`;
    row.addEventListener('click', () => window.windowAPI.openChat(friend));
    list.appendChild(row);
  });
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('[data-filter].active')?.classList.remove('active');
  button.classList.add('active');
  filter = button.dataset.filter;
  render();
}));
document.getElementById('friend-search').addEventListener('input', render);
document.querySelector('[data-minimize]').addEventListener('click', () => window.windowAPI.minimizeFloating());
document.querySelector('[data-close]').addEventListener('click', () => window.windowAPI.closeFloating());
render();