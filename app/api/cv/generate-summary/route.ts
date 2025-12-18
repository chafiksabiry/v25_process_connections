import { NextResponse } from 'next/server';
import { cvService } from '@/services/cvService';

export async function POST(req: Request) {
  try {
    const { profileData } = await req.json();
    const result = await cvService.generateSummary(profileData);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in generate-summary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

