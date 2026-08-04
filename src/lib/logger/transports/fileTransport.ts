import fs from 'node:fs';
import path from 'node:path';
import type { LogEvent, LogTransport } from '../types';
import { activeLogPath, planRotation, shouldRotate } from '../rotation';

const IS_NODE = typeof process !== 'undefined' && Boolean(process.versions?.node);

export interface FileTransportOptions {
  directory?: string;
  baseName?: string;
  maxBytes?: number;
  maxFiles?: number;
}

export function createFileTransport(options: FileTransportOptions = {}): LogTransport {
  const directory = options.directory ?? 'logs';
  const baseName = options.baseName ?? 'app';
  const maxBytes = options.maxBytes ?? 1024 * 1024;
  const maxFiles = options.maxFiles ?? 5;

  return {
    name: 'file',
    write(event: LogEvent) {
      if (!IS_NODE) return;
      try {
        fs.mkdirSync(directory, { recursive: true });
        const line = `${JSON.stringify(event)}\n`;
        const active = path.join(directory, activeLogPath(baseName));
        const currentSize = fs.existsSync(active) ? fs.statSync(active).size : 0;

        if (shouldRotate(currentSize, Buffer.byteLength(line), maxBytes)) {
          for (const op of planRotation({ baseName, currentFiles: listLogFiles(directory, baseName), maxFiles })) {
            if (op.type === 'delete') {
              fs.rmSync(path.join(directory, op.path), { force: true });
            } else {
              const from = path.join(directory, op.from);
              if (fs.existsSync(from)) {
                fs.renameSync(from, path.join(directory, op.to));
              }
            }
          }
        }

        fs.appendFileSync(active, line);
      } catch {
        // Logging must never interrupt the game.
      }
    },
  };
}

function listLogFiles(directory: string, baseName: string): string[] {
  try {
    if (!fs.existsSync(directory)) return [];
    const pattern = new RegExp(`^${baseName}(\\.\\d+)?\\.log$`);
    return fs.readdirSync(directory).filter((file) => pattern.test(file));
  } catch {
    return [];
  }
}
