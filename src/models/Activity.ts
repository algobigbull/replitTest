import mongoose, { Schema, Document, Model } from 'mongoose';
import { Activity as ActivityType } from '@/types';

export interface ActivityDocument extends Omit<ActivityType, '_id'>, Document {}

const ActivitySchema = new Schema<ActivityDocument>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    type: {
      type: String,
      enum: ['note', 'status_change', 'funnel_update', 'template_sent', 'call', 'whatsapp', 'email'],
      required: true,
    },
    content: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
  },
  { timestamps: true }
);

ActivitySchema.index({ leadId: 1, createdAt: -1 });

const Activity: Model<ActivityDocument> = mongoose.models.Activity || mongoose.model<ActivityDocument>('Activity', ActivitySchema);

export default Activity;
