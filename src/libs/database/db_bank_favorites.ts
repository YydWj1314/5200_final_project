import { throwError } from '../utils/errorUtils';
import { logCall } from '../utils/logUtils';
import { getDBPool } from '../db';

/**
 * Get all banks data by bank_favorites for a user
 * @param userId
 * @returns
 */
export async function getBankFavoritesByUid(userId: number) {
  logCall();
  try {
    const pool = getDBPool();

    // 关联 user_bank_favorites + question_banks
    // 只要未删除的题库，按收藏时间倒序
    const [rows] = await pool.query(
      `
      SELECT 
        qb.id,
        qb.title,
        qb.description
      FROM user_bank_favorites ubf
      JOIN question_banks qb
        ON ubf.bank_id = qb.id
      WHERE ubf.user_id = ?
        AND qb.is_delete = 0
      ORDER BY ubf.created_at DESC
      `,
      [userId],
    );

    // rows 本身就是 banks 数组
    return rows as any[];
  } catch (error) {
    console.error('[libs/db_bank_favorites/getBankFavoritesByUid]', error);
    throwError('Query db user_bank_favorites Failed');
  }
}

/**
 * Get user's favorite bank record id by user id and bank id
 * @param userId
 * @param bankId
 */
export async function getBfIdByUidAndBid(
  userId: number,
  bankId: number,
): Promise<number | null> {
  logCall();
  try {
    const pool = getDBPool();

    const [rows] = await pool.query(
      `
      SELECT id
      FROM user_bank_favorites
      WHERE user_id = ?
        AND bank_id = ?
      LIMIT 1
      `,
      [userId, bankId],
    );

    const data = rows as { id: number }[];
    const row = data[0];
    return row ? row.id : null;
  } catch (error) {
    console.error('[libs/db_bank_favorites/getBfIdByUidAndBid]', error);
    throwError('Query db user_bank_favorites Failed');
  }
}

/**
 * Insert data into user_bank_favorites
 * @param userId
 * @param bankId
 * @returns inserted id
 */
export async function insertBankFavorites(
  userId: number,
  bankId: number,
): Promise<number> {
  logCall();
  try {
    const pool = getDBPool();

    const [result] = await pool.query<any>(
      `
      INSERT INTO user_bank_favorites (user_id, bank_id, created_at)
      VALUES (?, ?, NOW())
      `,
      [userId, bankId],
    );

    // MySQL insertId
    const insertId = result.insertId as number | undefined;
    if (!insertId) {
      throwError('Insert user_bank_favorites Failed');
    }

    return Number(insertId);
  } catch (error) {
    console.error('[libs/db_bank_favorites/insertBankFavorites]', error);
    throwError('Insert user_bank_favorites Failed');
  }
}

/**
 * Delete one favorite record by userId and bankId
 * @param userId
 * @param bankId
 * @returns affected rows count
 */
export async function cancelBankFavorites(
  userId: number,
  bankId: number,
): Promise<number> {
  logCall();
  try {
    const pool = getDBPool();

    const [result] = await pool.query<any>(
      `
      DELETE FROM user_bank_favorites
      WHERE user_id = ?
        AND bank_id = ?
      `,
      [userId, bankId],
    );

    // MySQL affectedRows
    return Number(result.affectedRows ?? 0);
  } catch (error) {
    console.error('[libs/db_bank_favorites/cancelBankFavorites]', error);
    throwError('Delete user_bank_favorites Failed');
  }
}

/**
 * Batch delete user favorite banks
 * @param userId
 * @param bankIds
 * @returns affected rows count
 */
export async function batchDeleteBankFavorites(
  userId: number,
  bankIds: number[],
): Promise<number> {
  logCall();
  try {
    if (!bankIds || bankIds.length === 0) {
      return 0;
    }

    const pool = getDBPool();

    // (?, ?, ?, ...)
    const placeholders = bankIds.map(() => '?').join(', ');

    const [result] = await pool.query<any>(
      `
      DELETE FROM user_bank_favorites
      WHERE user_id = ?
        AND bank_id IN (${placeholders})
      `,
      [userId, ...bankIds],
    );

    return Number(result.affectedRows ?? 0);
  } catch (error) {
    console.error('[libs/db_bank_favorites/batchDeleteBankFavorites]', error);
    throwError('Delete Favorites Failed');
  }
}
