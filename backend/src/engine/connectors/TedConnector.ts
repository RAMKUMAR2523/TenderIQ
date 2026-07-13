import { PrismaClient } from '@prisma/client';
import { BaseConnector, NormalizedTender } from '../BaseConnector';
import fetch from 'node-fetch';

/**
 * TED (Tenders Electronic Daily) Connector
 * European Union public procurement data.
 */
export class TedConnector extends BaseConnector {
  private readonly API_URL = 'https://ted.europa.eu/api/v3/notices/search';

  constructor(prisma: PrismaClient) {
    super(prisma, 'TED_EU');
  }

  public async initialize(): Promise<void> {
    this.logging('INFO', 'Initializing TED API connection...');
    // In a real app, API tokens would be retrieved here
  }

  public async healthCheck(): Promise<boolean> {
    this.logging('INFO', 'Pinging TED EU API...');
    try {
      // Just a quick fetch to see if API is up
      const res = await fetch('https://ted.europa.eu/api/v3/notices/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'AC=[1]', page: 1, limit: 1 })
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  protected async fetchTenders(): Promise<any[]> {
    this.logging('INFO', 'Fetching latest tenders from TED...');
    const body = {
      query: 'TD=[3] AND PD=[20240101 TO 20241231]', // Example query for Contract Notices
      page: 1,
      limit: 25,
      fields: ['ND', 'TD', 'PD', 'TI', 'CY', 'AA', 'DT']
    };

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`TED API HTTP error! status: ${response.status}`);
    }

    const data: any = await response.json();
    return data.notices || [];
  }

  protected async normalize(raw: any): Promise<NormalizedTender> {
    return {
      source: this.sourceName,
      sourceUrl: `https://ted.europa.eu/udl?uri=TED:NOTICE:${raw.ND}:TEXT:EN:HTML`,
      referenceNumber: raw.ND || `TED-${Date.now()}`,
      title: raw.TI || 'EU Tender Notice',
      department: raw.AA || 'European Union Authority',
      category: 'International',
      closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      description: `European Union Public Procurement Notice: ${raw.TD}`
    };
  }
}
