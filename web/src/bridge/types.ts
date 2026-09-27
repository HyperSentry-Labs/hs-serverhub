import type { ContentPayload, StatusSnapshot } from '../types/content';

export type NuiMessage =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'bootstrap'; payload: ContentPayload }
  | { type: 'contentUpdate'; payload: ContentPayload }
  | { type: 'statusUpdate'; payload: StatusSnapshot };

export type NuiMessageHandler = (message: NuiMessage) => void;

/**
 * Everything the UI needs from "the outside world", whether that's a real
 * FiveM client or the in-browser dev mock. Components never talk to
 * `window.fetch`, `SendNUIMessage`, or the mock's timers directly - only
 * through this interface.
 */
export interface ServerHubBridge {
  readonly isFiveM: boolean;
  /** Subscribe to messages pushed from the FiveM client (or the mock). Returns an unsubscribe function. */
  onMessage(handler: NuiMessageHandler): () => void;
  /** Tell the client the player closed the UI (Escape, close button, etc.). */
  close(): Promise<void>;
  /** Ask for a fresh content/status snapshot. */
  refresh(): Promise<void>;
}
