import { NextRequest, NextResponse } from 'next/server';
import onboardingProgressService from '../../../../../services/onboardingProgressService';

export async function POST(req: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  try {
    const { companyId } = await params;
    const progress = await onboardingProgressService.resetProgress(companyId);
    return NextResponse.json(progress);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}



