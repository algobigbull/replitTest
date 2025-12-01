'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ActivityTimeline from '@/components/ActivityTimeline';
import { cn, formatDate, formatDateTime, getStatusColor, getSourceColor } from '@/lib/utils';
import { Lead, Activity, Template } from '@/types';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Tag,
  Send,
  Plus,
  X,
} from 'lucide-react';

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('note');
  const [nextAction, setNextAction] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    fetchTemplates();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data.lead);
        setActivities(data.activities);
      } else {
        router.push('/leads');
      }
    } catch (error) {
      console.error('Failed to fetch lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/leads/${id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: noteType,
          content: noteContent,
          nextAction: nextAction || undefined,
          nextActionDate: nextActionDate || undefined,
        }),
      });

      if (res.ok) {
        setNoteContent('');
        setNoteType('note');
        setNextAction('');
        setNextActionDate('');
        setShowNoteForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendTemplate = async (templateId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/send-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: id, templateId }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        setShowTemplateModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to send template:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleUpdateFunnelDay = async (funnelDay: number) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ funnelDay }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update funnel day:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/leads');
      }
    } catch (error) {
      alert('Failed to delete lead');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Lead not found</p>
        <Link href="/leads" className="text-orange-600 hover:underline mt-2 inline-block">
          Back to leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/leads"
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
            <p className="text-slate-500">{lead.phone}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/leads/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Edit size={18} />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Lead Info</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <select
                  value={lead.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium border cursor-pointer',
                    getStatusColor(lead.status)
                  )}
                >
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Funnel Day</span>
                <select
                  value={lead.funnelDay}
                  onChange={(e) => handleUpdateFunnelDay(parseInt(e.target.value))}
                  className="px-3 py-1 rounded-lg border border-slate-300 text-sm"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(d => (
                    <option key={d} value={d}>Day {d}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Source</span>
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  getSourceColor(lead.source)
                )}>
                  {lead.source}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Interest</span>
                <span className="text-slate-900 font-medium">{lead.interest}</span>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Mail size={16} />
                  <a href={`mailto:${lead.email}`} className="hover:text-orange-600">
                    {lead.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={16} />
                  <a href={`tel:${lead.phone}`} className="hover:text-orange-600">
                    {lead.phone}
                  </a>
                </div>
              </div>

              {lead.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={16} className="text-slate-400" />
                    <span className="text-sm text-slate-500">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {lead.nextAction && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span className="text-sm text-slate-500">Next Action</span>
                  </div>
                  <p className="text-slate-900 font-medium">{lead.nextAction}</p>
                  {lead.nextActionDate && (
                    <p className="text-sm text-slate-500 mt-1">
                      {formatDateTime(lead.nextActionDate)}
                    </p>
                  )}
                </div>
              )}

              {lead.notes && (
                <div className="pt-4 border-t border-slate-200">
                  <span className="text-sm text-slate-500">Notes</span>
                  <p className="text-slate-700 mt-1">{lead.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 text-xs text-slate-400 space-y-1">
                <p>Created: {formatDateTime(lead.createdAt)}</p>
                {lead.lastContactedAt && (
                  <p>Last contacted: {formatDateTime(lead.lastContactedAt)}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-3">
              <a
                href={`tel:${lead.phone}`}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Phone size={20} />
                <span className="text-xs">Call</span>
              </a>
              <a
                href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                target="_blank"
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
              >
                <MessageCircle size={20} />
                <span className="text-xs">WhatsApp</span>
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
              >
                <Mail size={20} />
                <span className="text-xs">Email</span>
              </a>
            </div>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <Send size={18} />
              Send Template
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Activity Timeline</h2>
              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm hover:shadow-md transition-all"
              >
                <Plus size={16} />
                Add Note
              </button>
            </div>

            {showNoteForm && (
              <form onSubmit={handleAddNote} className="mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Type
                      </label>
                      <select
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      >
                        <option value="note">Note</option>
                        <option value="call">Call</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Next Action
                      </label>
                      <input
                        type="text"
                        value={nextAction}
                        onChange={(e) => setNextAction(e.target.value)}
                        placeholder="e.g., Follow up call"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Next Action Date
                    </label>
                    <input
                      type="datetime-local"
                      value={nextActionDate}
                      onChange={(e) => setNextActionDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={3}
                      required
                      placeholder="Add your note here..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNoteForm(false)}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold">Send Template</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {templates.length > 0 ? (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template._id}
                      className="p-4 border border-slate-200 rounded-lg hover:border-orange-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{template.name}</h4>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                          Day {template.day}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {template.content}
                      </p>
                      <button
                        onClick={() => handleSendTemplate(template._id)}
                        disabled={submitting}
                        className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm hover:shadow-md transition-all disabled:opacity-50"
                      >
                        {submitting ? 'Sending...' : 'Send This Template'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">
                  No templates available. Create templates first.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
