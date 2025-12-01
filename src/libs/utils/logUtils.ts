// utils/logger.ts
export function logCall(level: 'log' | 'warn' | 'error' = 'log') {
  const stack = new Error().stack?.split('\n') ?? [];
  const callerLine = stack[2] ?? '';

  // Extract funcName + filePath + line
  const match = callerLine.match(/at\s+(\S+)\s+\((.*):(\d+):(\d+)\)/);
  if (match) {
    const [, func, file, line] = match;

    // Keep only the part after "project/"
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
