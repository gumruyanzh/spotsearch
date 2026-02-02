import { clipboard } from 'electron';
import Store from 'electron-store';

export interface ClipboardItem {
  id: string;
  text: string;
  timestamp: number;
}

const MAX_HISTORY_SIZE = 10;
const POLL_INTERVAL = 500;

const store = new Store<{ clipboardHistory: ClipboardItem[] }>({
  name: 'clipboard-history',
  defaults: {
    clipboardHistory: [],
  },
});

let lastClipboardText = '';
let pollInterval: NodeJS.Timeout | null = null;

export function getClipboardHistory(): ClipboardItem[] {
  return store.get('clipboardHistory', []);
}

export function clearClipboardHistory(): void {
  store.set('clipboardHistory', []);
}

export function copyFromHistory(id: string): boolean {
  const history = getClipboardHistory();
  const item = history.find((h) => h.id === id);
  if (item) {
    clipboard.writeText(item.text);
    lastClipboardText = item.text;
    return true;
  }
  return false;
}

function addToHistory(text: string): void {
  if (!text || text.trim().length === 0) return;

  const history = getClipboardHistory();
  const existingIndex = history.findIndex((h) => h.text === text);

  if (existingIndex !== -1) {
    const [existing] = history.splice(existingIndex, 1);
    existing.timestamp = Date.now();
    history.unshift(existing);
  } else {
    const newItem: ClipboardItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      timestamp: Date.now(),
    };
    history.unshift(newItem);
  }

  store.set('clipboardHistory', history.slice(0, MAX_HISTORY_SIZE));
}

function checkClipboard(): void {
  try {
    const currentText = clipboard.readText();
    if (currentText && currentText !== lastClipboardText) {
      lastClipboardText = currentText;
      addToHistory(currentText);
    }
  } catch (error) {
    console.error('Error reading clipboard:', error);
  }
}

export function startClipboardMonitor(): void {
  if (pollInterval) return;
  lastClipboardText = clipboard.readText() || '';
  pollInterval = setInterval(checkClipboard, POLL_INTERVAL);
  console.log('Clipboard monitor started');
}

export function stopClipboardMonitor(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
    console.log('Clipboard monitor stopped');
  }
}
