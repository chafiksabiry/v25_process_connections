import { NextRequest, NextResponse } from 'next/server';
import Agent from '@/models/Agent';
import dbConnect from '@/lib/db/mongodb';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const result = await req.json(); // The assessment result object
    const userId = params.id;

    // Find Agent profile
    let agent = await Agent.findOne({ userId });
    if (!agent) {
        agent = await Agent.findById(userId);
    }

    if (!agent) {
      return NextResponse.json({ error: 'Agent profile not found' }, { status: 404 });
    }

    // Prepare the skill object
    const skillData = {
        category: result.category,
        skill: result.skill,
        proficiency: result.proficiency,
        assessmentResults: {
            score: result.assessmentResults.score,
            strengths: result.assessmentResults.strengths,
            improvements: result.assessmentResults.improvements,
            feedback: result.assessmentResults.feedback,
            tips: result.assessmentResults.tips,
            keyMetrics: result.assessmentResults.keyMetrics,
            completedAt: new Date()
        }
    };

    // Update or push to skills.contactCenter
    const existingIndex = agent.skills.contactCenter.findIndex(
      (s: any) => s.skill === result.skill && s.category === result.category
    );

    if (existingIndex >= 0) {
      agent.skills.contactCenter[existingIndex] = skillData;
    } else {
      agent.skills.contactCenter.push(skillData);
    }

    await agent.save();
    return NextResponse.json(agent);
  } catch (error: any) {
    console.error('Error updating contact center assessment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

