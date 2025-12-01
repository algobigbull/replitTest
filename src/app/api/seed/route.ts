import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import User from '@/models/User';
import Template from '@/models/Template';
import Activity from '@/models/Activity';

const sampleLeads = [
  {
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    interest: 'Stock Market Basics',
    source: 'GMB',
    funnelDay: 0,
    status: 'Hot',
    nextAction: 'Send welcome message',
    tags: ['new', 'interested'],
    notes: 'Enquired about beginner course',
  },
  {
    name: 'Priya Sharma',
    phone: '+91 87654 32109',
    email: 'priya.sharma@email.com',
    interest: 'Options Trading',
    source: 'IG',
    funnelDay: 2,
    status: 'Warm',
    nextAction: 'Follow-up call',
    tags: ['options', 'experienced'],
    notes: 'Has some trading experience',
  },
  {
    name: 'Amit Patel',
    phone: '+91 76543 21098',
    email: 'amit.patel@email.com',
    interest: 'Technical Analysis',
    source: 'Walk-in',
    funnelDay: 5,
    status: 'Hot',
    nextAction: 'Schedule demo',
    tags: ['technical', 'serious'],
    notes: 'Visited academy, very interested',
  },
  {
    name: 'Sneha Reddy',
    phone: '+91 65432 10987',
    email: 'sneha.reddy@email.com',
    interest: 'Crypto Trading',
    source: 'Website',
    funnelDay: 1,
    status: 'Warm',
    nextAction: 'Send course details',
    tags: ['crypto', 'young'],
    notes: 'Filled website form',
  },
  {
    name: 'Vikram Singh',
    phone: '+91 54321 09876',
    email: 'vikram.singh@email.com',
    interest: 'Intraday Trading',
    source: 'Referral',
    funnelDay: 7,
    status: 'Cold',
    nextAction: 'Final follow-up',
    tags: ['intraday', 'referred'],
    notes: 'Referred by Rajesh',
  },
  {
    name: 'Ananya Gupta',
    phone: '+91 43210 98765',
    email: 'ananya.gupta@email.com',
    interest: 'Stock Market Basics',
    source: 'IG',
    funnelDay: 3,
    status: 'Hot',
    nextAction: 'Send payment link',
    tags: ['new', 'ready'],
    notes: 'Ready to enroll',
  },
  {
    name: 'Rohit Mehta',
    phone: '+91 32109 87654',
    email: 'rohit.mehta@email.com',
    interest: 'Futures Trading',
    source: 'GMB',
    funnelDay: 4,
    status: 'Warm',
    nextAction: 'Address queries',
    tags: ['futures', 'queries'],
    notes: 'Has questions about course',
  },
  {
    name: 'Kavita Joshi',
    phone: '+91 21098 76543',
    email: 'kavita.joshi@email.com',
    interest: 'Portfolio Management',
    source: 'Walk-in',
    funnelDay: 6,
    status: 'Warm',
    nextAction: 'Send testimonials',
    tags: ['portfolio', 'professional'],
    notes: 'Working professional',
  },
  {
    name: 'Suresh Iyer',
    phone: '+91 10987 65432',
    email: 'suresh.iyer@email.com',
    interest: 'Options Trading',
    source: 'Referral',
    funnelDay: 2,
    status: 'Cold',
    nextAction: 'Re-engage',
    tags: ['options', 'busy'],
    notes: 'Was busy, try again',
  },
  {
    name: 'Meera Krishnan',
    phone: '+91 09876 54321',
    email: 'meera.krishnan@email.com',
    interest: 'Technical Analysis',
    source: 'Website',
    funnelDay: 0,
    status: 'Hot',
    nextAction: 'Welcome call',
    tags: ['technical', 'eager'],
    notes: 'Just signed up, very eager',
  },
];

