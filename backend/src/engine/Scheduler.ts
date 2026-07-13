import { PrismaClient } from '@prisma/client';
import { CpppConnector } from './connectors/CpppConnector';
import { GemConnector } from './connectors/GemConnector';
import { UkContractsConnector } from './connectors/UkContractsConnector';
import { TedConnector } from './connectors/TedConnector';
import cron from 'node-cron';

const prisma = new PrismaClient();

// List of all active connectors
const connectors = [
  new CpppConnector(prisma),
  new GemConnector(prisma),
  new UkContractsConnector(prisma),
  new TedConnector(prisma)
];

let isRunning = false;

export async function runScheduler(retryCount = 0) {
  if (isRunning) {
    console.log("[Scheduler] Already running, skipping this tick.");
    return;
  }
  
  isRunning = true;
  console.log(`[Scheduler] Starting sync cycle across all connectors (Attempt ${retryCount + 1})...`);

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
  } catch (globalError: any) {
    console.error("[Scheduler] Critical failure in sync cycle:", globalError.message);
    if (retryCount < 3) {
      console.log(`[Scheduler] Retrying in 5 minutes...`);
      setTimeout(() => {
        isRunning = false;
        runScheduler(retryCount + 1);
      }, 5 * 60 * 1000);
    }
  } finally {
    isRunning = false;
  }
}

export function startBackgroundWorker() {
  // Run immediately on startup
  runScheduler().catch(console.error);

  // Run every hour
  cron.schedule('0 * * * *', () => {
    runScheduler().catch(console.error);
  });

  console.log("[Scheduler] Background worker started with node-cron. Polling every hour.");
}
