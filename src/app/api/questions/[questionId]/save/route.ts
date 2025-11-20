import { NextResponse } from 'next/server';
import { authSessionInServer } from '@/libs/utils/sessionUtils';
import { logCall } from '@/libs/utils/logUtils';
import {
  getSavedIdbyUidAndQid,
  insertQuestionSaved,
  cancelQuestionSaved,
} from '@/libs/database/db_question_saved';

export async function POST(
  req: Request,
  { params }: { params: { questionId: string } },
) {
  logCall();
  try {
    //Authentication
    const userId = await authSessionInServer();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Not logged in' },
        { status: 401 },
      );
    }

    // Get questionId from url path
    const questionId = Number(params.questionId);

    if (!Number.isFinite(questionId) || questionId <= 0) {
      return NextResponse.json(
        { ok: false, error: 'Invalid questionId' },
        { status: 400 },
      );
    }

    // DB Operation: Insert data
    const id = await insertQuestionSaved(userId, questionId);
    // console.log('[/api/questions/[questionId]/favorites]] inserted id:', id);

    // Return reponse
    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    console.error('[/api/questions/[questionId]/save][INSERT]: ', e);
    const msg = e?.message ?? 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/**
 * DELETE
 * @param req
 * @returns
 */
export async function DELETE(
  req: Request,
  { params }: { params: { questionId: string } },
) {
  logCall();
  try {
    //Authentication
    const userId = await authSessionInServer();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Not logged in' },
        { status: 401 },
      );
    }

    // Get questionId from url path
    const questionId = Number(params.questionId);
    if (!Number.isFinite(questionId) || questionId <= 0) {
      // console.warn('[/api/questions/[questionId]/favorites]] invalid questionId:', questionId);
      return NextResponse.json(
        { ok: false, error: 'Invalid questionId' },
        { status: 400 },
      );
    }

    // delete data in db question_favorites
    const affected = await cancelQuestionSaved(userId, questionId);
    // return response
    return NextResponse.json({ ok: true, affected });
  } catch (e: any) {
    console.error('[/api/questions/[questionId]/save] error:', e);
    const msg = e?.message ?? 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/**
 * GET question db id
 * @param req
 * @param param1
 * @returns
 */
export async function GET(
  req: Request,
  { params }: { params: { questionId: string } },
) {
  logCall();
  try {
    // Authentication
    const userId = await authSessionInServer();
    // console.log('[api/me] userId: ', userId);
    if (!userId) {
      return NextResponse.json({ ok: true, isSaved: false }, { status: 200 });
    }

    // Get questionId from url path
    const questionId = Number(params.questionId);
    if (!Number.isFinite(questionId) || questionId <= 0) {
      // console.warn('[/api/questions/[questionId]/favorites]] invalid questionId:', questionId);
      return NextResponse.json(
        { ok: false, error: 'Invalid questionId' },
        { status: 400 },
      );
    }

    // Query id in db
    const id = await getSavedIdbyUidAndQid(userId, questionId);
    // console.log('[api/save/router id:]', id);
    // return response
    return NextResponse.json(
      { ok: true, isSaved: id != null },
      { status: 200 },
    );
  } catch (e: any) {
    console.error(e);
    const msg = e?.message ?? 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
