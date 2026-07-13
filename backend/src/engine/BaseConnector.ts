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
   * Initialize any required resources (e.g. browser context, api tokens)
   */
  public async initialize(): Promise<void> {
    this.logging('INFO', 'Initializing connector...');
  }

  /**
   * Health check to verify the source is reachable before syncing
   */
  public async healthCheck(): Promise<boolean> {
    try {
      this.logging('INFO', 'Performing health check...');
      // By default, assume healthy if not overridden
      return true;
    } catch (error) {
      this.logging('ERROR', `Health check failed: ${error}`);
      return false;
    }
  }

  /**
   * Retry logic wrapper for flaky network requests
   */
  protected async retry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: any;
    for (let i = 1; i <= maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logging('WARN', `Operation failed (attempt ${i}/${maxRetries}). Retrying...`);
        await new Promise(res => setTimeout(res, 2000 * i));
      }
    }
    throw lastError;
  }

  /**
   * Standardized logging method
   */
  protected logging(level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
    console.log(`[${this.sourceName}][${level}] ${message}`);
  }

  /**
   * Main execution flow: Initialize -> HealthCheck -> Fetch -> Normalize -> Save/Update -> Log
   */
  public async sync(): Promise<{ added: number; updated: number; failed: number }> {
    const startTime = Date.now();
    let added = 0;
    let updated = 0;
    let failed = 0;
    let errorDetails = '';

    try {
      this.logging('INFO', 'Starting sync...');
      await this.initialize();

      const isHealthy = await this.healthCheck();
      if (!isHealthy) {
        throw new Error('Connector health check failed. Aborting sync.');
      }

      const rawData = await this.retry(() => this.fetchTenders());
      this.logging('INFO', `Fetched ${rawData.length} raw records.`);

      for (const raw of rawData) {
        try {
          const normalized = await this.normalize(raw);
          const existing = await this.prisma.tender.findFirst({
            where: { referenceNumber: normalized.referenceNumber, source: this.sourceName }
          });

          if (existing) {
            const didUpdate = await this.update(existing, normalized);
            if (didUpdate) updated++;
          } else {
            await this.save(normalized);
            added++;
          }
        } catch (e: any) {
          this.logging('ERROR', `Failed to process tender: ${e.message}`);
          failed++;
          errorDetails += `Failed to process a tender: ${e.message}\n`;
        }
      }
    } catch (e: any) {
      this.logging('ERROR', `Fatal sync error: ${e.message}`);
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

    this.logging('INFO', `Sync complete. Added: ${added}, Updated: ${updated}, Failed: ${failed}`);
    return { added, updated, failed };
  }

  /**
   * Fetch raw data from the source (API, HTML, etc.)
   */
  protected abstract fetchTenders(): Promise<any[]>;
  
  /**
   * Normalize raw data into the standardized schema
   */
  protected abstract normalize(raw: any): Promise<NormalizedTender>;

  /**
   * Save a completely new tender
   */
  protected async save(tender: NormalizedTender): Promise<void> {
    if (!tender.referenceNumber) throw new Error("Tender is missing referenceNumber");

    const newTender = await this.prisma.tender.create({
      data: {
        ...tender,
        tenderStatus: tender.closingDate && tender.closingDate < new Date() ? 'CLOSED' : 'ACTIVE',
      }
    });

    // Run AI Matcher asynchronously
    const matcher = new AiMatcher();
    matcher.matchTenderToCompanies(newTender.id).catch(err => {
      this.logging('ERROR', `AiMatcher failed: ${err.message}`);
    });
  }

  /**
   * Update an existing tender if properties changed
   */
  protected async update(existing: Tender, tender: NormalizedTender): Promise<boolean> {
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
        }
      });
      return true;
    }
    return false;
  }
}
