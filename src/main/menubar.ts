import { menubar, Menubar } from 'menubar';
import { globalShortcut, app, nativeImage, BrowserWindow } from 'electron';
import { join } from 'path';
import { getSetting } from './settings-store';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

let mb: Menubar | null = null;

export function createMenubar(): Menubar {
  // In development, use the project root. In production, use resources path.
  const isDev = !!MAIN_WINDOW_VITE_DEV_SERVER_URL;
  const assetsPath = isDev
    ? join(app.getAppPath(), 'assets/icons')
    : join(process.resourcesPath, 'assets/icons');

  const iconPath = join(assetsPath, 'trayTemplate.png');
  console.log('Icon path:', iconPath);

  // Create a placeholder icon if the file doesn't exist
  const icon = nativeImage.createFromPath(iconPath);
  console.log('Icon isEmpty:', icon.isEmpty());

  // Use a fallback icon if the template image doesn't load
  let trayIcon = icon;
  if (icon.isEmpty()) {
    // Create a simple colored icon as fallback
    console.log('Creating fallback icon');
    trayIcon = nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAQklEQVQ4y2NgGAWjYBSMAlLAyMDAYMDAwHCAgYHhP5KYAZYYOmD4DwPIYgZYYkMeMDIwMDAONhdQDEYDcRQMe8AIARI5E8bwhp0AAAAASUVORK5CYII='
    );
  }
  trayIcon.setTemplateImage(true);

  const indexUrl = MAIN_WINDOW_VITE_DEV_SERVER_URL
    ? MAIN_WINDOW_VITE_DEV_SERVER_URL
    : `file://${join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)}`;

  mb = menubar({
    index: indexUrl,
    icon: trayIcon,
    preloadWindow: true,
    showDockIcon: false,
    browserWindow: {
      width: 680,
      height: 480,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      frame: false,
      transparent: true,
      vibrancy: 'under-window',
      visualEffectState: 'active',
      webPreferences: {
        preload: join(__dirname, '../preload/preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    },
  });

  mb.on('ready', () => {
    console.log('SpotSearch is ready');

    // Register global shortcut
    registerGlobalShortcut();

    // Set tray tooltip
    mb?.tray.setToolTip('SpotSearch');

    // Auto-show window on startup for testing
    setTimeout(() => {
      mb?.showWindow();
    }, 1000);
  });

  mb.on('after-show', () => {
    // Focus the window and send focus event
    mb?.window?.focus();
    mb?.window?.webContents.send('window:focus');
  });

  mb.on('after-hide', () => {
    // Send blur event
    mb?.window?.webContents.send('window:blur');
  });

  return mb;
}

function registerGlobalShortcut(): void {
  const hotkey = getSetting('globalHotkey') || 'Alt+Space';

  // Unregister any existing shortcut
  globalShortcut.unregisterAll();

  const registered = globalShortcut.register(hotkey, () => {
    if (mb) {
      if (mb.window?.isVisible()) {
        mb.hideWindow();
      } else {
        mb.showWindow();
      }
    }
  });

  if (!registered) {
    console.warn(`Failed to register global shortcut: ${hotkey}`);
  }
}

export function getMenubar(): Menubar | null {
  return mb;
}

export function getWindow(): BrowserWindow | undefined {
  return mb?.window;
}

export function showWindow(): void {
  mb?.showWindow();
}

export function hideWindow(): void {
  mb?.hideWindow();
}

export function toggleWindow(): void {
  if (mb?.window?.isVisible()) {
    mb.hideWindow();
  } else {
    mb?.showWindow();
  }
}

// Cleanup on app quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
