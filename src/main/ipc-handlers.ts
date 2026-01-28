import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import type { SearchOptions, SearchResult, SearchStats } from '../shared/types';
import { searchEngine } from './search/search-engine';
import {
  openFile,
  revealInFinder,
  copyPath,
  previewWithQuickLook,
  getFileIcon,
  getFileMetadata,
} from './file-actions';
import { getSettings, setSettings, getSetting, setSetting } from './settings-store';

export function setupIpcHandlers(getWindow: () => BrowserWindow | undefined): void {
  // Search handlers
  ipcMain.on(IPC_CHANNELS.SEARCH_START, (event, options: SearchOptions) => {
    const window = getWindow();
    if (!window) return;

    // Remove previous listeners
    searchEngine.removeAllListeners();

    // Set up new listeners for this search
    searchEngine.on('result', (result: SearchResult) => {
      if (!window.isDestroyed()) {
        window.webContents.send(IPC_CHANNELS.SEARCH_RESULT, result);
      }
    });

    searchEngine.on('complete', (stats: SearchStats) => {
      if (!window.isDestroyed()) {
        window.webContents.send(IPC_CHANNELS.SEARCH_COMPLETE, stats);
      }
    });

    searchEngine.on('error', (error: string) => {
      if (!window.isDestroyed()) {
        window.webContents.send(IPC_CHANNELS.SEARCH_ERROR, error);
      }
    });

    // Start the search
    searchEngine.search(options);
  });

  ipcMain.on(IPC_CHANNELS.SEARCH_CANCEL, () => {
    searchEngine.cancel();
  });

  // File action handlers
  ipcMain.handle(IPC_CHANNELS.FILE_OPEN, async (_event, filePath: string) => {
    try {
      await openFile(filePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_REVEAL, (_event, filePath: string) => {
    revealInFinder(filePath);
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.FILE_COPY_PATH, (_event, filePath: string) => {
    copyPath(filePath);
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.FILE_PREVIEW, (_event, filePath: string) => {
    previewWithQuickLook(filePath);
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.FILE_GET_ICON, async (_event, filePath: string) => {
    return await getFileIcon(filePath);
  });

  ipcMain.handle(IPC_CHANNELS.FILE_GET_METADATA, async (_event, filePath: string) => {
    try {
      return await getFileMetadata(filePath);
    } catch {
      return null;
    }
  });

  // Settings handlers
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, (_event, key?: string) => {
    if (key) {
      return getSetting(key as keyof typeof getSettings);
    }
    return getSettings();
  });

  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_SET,
    (_event, keyOrSettings: string | object, value?: unknown) => {
      if (typeof keyOrSettings === 'string') {
        setSetting(keyOrSettings as any, value as any);
      } else {
        setSettings(keyOrSettings as any);
      }
      return getSettings();
    }
  );
}
