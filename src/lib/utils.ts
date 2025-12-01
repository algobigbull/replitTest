import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Hot':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Warm':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Cold':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getSourceColor(source: string): string {
  switch (source) {
    case 'GMB':
      return 'bg-green-100 text-green-800';
    case 'IG':
      return 'bg-pink-100 text-pink-800';
    case 'Walk-in':
      return 'bg-purple-100 text-purple-800';
    case 'Website':
      return 'bg-blue-100 text-blue-800';
    case 'Referral':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function generateLeadTableText(leads: any[]): string {
  if (leads.length === 0) return 'No leads to display';
  
  const header = '| Name | Phone | Status | Day | Next Action |';
  const separator = '|------|-------|--------|-----|-------------|';
  const rows = leads.map(lead => 
    `| ${lead.name} | ${lead.phone} | ${lead.status} | D${lead.funnelDay} | ${lead.nextAction || '-'} |`
  );
  
  return [header, separator, ...rows].join('\n');
}
