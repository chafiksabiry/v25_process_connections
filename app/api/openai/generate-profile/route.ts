import { NextRequest, NextResponse } from 'next/server';
import openaiService from '../../../../services/openaiService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyInfo, userId } = body;
    
    console.log('[API] Generate profile request:', {
      userId,
      companyInfoLength: companyInfo?.length,
      companyInfoPreview: companyInfo?.substring(0, 200),
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    });

    if (!companyInfo) {
      console.error('[API] Missing companyInfo in request body');
      return NextResponse.json({ 
        success: false, 
        message: 'Company info is required' 
      }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('[API] OPENAI_API_KEY is not configured');
      return NextResponse.json({ 
        success: false, 
        message: 'OpenAI API key is not configured' 
      }, { status: 500 });
    }

    console.log('[API] Calling OpenAI service...');
    const result = await openaiService.generateCompanyProfile(companyInfo, userId);
    console.log('[API] Profile generated successfully:', {
      companyName: result?.name,
      hasData: !!result
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API] Generate profile error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
      status: error.status,
      code: error.code
    });
    
    const errorMessage = error.message || 'Failed to generate company profile';
    const statusCode = error.status || 500;
    
    return NextResponse.json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name,
        cause: error.cause
      } : undefined
    }, { status: statusCode });
  }
}



