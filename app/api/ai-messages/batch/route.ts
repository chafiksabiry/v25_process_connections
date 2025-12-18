import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import AIMessage from '@/models/AIMessage';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest) {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const messages = await req.json();
    
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Expected array of messages' }, { status: 400 });
    }

    await dbConnect();
    const result = await AIMessage.insertMany(messages);

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}

