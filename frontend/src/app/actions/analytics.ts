"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getDashboardStats() {
  const analytics = await db.analytics.findFirst({
    orderBy: { date: 'desc' }
  });

  const totalTendersCount = await db.tender.count();
  const activeTenders = totalTendersCount > 0 ? totalTendersCount : (analytics?.totalTenders || 0);

  const proposalsInProgress = await db.proposal.count({
    where: { status: 'DRAFT' }
  });

  const submittedBids = await db.companyTender.count({
    where: { status: 'BIDDING' }
  });

  const wonBids = await db.companyTender.count({
    where: { status: 'WON' }
  });

  const lostBids = await db.companyTender.count({
    where: { status: 'LOST' }
  });

  const winRate = (wonBids + lostBids) > 0 
    ? Math.round((wonBids / (wonBids + lostBids)) * 100) 
    : 0;

  return {
    totalActiveTenders: activeTenders,
    proposalsInProgress: proposalsInProgress,
    submittedBids: submittedBids,
    wonBids: wonBids,
    lostBids: lostBids,
    winRate: winRate,
  };
}

export async function getRecentTenders() {
  return await db.tender.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
}

export async function getMonthlyTrends() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) return [];

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1); // Start of the month 6 months ago

  const tenders = await db.companyTender.findMany({
    where: {
      companyId: session.user.companyId,
      updatedAt: { gte: sixMonthsAgo }
    },
    select: { status: true, updatedAt: true }
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendsMap = new Map();

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    trendsMap.set(monthNames[d.getMonth()], { submitted: 0, won: 0 });
  }

  tenders.forEach(t => {
    const month = monthNames[t.updatedAt.getMonth()];
    if (trendsMap.has(month)) {
      const data = trendsMap.get(month);
      if (t.status === 'BIDDING' || t.status === 'WON' || t.status === 'LOST') data.submitted++;
      if (t.status === 'WON') data.won++;
    }
  });

  return Array.from(trendsMap, ([name, data]) => ({ name, ...data }));
}
