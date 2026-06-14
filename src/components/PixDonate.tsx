import { useState } from 'react';

const PIX_KEY = 'f74458dc-2a36-49bd-9250-1cef4365ebb8';

export function PixDonate() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard
      ?.writeText(PIX_KEY)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };
  return (
    <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-4 text-center">
      <p className="text-sm font-semibold text-white">Apoie o AriaQueue 💜</p>
      <p className="mt-1 text-xs text-slate-400">
        Curtindo? Ajude com um Pix de qualquer valor.
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <code className="break-all rounded bg-black/30 px-2 py-1 text-[11px] text-slate-300">
          {PIX_KEY}
        </code>
        <button
          type="button"
          onClick={copy}
          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-500"
        >
          {copied ? 'Copiado!' : 'Copiar Pix'}
        </button>
      </div>
    </div>
  );
}
