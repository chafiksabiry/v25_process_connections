import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { callService } from '@/services/calls/callService';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { duration } = body;
    
    const call = await callService.endCall(id, duration);

    if (!call) {
      return NextResponse.json({ success: false, error: 'Call not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: call
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}

