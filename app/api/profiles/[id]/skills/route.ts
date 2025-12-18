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
    // Body is expected to be { skills: { technical: [], ... } }
    // I should implement transformSkillsPayload if needed, but for now I'll assume frontend sends correct format 
    // or agentService handles it. 
    // agentService.updateProfile just saves what it gets.
    const profile = await agentService.updateProfile(id, { skills: body.skills });
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

