import { NextRequest, NextResponse } from 'next/server';
import onboardingProgressService from '@/services/onboardingProgressService';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ companyId: string, phaseId: string, stepId: string }> }) {
  try {
    const { companyId, phaseId, stepId } = await params;
    const body = await req.json();
    const { status } = body;
    const progress = await onboardingProgressService.updateStepProgress(companyId, parseInt(phaseId), parseInt(stepId), status);
    return NextResponse.json(progress);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}



