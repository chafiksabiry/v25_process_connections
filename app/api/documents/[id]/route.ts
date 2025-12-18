import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const id = params.id;

  try {
    await File.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Document deleted' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