const sampleTemplates = [
  {
    name: 'Day 0 - Welcome',
    day: 0,
    subject: 'Welcome to Bigbull Trading Academy!',
    content: 'Hi {name}! Welcome to Bigbull Trading Academy. I am Himanshu, and I will personally guide you on your trading journey. I see you are interested in {interest}. Let me know the best time to discuss your learning goals!',
    type: 'whatsapp',
  },
  {
    name: 'Day 1 - Introduction',
    day: 1,
    subject: 'Your Trading Journey Begins',
    content: 'Hello {name}! Hope you had time to think about your trading goals. At Bigbull Academy, we have helped 500+ students become profitable traders. Would you like to know more about our {interest} course?',
    type: 'whatsapp',
  },
  {
    name: 'Day 2 - Course Details',
    day: 2,
    subject: 'Course Details for {interest}',
    content: 'Hi {name}! Here are the details for our {interest} course: 12 weeks comprehensive training, live market sessions, 1-on-1 mentoring, and lifetime access to our trading community. Interested in a free demo?',
    type: 'whatsapp',
  },
  {
    name: 'Day 3 - Success Stories',
    day: 3,
    subject: 'Success Stories from Our Students',
    content: 'Hey {name}! Want to see what our students have achieved? Check out these success stories from traders just like you who started with zero knowledge. Reply YES to receive video testimonials!',
    type: 'whatsapp',
  },
  {
    name: 'Day 4 - Free Resources',
    day: 4,
    subject: 'Free Trading Resources',
    content: 'Hi {name}! As a thank you for your interest, here are some free resources to get you started: Our Trading Basics PDF, Top 10 Chart Patterns guide, and a Risk Management checklist. Let me know if helpful!',
    type: 'whatsapp',
  },
  {
    name: 'Day 5 - Special Offer',
    day: 5,
    subject: 'Exclusive Offer for You',
    content: 'Hello {name}! I have a special offer just for you - Enroll in our {interest} course this week and get 20% off plus bonus 1-on-1 strategy session worth Rs 5000. Limited slots available!',
    type: 'whatsapp',
  },
  {
    name: 'Day 6 - Last Chance',
    day: 6,
    subject: 'Offer Ending Soon',
    content: 'Hi {name}! Just a reminder - the special 20% discount on {interest} course expires tomorrow. Don\'t miss this opportunity to transform your trading career. Call me at your convenience!',
    type: 'whatsapp',
  },
  {
    name: 'Day 7 - Final Follow-up',
    day: 7,
    subject: 'Still Interested?',
    content: 'Hey {name}! I understand everyone has different timelines. If now isn\'t the right time, no worries! Just reply whenever you\'re ready to discuss {interest}. We\'ll be here to help. Best, Himanshu - Bigbull Academy',
    type: 'whatsapp',
  },
];

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const userCount = await User.countDocuments();
    let adminUser;
    
    if (userCount === 0) {
      adminUser = await User.create({
        name: 'Himanshu',
        email: 'admin@bigbull.com',
        password: 'admin123',
        role: 'admin',
      });
      
      await User.create({
        name: 'Sales Agent',
        email: 'agent@bigbull.com',
        password: 'agent123',
        role: 'agent',
      });
    } else {
      adminUser = await User.findOne({ role: 'admin' });
    }
    
    const existingLeads = await Lead.countDocuments();
    if (existingLeads === 0) {
      const leads = await Lead.insertMany(sampleLeads);
      
      const activities = leads.map((lead: any) => ({
        leadId: lead._id,
        type: 'note',
        content: 'Lead created (seed data)',
        userId: adminUser?._id.toString() || 'system',
        userName: adminUser?.name || 'System',
      }));
      
      await Activity.insertMany(activities);
    }
    
    const existingTemplates = await Template.countDocuments();
    if (existingTemplates === 0) {
      await Template.insertMany(sampleTemplates);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      credentials: {
        admin: { email: 'admin@bigbull.com', password: 'admin123' },
        agent: { email: 'agent@bigbull.com', password: 'agent123' },
      },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Seeding failed: ' + error.message },
      { status: 500 }
    );
  }
}
