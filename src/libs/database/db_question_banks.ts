/**
 * Data Access Layer (DAL) — Query methods for the `question_banks` table.
 *
 * MySQL 版本（GCP Cloud SQL）：
 * - 使用 getDBPool() 获取连接池
 * - 所有查询只返回 is_delete = 0 的记录
 */

import { Bank } from '@/types/Banks';
import { logCall } from '../utils/logUtils';
import { throwError } from '../utils/errorUtils';
import { getDBPool } from '../db';

/**
 * 获取所有题库（按创建时间倒序，限制条数）
 * @param limit
 * @returns
 */
export async function getAllBanks(limit = 12): Promise<Bank[]> {
  logCall();
  try {
    const pool = getDBPool();
    const [rows] = await pool.query(
      `
      SELECT
        id,
        title,
        topic,
        description,
        user_id,
        created_at,
        updated_at,
        edited_at,
        is_delete
      FROM question_banks
      WHERE is_delete = 0
      ORDER BY created_at DESC
      LIMIT ?
      `,
      [limit],
    );

    return rows as Bank[];
  } catch (error) {
    console.error('[libs/db_question_banks/getAllBanks]', error);
    throwError('Query question_banks failed');
  }
}

/**
 * 根据 id 获取单个题库
 * @param id
 * @returns
 */
export async function getBankById(id: number | string): Promise<Bank | null> {
  logCall();
  try {
    const pool = getDBPool();
    const [rows] = await pool.query(
      `
      SELECT
        id,
        title,
        topic,
        description,
        user_id,
        created_at,
        updated_at,
        edited_at,
        is_delete
      FROM question_banks
      WHERE is_delete = 0
        AND id = ?
      LIMIT 1
      `,
      [id],
    );

    const data = rows as Bank[];
    return data[0] ?? null;
  } catch (error) {
    console.error('[libs/db_question_banks/getBankById]', error);
    throwError('Query question_banks by id failed');
  }
}

/**
 * 根据 topic 获取题库列表
 * @param topic
 * @param limit
 * @returns
 */
export async function getBanksByTopic(
  topic: string,
  limit = 20,
): Promise<Bank[]> {
  logCall();
  try {
    const pool = getDBPool();
    const [rows] = await pool.query(
      `
      SELECT
        id,
        title,
        topic,
        description,
        user_id,
        created_at,
        updated_at,
        edited_at,
        is_delete
      FROM question_banks
      WHERE is_delete = 0
        AND topic = ?
      ORDER BY created_at DESC
      LIMIT ?
      `,
      [topic, limit],
    );

    return rows as Bank[];
  } catch (error) {
    console.error('[libs/db_question_banks/getBanksByTopic]', error);
    throwError('Query question_banks by topic failed');
  }
}
