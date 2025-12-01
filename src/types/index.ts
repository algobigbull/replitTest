export type LeadStatus = 'Hot' | 'Warm' | 'Cold';
export type LeadSource = 'GMB' | 'IG' | 'Walk-in' | 'Website' | 'Referral' | 'Other';
export type UserRole = 'admin' | 'agent';

export interface Lead {
  _id: string;
  name: string;
  phone: string;
  email: string;
  interest: string;
  source: LeadSource;
  funnelDay: number;
  status: LeadStatus;
  nextAction?: string;
  nextActionDate?: Date;
  tags: string[];
  notes: string;
  assignedTo?: string;
  createdAt: Date;
  lastContactedAt?: Date;
  updatedAt: Date;
}

export interface Activity {
  _id: string;
  leadId: string;
  type: 'note' | 'status_change' | 'funnel_update' | 'template_sent' | 'call' | 'whatsapp' | 'email';
  content: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
}

export interface Template {
  _id: string;
  name: string;
  day: number;
  subject: string;
  content: string;
  type: 'whatsapp' | 'email' | 'sms';
  isActive: boolean;
  createdAt: Date;
}

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  funnelDay?: number;
  tags?: string[];
  assignedTo?: string;
  q?: string;
}

export interface DashboardStats {
  total: number;
  hot: number;
  warm: number;
  cold: number;
  todayFollowUps: number;
  newToday: number;
}
