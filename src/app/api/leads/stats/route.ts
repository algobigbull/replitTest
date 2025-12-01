import { NextRequest, NextResponse } from 'next/server';
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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [total, hot, warm, cold, todayFollowUps, newToday] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'Hot' }),
      Lead.countDocuments({ status: 'Warm' }),
      Lead.countDocuments({ status: 'Cold' }),
      Lead.countDocuments({
        nextActionDate: { $gte: today, $lt: tomorrow },
      }),
      Lead.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
      }),
    ]);
    
    const bySource = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    
    const byFunnelDay = await Lead.aggregate([
      { $group: { _id: '$funnelDay', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    
    const upcomingFollowUps = await Lead.find({
      nextActionDate: { $gte: today },
    })
      .sort({ nextActionDate: 1 })
      .limit(10)
      .select('name phone status nextAction nextActionDate')
      .lean();
    
    return NextResponse.json({
      stats: {
        total,
        hot,
        warm,
        cold,
        todayFollowUps,
        newToday,
      },
      bySource,
      byFunnelDay,
      upcomingFollowUps,
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
