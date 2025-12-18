import { NextRequest, NextResponse } from 'next/server';
import { callService } from '@/services/calls/callService';

export async function POST(req: NextRequest) {
  // AI Assist might not always be authenticated if called from a webhook or background process, 
  // but for frontend calls it should be.
  // Assuming frontend calls it.
  
  try {
    const body = await req.json();
    const { transcription, context } = body;

    const result = await callService.processAIAssist(transcription, context || []);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

