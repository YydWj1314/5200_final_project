'use client';
import useSWR, { mutate as globalMutate } from 'swr';
import { useMemo, useCallback, useState } from 'react';

type IdListResp = { ok: boolean; ids: number[] };
const EMPTY_IDS: number[] = [];

export function useQuestionSaved(questionId?: number) {
  // 1) 全局只拉一次“已收藏ID列表”
  const {
    data: idList,
    isLoading: idsLoading,
    mutate: mutateIds,
  } = useSWR<IdListResp>('/api/saved-ids', {
    revalidateOnFocus: true,
  });

  // 2) 用 Set O(1) 判断是否已收藏
  const ids = useMemo(() => idList?.ids ?? EMPTY_IDS, [idList?.ids]);
  const set = useMemo(() => new Set(ids), [ids]);

  const qid = Number(questionId);
  const saved = Number.isFinite(qid) && set.has(qid);

  // 4) 切换收藏：只打 POST/DELETE，并乐观更新 ID 列表
  const [pending, setPending] = useState(false);
  const isLoading = idsLoading || pending;

  const toggleSave = useCallback(async () => {
    if (!Number.isFinite(questionId) || pending) return;
    const id = Number(questionId);
    const next = !saved;
    setPending(true);

    // 乐观改本地 id 列表
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

      // 如有“我的收藏列表”接口，这里也触发一下重拉
      // await globalMutate('/api/saved'); // 可选
      // 或者直接重拉ID列表以校准
      await mutateIds();
    } catch (e) {
      // 失败回滚
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
