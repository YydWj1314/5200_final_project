import { NextResponse } from 'next/server';
import { authSessionInServer } from '@/libs/utils/sessionUtils';
import { getSavedQidByUid } from '@/libs/database/db_question_saved';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = await authSessionInServer();
  if (!userId) {
    return NextResponse.json({ ok: false, ids: [] }, { status: 401 });
  }

  try {
    const ids = await getSavedQidByUid(userId);
    return NextResponse.json({ ok: true, ids });
  } catch (e) {
    console.error('[api/questions/saved-ids] error:', e);
    return NextResponse.json({ ok: false, ids: [] }, { status: 500 });
  }
}
