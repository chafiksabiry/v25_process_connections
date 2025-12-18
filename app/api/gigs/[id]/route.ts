import { NextRequest, NextResponse } from 'next/server';
import gigService from '../../../../services/gigService';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const gig = await gigService.getGigById(id);
    return NextResponse.json({ success: true, data: gig });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const gig = await gigService.updateGig(id, body);
    return NextResponse.json({ success: true, data: gig });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const gig = await gigService.deleteGig(id);
    return NextResponse.json({ success: true, message: 'Gig deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}



