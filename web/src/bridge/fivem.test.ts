import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFiveMBridge, postCallback } from './fivem';
import type { NuiMessage } from './types';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('postCallback', () => {
  it('resolves ok on a successful callback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    expect(await postCallback('close')).toEqual({ ok: true });
  });

  it('never throws on a network failure', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')));
    expect(await postCallback('refresh')).toEqual({ ok: false, reason: 'network' });
  });

  it('reports an HTTP error status', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    expect(await postCallback('close')).toEqual({ ok: false, reason: 'http' });
  });

  it('never hangs: a callback that does not answer times out', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      })),
    );
    const pending = postCallback('close', {}, 1000);
    await vi.advanceTimersByTimeAsync(1000);
    expect(await pending).toEqual({ ok: false, reason: 'timeout' });
  });

  it('posts to https://<resource>/<callback>', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('GetParentResourceName', () => 'hs-serverhub');
    (window as unknown as { GetParentResourceName: () => string }).GetParentResourceName = () => 'hs-serverhub';
    await postCallback('close');
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://hs-serverhub/close');
  });
});

describe('createFiveMBridge', () => {
  it('forwards only well-formed ServerHub messages', () => {
    const bridge = createFiveMBridge();
    const received: NuiMessage[] = [];
    const off = bridge.onMessage((m) => received.push(m));
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'open' } }));
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'somethingElse' } }));
    window.dispatchEvent(new MessageEvent('message', { data: 'a string' }));
    window.dispatchEvent(new MessageEvent('message', { data: null }));
    off();
    window.dispatchEvent(new MessageEvent('message', { data: { type: 'close' } }));
    expect(received).toEqual([{ type: 'open' }]);
  });
});
