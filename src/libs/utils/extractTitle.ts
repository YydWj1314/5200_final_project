export function extractTitle(md: string): string {
  if (!md) return 'Untitled';
  const lines = md.split('\n');
  for (const line of lines) {
    if (line.startsWith('#')) {
      return line.replace(/^#+\s*/, ''); // Remove Markdown heading symbols
    }
  }
  // If no title, take first 50 characters
  return md.slice(0, 50) + (md.length > 50 ? '...' : '');
}
