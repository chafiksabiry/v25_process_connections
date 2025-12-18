import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IUser } from './User';
import { ICompany } from './Company';
import { IGig } from './Gig';

export interface ILead extends Document {
  userId?: Types.ObjectId | IUser;
  companyId?: Types.ObjectId | ICompany;
  assignedTo?: Types.ObjectId | IUser;
  gigId?: Types.ObjectId | IGig;
  refreshToken?: string;
  id?: string;
  Last_Activity_Time?: Date;
  Activity_Tag?: string;
  Deal_Name?: string;
  Stage?: string;
  Email_1?: string;
  Phone?: string;
  Telephony?: string;
  Pipeline?: string;
  value?: number; // Added based on DashboardService usage
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: false
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  gigId: {
    type: Schema.Types.ObjectId,
    ref: 'Gig',
    required: false
  },
  refreshToken: {
    type: String,
    required: false
  },
  id: {
    type: String,
    required: false
  },
  Last_Activity_Time: {
    type: Date,
    required: false
  },
  Activity_Tag: String,
  Deal_Name: {
    type: String,
    required: false
  },
  Stage: {
    type: String,
    required: false
  },
  Email_1: {
    type: String,
    required: false,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props: any) => `${props.value} is not a valid email address!`
    }
  },
  Phone: {
    type: String,
    required: false
  },
  Telephony: {
    type: String,
    required: false
  },
  Pipeline: {
    type: String,
    required: false
  },
  value: { // Added based on dashboard calculation
    type: Number,
    required: false,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', leadSchema);

export default Lead;


