import { logCall } from '../utils/logUtils';
import { throwError } from '../utils/errorUtils';
import { getDBPool } from '../db';
import type { RowDataPacket } from 'mysql2';
import {
  QuestionInShowList,
  QuestionInTopSaved,
  QuestionInDetail,
} from '@/types/Questions';

/**
 * Get questions by bankId
 * Used in exam page for a specific question bank.
 */
export async function getQuestionsByBankId(
  bankId: number,
): Promise<QuestionInShowList[]> {
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

    return (rows as any[]).map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content ?? '',
      tags:
        typeof r.tags === 'string'
          ? (JSON.parse(r.tags) as string[])
          : (r.tags as string[] | null),
      answer: r.answer,
    }));
  } catch (error) {
    console.error('[db_questions/getQuestionsByBankId]', error);
    throwError('Query questions failed');
  }
}

/**
 * Get question list (all, not deleted)
 * Used by QuestionsPage main list.
 */
export async function getAllQuestions(): Promise<QuestionInShowList[]> {
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

    return (rows as any[]).map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content ?? '',
      tags:
        typeof r.tags === 'string'
          ? (JSON.parse(r.tags) as string[])
          : (r.tags as string[] | null),
      answer: r.answer,
    }));
  } catch (error) {
    console.error('[db_questions/getAllQuestions]', error);
    throwError('Query questions failed');
  }
}

/**
 * Get question detail by question id
 * @param questionId
 * @returns
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
        tags,
        answer
      FROM questions
      WHERE id = ?
        AND is_delete = 0
      LIMIT 1
      `,
      [questionId],
    );

    const row = (rows as any[])[0];
    if (!row) return null;

    const detail: QuestionInDetail = {
      id: row.id,
      title: row.title,
      content: row.content ?? '',
      tags:
        typeof row.tags === 'string'
          ? (JSON.parse(row.tags) as string[])
          : (row.tags as string[] | null),
      answer: row.answer,
    };

    return detail;
  } catch (error) {
    console.error('[db_questions/getQuestionByQid]', error);
    throwError('Query question by id failed');
  }
}

/**
 * Get questions saved by userId
 * Used in "My Banks / My Favorites" page.
 */
export async function getSavedQuestionsByUserId(
  userId: number,
): Promise<QuestionInShowList[]> {
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

    return (rows as any[]).map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content ?? '',
      tags:
        typeof r.tags === 'string'
          ? (JSON.parse(r.tags) as string[])
          : (r.tags as string[] | null),
      answer: r.answer,
    }));
  } catch (error) {
    console.error('[db_questions/getSavedQuestionsByUserId]', error);
    throwError('Get saved questions failed');
  }
}

/**
 * Search questions by string in title / content / answer
 */
export async function searchQuestionsByStr(
  str: string,
): Promise<QuestionInShowList[]> {
  logCall();
  try {
    const pool = getDBPool();

    const q = str?.trim();
    if (!q) return [];

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
          title   LIKE ?
          OR content LIKE ?
          OR answer  LIKE ?
        )
      ORDER BY id DESC
      `,
      [pattern, pattern, pattern],
    );

    return rows as unknown as QuestionInShowList[];
  } catch (error) {
    console.error('[db_questions/searchQuestionsByStr]', error);
    throwError('Search questions failed');
  }
}

// Escape special characters in LIKE pattern: %, _ and \
function escapeLike(s: string) {
  return s
    .replaceAll('\\', '\\\\') // escape backslash first
    .replaceAll('%', '\\%')
    .replaceAll('_', '\\_');
}

/**
 * Get top saved questions (by saved_count)
 * Used for "Top Saved" sidebar.
 */
export async function getTopSavedQuestions(
  limit: number,
): Promise<QuestionInTopSaved[]> {
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
      ORDER BY saved_count DESC, id DESC
      LIMIT ?
      `,
      [limit],
    );

    return (rows as any[]).map((r) => ({
      id: r.id,
      content: r.content ?? '',
      tags:
        typeof r.tags === 'string'
          ? (JSON.parse(r.tags) as string[])
          : (r.tags as string[] | null),
      saved_count: Number(r.saved_count ?? 0),
    }));
  } catch (error) {
    console.error('[db_questions/getTopSavedQuestions]', error);
    throwError('Query top saved questions failed');
  }
}
