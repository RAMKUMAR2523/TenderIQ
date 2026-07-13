import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function countDB() {
  const tenders = await prisma.tender.count();
  const companies = await prisma.company.count();
  const companyTenders = await prisma.companyTender.count();
  const logs = await prisma.crawlerLog.count();
  const states = await prisma.crawlerState.count();

  console.log("--- DATABASE METRICS ---");
  console.log(`Tenders: ${tenders}`);
  console.log(`Companies: ${companies}`);
  console.log(`CompanyTenders: ${companyTenders}`);
  console.log(`CrawlerLogs: ${logs}`);
  console.log(`CrawlerStates: ${states}`);
  await prisma.$disconnect();
}

countDB().catch(console.error);
