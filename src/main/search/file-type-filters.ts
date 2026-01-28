import type { FileTypeFilter } from '../../shared/types';

interface FilterDefinition {
  query: string;
  description: string;
}

export const FILE_TYPE_FILTERS: Record<FileTypeFilter, FilterDefinition> = {
  all: {
    query: '',
    description: 'All files',
  },
  folders: {
    query: 'kMDItemContentType == "public.folder"',
    description: 'Folders only',
  },
  documents: {
    query:
      '(kMDItemContentTypeTree == "public.text" || kMDItemContentTypeTree == "public.composite-content" || kMDItemContentType == "org.openxmlformats.wordprocessingml.document" || kMDItemContentType == "com.microsoft.word.doc")',
    description: 'Documents (doc, docx, txt, rtf)',
  },
  images: {
    query: 'kMDItemContentTypeTree == "public.image"',
    description: 'Images (jpg, png, gif, webp, heic)',
  },
  archives: {
    query: 'kMDItemContentTypeTree == "public.archive"',
    description: 'Archives (zip, tar, gz, rar, 7z)',
  },
  pdfs: {
    query: 'kMDItemContentType == "com.adobe.pdf"',
    description: 'PDF files',
  },
  audio: {
    query: 'kMDItemContentTypeTree == "public.audio"',
    description: 'Audio files (mp3, wav, m4a, flac)',
  },
  video: {
    query: 'kMDItemContentTypeTree == "public.movie"',
    description: 'Video files (mp4, mov, mkv, avi)',
  },
  code: {
    query: 'kMDItemContentTypeTree == "public.source-code"',
    description: 'Source code files',
  },
};

export function getFilterQuery(filters: FileTypeFilter[]): string {
  // If 'all' is selected or no filters, return empty
  if (filters.includes('all') || filters.length === 0) {
    return '';
  }

  const queries = filters
    .map((f) => FILE_TYPE_FILTERS[f].query)
    .filter((q) => q.length > 0);

  if (queries.length === 0) {
    return '';
  }

  if (queries.length === 1) {
    return queries[0];
  }

  // Combine with OR for multiple filters
  return `(${queries.join(' || ')})`;
}
