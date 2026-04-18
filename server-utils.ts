/**
 * Free TCP port detection and opening the UI in Chrome (or default browser on non-Windows).
 */
import net from 'net';
import { spawn } from 'child_process';

export function isTcpPortFree(port: number, host = '0.0.0.0'): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.listen(port, host, () => {
      server.close(() => resolve(true));
    });
  });
}

/** First free port in [startPort, startPort + maxAttempts). */
export async function findFreeTcpPort(
  startPort: number,
  maxAttempts = 150,
): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const p = startPort + i;
    if (await isTcpPortFree(p)) return p;
  }
  throw new Error(`No free TCP port in range ${startPort}-${startPort + maxAttempts - 1}`);
}

/** Open Google Chrome on Windows/macOS; elsewhere uses xdg-open. */
export function openChrome(url: string): void {
  try {
    if (process.platform === 'win32') {
      spawn('cmd', ['/c', 'start', 'chrome', url], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      }).unref();
      return;
    }
    if (process.platform === 'darwin') {
      spawn('open', ['-a', 'Google Chrome', url], {
        detached: true,
        stdio: 'ignore',
      }).unref();
      return;
    }
    spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
  } catch {
    console.warn('Could not open browser automatically. Open manually:', url);
  }
}

export function shouldOpenBrowser(): boolean {
  if (process.env.OPEN_BROWSER === '0' || process.env.OPEN_BROWSER === 'false') {
    return false;
  }
  if (process.env.NODE_ENV === 'production' && process.env.OPEN_BROWSER !== '1') {
    return false;
  }
  return true;
}
