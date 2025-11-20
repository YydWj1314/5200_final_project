// app/hooks/useBankFavorite.ts
'use client';
import useSWR from 'swr';
import { useMe } from './useMe';

type FavResp = { ok: boolean; isFavorited: boolean };

export function useBankFavorites(bankId: number) {
  // 获取当前用户
  const { me } = useMe();
  const uid = me?.id ?? 'anon'; // 未登录也给个固定指纹

  // 订阅收藏状态
  const url = Number.isFinite(bankId) ? `/api/banks/${bankId}/favorites` : null;
  const { data, mutate, isLoading, isValidating, error } = useSWR<FavResp>(
    url ? [url, uid] : null, // ← key 带 uid，换用户=换缓存槽位
    async ([u]) => {
      const res = await fetch(u, { credentials: 'include' });
      if (!res.ok) return { ok: true, isFavorited: false }; // 401/错误也给默认值
      return res.json();
    },
  );

  // 点击按钮：乐观更新 + 失败回滚 + 成功后校准
  async function toggleFavorite() {
    if (!url) return;
    const next = !data?.isFavorited;

    await mutate(
      async () => {
        const res = await fetch(url, {
          method: next ? 'POST' : 'DELETE',
          credentials: 'include',
        });
        if (res.status === 401) throw new Error('Not Logged In');
        if (!res.ok) throw new Error('Operation Failed ');
        return { ok: true, isFavorited: next };
      },
      {
        optimisticData: { ok: true, isFavorited: next }, // 立刻改 UI
        rollbackOnError: true, // 出错回滚
        revalidate: false, // 成功后我们手动校准
      },
    );

    await mutate(); // 再 GET 一次，对齐服务端（防漂移）
  }

  return {
    isFavorited: !!data?.isFavorited,
    isLoading,
    isValidating,
    error,
    toggleFavorite,
    refresh: () => mutate(),
  };
}
