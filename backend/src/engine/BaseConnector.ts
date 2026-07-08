import { PrismaClient, Tender } from '@prisma/client';
import { AiMatcher } from './AiMatcher';

export interface NormalizedTender {
  source: string;
  sourceUrl?: string;
  referenceNumber: string;
  title: string;
  department: string;
  organization?: string;
  state?: string;
  district?: string;
  category?: string;
  tenderValue?: number;
  emd?: number;
  bidOpeningDate?: Date;
  closingDate?: Date;
  description?: string;
  eligibility?: string;
  contactInfo?: string;
  pdfLinks?: string[];
  hasCorrigendum?: boolean;
}

export abstract class BaseConnector {
  protected prisma: PrismaClient;
  public sourceName: string;

  constructor(prisma: PrismaClient, sourceName: string) {
    this.prisma = prisma;
    this.sourceName = sourceName;
  }

  /**
   * Main execution flow: Fetch -> Normalize -> Save -> Log
   */
  public async sync(): Promise<{ added: number; updated: number; failed: number }> {
    const startTime = Date.now();
    let added = 0;
    let updated = 0;
    let failed = 0;
    let errorDetails = '';

    try {
      console.log(`[${this.sourceName}] Starting sync...`);
      const rawData = await this.fetchTenders();
      console.log(`[${this.sourceName}] Fetched ${rawData.length} raw records.`);

      for (const raw of rawData) {
        try {
          const normalized = await this.normalize(raw);
          const result = await this.save(normalized);
          if (result === 'ADDED') added++;
          else if (result === 'UPDATED') updated++;
        } catch (e: any) {
          console.error(`[${this.sourceName}] Failed to process tender:`, e.message);
          failed++;
          errorDetails += `Failed to process a tender: ${e.message}\n`;
        }
      }
    } catch (e: any) {
      console.error(`[${this.sourceName}] Fatal sync error:`, e.message);
      errorDetails = e.message;
    }

    const durationMs = Date.now() - startTime;

    // Log the sync attempt
    await this.prisma.crawlerLog.create({
      data: {
        source: this.sourceName,
        status: errorDetails ? 'FAILED' : 'SUCCESS',
        tendersFound: added + updated + failed,
        tendersAdded: added,
        tendersUpdated: updated,
        durationMs,
        errorDetails: errorDetails || null,
      },
    });

    console.log(`[${this.sourceName}] Sync complete. Added: ${added}, Updated: ${updated}, Failed: ${failed}`);
    return { added, updated, failed };
  }

  /**
   * Abstract methods to be implemented by each specific connector
   */
  protected abstract fetchTenders(): Promise<any[]>;
  protected abstract normalize(raw: any): Promise<NormalizedTender>;

  /**
   * Save or update tender based on referenceNumber and source
   */
  protected async save(tender: NormalizedTender): Promise<'ADDED' | 'UPDATED' | 'SKIPPED'> {
    if (!tender.referenceNumber) {
      throw new Error("Tender is missing referenceNumber");
    }

    const existing = await this.prisma.tender.findFirst({
      where: {
        referenceNumber: tender.referenceNumber,
        source: this.sourceName,
      }
    });

    if (existing) {
      // Check if update is needed (e.g., closing date changed)
      if (
        (tender.closingDate && existing.closingDate?.getTime() !== tender.closingDate.getTime()) ||
        tender.hasCorrigendum !== existing.hasCorrigendum
      ) {
        await this.prisma.tender.update({
          where: { id: existing.id },
          data: {
            closingDate: tender.closingDate,
            hasCorrigendum: tender.hasCorrigendum,
            tenderStatus: tender.closingDate && tender.closingDate < new Date() ? 'CLOSED' : 'ACTIVE',
            // Update other fields as necessary
          }
        });
        return 'UPDATED';
      }
      return 'SKIPPED';
    }

    // Insert new tender
    const newTender = await this.prisma.tender.create({
      data: {
        ...tender,
        tenderStatus: tender.closingDate && tender.closingDate < new Date() ? 'CLOSED' : 'ACTIVE',
      }
    });

    // Run AI Matcher asynchronously
    const matcher = new AiMatcher();
    matcher.matchTenderToCompanies(newTender.id).catch(err => {
      console.error(`[AiMatcher] Failed to match tender ${newTender.id}:`, err);
    });

    return 'ADDED';
  }
}
