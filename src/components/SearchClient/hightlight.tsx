import React from 'react';

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 把用户输入切成若干关键词（去重、去空）
// 英文按空格/逗号切；中文直接把原句当一个整体关键词即可
export function tokenize(q: string) {
  const raw = (q ?? '').trim();
  if (!raw) return [] as string[];
  const parts = raw
    .split(/[\s,，]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  // 没有空格时（常见中文），保留整句作为关键词
  if (parts.length === 1) return parts;
  // 去重
  return Array.from(new Set(parts));
}

// 在一段文本里高亮 tokens；返回 React 片段（无需 dangerouslySetInnerHTML）
export function highlightText(text: string, tokens: string[]) {
  if (!text || !tokens?.length) return text;
  const pattern = `(${tokens.map(escapeRegex).join('|')})`;
  const re = new RegExp(pattern, 'gi'); // 忽略大小写
  const slices = text.split(re); // split 会保留捕获组，奇数位就是命中片段
  return slices.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} style={{ padding: 0 }}>
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

// 生成“命中附近的摘要”（避免整段太长）
export function makeSnippet(text: string, tokens: string[], ctx = 60) {
  if (!text || !tokens?.length) return (text ?? '').slice(0, 160);
  const re = new RegExp(tokens.map(escapeRegex).join('|'), 'i');
  const m = re.exec(text);
  if (!m) return (text ?? '').slice(0, 160);
  const i = m.index;
  const start = Math.max(0, i - ctx);
  const end = Math.min(text.length, i + m[0].length + ctx);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return `${prefix}${text.slice(start, end)}${suffix}`;
}
