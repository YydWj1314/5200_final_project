import { NextResponse } from 'next/server';
import { authSessionInServer } from '@/libs/utils/sessionUtils';
import { createClient } from '@/libs/utils/supabase/app_router/server';
import { getSavedQuestionsByUserId } from '@/libs/database/db_questions';
import { QuestionInShowList } from '@/types/Questions';

// GET only: Returns questions favorited by current logged-in user (ordered by creation time DESC)
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
