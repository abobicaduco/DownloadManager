import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { Aria2Rpc, defaultDownloadsDir, type DownloadTaskView } from './aria2-rpc.ts';
import { parseExtrasFromJsonBody } from './shared-http-headers.ts';
import {
  findFreeTcpPort,
  isTcpPortFree,
  openChrome,
  shouldOpenBrowser,
} from './server-utils.ts';

dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARIA2_RPC_SECRET = process.env.ARIA2_RPC_SECRET ?? '';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Prefer existing aria2 on env port; otherwise first free port from that base. */
async function resolveAria2RpcPort(): Promise<number> {
  const preferred = Number(process.env.ARIA2_RPC_PORT) || 6800;
  const probe = new Aria2Rpc({ port: preferred, secret: ARIA2_RPC_SECRET });
  try {
    await probe.call('getVersion', []);
    return preferred;
  } catch {
    /* no daemon on preferred */
  }
  for (let p = preferred; p < preferred + 120; p++) {
    if (await isTcpPortFree(p)) return p;
  }
  throw new Error(
    `No free TCP port for aria2 RPC near ${preferred}. Set ARIA2_RPC_PORT in .env.`,
  );
}

async function ensureAria2(aria2: Aria2Rpc, downloadDir: string): Promise<void> {
  for (let i = 0; i < 5; i++) {
    try {
      await aria2.call('getVersion', []);
      return;
    } catch {
      if (i === 0) {
        fs.mkdirSync(downloadDir, { recursive: true });
        aria2.spawnDaemon(downloadDir);
      }
      await sleep(400 * (i + 1));
    }
  }
  throw new Error(
    'Could not connect to aria2. Install aria2 and ensure aria2c is on PATH: https://github.com/aria2/aria2/releases',
  );
}

async function startServer() {
  const app = express();
  const defaultDir = process.env.DOWNLOAD_DIR
    ? path.resolve(process.env.DOWNLOAD_DIR)
    : defaultDownloadsDir();

  const rpcPort = await resolveAria2RpcPort();
  const aria2 = new Aria2Rpc({ port: rpcPort, secret: ARIA2_RPC_SECRET });

  try {
    await ensureAria2(aria2, defaultDir);
  } catch (e) {
    console.error(e);
  }

  const httpStartPort = Number(process.env.PORT) || 3000;
  const httpPort = await findFreeTcpPort(httpStartPort);

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/paths', (_req, res) => {
    const downloads = defaultDir;
    res.json({
      downloads,
      /** Same folder used when the UI sends an empty path. */
      defaultSave: downloads,
    });
  });

  app.get('/api/health', async (_req, res) => {
    try {
      await aria2.call('getVersion', []);
      res.json({ ok: true, aria2: true, port: rpcPort, httpPort });
    } catch {
      res.status(503).json({ ok: false, aria2: false });
    }
  });

  app.post('/api/download', async (req, res) => {
    const url = String(req.body?.url ?? '').trim();
    const folder = String(req.body?.folder ?? '').trim();
    if (!url) {
      return res.status(400).json({ status: 'error', message: 'URL is required' });
    }
    const outDir = folder ? path.resolve(folder) : defaultDir;
    const httpExtras = parseExtrasFromJsonBody(req.body);
    try {
      fs.mkdirSync(outDir, { recursive: true });
      const { gid } = await aria2.addUri(url, outDir, httpExtras);
      res.json({ status: 'success', gid });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ status: 'error', message: msg });
    }
  });

  app.get('/api/queue', async (_req, res) => {
    try {
      const tasks: DownloadTaskView[] = await aria2.getTasksSnapshot();
      res.json(tasks);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/clear-history', async (_req, res) => {
    try {
      await aria2.purgeDownloadResult();
      res.json({ status: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ status: 'error', message: msg });
    }
  });

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

  const publicUrl = `http://localhost:${httpPort}`;

  const server = app.listen(httpPort, '0.0.0.0', () => {
    console.log(`AriaQueue UI: ${publicUrl}`);
    console.log(`aria2 RPC: 127.0.0.1:${rpcPort} (max 1 active download — queue)`);
    if (httpStartPort !== httpPort) {
      console.log(`(Port ${httpStartPort} was busy — using ${httpPort})`);
    }
    if (shouldOpenBrowser()) {
      openChrome(publicUrl);
    }
  });

  const shutdown = () => {
    aria2.shutdown();
    server.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
