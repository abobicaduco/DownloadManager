import { AlertCircle, History, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { DownloadTask } from '../types/download.ts';
import type { Strings } from '../i18n.ts';

type Props = {
  s: Strings;
  errors: DownloadTask[];
  onClear: () => void;
};

export function ErrorsView({ s, errors, onClear }: Props) {
  return (
    <div className="flex flex-col gap-4 min-h-0">
      <div className="flex justify-between items-center px-1 shrink-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {s.historyTab}
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] font-bold text-rose-400/90 hover:text-rose-300 transition-colors flex items-center gap-1.5 uppercase tracking-widest"
        >
          <Trash2 size={12} />
          {s.clear}
        </button>
      </div>
      <div className="flex-1 bg-black/25 border border-white/[0.05] rounded-xl p-4 overflow-y-auto space-y-3 min-h-0 max-h-[min(52vh,520px)]">
        {errors.length === 0 && (
          <div className="min-h-[140px] flex flex-col items-center justify-center opacity-35 gap-3">
            <History size={44} strokeWidth={1.25} />
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-center px-4">
              {s.emptyErrors}
            </p>
          </div>
        )}
        {errors.map((err) => (
          <motion.div
            key={err.gid}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-500/[0.07] border border-rose-500/20 rounded-xl flex gap-4"
          >
            <AlertCircle className="text-rose-400 shrink-0" size={20} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-rose-200/90 truncate">{err.name}</p>
              <p className="text-xs text-rose-300/70 mt-1 break-words">{err.error || '—'}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
