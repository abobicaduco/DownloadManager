/**
 * Pure helpers for HTTP extras → aria2 `header` option (array of "Name: value").
 * Shared by server / aria2-rpc — keep dependency-free for tooling.
 */
export type HttpDownloadExtras = {
  referer?: string;
  userAgent?: string;
  cookie?: string;
  /** Each entry must look like "Header-Name: value" */
  extraHeaders?: string[];
};

const MAX_RAW = 48 * 1024;

export function buildAriaHttpHeaders(extras: HttpDownloadExtras | undefined): string[] {
  if (!extras) return [];
  const headers: string[] = [];

  const ua = extras.userAgent?.trim();
  if (ua) headers.push(`User-Agent: ${ua}`);

  const ref = extras.referer?.trim();
  if (ref) headers.push(`Referer: ${ref}`);

  const ck = extras.cookie?.trim();
  if (ck) headers.push(`Cookie: ${ck}`);

  for (const line of extras.extraHeaders ?? []) {
    const t = line.trim();
    if (t.includes(':')) headers.push(t);
  }

  const joined = headers.join('\n');
  if (joined.length > MAX_RAW) {
    throw new Error(`HTTP header/cookie block exceeds ${MAX_RAW} bytes`);
  }
  return headers;
}

export function parseExtrasFromJsonBody(body: unknown): HttpDownloadExtras {
  if (!body || typeof body !== 'object') return {};
  const b = body as Record<string, unknown>;

  const referer = String(b.referer ?? '').trim();
  const userAgent = String(b.userAgent ?? '').trim();
  const cookie = String(b.cookie ?? '').trim();

  let extraHeaders: string[] = [];
  if (Array.isArray(b.extraHeaders)) {
    extraHeaders = b.extraHeaders.map((x) => String(x).trim()).filter(Boolean);
  } else if (typeof b.extraHeaders === 'string') {
    extraHeaders = b.extraHeaders
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const out: HttpDownloadExtras = {};
  if (referer) out.referer = referer;
  if (userAgent) out.userAgent = userAgent;
  if (cookie) out.cookie = cookie;
  if (extraHeaders.length) out.extraHeaders = extraHeaders;
  return out;
}
