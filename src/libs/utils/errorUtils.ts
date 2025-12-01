// libs/errorUtil.ts
export function throwError(message: string): never {
  const err = new Error(message);

  // Stack line 2 contains caller information
  const stackLines = err.stack?.split('\n') ?? [];
  const callerLine = stackLines[2] || '';
  // Extract filename from path (simplified)
  const match = callerLine.match(/\/([^/]+\.ts):\d+:\d+\)?$/);
  const fileName = match ? match[1] : 'unknown';

  throw new Error(`[${fileName}] ${message}`);
}
