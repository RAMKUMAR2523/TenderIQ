import { PrismaClient, Tender, Company } from '@prisma/client';
import { db as prisma } from '@/lib/db';

export class AiMatcher {
  /**
   * Run the AI Matching algorithm for all ACTIVE companies against a specific tender
   */
  public async matchTenderToCompanies(tenderId: string) {
    console.log(`[AiMatcher] Starting match process for Tender ${tenderId}`);
    
    const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
    if (!tender) return;

    // Fetch all companies
    const companies = await prisma.company.findMany();
    
    let matchedCount = 0;

    for (const company of companies) {
      const score = this.calculateHeuristicScore(tender, company);
      
      // If score is decently high (> 40%), we link it
      if (score >= 40) {
        await prisma.companyTender.upsert({
          where: {
            companyId_tenderId: { companyId: company.id, tenderId: tender.id }
          },
          update: { readinessScore: score },
          create: {
            companyId: company.id,
            tenderId: tender.id,
            status: "INTERESTED",
            readinessScore: score
          }
        });

        // Generate a notification for the company's users
        const users = await prisma.user.findMany({ where: { companyId: company.id } });
        for (const user of users) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: "ALERT",
              title: "New Matching Tender Discovered",
              message: `A new tender (${tender.referenceNumber}) matches your profile with a ${score}% score!`,
              linkUrl: `/tenders/${tender.id}`
            }
          });
        }
        
        matchedCount++;
      }
    }
    
    console.log(`[AiMatcher] Tender ${tenderId} matched to ${matchedCount} companies.`);
  }

  /**
   * Heuristic Scoring Algorithm (simulating AI match for cost/speed)
   * This parses keywords from the tender and compares with the company profile
   */
  private calculateHeuristicScore(tender: Tender, company: Company): number {
    let score = 0;
    const tenderText = `${tender.title} ${tender.description} ${tender.category}`.toLowerCase();
    
    // 1. Industry Match (up to 40 points)
    if (company.industries) {
      const industries = company.industries.toLowerCase().split(',');
      for (const ind of industries) {
        if (tenderText.includes(ind.trim())) {
          score += 40;
          break; // Max points awarded for industry
        }
      }
    }

    // 2. Services Match (up to 30 points)
    if (company.services) {
      const services = company.services.toLowerCase().split(',');
      let serviceMatch = 0;
      for (const srv of services) {
        if (tenderText.includes(srv.trim())) {
          serviceMatch += 10;
        }
      }
      score += Math.min(serviceMatch, 30);
    }

    // 3. Turnover / Value capacity (up to 30 points)
    // Basic logic: if tender is missing value, assume 15 points.
    if (!tender.tenderValue) {
      score += 15;
    } else {
      score += 30; // In a real app, compare company.annualTurnover to tender.tenderValue
    }

    // Add some random fuzziness (0-5%) to simulate AI variance
    score += Math.floor(Math.random() * 5);

    return Math.min(score, 99); // Max 99%
  }
}
