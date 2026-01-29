import type { SearchOptions } from '../../shared/types';
import { getFilterQuery } from './file-type-filters';

export function buildMdfindQuery(options: SearchOptions): string[] {
  const { query, exactMatch, fileTypes, extension } = options;

  if (!query.trim()) {
    return [];
  }

  // Escape special characters for mdfind query
  const escapedQuery = escapeQueryString(query);

  // Build the name query part
  let nameQuery: string;
  if (exactMatch) {
    // Exact match - case insensitive with 'c' modifier
    nameQuery = `kMDItemFSName == "${escapedQuery}"c`;
  } else {
    // Fuzzy match - contains, case insensitive
    nameQuery = `kMDItemFSName == "*${escapedQuery}*"c`;
  }

  // Get file type filter
  const typeQuery = getFilterQuery(fileTypes);

  // Build extension filter if provided
  let extensionQuery: string | null = null;
  if (extension && extension.trim()) {
    // Normalize extension - remove leading dot if present
    const ext = extension.trim().replace(/^\./, '');
    const escapedExt = escapeQueryString(ext);
    extensionQuery = `kMDItemFSName == "*.${escapedExt}"c`;
  }

  // Combine queries
  let fullQuery: string = nameQuery;

  if (typeQuery) {
    fullQuery = `${fullQuery} && ${typeQuery}`;
  }

  if (extensionQuery) {
    fullQuery = `${fullQuery} && ${extensionQuery}`;
  }

  return [fullQuery];
}

function escapeQueryString(query: string): string {
  // Escape special characters that could break the mdfind query
  return query
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\*/g, '\\*')
    .replace(/\?/g, '\\?');
}

export function buildMdfindArgs(options: SearchOptions): string[] {
  const query = buildMdfindQuery(options);

  if (query.length === 0) {
    return [];
  }

  // -onlyin can be used to limit search scope
  // For now, search everywhere
  return [...query];
}
