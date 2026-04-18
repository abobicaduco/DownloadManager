/** Mirrors server `HttpDownloadExtras` for POST /api/download */
export type HttpDownloadExtras = {
  referer?: string;
  userAgent?: string;
  cookie?: string;
  extraHeaders?: string[];
};
