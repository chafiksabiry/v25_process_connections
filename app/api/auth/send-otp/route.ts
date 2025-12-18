import { NextRequest, NextResponse } from 'next/server';
import authService from '@/services/authService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, phoneNumber } = body;

    if (!userId || !phoneNumber) {
      return NextResponse.json({ error: 'userId and phoneNumber are required' }, { status: 400 });
    }

    const result = await authService.sendOTPWithTwilio(userId, phoneNumber);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



