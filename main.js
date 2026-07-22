const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let friendsWindow;
const chatWindows = new Map();

function floatingWindowOptions(width, height) {
  return {
    width,
    height,
    minWidth: 300,
    minHeight: 360,
    frame: false,
    backgroundColor: '#111115',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  };
}

function openFriendsWindow() {
  if (friendsWindow && !friendsWindow.isDestroyed()) {
    friendsWindow.show();
    friendsWindow.focus();
    return;
  }
  friendsWindow = new BrowserWindow(floatingWindowOptions(330, 620));
  friendsWindow.loadFile(path.join(__dirname, 'renderer', 'friends.html'));
  friendsWindow.once('ready-to-show', () => friendsWindow.show());
  friendsWindow.on('closed', () => { friendsWindow = null; });
}

function openChatWindow(friend) {
  if (!friend?.uid) return;
  const existing = chatWindows.get(friend.uid);
  if (existing && !existing.isDestroyed()) {
    existing.show();
    existing.focus();
    return;
  }
  const chatWindow = new BrowserWindow(floatingWindowOptions(430, 560));
  chatWindows.set(friend.uid, chatWindow);
  chatWindow.loadFile(path.join(__dirname, 'renderer', 'chat.html'), {
    query: {
      uid: String(friend.uid),
      name: String(friend.name || friend.uid),
      status: String(friend.status || 'offline'),
      game: String(friend.game || ''),
    },
  });
  chatWindow.once('ready-to-show', () => chatWindow.show());
  chatWindow.on('closed', () => chatWindows.delete(friend.uid));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#131316',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('maximize', () => mainWindow.webContents.send('window:maximized', true));
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window:maximized', false));
}

ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:toggle-maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on('window:close', () => mainWindow?.close());
ipcMain.on('friends:open', openFriendsWindow);
ipcMain.on('chat:open', (_event, friend) => openChatWindow(friend));
ipcMain.on('floating:minimize', (event) => BrowserWindow.fromWebContents(event.sender)?.minimize());
ipcMain.on('floating:close', (event) => BrowserWindow.fromWebContents(event.sender)?.close());

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
