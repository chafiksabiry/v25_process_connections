import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GigMatchingWeight from '@/models/GigMatchingWeight';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const gigId = params.id;

  try {
    const weights = await GigMatchingWeight.findOne({ gigId });

    if (!weights) {
      return NextResponse.json({ success: false, message: 'Weights not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: weights });
  } catch (error: any) {
    console.error('Error fetching gig weights:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const gigId = params.id;

  try {
    const body = await req.json();
    const { matchingWeights } = body;

    const weights = await GigMatchingWeight.findOneAndUpdate(
      { gigId },
      { matchingWeights },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: weights });
  } catch (error: any) {
    console.error('Error saving gig weights:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const gigId = params.id;

  try {
    await GigMatchingWeight.findOneAndDelete({ gigId });
    return NextResponse.json({ success: true, message: 'Weights reset successfully' });
  } catch (error: any) {
    console.error('Error resetting gig weights:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


