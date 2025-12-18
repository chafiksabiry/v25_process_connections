import { NextRequest, NextResponse } from 'next/server';
import authService from '@/services/authService';
import { isValidObjectId } from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!isValidObjectId(userId)) {
       return NextResponse.json({ error: 'Invalid userId format' }, { status: 400 });
    }

    const result = await authService.checkFirstLogin(userId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error in check-first-login:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
