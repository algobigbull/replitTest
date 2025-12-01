import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Activity from '@/models/Activity';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    const lead = await Lead.findById(id).lean();
    
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    const activities = await Activity.find({ leadId: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    return NextResponse.json({ lead, activities });
  } catch (error: any) {
    console.error('Get lead error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const data = await request.json();
    
    const existingLead = await Lead.findById(id);
    
    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    const changes: string[] = [];
    
    if (data.status && data.status !== existingLead.status) {
      changes.push(`Status changed from ${existingLead.status} to ${data.status}`);
    }
    if (data.funnelDay !== undefined && data.funnelDay !== existingLead.funnelDay) {
      changes.push(`Funnel day updated from Day ${existingLead.funnelDay} to Day ${data.funnelDay}`);
    }
    
    const lead = await Lead.findByIdAndUpdate(
      id,
      { ...data, lastContactedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();
    
    if (changes.length > 0) {
      await Activity.create({
        leadId: id,
        type: changes[0].includes('Status') ? 'status_change' : 'funnel_update',
        content: changes.join('. '),
        userId: user.userId,
        userName: user.name,
      });
    }
    
    return NextResponse.json(lead);
  } catch (error: any) {
    console.error('Update lead error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const { id } = await params;
    
    const lead = await Lead.findByIdAndDelete(id);
    
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    await Activity.deleteMany({ leadId: id });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete lead error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
