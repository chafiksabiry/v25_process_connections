import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { leadService } from '@/services/leads/leadService';

export async function GET(req: NextRequest) {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Additional filters can be extracted here
    const query: any = {};
    if (searchParams.get('pipeline')) query.Pipeline = searchParams.get('pipeline');
    if (searchParams.get('stage')) query.Stage = searchParams.get('stage');

    const result = await leadService.getAllLeads(query, { page, limit });
    
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const lead = await leadService.createLead({
      ...body,
      userId: user.userId // Associate with creating user
    });
    
    return NextResponse.json({
      success: true,
      data: lead
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}


