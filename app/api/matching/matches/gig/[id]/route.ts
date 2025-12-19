import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agent from '@/models/Agent';
import Gig from '@/models/Gig';
import { MatchingEngine } from '@/lib/matching/engine';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id: gigId } = await params;

  try {
    const { weights } = await req.json();

    const gig = await Gig.findById(gigId)
      .populate('skills.professional.skill')
      .populate('skills.technical.skill')
      .populate('skills.soft.skill')
      .populate('skills.languages.language')
      .populate('industries')
      .populate('activities')
      .populate('destination_zone')
      .populate('availability.time_zone');

    if (!gig) {
      return NextResponse.json({ success: false, message: 'Gig not found' }, { status: 404 });
    }

    const agents = await Agent.find({ status: 'active' }) // Only active agents
      .populate('userId', 'email personalInfo')
      .populate('personalInfo.country')
      .populate('personalInfo.languages.language')
      .populate('skills.soft.skill')
      .populate('skills.professional.skill')
      .populate('skills.technical.skill')
      .populate('professionalSummary.industries')
      .populate('professionalSummary.activities')
      .populate('availability.timeZone');

    const matches = agents.map((agent) => {
      const { totalMatchingScore, details } = MatchingEngine.calculateScore(agent, gig, weights);
      
      return {
        agentId: agent._id,
        gigId: gig._id,
        totalMatchingScore,
        agentInfo: {
            name: agent.userId?.personalInfo?.name || agent.userId?.email || 'Unknown',
            email: agent.userId?.email,
            location: agent.personalInfo?.city || agent.personalInfo?.country?.name,
            languages: agent.personalInfo?.languages?.map((l: any) => ({
                language: l.language?.name,
                proficiency: l.proficiency
            })),
            skills: agent.skills,
            experience: agent.experience
        },
        skillsMatch: { score: details.skills, details: {} }, // Populate details if needed by frontend
        industryMatch: { score: details.industry, details: {} },
        languageMatch: { score: details.languages, details: {} },
        availabilityMatch: { score: details.availability, details: {} },
        // ... map other details
      };
    });

    // Sort by score descending
    matches.sort((a, b) => b.totalMatchingScore - a.totalMatchingScore);

    // Format response as expected by frontend MatchResponse
    const response = {
        totalMatches: matches.length,
        perfectMatches: matches.filter(m => m.totalMatchingScore >= 95).length,
        partialMatches: matches.filter(m => m.totalMatchingScore >= 70 && m.totalMatchingScore < 95).length,
        noMatches: matches.filter(m => m.totalMatchingScore < 50).length,
        preferedmatches: matches.slice(0, 5), // Top 5
        matches: matches
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error calculating matches:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


