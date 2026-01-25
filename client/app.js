const { app, BrowserWindow } = require('electron');

let appWindow;

function createWindow() {
    appWindow = new BrowserWindow({
        width: 1000,
        height: 800,
    });
    appWindow.loadFile('dist/client/index.html');

    appWindow.setMenuBarVisibility(false);

    appWindow.on('closed', () => {
        appWindow = null;
    });
}

app.whenReady().then(() => createWindow());
