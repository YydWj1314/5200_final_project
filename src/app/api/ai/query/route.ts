import { NextRequest } from 'next/server';
import { getOpenAIService } from '@/libs/llm/openai';

// Streaming response: Explain SQL question
export async function POST(req: NextRequest) {
  try {
    const { question, answer } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const openaiService = getOpenAIService();
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Use streaming response
          for await (const chunk of openaiService.explainSQLStream({
            question,
            answer,
          })) {
            // Send SSE formatted data
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            );
          }

          // Send end marker
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
          controller.close();
        } catch (error: any) {
          console.error('[AI Query Stream Error]', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error.message || 'Failed to get AI response' })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[AI Query Error]', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to get AI response',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

