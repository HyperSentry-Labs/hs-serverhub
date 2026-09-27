import type { ServerHubBridge } from './types';
import { createFiveMBridge } from './fivem';
import { createMockBridge } from './mock';

export type { ServerHubBridge, NuiMessage, NuiMessageHandler } from './types';

/**
 * The standard FiveM NUI detection: `window.invokeNative` only exists
 * inside the CEF runtime. A plain browser tab never has it.
 */
export function isFiveMEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof window.invokeNative === 'function';
}

let cachedBridge: ServerHubBridge | null = null;

export function getBridge(): ServerHubBridge {
  if (!cachedBridge) {
    cachedBridge = isFiveMEnvironment() ? createFiveMBridge() : createMockBridge();
  }
  return cachedBridge;
}
