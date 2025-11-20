import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  createSession,
  storeSessionInResponse,
} from '@/libs/utils/sessionUtils';
import { insertSession } from '@/libs/database/db_sessions';
import { logCall } from '@/libs/utils/logUtils';
import { getUserForLogin } from '@/libs/database/db_user_auth';

export async function POST(req: Request) {
  try {
    logCall();
    const { user_account, password } = await req.json();

    if (!user_account || !password) {
      return NextResponse.json(
        { error: 'Invalid account or password' },
        { status: 400 },
      );
    }

    // DB query
    const user = await getUserForLogin(user_account);

    if (!user) {
      return NextResponse.json(
        { error: 'inexistent or disabled account' },
        { status: 404 },
      );
    }

    const isDeleted = user.is_delete === true || user.is_delete === 1;

    if (isDeleted) {
      return NextResponse.json(
        { error: 'inexistent or disabled account' },
        { status: 404 },
      );
    }

    // 校验密码
    const ok = await bcrypt.compare(password, user.user_password);
    if (!ok) {
      return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
    }

    // 创建 session & cookie
    const { sid, expiresAt } = createSession();
    await storeSessionInResponse(sid);

    // 存 session 到 DB（你已经改成 MySQL 版了）
    const { hashedSid } = await insertSession(sid, user.id, expiresAt);

    if (!hashedSid) {
      return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/login] error:', e);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
