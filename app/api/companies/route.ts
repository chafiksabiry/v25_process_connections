import { NextRequest, NextResponse } from 'next/server';
import companyService from '../../../services/companyService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[API] Creating company:', {
      hasName: !!body.name,
      hasOverview: !!body.overview,
      userId: body.userId,
      keys: Object.keys(body)
    });
    
    const company = await companyService.createCompany(body);
    return NextResponse.json({ success: true, data: company }, { status: 201 });
  } catch (error: any) {
    console.error('[API] Company creation error:', {
      message: error.message,
      name: error.name,
      errors: error.errors,
      stack: error.stack
    });
    
    // Provide more detailed error message
    let errorMessage = error.message || 'Failed to create company';
    if (error.name === 'ValidationError' && error.errors) {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message).join(', ');
      errorMessage = `Validation error: ${validationErrors}`;
    }
    
    return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
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



