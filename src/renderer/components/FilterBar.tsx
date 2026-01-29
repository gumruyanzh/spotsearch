import React from 'react';
import { useSearchStore } from '../store/searchStore';
import type { FileTypeFilter } from '../../shared/types';

interface FilterChip {
  type: FileTypeFilter;
  label: string;
  icon: string;
}

const FILTER_CHIPS: FilterChip[] = [
  { type: 'all', label: 'All', icon: '📁' },
  { type: 'folders', label: 'Folders', icon: '📂' },
  { type: 'documents', label: 'Docs', icon: '📄' },
  { type: 'images', label: 'Images', icon: '🖼️' },
  { type: 'pdfs', label: 'PDFs', icon: '📕' },
  { type: 'code', label: 'Code', icon: '💻' },
  { type: 'archives', label: 'Archives', icon: '📦' },
  { type: 'audio', label: 'Audio', icon: '🎵' },
  { type: 'video', label: 'Video', icon: '🎬' },
];

export function FilterBar() {
  const { selectedFileTypes, toggleFileType, exactMatch, setExactMatch, extension, setExtension } =
    useSearchStore();

  return (
    <div className="filter-bar">
      <div className="extension-filter">
        <input
          type="text"
          className="extension-input"
          placeholder=".py"
          value={extension}
          onChange={(e) => setExtension(e.target.value)}
          title="Filter by extension (e.g., .py, .sh)"
        />
      </div>
      <div className="filter-chips">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.type}
            className={`filter-chip ${
              selectedFileTypes.includes(chip.type) ? 'active' : ''
            }`}
            onClick={() => toggleFileType(chip.type)}
            title={chip.label}
          >
            <span className="filter-icon">{chip.icon}</span>
            <span className="filter-label">{chip.label}</span>
          </button>
        ))}
      </div>
      <label className="exact-match-toggle">
        <input
          type="checkbox"
          checked={exactMatch}
          onChange={(e) => setExactMatch(e.target.checked)}
        />
        <span>Exact</span>
      </label>
    </div>
  );
}
