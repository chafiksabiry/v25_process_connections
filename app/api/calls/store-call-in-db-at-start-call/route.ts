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
    const { storeCall } = body;
    
    // Mapping frontend data to backend model
    const callData = {
        sid: storeCall.call_id,
        agent: storeCall.caller,
        // lead: storeCall.id_lead, // TODO: Resolve lead ID correctly if needed
        status: 'active',
        direction: 'outbound',
        createdAt: new Date(),
        phone_number: '0000000000' // Placeholder if not provided
    };

    const call = await callService.storeCall(callData);

    return NextResponse.json({
      success: true,
      _id: call._id,
      data: call
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}

