const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

const PANEL_URL = 'https://guvenlihipermarketbordo.com/yonetim-k7x4q9m2/';
const ALLOWED_HOST = 'guvenlihipermarketbordo.com';

let win;

// Aynı anda sadece bir pencere açılsın
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Güvenli Bordro',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  Menu.setApplicationMenu(null);
  win.loadURL(PANEL_URL);
  win.once('ready-to-show', () => win.show());

  // İnternet yoksa / site açılmazsa bilgi sayfası göster
  win.webContents.on('did-fail-load', (_e, code, _desc, _url, isMainFrame) => {
    if (isMainFrame && code !== -3) {
      win.loadFile(path.join(__dirname, 'offline.html'));
    }
  });

  // Site dışındaki linkleri normal tarayıcıda aç
  const isInternal = (url) => {
    try { return new URL(url).hostname.endsWith(ALLOWED_HOST); }
    catch { return false; }
  };

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternal(url)) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (e, url) => {
    if (!isInternal(url) && !url.startsWith('file://')) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  // F5 yenile, Ctrl+Shift+I geliştirici araçları
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F5') win.loadURL(PANEL_URL);
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      win.webContents.toggleDevTools();
    }
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
