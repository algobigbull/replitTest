import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Activity from '@/models/Activity';
import { getAuthUser } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { ids, updates } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No leads selected' }, { status: 400 });
    }
    
    await Lead.updateMany(
      { _id: { $in: ids } },
      { ...updates, lastContactedAt: new Date() }
    );
    
    const activities = ids.map(id => ({
      leadId: id,
      type: 'note' as const,
      content: `Bulk update: ${Object.entries(updates).map(([k, v]) => `${k}=${v}`).join(', ')}`,
      userId: user.userId,
      userName: user.name,
    }));
    
    await Activity.insertMany(activities);
    
    return NextResponse.json({ success: true, updated: ids.length });
  } catch (error: any) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const { ids } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No leads selected' }, { status: 400 });
    }
    
    await Lead.deleteMany({ _id: { $in: ids } });
    await Activity.deleteMany({ leadId: { $in: ids } });
    
    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error: any) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
