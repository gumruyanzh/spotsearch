import { spawn, ChildProcess } from 'child_process';
import { stat } from 'fs/promises';
import { basename, extname } from 'path';
import { EventEmitter } from 'events';
import type { SearchOptions, SearchResult, SearchStats } from '../../shared/types';
import { buildMdfindArgs } from './query-builder';

export class SearchEngine extends EventEmitter {
  private currentProcess: ChildProcess | null = null;
  private resultCount = 0;
  private startTime = 0;
  private maxResults = 100;

  constructor() {
    super();
  }

  search(options: SearchOptions): void {
    // Cancel any existing search
    this.cancel();

    const args = buildMdfindArgs(options);

    if (args.length === 0) {
      this.emit('complete', { count: 0, duration: 0 });
      return;
    }

    this.resultCount = 0;
    this.startTime = Date.now();

    // Spawn mdfind process
    this.currentProcess = spawn('mdfind', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let buffer = '';

    this.currentProcess.stdout?.on('data', (chunk: Buffer) => {
      buffer += chunk.toString();

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim() && this.resultCount < this.maxResults) {
          this.processResult(line.trim());
        }
      }

      // Stop if we've reached max results
      if (this.resultCount >= this.maxResults) {
        this.cancel();
      }
    });

    this.currentProcess.stderr?.on('data', (chunk: Buffer) => {
      const error = chunk.toString().trim();
      if (error) {
        this.emit('error', error);
      }
    });

    this.currentProcess.on('close', (code) => {
      // Process any remaining buffer
      if (buffer.trim() && this.resultCount < this.maxResults) {
        this.processResult(buffer.trim());
      }

      const stats: SearchStats = {
        count: this.resultCount,
        duration: Date.now() - this.startTime,
      };

      this.currentProcess = null;
      this.emit('complete', stats);
    });

    this.currentProcess.on('error', (error) => {
      this.emit('error', error.message);
      this.currentProcess = null;
    });
  }

  private async processResult(filePath: string): Promise<void> {
    try {
      const stats = await stat(filePath);
      const name = basename(filePath);
      const extension = extname(filePath).slice(1).toLowerCase();

      const result: SearchResult = {
        id: `${this.resultCount++}`,
        path: filePath,
        name,
        extension,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modifiedDate: stats.mtime.toISOString(),
      };

      this.emit('result', result);
    } catch {
      // File might have been deleted or be inaccessible
      // Still emit with basic info
      const name = basename(filePath);
      const extension = extname(filePath).slice(1).toLowerCase();

      const result: SearchResult = {
        id: `${this.resultCount++}`,
        path: filePath,
        name,
        extension,
        isDirectory: false,
      };

      this.emit('result', result);
    }
  }

  cancel(): void {
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM');
      this.currentProcess = null;
    }
  }

  setMaxResults(max: number): void {
    this.maxResults = max;
  }
}

// Singleton instance
export const searchEngine = new SearchEngine();
