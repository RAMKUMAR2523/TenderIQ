import { PrismaClient } from '@prisma/client';
import { CpppConnector } from '../src/engine/connectors/CpppConnector';
import { GemConnector } from '../src/engine/connectors/GemConnector';
import { UkContractsConnector } from '../src/engine/connectors/UkContractsConnector';
import { TedConnector } from '../src/engine/connectors/TedConnector';

const prisma = new PrismaClient();

async function runVerification() {
  console.log("==========================================");
  console.log("   TENDERIQ CONNECTOR VERIFICATION SCRIPT ");
  console.log("==========================================\n");

  const connectors = [
    new CpppConnector(prisma),
    new GemConnector(prisma),
    new UkContractsConnector(prisma),
    new TedConnector(prisma)
  ];

  for (const connector of connectors) {
    console.log(`\n--- Running Connector: ${connector.sourceName} ---`);
    const startTime = Date.now();
    try {
      const result = await connector.sync();
      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`[VERIFY] Source Name: ${connector.sourceName}`);
      console.log(`[VERIFY] Connection Success: YES`);
      console.log(`[VERIFY] Tenders Found/Processed: ${result.added + result.updated + result.failed}`);
      console.log(`[VERIFY] Number Imported: ${result.added}`);
      console.log(`[VERIFY] Number Updated: ${result.updated}`);
      console.log(`[VERIFY] Failed: ${result.failed}`);
      console.log(`[VERIFY] Time Taken: ${timeTaken}s`);
    } catch (e: any) {
      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[VERIFY] Source Name: ${connector.sourceName}`);
      console.log(`[VERIFY] Connection Success: NO`);
      console.log(`[VERIFY] Time Taken: ${timeTaken}s`);
      console.log(`[VERIFY] Error: ${e.message}`);
    }
  }

  console.log("\n==========================================");
  console.log("   LATEST 10 TENDERS IN DATABASE          ");
  console.log("==========================================\n");

  const latestTenders = await prisma.tender.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { source: true, referenceNumber: true, title: true, closingDate: true }
  });

  if (latestTenders.length === 0) {
    console.log("No tenders found in the database. Crawlers are not working.");
  } else {
    latestTenders.forEach((t, i) => {
      console.log(`${i + 1}. [${t.source}] ${t.referenceNumber}`);
      console.log(`   Title: ${t.title}`);
      console.log(`   Closing: ${t.closingDate ? t.closingDate.toISOString() : 'N/A'}\n`);
    });
  }

  await prisma.$disconnect();
  console.log("Verification complete.");
}

runVerification().catch(e => {
  console.error("Verification script failed:", e);
  prisma.$disconnect();
});
