import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DownloadTask {
  gid: string;
  name: string;
  url: string;
  progress: number;
  speed: string;
  status: 'active' | 'complete' | 'error' | 'waiting';
  error?: string;
  totalSize?: number;
  downloadedSize: number;
  startTime: number;
}

const downloads: Map<string, DownloadTask> = new Map();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/download', async (req, res) => {
    const { url, folder } = req.body;
    if (!url) {
      return res.status(400).json({ status: 'error', message: 'URL is required' });
    }

    const gid = Math.random().toString(36).substring(2, 15);
    const name = url.split('/').pop()?.split('?')[0] || 'unknown_file';
    
    const task: DownloadTask = {
      gid,
      name,
      url,
      progress: 0,
      speed: '0 B/s',
      status: 'waiting',
      downloadedSize: 0,
      startTime: Date.now(),
    };

    downloads.set(gid, task);

    // Start download process (async)
    handleDownload(gid);

    res.json({ status: 'success', gid });
  });

  app.get('/api/queue', (req, res) => {
    res.json(Array.from(downloads.values()));
  });

  app.post('/api/clear-history', (req, res) => {
    for (const [gid, task] of downloads.entries()) {
      if (task.status === 'complete' || task.status === 'error') {
        downloads.delete(gid);
      }
    }
    res.json({ status: 'success' });
  });

  async function handleDownload(gid: string) {
    const task = downloads.get(gid);
    if (!task) return;

    try {
      task.status = 'active';
      const response = await axios({
        method: 'get',
        url: task.url,
        responseType: 'stream',
        timeout: 30000,
      });

      const totalLength = parseInt(response.headers['content-length'] || '0', 10);
      task.totalSize = totalLength;

      let downloaded = 0;
      let lastUpdate = Date.now();
      let lastDownloaded = 0;

      response.data.on('data', (chunk: Buffer) => {
        downloaded += chunk.length;
        task.downloadedSize = downloaded;
        
        if (totalLength > 0) {
          task.progress = (downloaded / totalLength) * 100;
        }

        const now = Date.now();
        const duration = (now - lastUpdate) / 1000;
        if (duration >= 1) {
          const speed = (downloaded - lastDownloaded) / duration;
          task.speed = formatSpeed(speed);
          lastUpdate = now;
          lastDownloaded = downloaded;
        }
      });

      response.data.on('end', () => {
        task.progress = 100;
        task.status = 'complete';
        task.speed = '0 B/s';
      });

      response.data.on('error', (err: Error) => {
        task.status = 'error';
        task.error = err.message;
      });

    } catch (error: any) {
      task.status = 'error';
      task.error = error.message;
    }
  }

  function formatSpeed(bytesPerSecond: number): string {
    if (bytesPerSecond === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
