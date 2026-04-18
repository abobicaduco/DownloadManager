import type { Strings } from '../i18n.ts';

export function WebFooter({ s }: { s: Strings }) {
  return (
    <footer className="mt-8 pt-6 border-t border-white/[0.06] text-center">
      <p className="text-[11px] text-slate-500 font-medium">{s.footerLine}</p>
    </footer>
  );
}
