import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for now
  return NextResponse.json({
    data: [
      { _id: '1', name: 'Communication', description: 'Effective communication skills', category: 'soft' },
      { _id: '2', name: 'Empathy', description: 'Ability to understand others feelings', category: 'soft' },
      { _id: '3', name: 'Problem Solving', description: 'Ability to solve complex problems', category: 'soft' },
    ]
  });
}

