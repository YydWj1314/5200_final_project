// app/api/questions/top-saved/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/libs/utils/supabase/app_router/server';
import { logCall } from '@/libs/utils/logUtils';

const LIMIT = 10;

export async function GET(req: Request) {
  logCall();
  try {
    const sb = await createClient();

    const { data, error } = await sb
      .from('question_saved')
      .select('id, content, tags, saved_count')
      .order('saved_count', { ascending: false })
      .limit(LIMIT);

    return NextResponse.json({ ok: true, questions: data }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    const msg = e?.message ?? 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
