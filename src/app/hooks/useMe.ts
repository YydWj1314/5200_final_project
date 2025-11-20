// app/hooks/useMe.ts
'use client';
import useSWR from 'swr';

// API 返回格式
type MeResponse = {
  ok: boolean;
  user: User | null;
};

// 用户对象
type User = {
  id: number;
  user_account: string;
  user_name: string;
  user_role: string;
  user_avatar?: string | null;
  user_profile?: string | null;
};

/**
 * Auth api in client
 * by global swr GET fetcher
 * @returns
 */
export function useMe() {
  // global get fetch
  const { data, isLoading, error, mutate } = useSWR<MeResponse | null>(
    '/api/auth/me',
    {
      revalidateOnFocus: false,
    },
  );

  return {
    me: data?.user ?? null,
    isLoading,
    error,
    mutate,
  };
}
