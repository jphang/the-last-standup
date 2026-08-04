import type { LogEvent, LogTransport } from '../types';

export interface RemoteTransportOptions {
  endpoint: string;
  intervalMs?: number;
  batchSize?: number;
}

const DEFAULT_INTERVAL_MS = 1000;
const DEFAULT_BATCH_SIZE = 20;

export function createRemoteTransport(options: RemoteTransportOptions): LogTransport {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  const queue: LogEvent[] = [];
  let timer: ReturnType<typeof setInterval> | null = null;

  const stopTimer = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  const flush = (useBeacon = false) => {
    if (queue.length === 0) return;
    const events = queue.splice(0, queue.length);
    const body = JSON.stringify(events);

    try {
      if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(options.endpoint, body);
        return;
      }
      if (typeof fetch === 'undefined') return;
      fetch(options.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {
        // A failed flush must never crash the game.
      });
    } catch {
      // A failed flush must never crash the game.
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', () => flush(true));
  }

  return {
    name: 'remote',
    write(event: LogEvent) {
      queue.push(event);

      if (queue.length >= batchSize) {
        stopTimer();
        flush();
        return;
      }

      if (timer === null) {
        timer = setInterval(() => {
          flush();
          if (queue.length === 0) stopTimer();
        }, intervalMs);
      }
    },
  };
}
