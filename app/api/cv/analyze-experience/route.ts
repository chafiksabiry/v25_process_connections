import { NextResponse } from 'next/server';
import { cvService } from '@/services/cvService';

export async function POST(req: Request) {
  try {
    const { contentToProcess } = await req.json();
    const result = await cvService.analyzeExperience(contentToProcess);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in analyze-experience:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

