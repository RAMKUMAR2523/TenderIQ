import { PrismaClient } from '@prisma/client';
import { UkContractsConnector } from '../src/engine/connectors/UkContractsConnector';

const prisma = new PrismaClient();

async function runTest() {
  console.log("=== Testing UK Contracts Connector ===");
  const uk = new UkContractsConnector(prisma);
  const ukResult = await uk.sync();
  console.log("UK Contracts Result:", ukResult);

  console.log("\nFetching top 5 tenders from DB...");
  const tenders = await prisma.tender.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  
  for (const t of tenders) {
    console.log(`- [${t.source}] ${t.referenceNumber}: ${t.title.substring(0, 50)}...`);
  }
}

runTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
