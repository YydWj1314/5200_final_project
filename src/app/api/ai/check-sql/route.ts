import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIService } from '@/libs/llm/openai';

// SQL Code Check
export async function POST(req: NextRequest) {
  try {
    const { userSQL, correctSQL, question } = await req.json();

    if (!userSQL || !correctSQL || !question) {
      return NextResponse.json(
        { error: 'userSQL, correctSQL, and question are required' },
        { status: 400 }
      );
    }

    const openaiService = getOpenAIService();
    const feedback = await openaiService.checkSQL({
      userSQL,
      correctSQL,
      question,
    });

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error: any) {
    console.error('[SQL Check Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check SQL code',
      },
      { status: 500 }
    );
  }
}

