import { PrismaClient } from '@prisma/client';
import { CpppConnector } from './connectors/CpppConnector';
import { GemConnector } from './connectors/GemConnector';
import { UkContractsConnector } from './connectors/UkContractsConnector';

const prisma = new PrismaClient();

// List of all active connectors
const connectors = [
  new CpppConnector(prisma),
  new GemConnector(prisma),
  new UkContractsConnector(prisma)
];

let isRunning = false;

export async function runScheduler() {
  if (isRunning) {
    console.log("[Scheduler] Already running, skipping this tick.");
    return;
  }
  
  isRunning = true;
  console.log("[Scheduler] Starting sync cycle across all connectors...");

  try {
    for (const connector of connectors) {
      try {
        await connector.sync();
        
        // Update crawler state
        await prisma.crawlerState.upsert({
          where: { source: connector.sourceName },
          update: { lastRun: new Date(), lastSuccess: new Date() },
          create: { source: connector.sourceName, lastRun: new Date(), lastSuccess: new Date() }
        });
        
        // Wait a bit between connectors to prevent CPU spiking
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error: any) {
        console.error(`[Scheduler] Connector ${connector.sourceName} failed:`, error.message);
      }
    }
    console.log("[Scheduler] Sync cycle complete.");
  } finally {
    isRunning = false;
  }
}

export function startBackgroundWorker() {
  // Run immediately on startup
  runScheduler().catch(console.error);

  // Then run every 6 hours (6 * 60 * 60 * 1000 = 21600000 ms)
  // For demo/hackathon purposes, running every 1 hour (3600000 ms)
  setInterval(() => {
    runScheduler().catch(console.error);
  }, 3600000);

  console.log("[Scheduler] Background worker started. Polling every hour.");
}
