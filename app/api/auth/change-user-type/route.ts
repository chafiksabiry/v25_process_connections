import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { userId, newType } = await req.json();

    if (!userId || !newType) {
      return NextResponse.json(
        { message: 'User ID and new type are required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    user.userType = newType;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'User type updated successfully',
      user: {
        _id: user._id,
        userType: user.userType,
        email: user.email
      }
    });

  } catch (error: any) {
    console.error('Error updating user type:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
