import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Activity from '@/models/Activity';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const text = await file.text();
    
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    
    const leads: any[] = [];
    const errors: string[] = [];
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        const lead = new Lead({
          name: record.name || record.Name,
          phone: record.phone || record.Phone,
          email: record.email || record.Email,
          interest: record.interest || record.Interest || 'General',
          source: record.source || record.Source || 'Other',
          funnelDay: parseInt(record.funnelDay || record['Funnel Day'] || '0'),
          status: record.status || record.Status || 'Warm',
          tags: (record.tags || record.Tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
          notes: record.notes || record.Notes || '',
          nextAction: record.nextAction || record['Next Action'],
        });
        
        await lead.save();
        
        await Activity.create({
          leadId: lead._id,
          type: 'note',
          content: 'Lead imported from CSV',
          userId: user.userId,
          userName: user.name,
        });
        
        leads.push(lead);
      } catch (err: any) {
        errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      imported: leads.length,
      errors,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed: ' + error.message },
      { status: 500 }
    );
  }
}
