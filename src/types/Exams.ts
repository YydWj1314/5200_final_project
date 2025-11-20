export type Question = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  answer: string;
  bank: string;
};

export type AnswerState = Record<string, string[]>; // { [qid]: ["A","C"] }
