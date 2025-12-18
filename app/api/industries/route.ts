import { NextRequest, NextResponse } from 'next/server';
import Industry from '../../../models/Industry';
import dbConnect from '../../../lib/db/mongodb';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const items = await Industry.find();
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}



