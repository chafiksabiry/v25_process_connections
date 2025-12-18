import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { agentService } from '@/services/agentService';

export async function GET(req: NextRequest) {
  const user = authenticate(req);
  if (!user) {
    // If not authenticated, assume profile doesn't exist? Or return 401?
    // Frontend checkProfileExists handles errors.
    return NextResponse.json({ exists: false });
  }

  try {
    const profile = await agentService.getProfile(user.userId);
    return NextResponse.json({ exists: !!profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

