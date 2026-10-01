import type { NuiCallbackName, NuiCallbackResult, NuiMessage, NuiMessageHandler, ServerHubBridge } from './types';

declare global {
  interface Window {
    invokeNative?: (...args: unknown[]) => unknown;
    GetParentResourceName?: () => string;
  }
}

/** A NUI callback that has not answered in this long is treated as failed. */
export const CALLBACK_TIMEOUT_MS = 4000;

const MESSAGE_TYPES: readonly string[] = ['open', 'close', 'bootstrap', 'contentUpdate', 'statusUpdate'];

function getParentResourceName(): string {
  try {
    return window.GetParentResourceName ? window.GetParentResourceName() : 'hs-serverhub';
  } catch {
    return 'hs-serverhub';
  }
}

/**
 * POSTs to a client.lua NUI callback. This is the ONLY place the UI calls
 * `fetch`. It never throws and never hangs: a timeout or network failure
 * resolves with `{ ok: false, reason }` so callers can ignore or react.
 * Failures are logged once at warn level (rare - callbacks are user
 * initiated, never per tick); success is silent.
 */
export async function postCallback(
  name: NuiCallbackName,
  body: unknown = {},
  timeoutMs: number = CALLBACK_TIMEOUT_MS,
): Promise<NuiCallbackResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`https://${getParentResourceName()}/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.warn(`[hs-serverhub] NUI callback "${name}" returned HTTP ${response.status}`);
      return { ok: false, reason: 'http' };
    }
    return { ok: true };
  } catch (error) {
    const timedOut = controller.signal.aborted;
    // The endpoint can be briefly unavailable during a resource restart.
    console.warn(
      `[hs-serverhub] NUI callback "${name}" ${timedOut ? 'timed out' : 'failed'}` +
        (timedOut ? '' : `: ${error instanceof Error ? error.message : String(error)}`),
    );
    return { ok: false, reason: timedOut ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}

function isNuiMessage(data: unknown): data is NuiMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as { type?: unknown }).type === 'string' &&
    MESSAGE_TYPES.includes((data as { type: string }).type)
  );
}

export function createFiveMBridge(): ServerHubBridge {
  return {
    isFiveM: true,

    onMessage(handler: NuiMessageHandler) {
      const listener = (event: MessageEvent<unknown>) => {
        // Messages from other NUI sources (or malformed ones) are ignored.
        if (isNuiMessage(event.data)) handler(event.data);
      };
      window.addEventListener('message', listener);
      return () => window.removeEventListener('message', listener);
    },

    async close() {
      await postCallback('close');
    },

    async refresh() {
      await postCallback('refresh');
    },
  };
}
