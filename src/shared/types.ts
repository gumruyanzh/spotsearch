export interface SearchResult {
  id: string;
  path: string;
  name: string;
  extension: string;
  isDirectory: boolean;
  size?: number;
  modifiedDate?: string;
  contentType?: string;
}

export interface SearchOptions {
  query: string;
  exactMatch: boolean;
  fileTypes: FileTypeFilter[];
}

export type FileTypeFilter =
  | 'all'
  | 'folders'
  | 'documents'
  | 'images'
  | 'archives'
  | 'pdfs'
  | 'audio'
  | 'video'
  | 'code';

export interface SearchStats {
  count: number;
  duration: number;
}

export interface Settings {
  exactMatch: boolean;
  selectedFileTypes: FileTypeFilter[];
  globalHotkey: string;
}

export interface FileMetadata {
  size: number;
  modifiedDate: Date;
  createdDate: Date;
  contentType: string;
}
