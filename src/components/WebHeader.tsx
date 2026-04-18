import { DownloadCloud, Languages, Minus, X } from 'lucide-react';
import type { Lang, Strings } from '../i18n.ts';
import type { HealthState } from '../hooks/useBackendHealth.ts';

type Props = {
  s: Strings;
  lang: Lang;
  onToggleLang: () => void;
  health: HealthState;
};

function healthLabel(s: Strings, h: HealthState): string {
  if (h === 'ok') return s.backendOk;
  if (h === 'down') return s.backendDown;
  return s.backendCheck;
}

function healthClass(h: HealthState): string {
  if (h === 'ok') return 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]';
  if (h === 'down') return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]';
  return 'bg-amber-400 animate-pulse';
}

export function WebHeader({ s, lang, onToggleLang, health }: Props) {
  const desktopShell =
    typeof window !== 'undefined' && !!window.pywebview?.api?.minimize_app;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-white/[0.08] pb-6">
      <div className="flex items-start gap-4 min-w-0">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500/25 to-violet-500/20 border border-white/10 shadow-lg">
          <DownloadCloud className="text-sky-300" size={28} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{s.brand}</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/10 text-sky-200/90 border border-white/10">
              {s.webAppBadge}
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-xl">{s.tagline}</p>
          <div className="flex items-center gap-2 pt-1">
            <span
              className={`inline-block h-2 w-2 rounded-full ${healthClass(health)}`}
              title={healthLabel(s, health)}
              aria-hidden
            />
            <span className="text-[11px] text-slate-500 font-medium">{healthLabel(s, health)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
        <button
          type="button"
          onClick={onToggleLang}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-300 bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] transition-colors"
          title={lang === 'en' ? 'Português' : 'English'}
        >
          <Languages size={16} />
          {s.langShort}
        </button>
        {desktopShell ? (
          <>
            <button
              type="button"
              onClick={() => window.pywebview?.api?.minimize_app?.()}
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
              aria-label="Minimize"
            >
              <Minus size={18} />
            </button>
            <button
              type="button"
              onClick={() => window.pywebview?.api?.close_app?.()}
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-red-500/90 border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
