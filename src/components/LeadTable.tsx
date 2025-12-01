'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn, getStatusColor, getSourceColor, formatDate, formatRelativeTime } from '@/lib/utils';
import { Lead } from '@/types';
import {
  ChevronUp,
  ChevronDown,
  Phone,
  Mail,
  MessageCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

interface LeadTableProps {
  leads: Lead[];
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onDelete?: (id: string) => void;
}

export default function LeadTable({
  leads,
  selectedIds,
  onSelectChange,
  sortBy,
  sortOrder,
  onSort,
  onDelete,
}: LeadTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      onSelectChange([]);
    } else {
      onSelectChange(leads.map(l => l._id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const SortHeader = ({ field, label }: { field: string; label: string }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortBy === field && (
          sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        )}
      </div>
    </th>
  );

  const handleQuickAction = (type: string, lead: Lead) => {
    switch (type) {
      case 'call':
        window.open(`tel:${lead.phone}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:${lead.email}`, '_blank');
        break;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={selectedIds.length === leads.length && leads.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              />
            </th>
            <SortHeader field="name" label="Name" />
            <SortHeader field="status" label="Status" />
            <SortHeader field="source" label="Source" />
            <SortHeader field="funnelDay" label="Day" />
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Interest
            </th>
            <SortHeader field="nextActionDate" label="Next Action" />
            <SortHeader field="createdAt" label="Created" />
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Quick Actions
            </th>
            <th className="px-4 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {leads.map((lead) => (
            <tr
              key={lead._id}
              className={cn(
                'hover:bg-slate-50 transition-colors',
                selectedIds.includes(lead._id) && 'bg-orange-50'
              )}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(lead._id)}
                  onChange={() => toggleSelect(lead._id)}
                  className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
              </td>
              <td className="px-4 py-3">
                <Link href={`/leads/${lead._id}`} className="group">
                  <p className="font-medium text-slate-900 group-hover:text-orange-600 transition-colors">
                    {lead.name}
                  </p>
                  <p className="text-sm text-slate-500">{lead.phone}</p>
                </Link>
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'inline-flex px-2.5 py-1 rounded-full text-xs font-medium border',
                  getStatusColor(lead.status)
                )}>
                  {lead.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'inline-flex px-2.5 py-1 rounded-full text-xs font-medium',
                  getSourceColor(lead.source)
                )}>
                  {lead.source}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-medium">
                  D{lead.funnelDay}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600 max-w-[150px] truncate">
                {lead.interest}
              </td>
              <td className="px-4 py-3">
                {lead.nextAction ? (
                  <div>
                    <p className="text-sm text-slate-900">{lead.nextAction}</p>
                    {lead.nextActionDate && (
                      <p className="text-xs text-slate-500">
                        {formatDate(lead.nextActionDate)}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">
                {formatRelativeTime(lead.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleQuickAction('call', lead)}
                    className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                    title="Call"
                  >
                    <Phone size={16} />
                  </button>
                  <button
                    onClick={() => handleQuickAction('whatsapp', lead)}
                    className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleQuickAction('email', lead)}
                    className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors"
                    title="Email"
                  >
                    <Mail size={16} />
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 relative">
                <button
                  onClick={() => setOpenMenu(openMenu === lead._id ? null : lead._id)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                {openMenu === lead._id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setOpenMenu(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                      <Link
                        href={`/leads/${lead._id}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setOpenMenu(null)}
                      >
                        <Eye size={14} />
                        View Details
                      </Link>
                      <Link
                        href={`/leads/${lead._id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setOpenMenu(null)}
                      >
                        <Edit size={14} />
                        Edit Lead
                      </Link>
                      {onDelete && (
                        <button
                          onClick={() => {
                            onDelete(lead._id);
                            setOpenMenu(null);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {leads.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No leads found</p>
        </div>
      )}
    </div>
  );
}
