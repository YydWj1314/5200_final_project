// OpenAI Service Wrapper

import OpenAI from 'openai';
import { PROMPTS } from './prompts';
import type { ExplainSQLRequest, CheckSQLRequest, LLMConfig } from './types';

class OpenAIService {
  private client: OpenAI;
  private defaultConfig: LLMConfig = {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1500,
  };

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    this.client = new OpenAI({
      apiKey,
    });
  }

  /**
   * Explain SQL question (streaming response)
   */
  async *explainSQLStream(
    request: ExplainSQLRequest,
    config?: Partial<LLMConfig>
  ): AsyncGenerator<string, void, unknown> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const prompt = PROMPTS.explainSQL(request.question, request.answer);

    try {
      const stream = await this.client.chat.completions.create({
        model: finalConfig.model,
        messages: [
          {
            role: 'system',
            content: PROMPTS.systemMessages.sqlTutor,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          yield content;
        }
      }
    } catch (error: any) {
      console.error('[OpenAI Service] explainSQLStream error:', error);
      throw new Error(
        error.message || 'Failed to get AI explanation'
      );
    }
  }

  /**
   * Explain SQL question (non-streaming, for compatibility)
   */
  async explainSQL(
    request: ExplainSQLRequest,
    config?: Partial<LLMConfig>
  ): Promise<string> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const prompt = PROMPTS.explainSQL(request.question, request.answer);

    try {
      const completion = await this.client.chat.completions.create({
        model: finalConfig.model,
        messages: [
          {
            role: 'system',
            content: PROMPTS.systemMessages.sqlTutor,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.maxTokens,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('[OpenAI Service] explainSQL error:', error);
      throw new Error(
        error.message || 'Failed to get AI explanation'
      );
    }
  }

  /**
   * Check SQL code
   */
  async checkSQL(
    request: CheckSQLRequest,
    config?: Partial<LLMConfig>
  ): Promise<string> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const prompt = PROMPTS.checkSQL(
      request.userSQL,
      request.correctSQL,
      request.question
    );

    try {
      const completion = await this.client.chat.completions.create({
        model: finalConfig.model,
        messages: [
          {
            role: 'system',
            content: PROMPTS.systemMessages.sqlReviewer,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.maxTokens,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('[OpenAI Service] checkSQL error:', error);
      throw new Error(error.message || 'Failed to check SQL code');
    }
  }
}

// Singleton pattern
let instance: OpenAIService | null = null;

export function getOpenAIService(): OpenAIService {
  if (!instance) {
    instance = new OpenAIService();
  }
  return instance;
}

