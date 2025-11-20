import { NextResponse } from 'next/server';
import { getUserById } from '@/libs/database/db_user';
import { authSessionInServer } from '@/libs/utils/sessionUtils';
import type { UserGetById } from '@/types/Users';
import { logCall } from '@/libs/utils/logUtils';

export async function GET() {
  logCall();

  try {
    const userId = await authSessionInServer();
    // console.log('[api/me] userId: ', userId);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Not logged in' },
        { status: 401 },
      );
    }

    const user: UserGetById | null = await getUserById(userId);
    // console.log('[api/me] user: ', user);

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Not logged in' },
        { status: 401 },
      );
    }

    return NextResponse.json({ ok: true, user });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 },
    );
  }
}
