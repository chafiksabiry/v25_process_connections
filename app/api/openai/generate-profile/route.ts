import { NextRequest, NextResponse } from 'next/server';
import openaiService from '../../../../services/openaiService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyInfo, userId } = body;
    
    console.log('[API] Generate profile request:', {
      userId,
      companyInfoLength: companyInfo?.length,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    });

    if (!companyInfo) {
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

    const result = await openaiService.generateCompanyProfile(companyInfo, userId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API] Generate profile error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Failed to generate company profile',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}



