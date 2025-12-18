import { NextRequest, NextResponse } from 'next/server';
import { ProfessionalSkill, TechnicalSkill, SoftSkill } from '../../../models/Skill';
import dbConnect from '../../../lib/db/mongodb';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const [professional, technical, soft] = await Promise.all([
      ProfessionalSkill.find(),
      TechnicalSkill.find(),
      SoftSkill.find()
    ]);
    return NextResponse.json({ success: true, data: { professional, technical, soft } });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}



