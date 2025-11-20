// libs/database/db_user_auth.ts
import { getDBPool } from '../db';
import { logCall } from '@/libs/utils/logUtils';
import type { RowDataPacket } from 'mysql2';

export type DbUserForLogin = {
  id: number;
  user_password: string;
  is_delete: number | boolean | null;
};

export async function getUserForLogin(
  userAccount: string,
): Promise<DbUserForLogin | null> {
  logCall();
  const pool = getDBPool();

  const [rows] = await pool.query<RowDataPacket[]>(
    `
  SELECT id, user_password, is_delete
  FROM users
  WHERE LOWER(user_account) = LOWER(?)
  LIMIT 1
  `,
    [userAccount],
  );

  const row = rows[0] as (RowDataPacket & DbUserForLogin) | undefined;
  return row ?? null;
}
