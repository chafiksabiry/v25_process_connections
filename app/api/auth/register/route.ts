import { NextRequest, NextResponse } from 'next/server';
import authService from '@/services/authService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Registration attempt:", { email: body.email, fullName: body.fullName, phone: body.phone });
    const result = await authService.register(body, req);
    
    return NextResponse.json({ 
      message: 'Registration successful', 
      data: { code: result.verificationCode , _id: result.result._id } 
    }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: error.message, stack: error.stack }, { status: 400 });
  }
}
