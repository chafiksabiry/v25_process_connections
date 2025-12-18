import { NextRequest, NextResponse } from 'next/server';
import onboardingProgressService from '@/services/onboardingProgressService';

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const progress = await onboardingProgressService.getProgressByUserId(userId);
    return NextResponse.json(progress);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

