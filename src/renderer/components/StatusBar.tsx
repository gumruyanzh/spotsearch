import React from 'react';
import type { SearchStats } from '../../shared/types';

interface StatusBarProps {
  stats: SearchStats | null;
  isSearching: boolean;
  error: string | null;
  resultCount: number;
}

export function StatusBar({ stats, isSearching, error, resultCount }: StatusBarProps) {
  if (error) {
    return (
      <div className="status-bar error">
        <span className="status-icon">⚠️</span>
        <span className="status-text">{error}</span>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="status-bar">
        <span className="status-text">Searching...</span>
      </div>
    );
  }

  if (stats) {
    return (
      <div className="status-bar">
        <span className="status-text">
          {resultCount} {resultCount === 1 ? 'result' : 'results'}
          {stats.count > resultCount && ` (showing first ${resultCount})`}
        </span>
        <span className="status-duration">{stats.duration}ms</span>
      </div>
    );
  }

  return (
    <div className="status-bar">
      <span className="status-text">
        <kbd>⌥</kbd>+<kbd>Space</kbd> to toggle
      </span>
      <span className="status-hint">
        <kbd>↑↓</kbd> navigate · <kbd>Enter</kbd> open · <kbd>Space</kbd> preview
      </span>
    </div>
  );
}
