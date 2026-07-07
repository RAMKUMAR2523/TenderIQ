import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardClient from "./dashboard-client";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // For the hackathon, we fetch all active tenders
  const totalTendersCount = await db.tender.count();

  let wonBids = 0;
  let lostBids = 0;
  let proposalsInProgress = 0;
  let submittedBids = 0;

  if (session?.user?.companyId) {
    const companyId = session.user.companyId;

    proposalsInProgress = await db.companyTender.count({
      where: { companyId, status: "PREPARING" },
    });

    submittedBids = await db.companyTender.count({
      where: { companyId, status: "SUBMITTED" },
    });

    wonBids = await db.companyTender.count({
      where: { companyId, status: "WON" },
    });

    lostBids = await db.companyTender.count({
      where: { companyId, status: "LOST" },
    });
  }

  // Get active tenders to show on the dashboard (limit to 5)
  const recentTenders = await db.tender.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardClient 
      stats={{
        totalActiveTenders: totalTendersCount,
        proposalsInProgress,
        submittedBids,
        wonBids,
        lostBids,
        winRate: (wonBids + lostBids) > 0 ? Math.round((wonBids / (wonBids + lostBids)) * 100) : 0
      }}
      recentTenders={recentTenders}
      user={session?.user || null}
    />
  );
}
