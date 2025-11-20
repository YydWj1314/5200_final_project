export function extractTitle(md: string): string {
  if (!md) return 'Untitled';
  const lines = md.split('\n');
  for (const line of lines) {
    if (line.startsWith('#')) {
      return line.replace(/^#+\s*/, ''); // 去掉 Markdown 标题符号
    }
  }
  // 如果没有标题，就取前 50 字
  return md.slice(0, 50) + (md.length > 50 ? '...' : '');
}
