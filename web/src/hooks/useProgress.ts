import { useCallback, useMemo, useState } from 'react';
import { loadProgress, saveProgress } from '../lib/progress';

export interface ProgressApi {
  completed: ReadonlySet<string>;
  toggle: (id: string) => void;
  reset: () => void;
}

/**
 * Getting-started completion. Player-marked and device-local: ServerHub
 * cannot observe whether a step was really done, so it only ever records
 * what the player ticks themselves.
 */
export function useProgress(): ProgressApi {
  const [ids, setIds] = useState<string[]>(() => loadProgress());

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveProgress(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setIds([]);
    saveProgress([]);
  }, []);

  const completed = useMemo(() => new Set(ids), [ids]);
  return useMemo(() => ({ completed, toggle, reset }), [completed, toggle, reset]);
}
