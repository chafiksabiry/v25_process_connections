import { NextResponse } from 'next/server';
import { cvService } from '@/services/cvService';

export async function POST(req: Request) {
  try {
    const { contentToProcess } = await req.json();
    const result = await cvService.analyzeAchievements(contentToProcess);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in analyze-achievements:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

