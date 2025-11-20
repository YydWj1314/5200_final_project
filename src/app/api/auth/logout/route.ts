// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSessionBySid } from '@/libs/database/db_sessions';
import { SESSION_COOKIE_NAME } from '@/config/constants';
import { logCall } from '@/libs/utils/logUtils';

export async function DELETE() {
  try {
    logCall();

    const sid = cookies().get(SESSION_COOKIE_NAME)?.value ?? null;
    // Authentication
    if (!sid) {
      // idempotent operation
      const res = NextResponse.json({ ok: true, affected: 0 });
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }

    // Delete db data
    const count = await deleteSessionBySid(sid);

    // response and delete cookie session
    const res = NextResponse.json({ ok: true, count }); // affected 可能是 0 或 1
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: 'Logout failed' },
      { status: 500 },
    );
  }
}
