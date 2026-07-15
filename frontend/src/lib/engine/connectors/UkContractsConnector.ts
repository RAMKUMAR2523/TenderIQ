import { db as prisma } from "@/lib/db";
import { PrismaClient } from '@prisma/client';
import { BaseConnector, NormalizedTender } from '../BaseConnector';


/**
 * UK Contracts Finder Connector
 * Fetches REAL tender data from the official UK Government Open Data API.
 * This guarantees we have real data if Indian portals block IP scraping.
 */
export class UkContractsConnector extends BaseConnector {
  // Official REST API for Contracts Finder Open Data
  private readonly API_URL = 'https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search?publishedFrom=2024-01-01T00:00:00Z';

  constructor(prisma: PrismaClient) {
    super(prisma, 'UK_Contracts_Finder');
  }

  protected async fetchTenders(): Promise<any[]> {
    try {
      console.log(`[${this.sourceName}] Fetching from official API...`);
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: any = await response.json();
      
      // Data format is OCDS (Open Contracting Data Standard)
      const results = data.releases || [];
      console.log(`[${this.sourceName}] API returned ${results.length} releases.`);
      
      // Return top 50 to avoid overloading
      return results.slice(0, 50);
    } catch (error) {
      console.error(`[${this.sourceName}] Error fetching open data:`, error);
      return [];
    }
  }

  protected async normalize(raw: any): Promise<NormalizedTender> {
    const tender = raw.tender || {};
    const buyer = raw.buyer || {};
    
    // Parse Dates
    let closingDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    if (tender.tenderPeriod?.endDate) {
        const parsed = new Date(tender.tenderPeriod.endDate);
        if (!isNaN(parsed.getTime())) closingDate = parsed;
    }

    let tenderValue = 0;
    if (tender.value?.amount) {
        tenderValue = parseFloat(tender.value.amount);
    }

    return {
      source: this.sourceName,
      sourceUrl: `https://www.contractsfinder.service.gov.uk/Notice/${raw.ocid}`,
      referenceNumber: raw.ocid || raw.id,
      title: tender.title || 'UK Gov Tender',
      department: buyer.name || 'UK Government',
      organization: buyer.name,
      category: tender.mainProcurementCategory || 'Public Works',
      description: tender.description?.substring(0, 500),
      tenderValue,
      closingDate,
    };
  }
}
