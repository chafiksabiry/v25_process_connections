import { NextRequest, NextResponse } from 'next/server';
import authService from '@/services/authService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await authService.login(body.email, body.password, req);
    
    return NextResponse.json({ 
      message: 'Verification code sent', 
      data: { code: result.verificationCode } 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Login error:", error.message);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }
}



