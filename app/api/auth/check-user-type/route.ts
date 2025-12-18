import { NextRequest, NextResponse } from 'next/server';
import authService from '@/services/authService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;
    const result = await authService.checkUserType(userId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



