import { NextResponse } from 'next/server';
import { authSessionInServer } from '@/libs/utils/sessionUtils';
import { createClient } from '@/libs/utils/supabase/app_router/server';
import { getSavedQuestionsByUserId } from '@/libs/database/db_questions';
import { QuestionInShowList } from '@/types/Questions';

// 仅 GET：返回当前登录用户收藏的题目（按创建时间倒序）
export async function GET() {
  try {
    const userId = await authSessionInServer();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Not logged in' },
        { status: 401 },
      );
    }

    const questions = await getSavedQuestionsByUserId(userId);
    return NextResponse.json({ ok: true, items: questions });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 },
    );
  }
}
