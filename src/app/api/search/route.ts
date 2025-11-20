import { NextResponse } from 'next/server';
import { searchQuestionsByStr } from '@/libs/database/db_questions';

//fetch('/api/search?q=xxx')
export async function GET(req: Request) {
  //
  try {
    const { searchParams } = new URL(req.url);
    const str = searchParams.get('str') ?? '';
    const questions = await searchQuestionsByStr(str);
    return NextResponse.json({ ok: true, questions });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e?.message ?? 'Serach failed',
    });
  }
}
