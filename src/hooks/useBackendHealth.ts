import { useState, useEffect, useCallback } from 'react';

export type HealthState = 'checking' | 'ok' | 'down';

export function useBackendHealth(intervalMs = 4000): HealthState {
  const [state, setState] = useState<HealthState>('checking');

  const ping = useCallback(async () => {
    try {
      const r = await fetch('/api/health');
      const j = (await r.json()) as { ok?: boolean };
      setState(r.ok && j.ok ? 'ok' : 'down');
    } catch {
      setState('down');
    }
  }, []);

  useEffect(() => {
    void ping();
    const id = setInterval(ping, intervalMs);
    return () => clearInterval(id);
  }, [ping, intervalMs]);

  return state;
}
