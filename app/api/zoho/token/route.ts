import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { zohoService } from '@/services/zohoService';

export async function GET(req: NextRequest) {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = await zohoService.getValidToken(user.userId);
    return NextResponse.json({ 
        success: true, 
        access_token: token 
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 404 }); // 404 if config not found
  }
}

