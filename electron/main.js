const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { generateVideo } = require('./videoGenerator');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'YouTube Shorts Generator - 호반공인중개사',
    resizable: true,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handler for video generation
ipcMain.handle('generate-video', async (_event, { mediaPath, audioFile }) => {
  const assetsDir = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '..', 'assets');

  const audioPath = path.join(assetsDir, 'music', audioFile);
  const logoPath = path.join(assetsDir, 'logo.png');

  const outputDir = app.getPath('desktop');
  const outputPath = path.join(outputDir, 'shorts_output.mp4');

  const result = await generateVideo({
    mediaPath,
    audioPath,
    logoPath,
    outputPath,
    overlayText: '호반공인중개사 ☎ 032-574-7744',
  });

  return result;
});

// IPC handler for selecting output folder
ipcMain.handle('select-output-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});
