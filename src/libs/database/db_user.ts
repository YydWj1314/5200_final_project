import type { RowDataPacket } from 'mysql2';
import { throwError } from '@/libs/utils/errorUtils';
import type { UserGetById } from '@/types/Users';
import { logCall } from '../utils/logUtils';
import { getDBPool } from '../db';

/**
 * Get user by ID
 */
export async function getUserById(
  userId: number | string,
): Promise<UserGetById | null> {
  logCall();

  try {
    const pool = getDBPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id,
        user_account,
        user_name,
        user_role
      FROM users
      WHERE id = ?
        AND is_delete = 0
      LIMIT 1
      `,
      [userId],
    );

    const row = rows[0] as (RowDataPacket & UserGetById) | undefined;
    return row ?? null;
  } catch (error) {
    console.error('[db_user/getUserById]', error);
    throwError('Query user failed');
  }
}

/**
 * Get userId by email
 */
export async function getUidByEmail(email: string): Promise<number | null> {
  logCall();

  try {
    const pool = getDBPool();

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT id
      FROM users
      WHERE user_account = ?
      LIMIT 1
      `,
      [email.toLowerCase()],
    );

    const row = rows[0] as (RowDataPacket & { id: number }) | undefined;
    return row ? row.id : null;
  } catch (error) {
    console.error('[db_user/getUidByEmail]', error);
    return null;
  }
}

/**
 * Add new user
 */
export async function addUser(
  email: string,
  username: string,
  hashedPassword: string,
): Promise<number> {
  logCall();

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const pool = getDBPool();

    const [result] = await pool.query<any>(
      `
      INSERT INTO users (
        user_account,
        user_name,
        user_password,
        user_role,
        is_delete,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, 'user', 0, NOW(), NOW())
      `,
      [normalizedEmail, username, hashedPassword],
    );

    // 邮箱重复（唯一约束）— MySQL 错误代码 1062
    if (!result || !result.insertId) {
      throw new Error('E_ADD_USER_FAILED');
    }

    return Number(result.insertId);
  } catch (error: any) {
    console.error('[db_user/addUser]', error);

    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      throw new Error('E_DUPLICATE_EMAIL');
    }

    throw new Error('E_ADD_USER_FAILED');
  }
}
