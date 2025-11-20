import type { RowDataPacket } from 'mysql2';
import { throwError } from '../utils/errorUtils';
import { hashSession } from '../utils/sessionUtils';
import { logCall } from '../utils/logUtils';
import { getDBPool } from '../db';

/**
 * Insert session into db (MySQL)
 * @param sid       unhashed session id
 * @param userId    user id
 * @param expiresAt expirated time
 */
export async function insertSession(
  sid: string,
  userId: number,
  expiresAt: string, // ISO string
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

    // transfre MySQL DATETIME ：YYYY-MM-DD HH:MM:SS
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
 * @param hashedSid hashed session id
 */
export async function getUserIdBySession(
  hashedSid: string,
): Promise<number | null> {
  logCall();

  if (!hashedSid) {
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
      // session not exist/expired, return null
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
 * @param sid unhashed session id
 * @returns numbers of item deleted
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
