import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { zohoService } from '@/services/zohoService';

export async function POST(req: NextRequest) {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    // Assuming companyId is passed or we can derive it. For now, requiring it in body.
    // In a real app, we should probably get the user's company from their profile.
    const { companyId, clientId, clientSecret, refreshToken } = body;

    if (!companyId || !clientId || !clientSecret || !refreshToken) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await zohoService.configure(user.userId, companyId, {
        clientId,
        clientSecret,
        refreshToken
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

