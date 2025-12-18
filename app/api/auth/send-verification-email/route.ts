import { NextRequest, NextResponse } from 'next/server';
import authService from '@/services/authService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;
    const result = await authService.sendVerificationEmail(email, code);
    return NextResponse.json({ message: result });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}



