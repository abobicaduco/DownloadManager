/**
 * Minimal aria2 JSON-RPC client + helpers for sequential (queued) downloads.
 * Requires aria2c on PATH: https://aria2.github.io/
 */
import { type ChildProcess, spawn } from 'child_process';
import path from 'path';
import {
  buildAriaHttpHeaders,
  type HttpDownloadExtras,
} from './shared-http-headers.ts';

export type { HttpDownloadExtras } from './shared-http-headers.ts';

export type AriaTaskStatus =
  | 'active'
  | 'waiting'
  | 'complete'
  | 'error'
  | 'paused';

export interface DownloadTaskView {
  gid: string;
  name: string;
  url: string;
  progress: number;
  speed: string;
  status: AriaTaskStatus;
  error?: string;
  totalSize?: number;
  downloadedSize: number;
  startTime: number;
}

interface RpcResponse<T> {
  id?: string;
  result?: T;
  error?: { code: number; message: string };
}

function formatSpeed(bytesPerSecond: number): string {
  if (!bytesPerSecond || bytesPerSecond <= 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.min(
    Math.floor(Math.log(bytesPerSecond) / Math.log(k)),
    sizes.length - 1,
  );
  return `${parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function parseNum(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string') {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function basename(p: string): string {
  const s = p.replace(/\\/g, '/');
  const i = s.lastIndexOf('/');
  return i >= 0 ? s.slice(i + 1) : s;
}

function pickName(raw: Record<string, unknown>): string {
  const files = raw.files as Record<string, unknown>[] | undefined;
  if (files?.length) {
    const p = String(files[0].path ?? '');
    if (p) return basename(p);
  }
  const uris = raw.uris as { uri?: string }[] | undefined;
  if (uris?.length && uris[0]?.uri) {
    try {
      const u = new URL(uris[0].uri);
      const seg = u.pathname.split('/').filter(Boolean).pop();
      if (seg) return decodeURIComponent(seg);
    } catch {
      /* ignore */
    }
  }
  return 'download';
}

function pickUrl(raw: Record<string, unknown>): string {
  const uris = raw.uris as { uri?: string }[] | undefined;
  if (uris?.length && uris[0]?.uri) return String(uris[0].uri);
  return '';
}

function mapAriaStatus(
  s: string,
): 'active' | 'waiting' | 'complete' | 'error' | 'paused' {
  switch (s) {
    case 'active':
      return 'active';
    case 'waiting':
      return 'waiting';
    case 'paused':
      return 'paused';
    case 'complete':
      return 'complete';
    case 'error':
      return 'error';
    case 'removed':
      return 'complete';
    default:
      return 'waiting';
  }
}

export class Aria2Rpc {
  private readonly port: number;
  private readonly secret: string;
  private readonly rpcUrl: string;
  private child: ChildProcess | null = null;
  private nextId = 1;
  private startedByUs = false;

  constructor(opts: { port: number; secret: string }) {
    this.port = opts.port;
    this.secret = opts.secret;
    this.rpcUrl = `http://127.0.0.1:${this.port}/jsonrpc`;
  }

  get listenPort(): number {
    return this.port;
  }

  private params<T extends unknown[]>(args: T): unknown[] {
    if (this.secret) {
      return [`token:${this.secret}`, ...args];
    }
    return args;
  }

  async call<T>(method: string, args: unknown[] = []): Promise<T> {
    const body = {
      jsonrpc: '2.0' as const,
      id: String(this.nextId++),
      method: `aria2.${method}`,
      params: this.params(args),
    };
    const res = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`aria2 RPC HTTP ${res.status}`);
    }
    const json = (await res.json()) as RpcResponse<T>;
    if (json.error) {
      throw new Error(json.error.message || 'aria2 RPC error');
    }
    if (json.result === undefined) {
      throw new Error('aria2 RPC: empty result');
    }
    return json.result;
  }

  /** Spawn aria2c with one active download at a time (queue the rest). */
  spawnDaemon(downloadDir: string): void {
    if (this.child) return;
    const args = [
      '--enable-rpc',
      `--rpc-listen-port=${this.port}`,
      '--rpc-listen-all=false',
      '--rpc-allow-origin-all=true',
      '--max-concurrent-downloads=1',
      '--continue=true',
      '--auto-file-renaming=true',
      `--dir=${downloadDir}`,
    ];
    if (this.secret) {
      args.push(`--rpc-secret=${this.secret}`);
    }
    this.child = spawn('aria2c', args, {
      stdio: 'ignore',
      windowsHide: true,
    });
    this.startedByUs = true;
    this.child.on('exit', () => {
      this.child = null;
    });
  }

  attachExternalProcess(proc: ChildProcess): void {
    this.child = proc;
    this.startedByUs = false;
  }

  shutdown(): void {
    if (this.child && this.startedByUs) {
      try {
        this.child.kill();
      } catch {
        /* ignore */
      }
    }
    this.child = null;
  }

  async addUri(
    url: string,
    outDir: string,
    http?: HttpDownloadExtras,
  ): Promise<{ gid: string }> {
    const options: Record<string, unknown> = { dir: outDir };
    const headerList = buildAriaHttpHeaders(http);
    if (headerList.length > 0) {
      options.header = headerList;
    }
    const gid = await this.call<string>('addUri', [[url], options]);
    return { gid };
  }

  async purgeDownloadResult(): Promise<void> {
    await this.call('purgeDownloadResult', []);
  }

  async getTasksSnapshot(): Promise<DownloadTaskView[]> {
    const [active, waiting, stopped] = await Promise.all([
      this.call<unknown[]>('tellActive', []),
      this.call<unknown[]>('tellWaiting', [0, 200]),
      this.call<unknown[]>('tellStopped', [0, 48]),
    ]);
    const rows: DownloadTaskView[] = [];

    const pushRow = (raw: Record<string, unknown>) => {
      const st = String(raw.status ?? '');
      const mapped = mapAriaStatus(st);
      const total = parseNum(raw.totalLength);
      const done = parseNum(raw.completedLength);
      const spd = parseNum(raw.downloadSpeed);
      const err = String(raw.errorMessage ?? '').trim();
      let progress = 0;
      if (total > 0) progress = Math.min(100, (done / total) * 100);
      else if (mapped === 'complete') progress = 100;

      const uiStatus: AriaTaskStatus =
        mapped === 'error' || (err && st === 'error')
          ? 'error'
          : mapped === 'complete'
            ? 'complete'
            : mapped;

      rows.push({
        gid: String(raw.gid ?? ''),
        name: pickName(raw),
        url: pickUrl(raw),
        progress,
        speed: formatSpeed(spd),
        status: uiStatus,
        error: err || undefined,
        totalSize: total || undefined,
        downloadedSize: done,
        startTime: Date.now(),
      });
    };

    for (const arr of [active, waiting, stopped] as unknown[][]) {
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        if (item && typeof item === 'object') {
          pushRow(item as Record<string, unknown>);
        }
      }
    }

    const seen = new Set<string>();
    const dedup: DownloadTaskView[] = [];
    for (const r of rows) {
      if (!r.gid || seen.has(r.gid)) continue;
      seen.add(r.gid);
      dedup.push(r);
    }

    const rank = (s: AriaTaskStatus): number => {
      if (s === 'waiting') return 0;
      if (s === 'active') return 1;
      if (s === 'paused') return 2;
      if (s === 'complete') return 3;
      if (s === 'error') return 4;
      return 5;
    };
    dedup.sort((a, b) => rank(a.status) - rank(b.status));
    return dedup;
  }
}

export function defaultDownloadsDir(): string {
  const home = process.env.USERPROFILE || process.env.HOME || process.cwd();
  return path.join(home, 'Downloads');
}
