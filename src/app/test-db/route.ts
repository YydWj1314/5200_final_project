// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { getDBPool } from '@/libs/db';

export async function GET() {
  try {
    const pool = getDBPool();
    const [rows] = await pool.query(
      'SELECT id, user_account, user_name, user_role FROM users',
    );

    return NextResponse.json({
      ok: true,
      data: rows,
    });
  } catch (err: any) {
    console.error('GET /api/users error:', err);
    return NextResponse.json(
      { ok: false, error: err.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}
