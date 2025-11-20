import { Question } from '@/types/Exams'; // 字段需与 DB 对齐
import { logCall } from '../utils/logUtils';
import { throwError } from '../utils/errorUtils';
import { QuestionInDetail } from '@/types/Questions';
import { getDBPool } from '../db';
import type { RowDataPacket } from 'mysql2';

/**
 * Get questions by bankId
 */
export async function getQuestionsByBankId(
  bankId: number,
): Promise<Question[]> {
  logCall();
  try {
    const pool = getDBPool();

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        q.id,
        q.title,
        q.content,
        q.tags,
        q.answer
      FROM question_bank_questions qbq
      JOIN questions q
        ON qbq.question_id = q.id
      WHERE qbq.question_bank_id = ?
        AND q.is_delete = 0
      ORDER BY q.created_at DESC
      `,
      [bankId],
    );

    return rows as unknown as Question[];
  } catch (error) {
    console.error('[db_questions/getQuestionsByBankId]', error);
    throwError('Query questions failed');
  }
}

/**
 * Get question list (all, not deleted)
 */
export async function getAllQuestions(): Promise<Question[]> {
  logCall();
  try {
    const pool = getDBPool();

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        id,
        title,
        content,
        tags,
        answer
      FROM questions
      WHERE is_delete = 0
      ORDER BY created_at DESC
      `,
    );

    return rows as unknown as Question[];
  } catch (error) {
    console.error('[db_questions/getAllQuestions]', error);
    throwError('Query questions failed');
  }
}

/**
 * Get question by questionId
 */
export async function getQuestionByQid(
  questionId: number,
): Promise<QuestionInDetail | null> {
  logCall();
  try {
    const pool = getDBPool();

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        id,
        title,
        content,
        answer,
        tags,
        updated_at
      FROM questions
      WHERE id = ?
        AND is_delete = 0
      LIMIT 1
      `,
      [questionId],
    );

    const row = rows[0] as (RowDataPacket & QuestionInDetail) | undefined;
    return row ?? null;
  } catch (error) {
    console.error('[db_questions/getQuestionByQid]', error);
    throwError('Query questions failed');
  }
}

/**
 * Get saved questions by userId
 */
export async function getSavedQuestionsByUserId(
  userId: number,
): Promise<Question[]> {
  logCall();
  try {
    const pool = getDBPool();

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        q.id,
        q.title,
        q.content,
        q.tags,
        q.answer
      FROM user_question_saved uqs
      JOIN questions q
        ON uqs.question_id = q.id
      WHERE uqs.user_id = ?
        AND q.is_delete = 0
      ORDER BY uqs.created_at DESC
      `,
      [userId],
    );

    return rows as unknown as Question[];
  } catch (error) {
    console.error('[db_questions/getSavedQuestionsByUserId]', error);
    throwError('Get saved questions failed');
  }
}

/**
 * Search questions by string in title / content / answer
 */
export async function searchQuestionsByStr(str: string): Promise<Question[]> {
  logCall();
  try {
    const pool = getDBPool();

    const q = str?.trim();
    if (!q) return [];

    // 使用 LIKE 模糊搜索（参数绑定，不怕注入）
    const pattern = `%${escapeLike(q)}%`;

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        id,
        title,
        content,
        tags,
        answer
      FROM questions
      WHERE is_delete = 0
        AND (
          title   LIKE ? ESCAPE '\\'
          OR content LIKE ? ESCAPE '\\'
          OR answer  LIKE ? ESCAPE '\\'
        )
      ORDER BY id DESC
      `,
      [pattern, pattern, pattern],
    );

    return rows as unknown as Question[];
  } catch (error) {
    console.error('[db_questions/searchQuestionsByStr]', error);
    throwError('Search questions failed');
  }
}

// 工具：转义 LIKE 的特殊字符（%, _ 和 \）
function escapeLike(s: string) {
  return s
    .replaceAll('\\', '\\\\') // 先转义反斜杠
    .replaceAll('%', '\\%')
    .replaceAll('_', '\\_');
}

/**
 * Get top saved questions (by saved_count)
 */
export async function getTopSavedQuestions(limit: number): Promise<Question[]> {
  logCall();
  try {
    const pool = getDBPool();

    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        id,
        content,
        tags,
        saved_count
      FROM questions
      WHERE is_delete = 0
      ORDER BY saved_count DESC
      LIMIT ?
      `,
      [limit],
    );

    // 这里返回的字段比 Question 少一点，前端用的时候注意类型
    return rows as unknown as Question[];
  } catch (error) {
    console.error('[db_questions/getTopSavedQuestions]', error);
    throwError('Query top saved questions failed');
  }
}
