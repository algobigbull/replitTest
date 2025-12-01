'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import LeadTable from '@/components/LeadTable';
import { Lead, LeadStatus, LeadSource } from '@/types';
import { generateLeadTableText } from '@/lib/utils';
import {
  Search,
  Filter,
  Download,
  Upload,
  UserPlus,
  Copy,
  X,
  ChevronDown,
} from 'lucide-react';

const statuses: LeadStatus[] = ['Hot', 'Warm', 'Cold'];
const sources: LeadSource[] = ['GMB', 'IG', 'Walk-in', 'Website', 'Referral', 'Other'];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    funnelDay: '',
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (filters.status) params.set('status', filters.status);
      if (filters.source) params.set('source', filters.source);
      if (filters.funnelDay) params.set('funnelDay', filters.funnelDay);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('page', pagination.page.toString());

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  }, [search, filters, sortBy, sortOrder, pagination.page]);

  useEffect(() => {
    const debounce = setTimeout(fetchLeads, 300);
    return () => clearTimeout(debounce);
  }, [fetchLeads]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (selectedIds.length > 0) {
      params.set('ids', selectedIds.join(','));
    } else {
      if (filters.status) params.set('status', filters.status);
      if (filters.source) params.set('source', filters.source);
      if (filters.funnelDay) params.set('funnelDay', filters.funnelDay);
    }

    window.open(`/api/leads/export?${params.toString()}`, '_blank');
  };

  const handleCopyTable = () => {
    const leadsToExport = selectedIds.length > 0
      ? leads.filter(l => selectedIds.includes(l._id))
      : leads;
    
    const tableText = generateLeadTableText(leadsToExport);
    navigator.clipboard.writeText(tableText);
    alert('Lead table copied to clipboard!');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Imported ${data.imported} leads successfully!${data.errors.length > 0 ? `\n\nErrors:\n${data.errors.join('\n')}` : ''}`);
        fetchLeads();
      } else {
        alert(data.error || 'Import failed');
      }
    } catch (error) {
      alert('Import failed');
    }

    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLeads();
      }
    } catch (error) {
      alert('Failed to delete lead');
    }
  };

  const handleBulkAction = async (action: string, value?: string) => {
    if (selectedIds.length === 0) {
      alert('Please select leads first');
      return;
    }

    try {
      if (action === 'delete') {
        if (!confirm(`Delete ${selectedIds.length} leads?`)) return;
        await fetch('/api/leads/bulk', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds }),
        });
      } else {
        await fetch('/api/leads/bulk', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ids: selectedIds,
            updates: { [action]: value },
          }),
        });
      }
      setSelectedIds([]);
      fetchLeads();
    } catch (error) {
      alert('Action failed');
    }
  };

  const clearFilters = () => {
    setFilters({ status: '', source: '', funnelDay: '' });
    setSearch('');
  };

  const hasActiveFilters = filters.status || filters.source || filters.funnelDay || search;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 mt-1">{pagination.total} total leads</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
            <Upload size={18} />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={handleCopyTable}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Copy size={18} />
            Copy Table
          </button>
          <Link
            href="/leads/new"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <UserPlus size={18} />
            Add Lead
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, or email..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Filter size={18} />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                )}
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2.5 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X size={16} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                <option value="">All Statuses</option>
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                <option value="">All Sources</option>
                {sources.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={filters.funnelDay}
                onChange={(e) => setFilters({ ...filters, funnelDay: e.target.value })}
                className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                <option value="">All Funnel Days</option>
                {[0, 1, 2, 3, 4, 5, 6, 7].map(d => (
                  <option key={d} value={d}>Day {d}</option>
                ))}
              </select>
            </div>
          )}

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-200">
              <span className="text-sm text-slate-600">
                {selectedIds.length} selected
              </span>
              <div className="flex gap-2">
                <select
                  onChange={(e) => e.target.value && handleBulkAction('status', e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                  defaultValue=""
                >
                  <option value="">Change Status</option>
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  onChange={(e) => e.target.value && handleBulkAction('funnelDay', e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
                  defaultValue=""
                >
                  <option value="">Change Day</option>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(d => (
                    <option key={d} value={d}>Day {d}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <LeadTable
            leads={leads}
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onDelete={handleDelete}
          />
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Showing {((pagination.page - 1) * 50) + 1} to {Math.min(pagination.page * 50, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
