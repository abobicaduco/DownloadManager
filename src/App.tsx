import React, { useState, useCallback, useEffect } from 'react';
import { ListOrdered, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { type Lang, t } from './i18n.ts';
import { useDownloadQueue } from './hooks/useDownloadQueue.ts';
import { useBackendHealth } from './hooks/useBackendHealth.ts';
import { WebHeader } from './components/WebHeader.tsx';
import { WebFooter } from './components/WebFooter.tsx';
import { PixDonate } from './components/PixDonate.tsx';
import { QueueView } from './components/QueueView.tsx';
import { ErrorsView } from './components/ErrorsView.tsx';
import type { HttpDownloadExtras } from './types/http-download.ts';

function buildHttpExtras(f: {
  referer: string;
  userAgent: string;
  cookie: string;
  extraHeadersText: string;
}): HttpDownloadExtras | undefined {
  const extraLines = f.extraHeadersText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.includes(':'));
  const out: HttpDownloadExtras = {};
  if (f.referer.trim()) out.referer = f.referer.trim();
  if (f.userAgent.trim()) out.userAgent = f.userAgent.trim();
  if (f.cookie.trim()) out.cookie = f.cookie.trim();
  if (extraLines.length) out.extraHeaders = extraLines;
  if (!out.referer && !out.userAgent && !out.cookie && !out.extraHeaders?.length) return undefined;
  return out;
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const n = navigator.language.toLowerCase();
      return n.startsWith('pt') ? 'pt' : 'en';
    } catch {
      return 'en';
    }
  });
  const s = t(lang);
  const health = useBackendHealth();

  const [urlInput, setUrlInput] = useState('');
  const [path, setPath] = useState('');
  const [referer, setReferer] = useState('');
  const [userAgent, setUserAgent] = useState('');
  const [cookie, setCookie] = useState('');
  const [extraHeadersText, setExtraHeadersText] = useState('');
  const [serverDownloadsPath, setServerDownloadsPath] = useState<string | null>(null);
  const [tab, setTab] = useState<'dl' | 'hist'>('dl');
  const [isAdding, setIsAdding] = useState(false);

  const { downloads, addUrls, clearFinished } = useDownloadQueue();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/api/paths');
        if (!r.ok || cancelled) return;
        const j = (await r.json()) as { downloads?: string };
        if (!j.downloads) return;
        setServerDownloadsPath(j.downloads);
        setPath((prev) => (prev.trim() === '' ? j.downloads! : prev));
      } catch {
        /* offline */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyPcDownloads = useCallback(async () => {
    if (serverDownloadsPath) {
      setPath(serverDownloadsPath);
      return;
    }
    try {
      const r = await fetch('/api/paths');
      if (!r.ok) return;
      const j = (await r.json()) as { downloads?: string };
      if (j.downloads) {
        setServerDownloadsPath(j.downloads);
        setPath(j.downloads);
      }
    } catch {
      /* ignore */
    }
  }, [serverDownloadsPath]);

  const activeDownloads = downloads.filter(
    (d) => d.status !== 'error' && d.status !== 'complete',
  );
  const completedDownloads = downloads.filter((d) => d.status === 'complete');
  const errorDownloads = downloads.filter((d) => d.status === 'error');

  const submitQueue = useCallback(async () => {
    const lines = urlInput
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    setIsAdding(true);
    try {
      const httpExtras = buildHttpExtras({
        referer,
        userAgent,
        cookie,
        extraHeadersText,
      });
      await addUrls(lines, path, httpExtras);
      setUrlInput('');
    } catch (error) {
      console.error(s.connectionError, error);
    } finally {
      setIsAdding(false);
    }
  }, [
    urlInput,
    path,
    referer,
    userAgent,
    cookie,
    extraHeadersText,
    addUrls,
    s.connectionError,
  ]);

  const toggleLang = () => setLang((l) => (l === 'en' ? 'pt' : 'en'));

  return (
    <div className="min-h-screen w-full font-sans relative text-white">
      <div
        className="fixed inset-0 bg-gradient-to-br from-[#070a18] via-[#0d1028] to-[#14082a]"
        aria-hidden
      />
      <div
        className="fixed inset-0 opacity-[0.4] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(56,189,248,0.22),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(167,139,250,0.18),transparent)]"
        aria-hidden
      />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.03%22/%3E%3C/svg%3E')] opacity-60 pointer-events-none"
        aria-hidden
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-16">
        <div className="rounded-3xl bg-[#0f1219]/80 backdrop-blur-xl border border-white/[0.09] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.75)] px-5 sm:px-8 py-8 sm:py-10">
          <WebHeader s={s} lang={lang} onToggleLang={toggleLang} health={health} />

          <nav className="flex border-b border-white/[0.06] mt-2 mb-8 -mx-1">
            <button
              type="button"
              onClick={() => setTab('dl')}
              className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative flex items-center justify-center gap-2 rounded-t-lg ${
                tab === 'dl' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <ListOrdered size={15} />
              {s.queueTab}
              {tab === 'dl' && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-sky-500 to-violet-500 rounded-full"
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => setTab('hist')}
              className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative flex items-center justify-center gap-2 rounded-t-lg ${
                tab === 'hist' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <History size={15} />
              {s.historyTab}
              {tab === 'hist' && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full"
                />
              )}
            </button>
          </nav>

          <AnimatePresence mode="wait">
            {tab === 'dl' ? (
              <motion.div
                key="dl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <QueueView
                  s={s}
                  lang={lang}
                  path={path}
                  onPathChange={setPath}
                  onUsePcDownloads={applyPcDownloads}
                  urlInput={urlInput}
                  onUrlChange={setUrlInput}
                  onSubmit={submitQueue}
                  isAdding={isAdding}
                  activeDownloads={activeDownloads}
                  completedDownloads={completedDownloads}
                  referer={referer}
                  onRefererChange={setReferer}
                  userAgent={userAgent}
                  onUserAgentChange={setUserAgent}
                  cookie={cookie}
                  onCookieChange={setCookie}
                  extraHeadersText={extraHeadersText}
                  onExtraHeadersChange={setExtraHeadersText}
                />
              </motion.div>
            ) : (
              <motion.div
                key="hist"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ErrorsView s={s} errors={errorDownloads} onClear={clearFinished} />
              </motion.div>
            )}
          </AnimatePresence>

          <PixDonate />
          <WebFooter s={s} />
        </div>
      </div>
    </div>
  );
}
