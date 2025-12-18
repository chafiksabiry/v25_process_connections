import { NextRequest, NextResponse } from 'next/server';
import authService from '@/services/authService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await authService.linkedInAuth(body.code);
    return NextResponse.json({ token: result.token });
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    return NextResponse.json({ message: 'Failed to authenticate with LinkedIn' }, { status: 500 });
  }
}



