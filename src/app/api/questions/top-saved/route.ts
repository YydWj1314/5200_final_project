// app/api/questions/top-saved/route.ts
import { NextResponse } from 'next/server';
import { logCall } from '@/libs/utils/logUtils';
import { getTopSavedQuestions } from '@/libs/database/db_questions';

const LIMIT = 10;

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  logCall();

  try {
    const questions = await getTopSavedQuestions(LIMIT);

    return NextResponse.json(
      {
        ok: true,
        questions,
      },
      { status: 200 },
    );
  } catch (e: any) {
    console.error('[api/questions/top-saved] error:', e);
    const msg = e?.message ?? 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}