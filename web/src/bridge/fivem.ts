import type { NuiMessage, NuiMessageHandler, ServerHubBridge } from './types';

declare global {
  interface Window {
    invokeNative?: (...args: unknown[]) => unknown;
    GetParentResourceName?: () => string;
  }
}

function getParentResourceName(): string {
  try {
    return window.GetParentResourceName ? window.GetParentResourceName() : 'hs-serverhub';
  } catch {
    return 'hs-serverhub';
  }
}

/** Fire-and-forget POST to a client.lua NUI callback. Never throws. */
async function post(callbackName: string, body: unknown = {}): Promise<void> {
  try {
    await fetch(`https://${getParentResourceName()}/${callbackName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(body),
    });
  } catch {
    // The NUI callback endpoint can be briefly unavailable during a resource
    // restart. ServerHub degrades silently rather than throwing in the UI -
    // see the error-handling philosophy in the README.
  }
}

export function createFiveMBridge(): ServerHubBridge {
  return {
    isFiveM: true,

    onMessage(handler: NuiMessageHandler) {
      const listener = (event: MessageEvent<NuiMessage>) => {
        if (event.data && typeof event.data.type === 'string') {
          handler(event.data);
        }
      };
      window.addEventListener('message', listener);
      return () => window.removeEventListener('message', listener);
    },

    async close() {
      await post('close');
    },

    async refresh() {
      await post('refresh');
    },
  };
}
