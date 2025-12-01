'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatsCard from '@/components/StatsCard';
import { cn, formatDate, getStatusColor } from '@/lib/utils';
import {
  Users,
  Flame,
  Thermometer,
  Snowflake,
  Calendar,
  UserPlus,
  ArrowRight,
  Phone,
  RefreshCw,
} from 'lucide-react';

interface DashboardData {
  stats: {
    total: number;
    hot: number;
    warm: number;
    cold: number;
    todayFollowUps: number;
    newToday: number;
  };
  bySource: Array<{ _id: string; count: number }>;
  byFunnelDay: Array<{ _id: number; count: number }>;
  upcomingFollowUps: Array<{
    _id: string;
    name: string;
    phone: string;
    status: string;
    nextAction: string;
    nextActionDate: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/leads/stats');
      if (res.ok) {
        const data = await res.json();
        setData(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        await fetchData();
        alert('Database seeded successfully! Demo credentials: admin@bigbull.com / admin123');
      }
    } catch (error) {
      console.error('Failed to seed:', error);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const stats = data?.stats || { total: 0, hot: 0, warm: 0, cold: 0, todayFollowUps: 0, newToday: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back to Bigbull CRM</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={seedDatabase}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={seeding ? 'animate-spin' : ''} />
            {seeding ? 'Seeding...' : 'Seed Demo Data'}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Leads"
          value={stats.total}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Hot Leads"
          value={stats.hot}
          icon={Flame}
          color="red"
        />
        <StatsCard
          title="Warm Leads"
          value={stats.warm}
          icon={Thermometer}
          color="orange"
        />
        <StatsCard
          title="Cold Leads"
          value={stats.cold}
          icon={Snowflake}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          title="Today's Follow-ups"
          value={stats.todayFollowUps}
          icon={Calendar}
          color="green"
        />
        <StatsCard
          title="New Today"
          value={stats.newToday}
          icon={UserPlus}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Leads by Source</h2>
          </div>
          {data?.bySource && data.bySource.length > 0 ? (
            <div className="space-y-3">
              {data.bySource.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="text-slate-600">{item._id}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full"
                        style={{ width: `${(item.count / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="font-medium text-slate-900 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No data available</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Funnel Distribution</h2>
          </div>
          {data?.byFunnelDay && data.byFunnelDay.length > 0 ? (
            <div className="flex items-end justify-between gap-2 h-40">
              {Array.from({ length: 8 }, (_, i) => {
                const dayData = data.byFunnelDay.find(d => d._id === i);
                const count = dayData?.count || 0;
                const maxCount = Math.max(...data.byFunnelDay.map(d => d.count));
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500">{count}</span>
                    <div
                      className="w-full bg-gradient-to-t from-orange-500 to-red-500 rounded-t-lg transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-xs font-medium text-slate-600">D{i}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No data available</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Follow-ups</h2>
          <Link
            href="/leads?filter=followups"
            className="text-sm text-orange-600 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {data?.upcomingFollowUps && data.upcomingFollowUps.length > 0 ? (
          <div className="space-y-3">
            {data.upcomingFollowUps.map((lead) => (
              <Link
                key={lead._id}
                href={`/leads/${lead._id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-medium">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{lead.name}</p>
                    <p className="text-sm text-slate-500">{lead.nextAction}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    'inline-flex px-2 py-1 rounded-full text-xs font-medium border',
                    getStatusColor(lead.status)
                  )}>
                    {lead.status}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(lead.nextActionDate)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">No upcoming follow-ups</p>
        )}
      </div>
    </div>
  );
}
