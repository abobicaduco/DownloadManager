import { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  DownloadCloud,
  Folder,
  FolderInput,
  ListOrdered,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { DownloadTask } from '../types/download.ts';
import type { Lang } from '../i18n.ts';
import type { Strings } from '../i18n.ts';
import { labelStatus } from '../i18n.ts';

type Props = {
  s: Strings;
  lang: Lang;
  path: string;
  onPathChange: (v: string) => void;
  onUsePcDownloads: () => void;
  urlInput: string;
  onUrlChange: (v: string) => void;
  onSubmit: () => void;
  isAdding: boolean;
  activeDownloads: DownloadTask[];
  completedDownloads: DownloadTask[];
  referer: string;
  onRefererChange: (v: string) => void;
  userAgent: string;
  onUserAgentChange: (v: string) => void;
  cookie: string;
  onCookieChange: (v: string) => void;
  extraHeadersText: string;
  onExtraHeadersChange: (v: string) => void;
};

export function QueueView({
  s,
  lang,
  path,
  onPathChange,
  onUsePcDownloads,
  urlInput,
  onUrlChange,
  onSubmit,
  isAdding,
  activeDownloads,
  completedDownloads,
  referer,
  onRefererChange,
  userAgent,
  onUserAgentChange,
  cookie,
  onCookieChange,
  extraHeadersText,
  onExtraHeadersChange,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isPywebview =
    typeof window !== 'undefined' && !!window.pywebview?.api?.download_link;

  return (
    <div className="flex flex-col gap-6 min-h-0">
      <p className="text-sm text-slate-400 leading-relaxed">{s.bulkHint}</p>

      <div className="space-y-3 shrink-0">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {s.folderLabel}
        </label>
        <p className="text-[11px] text-slate-500 leading-snug">{s.folderHelpWeb}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3">
            <Folder size={18} className="text-sky-400/90 shrink-0" />
            <input
              value={path}
              onChange={(e) => onPathChange(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-slate-200 placeholder:text-slate-600"
              placeholder={s.folderPlaceholder}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            onClick={onUsePcDownloads}
            className="bg-emerald-600/25 hover:bg-emerald-600/35 border border-emerald-500/30 px-5 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-2 text-emerald-100 shrink-0 py-3 whitespace-nowrap"
          >
            <FolderInput size={16} />
            {s.usePcDownloads}
          </button>
        </div>

        <textarea
          placeholder={s.urlPlaceholder}
          value={urlInput}
          onChange={(e) => onUrlChange(e.target.value)}
          rows={4}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500/50 focus:bg-white/[0.06] outline-none transition-all resize-y min-h-[100px]"
        />

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:bg-white/[0.04] transition-colors"
          >
            <span>{s.advancedHttp}</span>
            {showAdvanced ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {showAdvanced ? (
            <div className="px-4 pb-4 pt-0 space-y-3 border-t border-white/[0.06]">
              <p className="text-[11px] text-slate-500 leading-relaxed pt-3">{s.advancedHttpHint}</p>
              {isPywebview ? (
                <p className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  {s.pywebviewNoHttp}
                </p>
              ) : null}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {s.refererLabel}
                </label>
                <input
                  value={referer}
                  onChange={(e) => onRefererChange(e.target.value)}
                  placeholder={s.refererPlaceholder}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600"
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {s.userAgentLabel}
                </label>
                <input
                  value={userAgent}
                  onChange={(e) => onUserAgentChange(e.target.value)}
                  placeholder={s.userAgentPlaceholder}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 font-mono text-[12px]"
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {s.cookieLabel}
                </label>
                <textarea
                  value={cookie}
                  onChange={(e) => onCookieChange(e.target.value)}
                  placeholder={s.cookiePlaceholder}
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 font-mono resize-y min-h-[72px]"
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {s.extraHeadersLabel}
                </label>
                <textarea
                  value={extraHeadersText}
                  onChange={(e) => onExtraHeadersChange(e.target.value)}
                  placeholder={s.extraHeadersPlaceholder}
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 font-mono resize-y min-h-[72px]"
                  spellCheck={false}
                />
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isAdding || !urlInput.trim()}
          className="w-full sm:w-auto bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 disabled:opacity-45 disabled:pointer-events-none px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-white shadow-lg shadow-sky-900/40"
        >
          {isAdding ? <Loader2 className="animate-spin" size={18} /> : <DownloadCloud size={18} />}
          {isAdding ? s.adding : s.addQueue}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0 max-h-[min(52vh,520px)]">
        {activeDownloads.length === 0 && completedDownloads.length === 0 && (
          <div className="min-h-[180px] flex flex-col items-center justify-center opacity-40 gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
            <Activity size={48} strokeWidth={1.25} />
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-center px-4">
              {s.emptyQueue}
            </p>
          </div>
        )}

        <AnimatePresence>
          {[...activeDownloads, ...completedDownloads].map((dl) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              key={dl.gid}
              className="glass-card p-4 rounded-xl flex flex-col gap-3 border border-white/[0.05]"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  {dl.status === 'complete' ? (
                    <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                  ) : dl.status === 'waiting' ? (
                    <ListOrdered className="text-amber-400/90 shrink-0 mt-0.5" size={20} />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-sky-400 border-t-transparent animate-spin shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-100 truncate" title={dl.name}>
                      {dl.name}
                    </p>
                    {dl.url ? (
                      <p className="text-[10px] text-slate-500 truncate mt-0.5" title={dl.url}>
                        {dl.url}
                      </p>
                    ) : null}
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-sky-400/90 shrink-0">
                  {dl.progress.toFixed(1)}%
                </span>
              </div>

              <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    dl.status === 'complete' ? 'bg-emerald-400' : 'bg-sky-500'
                  }`}
                  style={{ boxShadow: '0 0 12px rgba(56,189,248,0.35)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${dl.progress}%` }}
                  transition={{ ease: 'linear', duration: 0.35 }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                <span>{dl.speed}</span>
                <span
                  className={
                    dl.status === 'complete'
                      ? 'text-emerald-400/90'
                      : dl.status === 'waiting'
                        ? 'text-amber-400/90'
                        : 'text-sky-400/90'
                  }
                >
                  {labelStatus(lang, dl.status)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
