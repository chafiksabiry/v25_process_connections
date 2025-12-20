import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import { vertexService } from '@/services/ai/vertexService';

export async function POST(req: NextRequest) {
  // Skip execution during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 });
  }

  const user = authenticate(req);
  if (!user) {
    // For assessments, we might allow unauthenticated if session cookie exists?
    // But better to enforce auth.
    // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fileUri, languageCode } = await req.json();
    const result = await vertexService.transcribeAudio(fileUri, languageCode);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

