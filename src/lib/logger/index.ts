import { shouldLog } from './formats';
import { consoleTransport } from './transports/consoleTransport';
import type { LogEvent, LoggerConfig } from './types';

export type {
  LogEvent,
  LogLevel,
  LogMeta,
  LogTransport,
  LoggerConfig,
} from './types';
export { serializeEvent, shouldLog, toIsoTimestamp } from './formats';
export { activeLogPath, indexedLogPath, planRotation, shouldRotate } from './rotation';
export type { RotationOp, RotationPlanOptions } from './rotation';
export { consoleTransport } from './transports/consoleTransport';
export { createRemoteTransport } from './transports/remoteTransport';
export type { RemoteTransportOptions } from './transports/remoteTransport';
export type { FileTransportOptions } from './transports/fileTransport';

let config: LoggerConfig = {
  transports: [consoleTransport],
  maxBytes: 1024 * 1024,
  maxFiles: 5,
  level: 'info',
};

export function configureLogger(overrides: Partial<LoggerConfig> = {}): LoggerConfig {
  config = { ...config, ...overrides };
  return config;
}

export function log(event: LogEvent): void {
  if (!shouldLog(event.level, config.level)) return;
  for (const transport of config.transports) {
    try {
      transport.write(event);
    } catch {
      // A broken transport must never crash the game.
    }
  }
}
