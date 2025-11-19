// electron/main.cjs
const { app, BrowserWindow } = require('electron');
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,                          // hide until ready-to-show
    backgroundColor: '#0b0b0b',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const startUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../dist/index.html')}`;

  win.loadURL(startUrl);

  // Show window only when React is ready
  win.once('ready-to-show', () => win.show());
};
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


// npm run start