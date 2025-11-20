import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { addUser, getUidByEmail } from '@/libs/database/db_user';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { email, username, password, confirm } = body || {};

  // 1) 基础校验
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

  // 2) email 格式兜底校验
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return NextResponse.json(
      { ok: false, error: 'Invalid email format' },
      { status: 400 },
    );
  }

  // 3) email 唯一性检查
  const existUserId = await getUidByEmail(email);
  if (existUserId) {
    return NextResponse.json(
      { ok: false, error: 'Email has been registered' },
      { status: 400 },
    );
  }

  // 4) 插入用户（**一定要 await**）
  const hashedPassword = await bcrypt.hash(password, 10);

  let newId: number;
  try {
    newId = await addUser(email, username, hashedPassword);
  } catch (e: any) {
    // 和 db_user.ts 里的约定保持一致：
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

  // 5) return success
  return NextResponse.json({ ok: true, userId: newId });
}
