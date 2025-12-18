import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { callService } from '@/services/calls/callService';

export async function POST(req: NextRequest) {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { to } = body; // Frontend sends { to: phoneNumber }

    if (!to) {
       return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    const call = await callService.initiateCall(user.userId, to);

    return NextResponse.json({
      success: true,
      data: call
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}

