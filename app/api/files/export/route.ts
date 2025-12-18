import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../../../lib/auth-middleware';
import fileService from '../../../../services/fileService';

export async function GET(req: NextRequest) {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const files = await fileService.exportFiles(user.userId);
    return NextResponse.json(files);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}



