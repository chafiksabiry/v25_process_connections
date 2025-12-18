import { NextRequest, NextResponse } from 'next/server';
import companyService from '@/services/companyService';
import { authenticate } from '@/lib/auth-middleware';

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const company = await companyService.getCompanyByUserId(params.userId);
    if (!company) {
      return NextResponse.json({ success: false, message: 'Company not found for this user' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: company });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
