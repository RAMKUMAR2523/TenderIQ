'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getConnectorStatus() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Fetch Crawler States
  const states = await db.crawlerState.findMany({
    orderBy: { lastRun: 'desc' }
  });

  // Fetch recent Crawler Logs
  const logs = await db.crawlerLog.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' }
  });

  // Fetch total tenders today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newTendersToday = await db.tender.count({
    where: {
      createdAt: {
        gte: today
      }
    }
  });

  return { states, logs, newTendersToday };
}
