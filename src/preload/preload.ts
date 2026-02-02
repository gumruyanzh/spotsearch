import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import type { SearchOptions, SearchResult, SearchStats, Settings } from '../shared/types';

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Search
  search: (options: SearchOptions) => {
    ipcRenderer.send(IPC_CHANNELS.SEARCH_START, options);
  },

  cancelSearch: () => {
    ipcRenderer.send(IPC_CHANNELS.SEARCH_CANCEL);
  },

  onSearchResult: (callback: (result: SearchResult) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, result: SearchResult) =>
      callback(result);
    ipcRenderer.on(IPC_CHANNELS.SEARCH_RESULT, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SEARCH_RESULT, handler);
  },

  onSearchComplete: (callback: (stats: SearchStats) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, stats: SearchStats) =>
      callback(stats);
    ipcRenderer.on(IPC_CHANNELS.SEARCH_COMPLETE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SEARCH_COMPLETE, handler);
  },

  onSearchError: (callback: (error: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, error: string) =>
      callback(error);
    ipcRenderer.on(IPC_CHANNELS.SEARCH_ERROR, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SEARCH_ERROR, handler);
  },

  // File actions
  openFile: (filePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN, filePath),

  revealFile: (filePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_REVEAL, filePath),

  copyPath: (filePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_COPY_PATH, filePath),

  previewFile: (filePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_PREVIEW, filePath),

  getFileIcon: (filePath: string): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_GET_ICON, filePath),

  getFileMetadata: (
    filePath: string
  ): Promise<{ size: number; modifiedDate: string; createdDate: string } | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_GET_METADATA, filePath),

  // Settings
  getSettings: (): Promise<Settings> =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),

  setSettings: (settings: Partial<Settings>): Promise<Settings> =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings),

  // Window
  hideWindow: () => {
    ipcRenderer.send(IPC_CHANNELS.WINDOW_HIDE);
  },

  onWindowFocus: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('window:focus', handler);
    return () => ipcRenderer.removeListener('window:focus', handler);
  },

  onWindowBlur: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('window:blur', handler);
    return () => ipcRenderer.removeListener('window:blur', handler);
  },

  // Clipboard
  getClipboardHistory: () => ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_GET),
  clearClipboardHistory: () => ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_CLEAR),
  copyFromClipboardHistory: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_COPY, id),
});

// Type declarations for the exposed API
declare global {
  interface Window {
    api: {
      search: (options: SearchOptions) => void;
      cancelSearch: () => void;
      onSearchResult: (callback: (result: SearchResult) => void) => () => void;
      onSearchComplete: (callback: (stats: SearchStats) => void) => () => void;
      onSearchError: (callback: (error: string) => void) => () => void;
      openFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
      revealFile: (filePath: string) => Promise<{ success: boolean }>;
      copyPath: (filePath: string) => Promise<{ success: boolean }>;
      previewFile: (filePath: string) => Promise<{ success: boolean }>;
      getFileIcon: (filePath: string) => Promise<string>;
      getFileMetadata: (
        filePath: string
      ) => Promise<{ size: number; modifiedDate: string; createdDate: string } | null>;
      getSettings: () => Promise<Settings>;
      setSettings: (settings: Partial<Settings>) => Promise<Settings>;
      hideWindow: () => void;
      onWindowFocus: (callback: () => void) => () => void;
      onWindowBlur: (callback: () => void) => () => void;
      getClipboardHistory: () => Promise<Array<{ id: string; text: string; timestamp: number }>>;
      clearClipboardHistory: () => Promise<{ success: boolean }>;
      copyFromClipboardHistory: (id: string) => Promise<{ success: boolean }>;
    };
  }
}
