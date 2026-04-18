export interface DownloadTask {
  gid: string;
  name: string;
  url: string;
  progress: number;
  speed: string;
  status: 'active' | 'complete' | 'error' | 'waiting' | 'paused';
  error?: string;
}
