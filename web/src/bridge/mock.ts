import type { NuiMessage, NuiMessageHandler, ServerHubBridge } from './types';
import { getFixture } from '../mock/fixtures';

/**
 * Simulates the FiveM client for `npm run dev`. Emits the same message
 * sequence a real session would (open -> bootstrap -> statusUpdate) using
 * demo data for a fictional server, so every page can be built and reviewed
 * without launching GTA V. See docs/development.md#browser-mode.
 *
 * Pick a representative data set with `?fixture=` (default, empty, minimal,
 * long, many, rtl), e.g. http://localhost:5173/?fixture=rtl
 */
export function createMockBridge(search: string = typeof window === 'undefined' ? '' : window.location.search): ServerHubBridge {
  const fixture = getFixture(new URLSearchParams(search).get('fixture'));
  const handlers = new Set<NuiMessageHandler>();
  const emit = (message: NuiMessage) => handlers.forEach((h) => h(message));

  setTimeout(() => emit({ type: 'open' }), 0);
  setTimeout(() => emit({ type: 'bootstrap', payload: fixture.content }), 30);
  if (fixture.status) {
    const status = fixture.status;
    setTimeout(() => emit({ type: 'statusUpdate', payload: status }), 60);
  }

  // Gentle live-looking fluctuation so the status card doesn't look frozen
  // during a demo, without implying real infrastructure.
  const interval = fixture.status
    ? setInterval(() => {
        const base = fixture.status!;
        const drift = Math.floor(Math.random() * 5) - 2;
        const online = Math.max(0, Math.min(base.max, base.online + drift));
        emit({
          type: 'statusUpdate',
          payload: { ...base, online, uptimeSeconds: (base.uptimeSeconds ?? 0) + 8 },
        });
      }, 8000)
    : undefined;

  if (interval !== undefined && import.meta.hot) {
    import.meta.hot.dispose(() => clearInterval(interval));
  }

  return {
    isFiveM: false,

    onMessage(handler: NuiMessageHandler) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },

    async close() {
      console.info('[hs-serverhub mock] close() called - in FiveM this releases NUI focus.');
    },

    async refresh() {
      emit({ type: 'contentUpdate', payload: fixture.content });
      if (fixture.status) emit({ type: 'statusUpdate', payload: fixture.status });
    },
  };
}
