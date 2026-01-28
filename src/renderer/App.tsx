import React, { useRef } from 'react';
import { SearchInput } from './components/SearchInput';
import { FilterBar } from './components/FilterBar';
import { ResultsList } from './components/ResultsList';
import { StatusBar } from './components/StatusBar';
import { useSearch } from './hooks/useSearch';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import './styles/global.css';

export function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { results, isSearching, stats, error } = useSearch();

  useKeyboardNav({ inputRef, listRef });

  return (
    <div className="app">
      <SearchInput ref={inputRef} isSearching={isSearching} />
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
