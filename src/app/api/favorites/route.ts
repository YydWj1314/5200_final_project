import { NextResponse } from 'next/server';
import {
  batchDeleteBankFavorites,
  getBfIdByUidAndBid,
} from '@/libs/database/db_bank_favorites';
import { authSessionInServer } from '@/libs/utils/sessionUtils';
import { logCall } from '@/libs/utils/logUtils';

export async function DELETE(req: Request) {
  logCall();
  // Authentication and get userId
  try {
    const userId = await authSessionInServer();

    // Auth failed response
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Not logged in' },
        { status: 401 },
      );
    }
    // Get bankIds from post body
    const { bankIds } = await req.json();
    // delte by bankId[] and userId
    const affected = await batchDeleteBankFavorites(userId, bankIds);
    // Successful response
    return NextResponse.json({ ok: true, affected });
  } catch (e: any) {
    console.error(e);
    const msg = e?.message ?? 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/**
 * Get user_favorite_bank id by useId and bankId
 * @param req
 * @param param1
 * @returns
 */
export async function GET(
  req: Request,
  { params }: { params: { bankId: string } },
) {
  logCall();
  try {
    // Authentication
    const userId = await authSessionInServer();
    // console.log('[/api/banks/[bankId]/favorites]] userId:', userId);

    // Failed response
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Not logged in' },
        { status: 401 },
      );
    }

    // Get bankId from url path
    const bankId = Number(params.bankId);
    const bankIdNum = Number(bankId);
    if (!Number.isFinite(bankIdNum) || bankIdNum <= 0) {
      // console.warn('[/api/banks/[bankId]/favorites]] invalid bankId:', bankId);
      return NextResponse.json(
        { ok: false, error: 'Invalid bankId' },
        { status: 400 },
      );
    }

    // Query id in db
    const favoriteBankId = await getBfIdByUidAndBid(userId, bankId);
    // return response
    return NextResponse.json({ ok: true, isFavorited: favoriteBankId != null });
  } catch (e: any) {
    console.error(e);
    const msg = e?.message ?? 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
