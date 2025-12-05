import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { addUser, getUidByEmail } from '@/libs/database/db_user';
import {
  createSession,
  storeSessionInResponse,
} from '@/libs/utils/sessionUtils';
import { insertSession } from '@/libs/database/db_sessions';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, username, password, confirm } = body || {};

  // 1) Basic validation
  if (!email || !username || !password || !confirm) {
    return NextResponse.json(
      { ok: false, error: 'Missing necessary fields' },
      { status: 400 },
    );
  }

  if (password !== confirm) {
    return NextResponse.json(
      { ok: false, error: "Password doesn't match" },
      { status: 400 },
    );
  }

  // 2) Email format validation
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return NextResponse.json(
      { ok: false, error: 'Invalid email format' },
      { status: 400 },
    );
  }

  // 3) Email uniqueness check
  const existUserId = await getUidByEmail(email);
  if (existUserId) {
    return NextResponse.json(
      { ok: false, error: 'Email has been registered' },
      { status: 400 },
    );
  }

  // 4) Insert user (**must await**)
  const hashedPassword = await bcrypt.hash(password, 10);

  let newId: number;
  try {
    newId = await addUser(email, username, hashedPassword);
  } catch (e: any) {
    // Keep consistent with db_user.ts conventions:
    // E_DUPLICATE_EMAIL / E_ADD_USER_FAILED
    if (e.message === 'E_DUPLICATE_EMAIL') {
      return NextResponse.json(
        { ok: false, error: 'Email already exists' },
        { status: 409 },
      );
    }
    console.error('Register error:', e);
    return NextResponse.json(
      { ok: false, error: 'Failed to create user' },
      { status: 500 },
    );
  }

  // 5) Create session & cookie (auto-login after registration)
  try {
    const { sid, expiresAt } = createSession();
    await storeSessionInResponse(sid);
    const { hashedSid } = await insertSession(sid, newId, expiresAt);

    if (!hashedSid) {
      console.error('[sign-up] Failed to create session');
      // Still return success, but session creation failed
    }
  } catch (e) {
    console.error('[sign-up] Session creation error:', e);
    // Still return success, but session creation failed
  }

  // 6) return success
  return NextResponse.json({ ok: true, userId: newId });
}
