'use client';

import { cn, formatDateTime } from '@/lib/utils';
import { Activity } from '@/types';
import {
  MessageSquare,
  TrendingUp,
  Zap,
  Send,
  Phone,
  MessageCircle,
  Mail,
} from 'lucide-react';

interface ActivityTimelineProps {
  activities: Activity[];
}

const activityIcons = {
  note: MessageSquare,
  status_change: TrendingUp,
  funnel_update: Zap,
  template_sent: Send,
  call: Phone,
  whatsapp: MessageCircle,
  email: Mail,
};

const activityColors = {
  note: 'bg-blue-100 text-blue-600',
  status_change: 'bg-purple-100 text-purple-600',
  funnel_update: 'bg-orange-100 text-orange-600',
  template_sent: 'bg-green-100 text-green-600',
  call: 'bg-cyan-100 text-cyan-600',
  whatsapp: 'bg-emerald-100 text-emerald-600',
  email: 'bg-pink-100 text-pink-600',
};

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type] || MessageSquare;
        const colorClass = activityColors[activity.type] || 'bg-gray-100 text-gray-600';

        return (
          <div key={activity._id} className="flex gap-4">
            <div className="relative">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                colorClass
              )}>
                <Icon size={18} />
              </div>
              {index < activities.length - 1 && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-200" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900 capitalize">
                  {activity.type.replace('_', ' ')}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDateTime(activity.createdAt)}
                </p>
              </div>
              <p className="text-sm text-slate-600 mt-1">{activity.content}</p>
              <p className="text-xs text-slate-400 mt-1">by {activity.userName}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
