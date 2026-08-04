// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LogEvent } from '../../src/lib/logger/types';
import { createRemoteTransport } from '../../src/lib/logger/transports/remoteTransport';

function makeEvent(index: number): LogEvent {
  return {
    type: 'battle.start',
    level: 'info',
    ts: new Date().toISOString(),
    userId: `user-${index}`,
    data: { characterId: 'char-1', enemyName: 'Bugzoid Grunt', isBoss: false, playerLevel: 1 },
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('createRemoteTransport', () => {
  it('batches events into a single POST after the flush interval', () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({});
    vi.stubGlobal('fetch', fetchMock);

    const transport = createRemoteTransport({ endpoint: '/__logs', intervalMs: 1000, batchSize: 20 });
    transport.write(makeEvent(1));
    transport.write(makeEvent(2));
    transport.write(makeEvent(3));

    expect(fetchMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/__logs');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toHaveLength(3);
  });

  it('flushes immediately once the batch size is reached', () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    vi.stubGlobal('fetch', fetchMock);

    const transport = createRemoteTransport({ endpoint: '/__logs', batchSize: 2 });
    transport.write(makeEvent(1));
    transport.write(makeEvent(2));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toHaveLength(2);
  });

  it('stops the flush timer after the queue drains', () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({});
    vi.stubGlobal('fetch', fetchMock);

    const transport = createRemoteTransport({ endpoint: '/__logs', intervalMs: 1000, batchSize: 20 });
    transport.write(makeEvent(1));

    vi.advanceTimersByTime(1000);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('never throws when the POST fails', () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);

    const transport = createRemoteTransport({ endpoint: '/__logs', intervalMs: 1000, batchSize: 20 });
    transport.write(makeEvent(1));

    expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
  });

  it('flushes remaining events via sendBeacon on pagehide', () => {
    const beaconMock = vi.fn<(url: string, body: string) => boolean>(() => true);
    vi.stubGlobal('navigator', { sendBeacon: beaconMock });

    const transport = createRemoteTransport({ endpoint: '/__logs', batchSize: 20 });
    transport.write(makeEvent(1));
    transport.write(makeEvent(2));

    window.dispatchEvent(new Event('pagehide'));

    expect(beaconMock).toHaveBeenCalledTimes(1);
    expect(beaconMock.mock.calls[0][0]).toBe('/__logs');
    expect(JSON.parse(beaconMock.mock.calls[0][1])).toHaveLength(2);
  });
});
