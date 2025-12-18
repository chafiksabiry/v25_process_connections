import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import fileService from '@/services/fileService';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = authenticate(req);
  if (!user) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const file = await fileService.togglePublicAccess(id, user.userId);
    return NextResponse.json(file);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}



