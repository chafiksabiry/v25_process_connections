import { NextRequest, NextResponse } from 'next/server';
import companyService from '../../../services/companyService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const company = await companyService.createCompany(body);
    return NextResponse.json({ success: true, data: company }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const companies = await companyService.getAllCompanies();
    return NextResponse.json({ success: true, data: companies });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}



