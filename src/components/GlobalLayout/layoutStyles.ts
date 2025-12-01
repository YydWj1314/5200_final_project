import type { CSSProperties } from 'react';

type Styles = Record<string, CSSProperties>;

/** Unified height constants */
export const HEADER_HEIGHT = 64; // Header height
export const FOOTER_HEIGHT = 80; // Footer height (can be modified as needed)

export const layoutStyles: Styles = {
  /** Outer layout: fill viewport, push footer to bottom when height is insufficient */
  layout: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    background: '#f5f6f8',
  },

  /** Fixed header (full width) */
  header: {
    position: 'fixed',
    top: 'env(safe-area-inset-top, 0)',
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingLeft: `calc(20px + env(safe-area-inset-left, 0px))`,
    paddingRight: `calc(20px + env(safe-area-inset-right, 0px))`,
    background: '#fff',
    color: '#000',
    borderBottom: '1px solid #f0f0f0',
    zIndex: 1000,
  },

  /** Brand area inside header */
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    textDecoration: 'none',
  },
  brandTitle: { fontWeight: 700, color: '#000', fontSize: 18 },

  /** Menu/Navigation (expands horizontally within header) */
  menu: {
    flex: 1,
    minWidth: 40,
    background: 'transparent',
    borderBottom: 'none',
  },

  /**
   * Content container: reserve header height at top; center horizontally; reserve space at bottom to avoid tight footer
   * If you're using Ant Layout.Content, apply this style to Content
   */
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 24,
    paddingLeft: `calc(24px + env(safe-area-inset-left, 0px))`,
    paddingRight: `calc(24px + env(safe-area-inset-right, 0px))`,
    background: '#f5f6f8',
  },

  /** Inner content max-width container */
  contentInner: {
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
  },

  /** Sticky footer (not fixed), naturally at bottom when content is insufficient */
  footer: {
    height: FOOTER_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    background: '#fff',
    borderTop: '1px solid #f0f0f0',
    paddingLeft: `calc(16px + env(safe-area-inset-left, 0px))`,
    paddingRight: `calc(16px + env(safe-area-inset-right, 0px))`,
  },

  /** Search box (example) */
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #d9d9d9',
    borderRadius: 8,
    paddingInline: 8,
    background: '#fff',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
  },

  /** Optional: spacer below header (if you don't want to use content's paddingTop approach) */
  headerSpacer: {
    height: HEADER_HEIGHT,
  },
};
