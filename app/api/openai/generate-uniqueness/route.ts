import { NextRequest, NextResponse } from 'next/server';
import openaiService from '../../../../services/openaiService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile } = body;
    const result = await openaiService.generateUniquenessCategories(profile);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}



