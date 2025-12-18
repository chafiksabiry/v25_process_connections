import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { agentService } from '@/services/agentService';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    // updateBasicInfo is not explicitly in AgentService yet, but updateProfile handles it.
    // However, the original code had a specific method. I should probably add it or just use updateProfile.
    // updateProfile handles partial updates via findByIdAndUpdate.
    const profile = await agentService.updateProfile(id, body);
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

