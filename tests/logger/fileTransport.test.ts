import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LogEvent } from '../../src/lib/logger/types';
import { createFileTransport } from '../../src/lib/logger/transports/fileTransport';

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'last-standup-log-'));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

function makeEvent(index: number): LogEvent {
  return {
    type: 'battle.start',
    level: 'info',
    ts: new Date().toISOString(),
    userId: `user-${index}`,
    data: {
      characterId: 'char-1',
      enemyName: 'Bugzoid Grunt',
      isBoss: false,
      playerLevel: 1,
    },
  };
}

function listLogFiles(): string[] {
  return fs.readdirSync(dir).filter((f) => f.endsWith('.log'));
}

function readLines(file: string): string[] {
  return fs.readFileSync(path.join(dir, file), 'utf8').trim().split('\n').filter(Boolean);
}

describe('createFileTransport', () => {
  it('writes human-readable lines to the active log file by default', () => {
    const transport = createFileTransport({ directory: dir, maxBytes: 1024 * 1024, maxFiles: 5 });

    transport.write(makeEvent(1));
    transport.write(makeEvent(2));

    expect(listLogFiles()).toEqual(['app.log']);
    const lines = readLines('app.log');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^\d{4}-\d{2}-\d{2}T.*INFO.*\[user-1\].*battle\.start/);
    expect(lines[0]).toContain('enemyName="Bugzoid Grunt"');
    expect(lines[0]).toContain('isBoss=false');
  });

  it('writes raw JSON lines when format is set to json', () => {
    const transport = createFileTransport({
      directory: dir,
      maxBytes: 1024 * 1024,
      maxFiles: 5,
      format: 'json',
    });

    transport.write(makeEvent(1));

    const [line] = readLines('app.log');
    expect(JSON.parse(line).type).toBe('battle.start');
    expect(JSON.parse(line).userId).toBe('user-1');
  });

  it('rotates the active file once it fills up', () => {
    const transport = createFileTransport({ directory: dir, maxBytes: 100, maxFiles: 5, format: 'json' });

    for (let i = 0; i < 4; i++) transport.write(makeEvent(i));

    const files = listLogFiles();
    expect(files).toContain('app.log');
    expect(files).toContain('app.1.log');
    expect(readLines('app.1.log').length).toBeGreaterThan(0);
  });

  it('caps the number of rotated files', () => {
    const transport = createFileTransport({ directory: dir, maxBytes: 50, maxFiles: 3, format: 'json' });

    for (let i = 0; i < 20; i++) transport.write(makeEvent(i));

    const files = listLogFiles();
    expect(files.length).toBeLessThanOrEqual(3);
    for (const file of files) {
      for (const line of readLines(file)) {
        expect(() => JSON.parse(line)).not.toThrow();
      }
    }
  });

  it('cleans up any files beyond the cap on rotation', () => {
    const transport = createFileTransport({ directory: dir, maxBytes: 50, maxFiles: 2, format: 'json' });
    fs.writeFileSync(path.join(dir, 'app.9.log'), 'stale\n');

    for (let i = 0; i < 10; i++) transport.write(makeEvent(i));

    expect(listLogFiles().filter((f) => f !== 'app.9.log')).not.toContain('app.9.log');
  });
});
