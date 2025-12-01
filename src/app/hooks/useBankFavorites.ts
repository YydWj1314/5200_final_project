// app/hooks/useBankFavorite.ts
'use client';
import useSWR from 'swr';
import { useMe } from './useMe';

type FavResp = { ok: boolean; isFavorited: boolean };

export function useBankFavorites(bankId: number) {
  // Get current user
  const { me } = useMe();
  const uid = me?.id ?? 'anon'; // Give fixed fingerprint even if not logged in

  // Subscribe to favorite status
  const url = Number.isFinite(bankId) ? `/api/banks/${bankId}/favorites` : null;
  const { data, mutate, isLoading, isValidating, error } = useSWR<FavResp>(
    url ? [url, uid] : null, // ← key includes uid, changing user = changing cache slot
    async ([u]) => {
      const res = await fetch(u, { credentials: 'include' });
      if (!res.ok) return { ok: true, isFavorited: false }; // 401/error also gives default value
      return res.json();
    },
  );

  // Click button: optimistic update + rollback on failure + revalidate on success
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
        optimisticData: { ok: true, isFavorited: next }, // Immediately update UI
        rollbackOnError: true, // Rollback on error
        revalidate: false, // Manually revalidate after success
      },
    );

    await mutate(); // GET again to sync with server (prevent drift)
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
