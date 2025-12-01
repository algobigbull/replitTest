import LeadForm from '@/components/LeadForm';

export default function NewLeadPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Add New Lead</h1>
        <p className="text-slate-500 mt-1">Create a new lead in the CRM</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <LeadForm />
      </div>
    </div>
  );
}
