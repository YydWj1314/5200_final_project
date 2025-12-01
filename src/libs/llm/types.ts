// LLM Related Type Definitions

export interface ExplainSQLRequest {
  question: string;
  answer?: string;
}

export interface ExplainSQLResponse {
  explanation: string;
  steps: string[];
  concepts: string[];
  commonMistakes: string[];
}

export interface CheckSQLRequest {
  userSQL: string;
  correctSQL: string;
  question: string;
}

export interface CheckSQLResponse {
  isCorrect: boolean;
  score: number; // 0-100
  feedback: string;
  errors?: string[];
  suggestions?: string[];
  performanceTips?: string[];
}

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

