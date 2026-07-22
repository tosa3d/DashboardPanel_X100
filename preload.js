const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('windowAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
  close: () => ipcRenderer.send('window:close'),
  openFriends: () => ipcRenderer.send('friends:open'),
  openChat: (friend) => ipcRenderer.send('chat:open', friend),
  minimizeFloating: () => ipcRenderer.send('floating:minimize'),
  closeFloating: () => ipcRenderer.send('floating:close'),
  onMaximizeChange: (callback) => {
    ipcRenderer.on('window:maximized', (_e, isMax) => callback(isMax));
  },
});
