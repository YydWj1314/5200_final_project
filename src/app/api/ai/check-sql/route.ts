import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIService } from '@/libs/llm/openai';

// SQL Code Check
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userSQL, correctSQL, question } = body;

    console.log('[SQL Check API] Received request:', {
      hasUserSQL: !!userSQL,
      hasCorrectSQL: !!correctSQL,
      hasQuestion: !!question,
    });

    if (!userSQL || !correctSQL || !question) {
      const missing = [];
      if (!userSQL) missing.push('userSQL');
      if (!correctSQL) missing.push('correctSQL');
      if (!question) missing.push('question');
      
      console.error('[SQL Check API] Missing fields:', missing);
      return NextResponse.json(
        { 
          success: false,
          error: `Missing required fields: ${missing.join(', ')}` 
        },
        { status: 400 }
      );
    }

    console.log('[SQL Check API] Calling OpenAI service...');
    const openaiService = getOpenAIService();
    const feedback = await openaiService.checkSQL({
      userSQL,
      correctSQL,
      question,
    });

    console.log('[SQL Check API] Success, feedback length:', feedback?.length || 0);
    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error: any) {
    console.error('[SQL Check API] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to check SQL code';
    if (error.message?.includes('OPENAI_API_KEY')) {
      errorMessage = 'OpenAI API key is not configured. Please check your environment variables.';
    } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
      errorMessage = 'OpenAI API rate limit exceeded. Please try again later.';
    } else if (error.message?.includes('quota') || error.message?.includes('insufficient')) {
      errorMessage = 'OpenAI API quota exceeded. Please check your account billing.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

