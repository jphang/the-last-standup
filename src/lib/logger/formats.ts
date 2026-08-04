import type { LogEvent } from './types';

const LEVEL_RANK: Record<LogEvent['level'], number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export function toIsoTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

export function shouldLog(level: LogEvent['level'], threshold: LogEvent['level']): boolean {
  return LEVEL_RANK[level] >= LEVEL_RANK[threshold];
}

export function serializeEvent(event: LogEvent): string {
  return JSON.stringify(event);
}

export type LogFormat = 'json' | 'pretty';

function quoteLogfmtValue(value: string | number | boolean): string {
  const str = String(value);
  if (/[\s"=]/.test(str)) return JSON.stringify(str);
  return str;
}

function formatData(data: object): string {
  return Object.entries(data)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${quoteLogfmtValue(value as string | number | boolean)}`)
    .join(' ');
}

export function formatEventHumanReadable(event: LogEvent): string {
  const parts = [event.ts, event.level.toUpperCase().padEnd(5)];
  if (event.userId) parts.push(`[${event.userId}]`);
  parts.push(event.type);

  const data = formatData(event.data);
  if (data) parts.push(data);

  return parts.join(' ');
}

export function formatEvent(event: LogEvent, format: LogFormat = 'pretty'): string {
  return format === 'pretty' ? formatEventHumanReadable(event) : serializeEvent(event);
}
