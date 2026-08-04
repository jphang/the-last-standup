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
