import { describe, expect, it } from 'vitest';
import {
  activeLogPath,
  indexedLogPath,
  planRotation,
  shouldRotate,
} from '../../src/lib/logger/rotation';

describe('rotation helpers', () => {
  it('derives the active and indexed log paths', () => {
    expect(activeLogPath('app')).toBe('app.log');
    expect(indexedLogPath('app', 3)).toBe('app.3.log');
  });

  it('does not rotate when the write fits under the cap', () => {
    expect(shouldRotate(100, 50, 200)).toBe(false);
  });

  it('rotates when the write would exceed the cap', () => {
    expect(shouldRotate(160, 50, 200)).toBe(true);
  });

  it('does not rotate an empty file', () => {
    expect(shouldRotate(0, 50, 200)).toBe(false);
  });
});

describe('planRotation', () => {
  it('rotates a bare chain of just the active file', () => {
    expect(planRotation({ baseName: 'app', currentFiles: ['app.log'], maxFiles: 5 })).toEqual([
      { type: 'rename', from: 'app.log', to: 'app.1.log' },
    ]);
  });

  it('rotates the active file into the first slot', () => {
    expect(
      planRotation({ baseName: 'app', currentFiles: ['app.log', 'app.1.log'], maxFiles: 5 })
    ).toEqual([
      { type: 'rename', from: 'app.1.log', to: 'app.2.log' },
      { type: 'rename', from: 'app.log', to: 'app.1.log' },
    ]);
  });

  it('shifts the full chain and drops the oldest file', () => {
    const ops = planRotation({
      baseName: 'app',
      currentFiles: ['app.log', 'app.1.log', 'app.2.log', 'app.3.log', 'app.4.log'],
      maxFiles: 5,
    });

    expect(ops).toEqual([
      { type: 'delete', path: 'app.4.log' },
      { type: 'rename', from: 'app.3.log', to: 'app.4.log' },
      { type: 'rename', from: 'app.2.log', to: 'app.3.log' },
      { type: 'rename', from: 'app.1.log', to: 'app.2.log' },
      { type: 'rename', from: 'app.log', to: 'app.1.log' },
    ]);
  });

  it('drops indexes beyond the cap from a legacy config', () => {
    const ops = planRotation({
      baseName: 'app',
      currentFiles: ['app.log', 'app.1.log', 'app.7.log'],
      maxFiles: 5,
    });

    expect(ops).toEqual([
      { type: 'delete', path: 'app.7.log' },
      { type: 'rename', from: 'app.1.log', to: 'app.2.log' },
      { type: 'rename', from: 'app.log', to: 'app.1.log' },
    ]);
  });

  it('handles gaps in the chain', () => {
    const ops = planRotation({
      baseName: 'app',
      currentFiles: ['app.log', 'app.3.log'],
      maxFiles: 5,
    });

    expect(ops).toEqual([
      { type: 'rename', from: 'app.3.log', to: 'app.4.log' },
      { type: 'rename', from: 'app.log', to: 'app.1.log' },
    ]);
  });

  it('deletes the active file instead of rotating when maxFiles is 1', () => {
    expect(planRotation({ baseName: 'app', currentFiles: ['app.log'], maxFiles: 1 })).toEqual([
      { type: 'delete', path: 'app.log' },
    ]);
  });
});
