import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Template from '@/models/Template';
import Activity from '@/models/Activity';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { leadId, templateId } = await request.json();
    
    const [lead, template] = await Promise.all([
      Lead.findById(leadId),
      Template.findById(templateId),
    ]);
    
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    const personalizedContent = template.content
      .replace(/\{name\}/g, lead.name)
      .replace(/\{interest\}/g, lead.interest)
      .replace(/\{phone\}/g, lead.phone);
    
    console.log('=== SENDING TEMPLATE ===');
    console.log(`To: ${lead.name} (${lead.phone})`);
    console.log(`Template: ${template.name}`);
    console.log(`Type: ${template.type}`);
    console.log(`Content: ${personalizedContent}`);
    console.log('========================');
    
    await Activity.create({
      leadId: lead._id,
      type: 'template_sent',
      content: `Sent "${template.name}" template via ${template.type}: ${personalizedContent.substring(0, 100)}...`,
      userId: user.userId,
      userName: user.name,
    });
    
    await Lead.findByIdAndUpdate(leadId, { lastContactedAt: new Date() });
    
    return NextResponse.json({
      success: true,
      message: `Template "${template.name}" sent to ${lead.name}`,
      preview: personalizedContent,
    });
  } catch (error: any) {
    console.error('Send template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
