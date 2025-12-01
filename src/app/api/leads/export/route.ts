import { NextRequest, NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const funnelDay = searchParams.get('funnelDay');
    const ids = searchParams.get('ids');
    
    const query: any = {};
    
    if (ids) {
      query._id = { $in: ids.split(',') };
    } else {
      if (status) query.status = status;
      if (source) query.source = source;
      if (funnelDay) query.funnelDay = parseInt(funnelDay);
    }
    
    const leads = await Lead.find(query).sort({ createdAt: -1 }).lean();
    
    const data = leads.map((lead) => ({
      Name: lead.name,
      Phone: lead.phone,
      Email: lead.email,
      Interest: lead.interest,
      Source: lead.source,
      'Funnel Day': lead.funnelDay,
      Status: lead.status,
      Tags: lead.tags.join(', '),
      Notes: lead.notes,
      'Next Action': lead.nextAction || '',
      'Created At': new Date(lead.createdAt).toISOString(),
      'Last Contacted': lead.lastContactedAt 
        ? new Date(lead.lastContactedAt).toISOString() 
        : '',
    }));
    
    const csv = stringify(data, { header: true });
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}
