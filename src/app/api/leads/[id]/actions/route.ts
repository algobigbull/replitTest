import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Activity from '@/models/Activity';
import { getAuthUser } from '@/lib/auth';

export async function POST(
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
    const { type, content, nextAction, nextActionDate } = await request.json();
    
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    const activity = await Activity.create({
      leadId: id,
      type: type || 'note',
      content,
      userId: user.userId,
      userName: user.name,
    });
    
    const updateData: any = { lastContactedAt: new Date() };
    
    if (nextAction) {
      updateData.nextAction = nextAction;
    }
    if (nextActionDate) {
      updateData.nextActionDate = new Date(nextActionDate);
    }
    
    await Lead.findByIdAndUpdate(id, updateData);
    
    return NextResponse.json(activity, { status: 201 });
  } catch (error: any) {
    console.error('Add action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
