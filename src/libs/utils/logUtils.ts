// utils/logger.ts
export function logCall(level: 'log' | 'warn' | 'error' = 'log') {
  const stack = new Error().stack?.split('\n') ?? [];
  const callerLine = stack[2] ?? '';

  // 提取 funcName + filePath + line
  const match = callerLine.match(/at\s+(\S+)\s+\((.*):(\d+):(\d+)\)/);
  if (match) {
    const [, func, file, line] = match;

    // 只保留 "project/" 后面的部分
    const shortFile = file.includes('project')
      ? file.split('project')[1].replace(/^[/\\]/, '')
      : file;

    const msg = `=====[${shortFile}] ${func} (line ${line}) isCalled =====`;

    if (level === 'warn') console.warn(msg);
    else if (level === 'error') console.error(msg);
    else console.log(msg);
  } else {
    console.log(callerLine);
  }
}
