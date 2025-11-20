import { NextResponse } from 'next/server';
import { authSessionInServer } from '@/libs/utils/sessionUtils';
import { createClient } from '@/libs/utils/supabase/app_router/server';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await authSessionInServer();
  if (!userId)
    return NextResponse.json({ ok: false, ids: [] }, { status: 401 });

  const sb = await createClient();
  const { data, error } = await sb
    .from('user_question_saved')
    .select('question_id')
    .eq('user_id', userId);

  if (error) return NextResponse.json({ ok: false, ids: [] }, { status: 500 });
  return NextResponse.json({
    ok: true,
    ids: (data ?? []).map((r) => r.question_id),
  });
}
