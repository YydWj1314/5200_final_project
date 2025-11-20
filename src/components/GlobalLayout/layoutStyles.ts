import type { CSSProperties } from 'react';

type Styles = Record<string, CSSProperties>;

/** 统一高度常量 */
export const HEADER_HEIGHT = 64; // Header height
export const FOOTER_HEIGHT = 80; // Footer height（可按需改）

export const layoutStyles: Styles = {
  /** 外层布局：撑满视口，高度不足时把页脚推到底部 */
  layout: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    background: '#f5f6f8',
  },

  /** 固定头部（全宽） */
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

  /** 头部内的品牌区 */
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    textDecoration: 'none',
  },
  brandTitle: { fontWeight: 700, color: '#000', fontSize: 18 },

  /** 菜单/导航（在 header 内横向撑开） */
  menu: {
    flex: 1,
    minWidth: 40,
    background: 'transparent',
    borderBottom: 'none',
  },

  /**
   * 内容容器：顶部留出 header 的高度；左右居中；底部预留一点空间避免和页脚贴太紧
   * 如果你用的是 Ant Layout.Content，把这个样式放在 Content 上
   */
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 24,
    paddingLeft: `calc(24px + env(safe-area-inset-left, 0px))`,
    paddingRight: `calc(24px + env(safe-area-inset-right, 0px))`,
    background: '#f5f6f8',
  },

  /** 内层内容最大宽度容器 */
  contentInner: {
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
  },

  /** 粘底页脚（不固定），内容不足时自然在底部 */
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

  /** 搜索框（示例） */
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

  /** 可选：头部下面的占位（如果你不想用 content 的 paddingTop 方案） */
  headerSpacer: {
    height: HEADER_HEIGHT,
  },
};
