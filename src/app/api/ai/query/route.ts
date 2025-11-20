import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { question, answer } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const prompt = `You are a helpful SQL tutor. A student is practicing SQL questions.

Question:
${question}

${answer ? `Correct Answer:\n${answer}\n\n` : ''}

Please provide:
1. A clear explanation of how to approach this SQL problem
2. Step-by-step breakdown of the solution
3. Key SQL concepts used
4. Common mistakes to avoid

Format your response in clear, easy-to-understand language. Use markdown for formatting if needed.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful SQL tutor. Explain SQL concepts clearly and provide step-by-step guidance.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      response: aiResponse,
    });
  } catch (error: any) {
    console.error('[AI Query Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get AI response',
      },
      { status: 500 }
    );
  }
}

