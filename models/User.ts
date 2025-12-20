import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  fullName: string;
  password?: string;
  phone?: string;
  linkedInId?: string;
  isVerified: boolean;
  verificationCode?: {
    code?: string;
    expiresAt?: Date;
    otp?: number;
    otpExpiresAt?: Date;
  };
  ipHistory?: Array<{
    ip: string;
    timestamp: Date;
    action: 'register' | 'login';
    locationInfo?: {
      location?: mongoose.Types.ObjectId;
      region?: string;
      city?: string;
      isp?: string;
      postal?: string;
      coordinates?: string;
    };
  }>;
  createdAt: Date;
  typeUser?: string;
  firstTime: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: function(this: any) {
      return !this.linkedInId;
    }
  },
  phone: {
    type: String,
    required: function(this: any) {
      return !this.linkedInId;
    }
  },
  linkedInId: {
    type: String,
    sparse: true,
    unique: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    code: String,
    expiresAt: Date,
    otp: { type: Number },
    otpExpiresAt: { type: Date },
  },
  ipHistory: [{
    ip: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['register', 'login']
    },
    locationInfo: {
      location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timezone',
        required: false
      },
      region: String,
      city: String,
      isp: String,
      postal: String,
      coordinates: String // format: "lat,lng"
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  typeUser: {
    type :String,
    default: null,
  },
  firstTime: {
    type: Boolean,
    default: true
  }
});

userSchema.pre('save', async function(this: any) {
  const user = this;
  if (!user.isModified('password') || !user.password) {
    return;
  }
  
  try {
    user.password = await bcrypt.hash(user.password, 10);
  } catch (err: any) {
    throw new Error(err);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
