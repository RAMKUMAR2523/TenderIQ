'use server';

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

  // Fetch total tenders
  const totalTenders = await db.tender.count();

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

  const failedConnectors = states.filter(s => s.lastRun?.getTime() !== s.lastSuccess?.getTime()).length;
  const successRate = states.length > 0 ? Math.round(((states.length - failedConnectors) / states.length) * 100) : 100;

  return { states, logs, newTendersToday, totalTenders, failedConnectors, successRate };
}
