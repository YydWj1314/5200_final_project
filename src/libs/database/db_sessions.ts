import type { RowDataPacket } from 'mysql2';
import { throwError } from '../utils/errorUtils';
import { hashSession } from '../utils/sessionUtils';
import { logCall } from '../utils/logUtils';
import { getDBPool } from '../db';

/**
 * Insert session into db (MySQL)
 * @param sid       原始 session id（未哈希）
 * @param userId    用户 id
 * @param expiresAt 过期时间（ISO 字符串：如 new Date().toISOString()）
 */
export async function insertSession(
  sid: string,
  userId: number,
  expiresAt: string, // ISO 字符串
): Promise<{ hashedSid: string; expiresAt: string }> {
  logCall();

  if (!sid || !userId || !expiresAt) {
    throwError('Invalid Paramters');
  }

  const hashedSid = hashSession(sid);
  console.log('[libs/db_session] hash created:', hashedSid);

  try {
    const pool = getDBPool();

    // 把 ISO 字符串转成 Date
    const expiryDate = new Date(expiresAt);
    if (Number.isNaN(expiryDate.getTime())) {
      console.error('[insertSession] invalid expiresAt:', expiresAt);
      throwError('Invalid expiresAt');
    }

    // 转成 MySQL DATETIME 格式：YYYY-MM-DD HH:MM:SS
    const mysqlExpiresAt = expiryDate
      .toISOString() // 2025-11-27T02:28:40.681Z
      .slice(0, 19) // 2025-11-27T02:28:40
      .replace('T', ' '); // 2025-11-27 02:28:40

    const [result] = await pool.query<any>(
      `
      INSERT INTO sessions (hashed_sid, user_id, expires_at, created_at)
      VALUES (?, ?, ?, NOW())
      `,
      [hashedSid, userId, mysqlExpiresAt],
    );

    if (!result || result.affectedRows !== 1) {
      throwError('Insert Session Failed');
    }

    return { hashedSid, expiresAt };
  } catch (error) {
    console.error('[libs/db_session/insertSession] Error:', error);
    throwError('Insert Session Failed');
  }
}

/**
 * Get user id by hashed session id
 * @param hashedSid 已哈希的 session id
 */
export async function getUserIdBySession(
  hashedSid: string,
): Promise<number | null> {
  logCall();

  if (!hashedSid) {
    // 没有 sid 本身就代表未登录，直接返回 null，不用抛错
    return null;
  }

  try {
    const pool = getDBPool();

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT user_id
      FROM sessions
      WHERE hashed_sid = ?
        AND expires_at > NOW()
      LIMIT 1
      `,
      [hashedSid],
    );

    const row = rows[0] as (RowDataPacket & { user_id: number }) | undefined;
    if (!row) {
      // session 不存在 / 过期：正常情况，返回 null
      return null;
    }

    return Number(row.user_id);
  } catch (error) {
    console.error('[db_sessions/getUserIdBySession]', error);
    throwError('Query Session Failed');
  }
}

/**
 * Delete session by sid (原始 sid)
 * @param sid 未哈希 session id
 * @returns 删除的条数
 */
export async function deleteSessionBySid(sid: string): Promise<number> {
  logCall();

  if (!sid) {
    throwError('Sid Missing');
  }

  const hashedSid = hashSession(sid);

  try {
    const pool = getDBPool();

    const [result] = await pool.query<any>(
      `
      DELETE FROM sessions
      WHERE hashed_sid = ?
      `,
      [hashedSid],
    );

    return Number(result.affectedRows ?? 0);
  } catch (error) {
    console.error('[libs/db_session/deleteSessionBySid]', error);
    throwError('Delete Session Failed');
  }
}
