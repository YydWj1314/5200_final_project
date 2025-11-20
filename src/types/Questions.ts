// 如果你的 int8 通过驱动返回为字符串，可把 Int8 改成 string

export interface Question {
  id: number; // int8
  title: string | null; // varchar
  content: string; // text
  tags: string[] | null; // jsonb（建议存 string[]）
  answer: string | null; // text
  user_id: number | null; // int8
  edited_at: string | null; // timestamptz
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
  is_delete: boolean; // bool
}

export interface QuestionInShowList {
  id: number; // int8
  title: string | null; // varchar
  content: string; // text
  tags: string[] | null; // jsonb（建议存 string[]）
  answer: string | null; // text
}

export interface QuestionInDetail {
  id: number | string; // int8
  title: string | null; // varchar
  content: string; // text
  tags: string[] | null; // jsonb（建议存 string[]）
  answer: string | null; // text
}

export interface QuestionInTopSaved {
  id: number; // int8
  content: string | null;
  tags: string[] | null;
  saved_count: number;
}
