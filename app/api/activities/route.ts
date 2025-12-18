import { NextRequest, NextResponse } from 'next/server';
import Activity from '../../../models/Activity';
import dbConnect from '../../../lib/db/mongodb';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const items = await Activity.find();
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}



