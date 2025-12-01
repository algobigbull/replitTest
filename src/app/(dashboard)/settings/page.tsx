'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, Database, RefreshCw } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  createdAt: string;
}

export default function SettingsPage() {
  const [seeding, setSeeding] = useState(false);

  const seedDatabase = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`Database seeded successfully!\n\nDemo credentials:\nAdmin: ${data.credentials.admin.email} / ${data.credentials.admin.password}\nAgent: ${data.credentials.agent.email} / ${data.credentials.agent.password}`);
      } else {
        alert(data.error || 'Seeding failed');
      }
    } catch (error) {
      alert('Failed to seed database');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your CRM settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Database className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Database</h2>
              <p className="text-sm text-slate-500">Manage your database</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={seedDatabase}
              disabled={seeding}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={seeding ? 'animate-spin' : ''} />
              {seeding ? 'Seeding...' : 'Seed Demo Data'}
            </button>
            <p className="text-xs text-slate-500 text-center">
              Creates sample leads, templates, and demo users
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Shield className="text-purple-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Roles</h2>
              <p className="text-sm text-slate-500">User role permissions</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Admin</p>
              <ul className="text-sm text-slate-600 mt-1 space-y-1">
                <li>• Full access to all features</li>
                <li>• Manage users and settings</li>
                <li>• Delete leads and bulk actions</li>
                <li>• Create and manage templates</li>
              </ul>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Agent</p>
              <ul className="text-sm text-slate-600 mt-1 space-y-1">
                <li>• View and update leads</li>
                <li>• Add notes and activities</li>
                <li>• Use templates</li>
                <li>• Export leads</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Users className="text-orange-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Demo Accounts</h2>
              <p className="text-sm text-slate-500">Use these credentials to test</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900 mb-2">Admin Account</p>
              <p className="text-sm text-slate-600">Email: admin@bigbull.com</p>
              <p className="text-sm text-slate-600">Password: admin123</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900 mb-2">Agent Account</p>
              <p className="text-sm text-slate-600">Email: agent@bigbull.com</p>
              <p className="text-sm text-slate-600">Password: agent123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
