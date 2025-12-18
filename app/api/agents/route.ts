import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GigAgent from '@/models/GigAgent';
import Gig from '@/models/Gig'; // Needed for population

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) {
    return NextResponse.json({ success: false, message: 'Company ID is required' }, { status: 400 });
  }

  try {
    // 1. Find all Gigs for this company
    const gigs = await Gig.find({ companyId: companyId }).select('_id');
    const gigIds = gigs.map(g => g._id);

    // 2. Find all GigAgents for these gigs with active status
    const gigAgents = await GigAgent.find({
      gigId: { $in: gigIds },
      status: { $in: ['hired', 'active', 'enrolled'] }
    })
    .populate({
      path: 'agentId',
      populate: [
        { path: 'userId', select: 'email personalInfo' },
        { path: 'personalInfo.country', select: 'name' },
        { path: 'personalInfo.languages.language', select: 'name' }
      ]
    })
    .populate('gigId', 'title');

    // 3. Format the response for the panel
    const agents = gigAgents.map(ga => {
      const agent = ga.agentId;
      return {
        id: agent._id,
        name: agent.userId?.personalInfo?.name || agent.userId?.email || 'Unknown',
        email: agent.userId?.email,
        region: agent.personalInfo?.country?.name || 'Unknown',
        languages: agent.personalInfo?.languages?.map((l: any) => l.language?.name) || [],
        status: ga.status === 'hired' ? 'active' : ga.status,
        gigTitle: ga.gigId?.title,
        calls: 0, // Placeholder: Need call stats
        rating: 0, // Placeholder
        revenue: '$0' // Placeholder
      };
    });

    return NextResponse.json(agents);
  } catch (error: any) {
    console.error('Error fetching company agents:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

