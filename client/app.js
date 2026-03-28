const { app, BrowserWindow } = require('electron');

let appWindow;
const MAIN_WINDOW_MIN_WIDTH = 1000;
const MAIN_WINDOW_MIN_HEIGHT = 800;
const CHAT_WINDOW_NAME = 'pokeworld-chat-window';
const CHAT_WINDOW_MIN_WIDTH = 520;
const CHAT_WINDOW_MIN_HEIGHT = 760;

function configureWindow(window, minWidth, minHeight) {
    window.setMinimumSize(minWidth, minHeight);
    window.setMenuBarVisibility(false);
    window.removeMenu();
}

function createWindow() {
    appWindow = new BrowserWindow({
        width: MAIN_WINDOW_MIN_WIDTH,
        height: MAIN_WINDOW_MIN_HEIGHT,
        minWidth: MAIN_WINDOW_MIN_WIDTH,
        minHeight: MAIN_WINDOW_MIN_HEIGHT,
    });
    appWindow.loadFile('dist/client/index.html');
    configureWindow(appWindow, MAIN_WINDOW_MIN_WIDTH, MAIN_WINDOW_MIN_HEIGHT);

    appWindow.webContents.setWindowOpenHandler(({ frameName }) => {
        if (frameName !== CHAT_WINDOW_NAME) {
            return { action: 'allow' };
        }

        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                width: CHAT_WINDOW_MIN_WIDTH,
                height: CHAT_WINDOW_MIN_HEIGHT,
                minWidth: CHAT_WINDOW_MIN_WIDTH,
                minHeight: CHAT_WINDOW_MIN_HEIGHT,
                autoHideMenuBar: true,
            },
        };
    });

    appWindow.webContents.on('did-create-window', (window) => {
        configureWindow(window, CHAT_WINDOW_MIN_WIDTH, CHAT_WINDOW_MIN_HEIGHT);
    });

    appWindow.on('closed', () => {
        appWindow = null;
    });
}

app.whenReady().then(() => createWindow());
