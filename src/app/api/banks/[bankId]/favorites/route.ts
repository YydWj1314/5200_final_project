/**
 * /api/banks/[bankId]/favorites
 * GET POST DELETE
 * 收藏指定题库。
 *
 * - 需要登录（基于 Session Cookie）
 * - 请求体: { bankId: number }
 * - 返回:
 *   - 200: { ok: true, id: number }   // 插入成功
 *   - 400: { ok: false, error: 'Invalid bankId' }
 *   - 401: { ok: false, error: 'Not logged in' }
 *   - 500: { ok: false, error: string }
 */

import { NextResponse } from 'next/server';
import {
  insertBankFavorites,
  cancelBankFavorites,
  getBfIdByUidAndBid,
} from '@/libs/database/db_bank_favorites';
import { authSessionInServer } from '@/libs/utils/sessionUtils';
import { logCall } from '@/libs/utils/logUtils';

/**
 * POST:
 * Receive request and call insert insertBankFavorites api
 * then return response
 * @param req
 * @returns
 */
export async function POST(
  req: Request,
  { params }: { params: { bankId: string } },
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

    // Get bankId from url path
    const bankId = Number(params.bankId);
    // Get bankId
    const bankIdNum = Number(bankId);
    if (!Number.isFinite(bankIdNum) || bankIdNum <= 0) {
      // console.warn('[/api/banks/[bankId]/favorites]] invalid bankId:', bankId);
      return NextResponse.json(
        { ok: false, error: 'Invalid bankId' },
        { status: 400 },
      );
    }

    // DB Operation: Insert data
    const id = await insertBankFavorites(userId, bankIdNum);
    // console.log('[/api/banks/[bankId]/favorites]] inserted id:', id);

    // Return reponse
    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    console.error('[/api/banks/[bankId]/favorites][POST]: ', e);
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
  { params }: { params: { bankId: string } },
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

    // delete data in db bank_favorites
    const affected = await cancelBankFavorites(userId, bankId);
    // return response
    return NextResponse.json({ ok: true, affected });
  } catch (e: any) {
    console.error('[/api/banks/[bankId]/favorites][DELETE] error:', e);
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
  _req: Request,
  { params }: { params: { bankId: string } },
) {
  logCall();

  try {
    // Auth
    const userId = await authSessionInServer();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Not logged in' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    // Validate bankId
    const bankId = Number(params.bankId);
    if (!Number.isFinite(bankId) || bankId <= 0) {
      return NextResponse.json(
        { ok: false, error: 'Invalid bankId' },
        { status: 400 },
      );
    }

    // DB query
    const favoriteBankId = await getBfIdByUidAndBid(userId, bankId);

    return NextResponse.json(
      { ok: true, isFavorited: favoriteBankId != null },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e: any) {
    console.error('[/api/banks/[bankId]/favorites][GET] error:', e);
    const msg = e?.message ?? 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
