import mongoose, { Schema, Document, Model } from 'mongoose';
import { Lead as LeadType, LeadStatus, LeadSource } from '@/types';

export interface LeadDocument extends Omit<LeadType, '_id'>, Document {}

const LeadSchema = new Schema<LeadDocument>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    interest: { type: String, required: true, trim: true },
    source: {
      type: String,
      enum: ['GMB', 'IG', 'Walk-in', 'Website', 'Referral', 'Other'],
      required: true,
    },
    funnelDay: { type: Number, default: 0, min: 0, max: 7 },
    status: {
      type: String,
      enum: ['Hot', 'Warm', 'Cold'],
      default: 'Warm',
    },
    nextAction: { type: String, trim: true },
    nextActionDate: { type: Date },
    tags: [{ type: String, trim: true }],
    notes: { type: String, default: '' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    lastContactedAt: { type: Date },
  },
  { timestamps: true }
);

LeadSchema.index({ name: 'text', phone: 'text', email: 'text' });
LeadSchema.index({ status: 1 });
LeadSchema.index({ source: 1 });
LeadSchema.index({ funnelDay: 1 });
LeadSchema.index({ nextActionDate: 1 });
LeadSchema.index({ createdAt: -1 });

const Lead: Model<LeadDocument> = mongoose.models.Lead || mongoose.model<LeadDocument>('Lead', LeadSchema);

export default Lead;
