const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('windowAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
  close: () => ipcRenderer.send('window:close'),
  onMaximizeChange: (callback) => {
    ipcRenderer.on('window:maximized', (_e, isMax) => callback(isMax));
  },
});
