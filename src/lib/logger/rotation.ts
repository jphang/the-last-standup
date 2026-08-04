export type RotationOp =
  | { type: 'delete'; path: string }
  | { type: 'rename'; from: string; to: string };

export interface RotationPlanOptions {
  baseName: string;
  currentFiles: string[];
  maxFiles: number;
}

export function activeLogPath(baseName: string): string {
  return `${baseName}.log`;
}

export function indexedLogPath(baseName: string, index: number): string {
  return `${baseName}.${index}.log`;
}

export function shouldRotate(currentSize: number, incomingLength: number, maxBytes: number): boolean {
  return currentSize > 0 && currentSize + incomingLength > maxBytes;
}

export function planRotation({ baseName, currentFiles, maxFiles }: RotationPlanOptions): RotationOp[] {
  const active = activeLogPath(baseName);
  const present = new Set(currentFiles);
  const ops: RotationOp[] = [];

  if (maxFiles <= 1) {
    if (present.has(active)) ops.push({ type: 'delete', path: active });
    return ops;
  }

  const maxIndex = maxFiles - 1;

  const presentIndexes = new Set<number>();
  for (const file of currentFiles) {
    const match = file.match(new RegExp(`^${baseName}\\.(\\d+)\\.log$`));
    if (match) presentIndexes.add(Number(match[1]));
  }

  for (const index of [...presentIndexes].sort((a, b) => b - a)) {
    if (index > maxIndex) ops.push({ type: 'delete', path: indexedLogPath(baseName, index) });
  }

  if (presentIndexes.has(maxIndex)) {
    ops.push({ type: 'delete', path: indexedLogPath(baseName, maxIndex) });
  }

  for (let index = maxIndex - 1; index >= 1; index--) {
    if (presentIndexes.has(index)) {
      ops.push({ type: 'rename', from: indexedLogPath(baseName, index), to: indexedLogPath(baseName, index + 1) });
    }
  }

  if (present.has(active)) {
    ops.push({ type: 'rename', from: active, to: indexedLogPath(baseName, 1) });
  }

  return ops;
}
