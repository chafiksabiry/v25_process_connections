import { NextRequest, NextResponse } from 'next/server';
import gigService from '../../../services/gigService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const gig = await gigService.createGig(body);
    return NextResponse.json({ success: true, data: gig }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const gigs = await gigService.getAllGigs();
    return NextResponse.json({ success: true, data: gigs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}



