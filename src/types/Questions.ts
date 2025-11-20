/**
 * Raw Question row from the database.
 * Matches the structure of the `questions` table in MySQL.
 */
export interface Question {
  id: number; // BIGINT
  title: string | null; // VARCHAR
  content: string; // TEXT
  tags: string[] | null; // JSON
  answer: string | null; // TEXT

  user_id: number | null; // BIGINT
  edited_at: string | null; // DATETIME (ISO string)
  created_at: string; // DATETIME
  updated_at: string; // DATETIME

  is_delete: boolean; // TINYINT(1) mapped to boolean
  saved_count: number; // BIGINT
}

/**
 * Minimal question shape for display in a list (e.g. saved questions).
 */
export interface QuestionInShowList {
  id: number;
  title: string | null;
  content: string;
  tags: string[] | null;
  answer: string | null;
}

/**
 * Question detail view — same fields as show list, separated for clarity.
 */
export interface QuestionInDetail {
  id: number;
  title: string | null;
  content: string;
  tags: string[] | null;
  answer: string | null;
}

/**
 * Lightweight structure for "Top Saved Questions" ranking.
 */
export interface QuestionInTopSaved {
  id: number;
  content: string;
  tags: string[] | null;
  saved_count: number;
}
