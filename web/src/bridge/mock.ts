import type { NuiMessage, NuiMessageHandler, ServerHubBridge } from './types';
import { demoContent, demoStatus } from '../mock/demoContent';

/**
 * Simulates the FiveM client for `npm run dev`. Emits the same message
 * sequence a real session would (open -> bootstrap -> occasional
 * statusUpdate) using demo data, so every page can be built and reviewed
 * without launching GTA V. See docs/development.md#browser-mode.
 */
export function createMockBridge(): ServerHubBridge {
  const handlers = new Set<NuiMessageHandler>();
  const emit = (message: NuiMessage) => handlers.forEach((h) => h(message));

  // Simulate the real open -> bootstrap -> statusUpdate sequence.
  setTimeout(() => emit({ type: 'open' }), 0);
  setTimeout(() => emit({ type: 'bootstrap', payload: demoContent }), 30);
  setTimeout(() => emit({ type: 'statusUpdate', payload: demoStatus }), 60);

  // Gentle live-looking fluctuation so the Overview page's status card
  // doesn't look frozen during a demo, without implying real infrastructure.
  const interval = setInterval(() => {
    const drift = Math.floor(Math.random() * 5) - 2;
    const online = Math.max(0, Math.min(demoStatus.max, demoStatus.online + drift));
    emit({
      type: 'statusUpdate',
      payload: { ...demoStatus, online, uptimeSeconds: (demoStatus.uptimeSeconds ?? 0) + 8 },
    });
  }, 8000);

  if (import.meta.hot) {
    import.meta.hot.dispose(() => clearInterval(interval));
  }

  return {
    isFiveM: false,

    onMessage(handler: NuiMessageHandler) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },

    async close() {
      // eslint-disable-next-line no-console
      console.info('[hs-serverhub mock] close() called - in FiveM this releases NUI focus.');
    },

    async refresh() {
      emit({ type: 'contentUpdate', payload: demoContent });
      emit({ type: 'statusUpdate', payload: demoStatus });
    },
  };
}
