import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { callService } from '@/services/calls/callService';
import Call from '@/models/Call';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { phoneNumber, callSid } = body;
    
    await dbConnect();
    
    // Find call by SID and update
    let call = await Call.findOne({ sid: callSid });
    
    if (call) {
        call.status = 'completed';
        call.updatedAt = new Date();
        await call.save();
    } else {
        // If not found (maybe not created at start), create it
        // Note: This logic depends on how consistent the SID is between start/end
        console.warn(`Call with SID ${callSid} not found at end call, creating new record.`);
        call = await Call.create({
            sid: callSid,
            agent: user.userId,
            phone_number: phoneNumber,
            direction: 'outbound',
            status: 'completed'
        });
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

