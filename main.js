//------------------------------------
// モジュール
//------------------------------------
const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  screen,
} = require("electron");
const path = require("path");
const Store = require("electron-store");
const store = new Store();
const localShortcut = require("electron-localshortcut");

//------------------------------------
// 定数
//------------------------------------
const IS_MAC = process.platform === "darwin";
const MAIN_WINDOWS_WIDTH = 400;
const MAIN_WINDOWS_HEIGHT = 600;

//------------------------------------
// グローバル変数
//------------------------------------
// ウィンドウ管理用
let mainWindow;

if (IS_MAC) {
  app.dock.hide();
}

/**
 * ウィンドウを作成する
 */
function createWindow() {
  const pos = store.get("window.pos") || getCenterPosition();
  const size = store.get("window.size") || [
    MAIN_WINDOWS_WIDTH,
    MAIN_WINDOWS_HEIGHT,
  ];

  mainWindow = new BrowserWindow({
    width: size[0],
    height: size[1],
    x: pos[0],
    y: pos[1],
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.setAlwaysOnTop(true, "screen-saver");
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.loadURL("https://chat.openai.com/chat");
  // mainWindow.webContents.openDevTools();

  localShortcut.register(mainWindow, "F12", () => {
    mainWindow.webContents.toggleDevTools();
  });

  // F5キーでリロード機能を実装
  localShortcut.register(mainWindow, "F5", () => {
    mainWindow.webContents.reload();
  });

  /**
   * CommandOrControl+Enterで文章送信
   */
  localShortcut.register(mainWindow, "CommandOrControl+Enter", async () => {
    const webContents = mainWindow.webContents;

    try {
      await webContents.executeJavaScript(`
      (function() {
        const textarea = document.querySelector("#prompt-textarea");
        const button = document.querySelector("textarea + button");
        if (button && textarea && textarea.value.trim() !== '') {
          button.click();
          textarea.value = '';  // テキストエリアをクリア
          return 'Button clicked!';
        }
        return 'Button not clicked!';
      })();
    `);
    } catch (error) {
      console.error("Error executing script:", error);
    }
  });

  // ウィンドウが閉じられる直前に保存
  mainWindow.on("close", () => {
    store.set("window.pos", mainWindow.getPosition()); // ウィンドウの座標を記録
    store.set("window.size", mainWindow.getSize()); // ウィンドウのサイズを記録
  });
}

function showAndFocusWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
}

/**
 * globalShortcutの処理
 */
app
  .whenReady()
  .then(() => {
    // CommandOrControl+Gでウィンドウの表示/非表示を切り替える
    globalShortcut.register("CommandOrControl+G", () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        showAndFocusWindow();
      }
    });

    // CommandOrControl+shift+Gで再起動
    globalShortcut.register("CommandOrControl+Shift+G", () => {
      app.relaunch();
      app.exit();
    });
  })
  .then(createWindow);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    showAndFocusWindow();
  }
});

app.on("window-all-closed", function () {
  if (!IS_MAC) app.quit();
});

/**
 * ウィンドウの中央の座標を返却
 *
 * @return {array}
 */
function getCenterPosition() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const x = Math.floor((width - MAIN_WINDOWS_WIDTH) / 2);
  const y = Math.floor((height - MAIN_WINDOWS_HEIGHT) / 2);
  return [x, y];
}
