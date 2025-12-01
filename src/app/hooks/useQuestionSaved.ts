'use client';
import useSWR, { mutate as globalMutate } from 'swr';
import { useMemo, useCallback, useState } from 'react';

type IdListResp = { ok: boolean; ids: number[] };
const EMPTY_IDS: number[] = [];

export function useQuestionSaved(questionId?: number) {
  // 1) Fetch "saved ID list" globally only once
  const {
    data: idList,
    isLoading: idsLoading,
    mutate: mutateIds,
  } = useSWR<IdListResp>('/api/saved-ids', {
    revalidateOnFocus: true,
  });

  // 2) Use Set O(1) to check if already saved
  const ids = useMemo(() => idList?.ids ?? EMPTY_IDS, [idList?.ids]);
  const set = useMemo(() => new Set(ids), [ids]);

  const qid = Number(questionId);
  const saved = Number.isFinite(qid) && set.has(qid);

  // 4) Toggle save: only POST/DELETE, and optimistically update ID list
  const [pending, setPending] = useState(false);
  const isLoading = idsLoading || pending;

  const toggleSave = useCallback(async () => {
    if (!Number.isFinite(questionId) || pending) return;
    const id = Number(questionId);
    const next = !saved;
    setPending(true);

    // Optimistically update local ID list
    await mutateIds(
      (prev) => {
        const curr = prev?.ids ?? [];
        return next
          ? { ok: true, ids: Array.from(new Set([id, ...curr])) }
          : { ok: true, ids: curr.filter((x) => x !== id) };
      },
      { revalidate: false },
    );

    try {
      const res = await fetch(`/api/questions/${id}/save`, {
        method: next ? 'POST' : 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('network');

      // If there's a "my favorites list" endpoint, trigger refresh here too
      // await globalMutate('/api/saved'); // Optional
      // Or directly refresh ID list to sync
      await mutateIds();
    } catch (e) {
      // Rollback on failure
      await mutateIds(
        (prev) => {
          const curr = prev?.ids ?? [];
          return next
            ? { ok: true, ids: curr.filter((x) => x !== id) }
            : { ok: true, ids: Array.from(new Set([id, ...curr])) };
        },
        { revalidate: false },
      );
    } finally {
      setPending(false);
    }
  }, [questionId, saved, pending, mutateIds]);

  return { isSaved: saved, isLoading, toggleSave };
}
