import { NextRequest, NextResponse } from 'next/server';
import authService from '@/services/authService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;
    const { token, user } = await authService.linkedinSignIn(code);
    return NextResponse.json({ token, user });
  } catch (error: any) {
    console.error("LinkedIn OAuth Error:", error);
    return NextResponse.json({ error: "LinkedIn authentication failed" }, { status: 500 });
  }
}



