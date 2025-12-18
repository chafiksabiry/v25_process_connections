import { NextRequest, NextResponse } from 'next/server';
import authService from '@/services/authService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await authService.verifyEmail(body.email, body.code);
    return NextResponse.json({ token: result.token, result });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}



