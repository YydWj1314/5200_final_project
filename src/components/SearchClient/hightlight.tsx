import React from 'react';

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Split user input into keywords (deduplicate, remove empty)
// English: split by space/comma; Chinese: treat entire sentence as one keyword
export function tokenize(q: string) {
  const raw = (q ?? '').trim();
  if (!raw) return [] as string[];
  const parts = raw
    .split(/[\s,，]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  // When no spaces (common in Chinese), keep entire sentence as keyword
  if (parts.length === 1) return parts;
  // Deduplicate
  return Array.from(new Set(parts));
}

// Highlight tokens in text; returns React fragments (no need for dangerouslySetInnerHTML)
export function highlightText(text: string, tokens: string[]) {
  if (!text || !tokens?.length) return text;
  const pattern = `(${tokens.map(escapeRegex).join('|')})`;
  const re = new RegExp(pattern, 'gi'); // Case insensitive
  const slices = text.split(re); // split preserves capture groups, odd indices are matches
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

// Generate "summary around matches" (avoid entire paragraph being too long)
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
