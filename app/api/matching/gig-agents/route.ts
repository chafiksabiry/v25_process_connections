import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GigAgent from '@/models/GigAgent';

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const { gigId, agentId, matchDetails, status } = body;

    const gigAgent = await GigAgent.create({
      gigId,
      agentId,
      matchDetails,
      status: status || 'invited',
    });

    return NextResponse.json(gigAgent, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
        return NextResponse.json({ success: false, message: 'Agent already associated with this gig' }, { status: 409 });
    }
    console.error('Error creating gig-agent:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


