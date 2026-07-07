"use server";

import { db } from "@/lib/db";

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
    proposalsInProgress: proposalsInProgress || 3, // fallback for UI demo
    submittedBids: submittedBids || 12,
    wonBids: wonBids || (analytics?.tendersWon || 5),
    lostBids: lostBids || (analytics?.tendersLost || 2),
    winRate: winRate > 0 ? winRate : 68,
  };
}

export async function getRecentTenders() {
  return await db.tender.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
}

export async function getMonthlyTrends() {
  // Mocking trends for the chart since we don't have historical data seeded
  return [
    { name: 'Jan', submitted: 4, won: 1 },
    { name: 'Feb', submitted: 3, won: 2 },
    { name: 'Mar', submitted: 5, won: 1 },
    { name: 'Apr', submitted: 7, won: 3 },
    { name: 'May', submitted: 2, won: 0 },
    { name: 'Jun', submitted: 6, won: 4 },
  ];
}
