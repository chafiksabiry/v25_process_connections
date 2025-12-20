import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OnboardingProgress from '@/models/OnboardingProgress';
import mongoose from 'mongoose';

// POST /api/companies/[id]/onboarding - Initialize onboarding progress
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id: companyId } = await params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return NextResponse.json(
        { message: 'Invalid company ID format' },
        { status: 400 }
      );
    }

    const companyObjectId = new mongoose.Types.ObjectId(companyId);

    // Check if progress already exists
    const existingProgress = await OnboardingProgress.findOne({ companyId: companyObjectId });

    if (existingProgress) {
      return NextResponse.json(
        { message: 'Onboarding progress already exists for this company' },
        { status: 400 }
      );
    }

    // Create initial structure
    // Note: The structure here matches the one in OnboardingProgressController.ts
    const initialProgress = new OnboardingProgress({
      companyId: companyObjectId,
      currentPhase: 1,
      completedSteps: [1],
      phases: [
        { 
          id: 1, 
          status: 'in_progress', 
          steps: [
            { id: 1, status: 'completed', completedAt: new Date() },
            { id: 2, status: 'pending', disabled: true },
            { id: 3, status: 'pending' }
          ]
        },
        { id: 2, status: 'pending', steps: Array.from({length: 6}, (_, i) => ({ id: i + 4, status: 'pending' })) },
        { id: 3, status: 'pending', steps: Array.from({length: 3}, (_, i) => ({ id: i + 10, status: 'pending' })) },
        { id: 4, status: 'pending', steps: [{ id: 13, status: 'pending' }] }
      ]
    });

    console.log('[Onboarding] Attempting to save progress...');
    const savedProgress = await initialProgress.save();
    console.log('[Onboarding] Progress saved successfully:', savedProgress._id);
    
    return NextResponse.json(savedProgress, { status: 201 });
  } catch (error: any) {
    console.error('[Onboarding] Error initializing onboarding progress:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 500)
    });
    return NextResponse.json(
      { message: 'Error initializing onboarding progress', error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/companies/[id]/onboarding - Get onboarding progress
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id: companyId } = await params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return NextResponse.json(
        { message: 'Invalid company ID format' },
        { status: 400 }
      );
    }

    const progress = await OnboardingProgress.findOne({ companyId });
    
    if (!progress) {
      return NextResponse.json(
        { message: 'Onboarding progress not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error: any) {
    console.error('Error fetching onboarding progress:', error);
    return NextResponse.json(
      { message: 'Error fetching onboarding progress', error: error.message },
      { status: 500 }
    );
  }
}

