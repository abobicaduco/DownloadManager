export type Lang = 'en' | 'pt';

export const STR = {
  en: {
    brand: 'AriaQueue',
    tagline: 'Sequential downloads powered by aria2',
    queueTab: 'Queue',
    historyTab: 'Errors',
    folderLabel: 'Save folder',
    folderPlaceholder: 'Absolute path (e.g. C:\\Users\\you\\Downloads)',
    usePcDownloads: 'Use PC Downloads folder',
    folderHelpWeb:
      'The browser cannot open some Windows folders (e.g. Downloads) safely. Type the full path above or use the button — the path comes from the app running on your PC.',
    urlPlaceholder: 'Paste one or more URLs (one per line)',
    addQueue: 'Add to queue',
    adding: 'Adding…',
    emptyQueue: 'Nothing in the queue yet',
    emptyErrors: 'No errors',
    speed: 'Speed',
    status: 'Status',
    waiting: 'Queued',
    active: 'Downloading',
    paused: 'Paused',
    complete: 'Done',
    error: 'Error',
    clear: 'Clear finished',
    langShort: 'EN',
    bulkHint: 'Add several links — aria2 runs one download at a time; the rest wait in line.',
    pywebviewNote: '',
    connectionError: 'Connection error',
    addError: 'Could not add',
    backendOk: 'API & aria2',
    backendDown: 'Offline',
    backendCheck: '…',
    footerLine: 'Web app · React & TypeScript · aria2 backend',
    webAppBadge: 'Web',
    advancedHttp: 'HTTP options (protected hosts)',
    advancedHttpHint:
      'For CDNs / Cloudflare: paste Referer, Cookie (e.g. cf_clearance from DevTools), and optional User-Agent. Same values apply to every URL in the batch. Tokens expire — copy fresh from the browser.',
    refererLabel: 'Referer',
    refererPlaceholder: 'https://example.com/',
    userAgentLabel: 'User-Agent',
    userAgentPlaceholder: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ... Chrome/...',
    cookieLabel: 'Cookie header',
    cookiePlaceholder: 'cf_clearance=...; session=...',
    extraHeadersLabel: 'Extra headers (one per line)',
    extraHeadersPlaceholder: 'Accept: */*\nAccept-Language: en-US,en;q=0.9',
    pywebviewNoHttp:
      'Desktop shell (Python) does not send these headers yet — use npm run dev in the browser.',
  },
  pt: {
    brand: 'AriaQueue',
    tagline: 'Downloads sequenciais com aria2',
    queueTab: 'Fila',
    historyTab: 'Erros',
    folderLabel: 'Pasta de destino',
    folderPlaceholder: 'Caminho absoluto (ex.: C:\\Users\\voce\\Downloads)',
    usePcDownloads: 'Usar pasta Downloads do PC',
    folderHelpWeb:
      'O Chrome bloqueia o seletor de pastas em locais como Downloads. Digite o caminho completo ou use o botão — o servidor no seu PC informa o caminho correto.',
    urlPlaceholder: 'Cole uma ou mais URLs (uma por linha)',
    addQueue: 'Adicionar à fila',
    adding: 'Adicionando…',
    emptyQueue: 'Nada na fila ainda',
    emptyErrors: 'Sem erros',
    speed: 'Velocidade',
    status: 'Status',
    waiting: 'Na fila',
    active: 'Baixando',
    paused: 'Pausado',
    complete: 'Concluído',
    error: 'Erro',
    clear: 'Limpar finalizados',
    langShort: 'PT',
    bulkHint:
      'Várias URLs de uma vez — o aria2 mantém só um download ativo; os demais aguardam na fila.',
    pywebviewNote: '',
    connectionError: 'Erro de conexão',
    addError: 'Não foi possível adicionar',
    backendOk: 'API e aria2',
    backendDown: 'Offline',
    backendCheck: '…',
    footerLine: 'App web · React e TypeScript · backend aria2',
    webAppBadge: 'Web',
    advancedHttp: 'Opções HTTP (sites protegidos)',
    advancedHttpHint:
      'Para CDNs / Cloudflare: informe Referer, Cookie (ex.: cf_clearance do DevTools) e User-Agent opcional. Os mesmos valores valem para todas as URLs do lote. Tokens expiram — copie de novo do navegador.',
    refererLabel: 'Referer',
    refererPlaceholder: 'https://exemplo.com/',
    userAgentLabel: 'User-Agent',
    userAgentPlaceholder: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ... Chrome/...',
    cookieLabel: 'Cookie',
    cookiePlaceholder: 'cf_clearance=...; sessao=...',
    extraHeadersLabel: 'Headers extras (um por linha)',
    extraHeadersPlaceholder: 'Accept: */*\nAccept-Language: pt-BR,pt;q=0.9',
    pywebviewNoHttp:
      'O modo janela Python ainda não envia esses cabeçalhos — use npm run dev no navegador.',
  },
} as const;

export type Strings = (typeof STR)['en'];

export function t(lang: Lang): Strings {
  return STR[lang];
}

export function labelStatus(lang: Lang, status: string): string {
  const s = t(lang);
  switch (status) {
    case 'waiting':
      return s.waiting;
    case 'active':
      return s.active;
    case 'paused':
      return s.paused;
    case 'complete':
      return s.complete;
    case 'error':
      return s.error;
    default:
      return status;
  }
}
