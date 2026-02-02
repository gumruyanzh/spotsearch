import React, { useRef, useState, Component, ReactNode } from 'react';
import { SearchInput } from './components/SearchInput';
import { FilterBar } from './components/FilterBar';
import { ResultsList } from './components/ResultsList';
import { StatusBar } from './components/StatusBar';
import { ClipboardHistory } from './components/ClipboardHistory';
import { useSearch } from './hooks/useSearch';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import './styles/global.css';

// Error boundary to catch component errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Component error:', error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [clipboardExpanded, setClipboardExpanded] = useState(false);

  const { results, isSearching, stats, error } = useSearch();

  useKeyboardNav({ inputRef, listRef });

  return (
    <div className="app">
      <SearchInput ref={inputRef} isSearching={isSearching} />
      <ErrorBoundary>
        <ClipboardHistory
          isExpanded={clipboardExpanded}
          onToggle={() => setClipboardExpanded(!clipboardExpanded)}
        />
      </ErrorBoundary>
      <FilterBar />
      <ResultsList ref={listRef} results={results} isSearching={isSearching} />
      <StatusBar
        stats={stats}
        isSearching={isSearching}
        error={error}
        resultCount={results.length}
      />
    </div>
  );
}
