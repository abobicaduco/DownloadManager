import { useState, useEffect, useCallback } from 'react';
import type { DownloadTask } from '../types/download.ts';
import type { HttpDownloadExtras } from '../types/http-download.ts';

export function useDownloadQueue(pollMs = 900) {
  const [downloads, setDownloads] = useState<DownloadTask[]>([]);

  const fetchQueue = useCallback(async () => {
    try {
      if (window.pywebview?.api?.get_queue) {
        const list = (await window.pywebview.api.get_queue()) as DownloadTask[];
        setDownloads(Array.isArray(list) ? list : []);
        return;
      }
      const response = await fetch('/api/queue');
      if (!response.ok) return;
      const list = (await response.json()) as DownloadTask[];
      setDownloads(Array.isArray(list) ? list : []);
    } catch {
      /* backend starting */
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchQueue, pollMs);
    return () => clearInterval(interval);
  }, [fetchQueue, pollMs]);

  const addUrls = useCallback(
    async (
      lines: string[],
      folder: string,
      http?: HttpDownloadExtras,
    ): Promise<{ ok: boolean }> => {
      if (lines.length === 0) return { ok: false };

      if (window.pywebview?.api?.download_link) {
        for (const url of lines) {
          const res = (await window.pywebview.api.download_link(url, folder)) as {
            status?: string;
            message?: string;
          };
          if (res.status !== 'success') {
            console.error('download_link failed', url, res.message);
          }
        }
        await fetchQueue();
        return { ok: true };
      }

      const bodyBase: Record<string, unknown> = { folder };
      if (http?.referer) bodyBase.referer = http.referer;
      if (http?.userAgent) bodyBase.userAgent = http.userAgent;
      if (http?.cookie) bodyBase.cookie = http.cookie;
      if (http?.extraHeaders?.length) bodyBase.extraHeaders = http.extraHeaders;

      for (const url of lines) {
        const response = await fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...bodyBase, url }),
        });
        const res = (await response.json()) as { status?: string };
        if (!response.ok || res.status !== 'success') {
          console.error('enqueue failed', url, res);
        }
      }
      await fetchQueue();
      return { ok: true };
    },
    [fetchQueue],
  );

  const clearFinished = useCallback(async () => {
    if (window.pywebview?.api?.clear_history) {
      await window.pywebview.api.clear_history();
    } else {
      await fetch('/api/clear-history', { method: 'POST' });
    }
    await fetchQueue();
  }, [fetchQueue]);

  return { downloads, fetchQueue, addUrls, clearFinished };
}
