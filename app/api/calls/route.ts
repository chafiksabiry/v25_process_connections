import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { callService } from '@/services/calls/callService';

export async function GET(req: NextRequest) {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query: any = {};
    if (searchParams.get('userId')) {
        // If user wants their own calls or if filtering by user
        query.agent = searchParams.get('userId'); 
    } else {
        // Default to user's calls if not admin? Assuming basic behavior
        query.agent = user.userId;
    }

    const calls = await callService.getAllCalls(query);

    return NextResponse.json({
      success: true,
      data: calls,
      count: calls.length
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const call = await callService.createCall({
      ...body,
      agent: user.userId
    });

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

