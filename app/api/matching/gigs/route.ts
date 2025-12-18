import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gig from '@/models/Gig';

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const gigs = await Gig.find({})
      .sort({ createdAt: -1 });

    return NextResponse.json(gigs);
  } catch (error: any) {
    console.error('Error fetching gigs for matching:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


