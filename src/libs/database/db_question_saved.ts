import { logCall } from '../utils/logUtils';
import { throwError } from '../utils/errorUtils';
import { getDBPool } from '../db';
import type { RowDataPacket } from 'mysql2';

/**
 *
 * @param userId
 * @param questionId
 * @returns
 */
export async function insertQuestionSaved(
  userId: number,
  questionId: number,
): Promise<number> {
  logCall();
  try {
    const pool = getDBPool();

    const [result] = await pool.query<any>(
      `
      INSERT INTO user_question_saved (user_id, question_id, created_at)
      VALUES (?, ?, NOW())
      `,
      [userId, questionId],
    );

    return result.affectedRows ?? 0;
  } catch (error) {
    console.error('[db_question_saved/insertQuestionSaved]', error);
    throwError('Insert question saved failed');
  }
}

/**
 * Delete a saved question
 */
export async function cancelQuestionSaved(
  userId: number,
  questionId: number,
): Promise<number> {
  logCall();
  try {
    const pool = getDBPool();

    const [result] = await pool.query<any>(
      `
      DELETE FROM user_question_saved
      WHERE user_id = ?
        AND question_id = ?
      `,
      [userId, questionId],
    );

    return result.affectedRows ?? 0;
  } catch (error) {
    console.error('[db_question_saved/cancelQuestionSaved]', error);
    throwError('Delete question saved failed');
  }
}

/**
 * Get saved record id by userId & questionId
 */
export async function getSavedIdbyUidAndQid(
  userId: number,
  questionId: number,
): Promise<number | null> {
  logCall();
  try {
    const pool = getDBPool();

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT id
      FROM user_question_saved
      WHERE user_id = ?
        AND question_id = ?
      LIMIT 1
      `,
      [userId, questionId],
    );

    const row = rows[0] as (RowDataPacket & { id: number }) | undefined;
    return row ? row.id : null;
  } catch (error) {
    console.error('[db_question_saved/getSavedIdByUidAndQid]', error);
    throwError('Query user_question_saved failed');
  }
}
