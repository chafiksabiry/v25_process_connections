import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import { authenticate } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  await connectDB();
  // const user = authenticate(req); // Optional authentication check

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const companyId = searchParams.get('companyId'); // Optional filter

    let query: any = {};
    if (type && type !== 'all') {
      query.type = type;
    }
    // if (companyId) { query.companyId = companyId; }

    const documents = await File.find(query).sort({ createdAt: -1 });

    // Map to frontend interface
    const formattedDocs = documents.map(doc => ({
      id: doc._id,
      name: doc.name,
      description: doc.metadata?.get('description') || '',
      type: doc.type,
      fileUrl: doc.path, // Or generate signed URL
      uploadedAt: doc.createdAt,
      uploadedBy: 'User', // Populate if needed
      tags: doc.metadata?.get('tags') || [],
      usagePercentage: 0,
      isPublic: doc.isPublic
    }));

    return NextResponse.json({ documents: formattedDocs });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  
  try {
    const body = await req.json();
    // Expecting body to have metadata, name, type, etc.
    // In a real app, file upload handles the binary, this handles the record.
    
    const newFile = await File.create({
      name: body.name,
      size: body.size || 0,
      type: body.type,
      path: body.fileUrl || '#',
      uploadedBy: body.userId || new Object('000000000000000000000000'), // Placeholder ID
      isPublic: true,
      metadata: {
        description: body.description,
        tags: body.tags
      }
    });

    return NextResponse.json({ success: true, document: newFile }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating document:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


