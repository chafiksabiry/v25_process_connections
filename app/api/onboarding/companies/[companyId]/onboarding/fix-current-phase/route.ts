import { NextRequest, NextResponse } from 'next/server';
import onboardingProgressService from '@/services/onboardingProgressService';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  try {
    const { companyId } = await params;
    const progress = await onboardingProgressService.fixCurrentPhase(companyId);
    return NextResponse.json({
        message: 'Current phase fixed successfully',
        progress
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}



