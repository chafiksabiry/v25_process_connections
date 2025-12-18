import { NextRequest, NextResponse } from 'next/server';
import onboardingProgressService from '@/services/onboardingProgressService';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  try {
    const { companyId } = await params;
    const body = await req.json();
    const { phase } = body;
    const progress = await onboardingProgressService.updateCurrentPhase(companyId, parseInt(phase));
    return NextResponse.json(progress);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}



