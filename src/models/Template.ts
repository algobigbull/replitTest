import mongoose, { Schema, Document, Model } from 'mongoose';
import { Template as TemplateType } from '@/types';

export interface TemplateDocument extends Omit<TemplateType, '_id'>, Document {}

const TemplateSchema = new Schema<TemplateDocument>(
  {
    name: { type: String, required: true, trim: true },
    day: { type: Number, required: true, min: 0, max: 7 },
    subject: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['whatsapp', 'email', 'sms'],
      default: 'whatsapp',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TemplateSchema.index({ day: 1 });
TemplateSchema.index({ isActive: 1 });

const Template: Model<TemplateDocument> = mongoose.models.Template || mongoose.model<TemplateDocument>('Template', TemplateSchema);

export default Template;
