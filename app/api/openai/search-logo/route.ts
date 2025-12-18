import { NextRequest, NextResponse } from 'next/server';
import openaiService from '../../../../services/openaiService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, companyWebsite } = body;
    const result = await openaiService.searchCompanyLogo(companyName, companyWebsite);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}



