import { useEffect, useCallback, RefObject } from 'react';
import { useSearchStore } from '../store/searchStore';

interface UseKeyboardNavOptions {
  inputRef: RefObject<HTMLInputElement | null>;
  listRef: RefObject<HTMLDivElement | null>;
}

export function useKeyboardNav({ inputRef, listRef }: UseKeyboardNavOptions) {
  const {
    results,
    selectedIndex,
    selectNext,
    selectPrevious,
    setSelectedIndex,
    query,
    setQuery,
  } = useSearchStore();

  const getSelectedResult = useCallback(() => {
    return results[selectedIndex] || null;
  }, [results, selectedIndex]);

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      const selected = getSelectedResult();

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          selectNext();
          break;

        case 'ArrowUp':
          event.preventDefault();
          selectPrevious();
          break;

        case 'Enter':
          if (selected) {
            event.preventDefault();
            if (event.metaKey || event.ctrlKey) {
              // Cmd+Enter: Reveal in Finder
              await window.api.revealFile(selected.path);
            } else {
              // Enter: Open file
              await window.api.openFile(selected.path);
            }
          }
          break;

        case ' ':
          // Space: QuickLook preview (only when not typing in input)
          if (document.activeElement !== inputRef.current && selected) {
            event.preventDefault();
            await window.api.previewFile(selected.path);
          }
          break;

        case 'Escape':
          event.preventDefault();
          if (query) {
            // First Escape: Clear query
            setQuery('');
            inputRef.current?.focus();
          } else {
            // Second Escape: Hide window
            window.api.hideWindow();
          }
          break;

        case 'Tab':
          // Allow normal tab behavior when in an input field
          if (document.activeElement instanceof HTMLInputElement) {
            return; // Let Tab work normally for focus navigation
          }
          // Otherwise use Tab for result navigation
          event.preventDefault();
          if (event.shiftKey) {
            selectPrevious();
          } else {
            selectNext();
          }
          break;

        case 'Home':
          event.preventDefault();
          setSelectedIndex(0);
          break;

        case 'End':
          event.preventDefault();
          setSelectedIndex(results.length - 1);
          break;

        case 'PageDown':
          event.preventDefault();
          setSelectedIndex(Math.min(selectedIndex + 10, results.length - 1));
          break;

        case 'PageUp':
          event.preventDefault();
          setSelectedIndex(Math.max(selectedIndex - 10, 0));
          break;

        default:
          // If typing a character and not in any input, focus the main input
          if (
            event.key.length === 1 &&
            !event.metaKey &&
            !event.ctrlKey &&
            !(document.activeElement instanceof HTMLInputElement)
          ) {
            inputRef.current?.focus();
          }
          break;
      }
    },
    [
      getSelectedResult,
      selectNext,
      selectPrevious,
      setSelectedIndex,
      selectedIndex,
      results.length,
      query,
      setQuery,
      inputRef,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && results.length > 0) {
      const selectedElement = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, listRef, results.length]);

  return {
    selectedIndex,
    getSelectedResult,
  };
}
