import React, { useState, useEffect } from 'react';

interface ClipboardItem {
  id: string;
  text: string;
  timestamp: number;
}

interface Props {
  isExpanded: boolean;
  onToggle: () => void;
}

export function ClipboardHistory({ isExpanded, onToggle }: Props) {
  const [history, setHistory] = useState<ClipboardItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchHistory = async () => {
      if (!window.api?.getClipboardHistory) {
        setError('API not available');
        return;
      }
      try {
        const items = await window.api.getClipboardHistory();
        if (mounted) {
          setHistory(items || []);
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          console.error('Clipboard fetch error:', e);
          setError(String(e));
        }
      }
    };

    fetchHistory();

    // Poll when expanded
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isExpanded) {
      interval = setInterval(fetchHistory, 1000);
    }

    // Refresh on window focus
    let unsubscribe: (() => void) | null = null;
    if (window.api?.onWindowFocus) {
      unsubscribe = window.api.onWindowFocus(fetchHistory);
    }

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  }, [isExpanded]);

  const handleCopy = async (id: string) => {
    if (!window.api?.copyFromClipboardHistory) return;
    try {
      await window.api.copyFromClipboardHistory(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (e) {
      console.error('Copy error:', e);
    }
  };

  const handleClear = async () => {
    if (!window.api?.clearClipboardHistory) return;
    try {
      await window.api.clearClipboardHistory();
      setHistory([]);
    } catch (e) {
      console.error('Clear error:', e);
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  const truncate = (text: string) => {
    const s = text.replace(/\n/g, ' ').trim();
    return s.length <= 50 ? s : s.slice(0, 50) + '...';
  };

  if (error) {
    return null; // Don't show if there's an error
  }

  return (
    <div className="clipboard-section">
      <button
        className="clipboard-toggle"
        onClick={onToggle}
        type="button"
      >
        <span className="clipboard-arrow">{isExpanded ? '▼' : '▶'}</span>
        <span>Clipboard History</span>
        {history.length > 0 && (
          <span className="clipboard-badge">{history.length}</span>
        )}
      </button>

      {isExpanded && (
        <div className="clipboard-panel">
          {history.length === 0 ? (
            <div className="clipboard-empty">No clipboard history yet</div>
          ) : (
            <>
              <div className="clipboard-list">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={`clipboard-item ${copiedId === item.id ? 'copied' : ''}`}
                    onClick={() => handleCopy(item.id)}
                  >
                    <div className="clipboard-item-info">
                      <span className="clipboard-text">{truncate(item.text)}</span>
                      <span className="clipboard-time">{formatTime(item.timestamp)}</span>
                    </div>
                    <span className="clipboard-action">
                      {copiedId === item.id ? '✓' : 'Copy'}
                    </span>
                  </div>
                ))}
              </div>
              <button className="clipboard-clear" onClick={handleClear} type="button">
                Clear History
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
