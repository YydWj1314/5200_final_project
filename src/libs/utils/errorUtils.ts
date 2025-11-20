// libs/errorUtil.ts
export function throwError(message: string): never {
  const err = new Error(message);

  // stack 第 2 行就是调用方信息
  const stackLines = err.stack?.split('\n') ?? [];
  const callerLine = stackLines[2] || '';
  // 从路径里提取文件名（简化）
  const match = callerLine.match(/\/([^/]+\.ts):\d+:\d+\)?$/);
  const fileName = match ? match[1] : 'unknown';

  throw new Error(`【${fileName}】${message}`);
}
