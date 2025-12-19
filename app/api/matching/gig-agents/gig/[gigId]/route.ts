import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GigAgent from '@/models/GigAgent';

export async function GET(req: NextRequest, { params }: { params: Promise<{ gigId: string }> }) {
  await connectDB();
  const { gigId } = await params;

  try {
    const gigAgents = await GigAgent.find({ gigId })
      .populate({
        path: 'agentId',
        populate: [
            { path: 'userId', select: 'email personalInfo' },
            { path: 'personalInfo.country' }
        ]
      });

    return NextResponse.json(gigAgents);
  } catch (error: any) {
    console.error('Error fetching gig agents:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


