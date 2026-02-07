const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

// Create the browser window
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 800,
    resizable: false,
    frame: false, // Disable default title bar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'login.html'));

  // Open DevTools in development (comment out for production)
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// App event listeners
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for messenger functionality
ipcMain.handle('get-users', async () => {
  // Mock data - replace with actual database calls
  return [
    { id: 1, name: 'Người dùng 1', avatar: '<i data-lucide="user"></i>', status: 'online' },
    { id: 2, name: 'Người dùng 2', avatar: '<i data-lucide="user"></i>', status: 'offline' },
    { id: 3, name: 'Người dùng 3', avatar: '<i data-lucide="user"></i>', status: 'online' },
  ];
});

ipcMain.handle('get-messages', async (event, userId) => {
  // Mock data - replace with actual database calls
  return [
    { id: 1, sender: 'Người dùng 1', text: 'Xin chào!', timestamp: new Date() },
    { id: 2, sender: 'Bạn', text: 'Chào bạn!', timestamp: new Date() },
  ];
});

ipcMain.handle('send-message', async (event, { userId, message }) => {
  // Handle message sending - save to database
  return { success: true, messageId: Date.now() };
});

ipcMain.on('login-success', () => {
  if (mainWindow) {
    mainWindow.setResizable(true);
    mainWindow.setSize(400, 800);
    mainWindow.center();
  }
});

ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
});

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});

ipcMain.on('window-toggle-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});


ipcMain.on('open-about', () => {
  const aboutWindow = new BrowserWindow({
    width: 400,
    height: 450,
    x: 100, // Thử đặt ở tọa độ 100
    y: 100, // Thử đặt ở tọa độ 100
    resizable: false,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  aboutWindow.loadFile(path.join(__dirname, 'about.html'));
});

ipcMain.on('open-chat', (event, user) => {
  const chatWindow = new BrowserWindow({
    width: 600,
    height: 550,
    minWidth: 500,
    minHeight: 400,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  chatWindow.loadFile(path.join(__dirname, 'chat.html'));
});

ipcMain.on('open-preferences', () => {
  const prefWindow = new BrowserWindow({
    width: 650,
    height: 600,
    resizable: false,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  prefWindow.loadFile(path.join(__dirname, 'preferences.html'));
});


