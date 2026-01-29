import { useEffect, useRef, useCallback } from 'react';
import { useSearchStore } from '../store/searchStore';

const DEBOUNCE_DELAY = 300;

export function useSearch() {
  const {
    query,
    exactMatch,
    selectedFileTypes,
    extension,
    results,
    isSearching,
    stats,
    error,
    addResult,
    clearResults,
    setIsSearching,
    setStats,
    setError,
  } = useSearchStore();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set up IPC listeners
  useEffect(() => {
    const unsubResult = window.api.onSearchResult((result) => {
      addResult(result);
    });

    const unsubComplete = window.api.onSearchComplete((searchStats) => {
      setIsSearching(false);
      setStats(searchStats);
    });

    const unsubError = window.api.onSearchError((searchError) => {
      setIsSearching(false);
      setError(searchError);
    });

    return () => {
      unsubResult();
      unsubComplete();
      unsubError();
    };
  }, [addResult, setIsSearching, setStats, setError]);

  // Debounced search
  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Cancel any ongoing search
    window.api.cancelSearch();

    // If query is empty, clear results
    if (!query.trim()) {
      clearResults();
      setIsSearching(false);
      return;
    }

    // Set up debounced search
    debounceRef.current = setTimeout(() => {
      clearResults();
      setIsSearching(true);
      setError(null);

      window.api.search({
        query: query.trim(),
        exactMatch,
        fileTypes: selectedFileTypes,
        extension: extension.trim() || undefined,
      });
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, exactMatch, selectedFileTypes, extension, clearResults, setIsSearching, setError]);

  const cancelSearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    window.api.cancelSearch();
    setIsSearching(false);
  }, [setIsSearching]);

  return {
    results,
    isSearching,
    stats,
    error,
    cancelSearch,
  };
}
