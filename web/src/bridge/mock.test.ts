import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockBridge } from './mock';
import type { NuiMessage } from './types';

describe('createMockBridge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is flagged as not running inside FiveM', () => {
    expect(createMockBridge().isFiveM).toBe(false);
  });

  it('emits open, then bootstrap, then an initial statusUpdate', () => {
    const bridge = createMockBridge();
    const received: NuiMessage['type'][] = [];
    bridge.onMessage((msg) => received.push(msg.type));

    vi.advanceTimersByTime(100);

    expect(received).toEqual(['open', 'bootstrap', 'statusUpdate']);
  });

  it('stops notifying a handler after it unsubscribes', () => {
    const bridge = createMockBridge();
    const received: NuiMessage['type'][] = [];
    const unsubscribe = bridge.onMessage((msg) => received.push(msg.type));

    vi.advanceTimersByTime(30); // only the 'open' + 'bootstrap' messages so far
    unsubscribe();
    vi.advanceTimersByTime(1000);

    expect(received).toEqual(['open', 'bootstrap']);
  });

  it('refresh() emits a fresh contentUpdate and statusUpdate', async () => {
    const bridge = createMockBridge();
    const received: NuiMessage['type'][] = [];
    bridge.onMessage((msg) => received.push(msg.type));
    vi.advanceTimersByTime(100);
    received.length = 0;

    await bridge.refresh();

    expect(received).toEqual(['contentUpdate', 'statusUpdate']);
  });
});
