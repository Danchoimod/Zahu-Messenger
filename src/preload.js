const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  getUsers: () => ipcRenderer.invoke('get-users'),
  getMessages: (userId) => ipcRenderer.invoke('get-messages', userId),
  sendMessage: (userId, message) => ipcRenderer.invoke('send-message', { userId, message }),
  loginSuccess: () => ipcRenderer.send('login-success'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  toggleMaximizeWindow: () => ipcRenderer.send('window-toggle-maximize'),
  openAbout: () => ipcRenderer.send('open-about'),
  openPreferences: () => ipcRenderer.send('open-preferences'),
  openChat: (user) => ipcRenderer.send('open-chat', user),
});


