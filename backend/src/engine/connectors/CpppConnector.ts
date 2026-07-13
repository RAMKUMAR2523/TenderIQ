import { PrismaClient } from '@prisma/client';
import { BaseConnector, NormalizedTender } from '../BaseConnector';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

/**
 * CPPP Connector using Puppeteer to bypass basic scraping protections
 */
export class CpppConnector extends BaseConnector {
  private readonly URL = 'https://eprocure.gov.in/cppp/latestactivetenders';

  constructor(prisma: PrismaClient) {
    super(prisma, 'CPPP');
  }

  protected async fetchTenders(): Promise<any[]> {
    console.log(`[${this.sourceName}] Launching headless browser...`);
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
    const page = await browser.newPage();
    
    // Set a normal user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    try {
      console.log(`[${this.sourceName}] Navigating to ${this.URL}`);
      await page.goto(this.URL, { waitUntil: 'networkidle2', timeout: 30000 });
      const html = await page.content();
      
      const $ = cheerio.load(html);
      const tenders: any[] = [];
      
      $('table.list_table tbody tr').each((i, el) => {
        if (i === 0) return; // Header
        const tds = $(el).find('td');
        if (tds.length >= 4) {
            const titleEl = $(tds[4]).find('a');
            tenders.push({
                referenceNumber: `CPPP-${$(tds[0]).text().trim()}-${Date.now()}`,
                ePublishedDate: $(tds[1]).text().trim(),
                closingDate: $(tds[2]).text().trim(),
                title: titleEl.text().trim(),
                url: titleEl.attr('href'),
                organization: $(tds[5]).text().trim(),
            });
        }
      });
      
      return tenders;
    } catch (error) {
      console.error(`[${this.sourceName}] Error in Puppeteer scrape:`, error);
      return [];
    } finally {
      await browser.close();
    }
  }

  protected async normalize(raw: any): Promise<NormalizedTender> {
    // Parse the date if possible
    let closingDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // fallback
    if (raw.closingDate) {
        try {
            // CPPP format usually: "10-Jul-2026 03:00 PM"
            // Varies wildly. We attempt a rough parse or just save it.
            const parsed = new Date(raw.closingDate);
            if (!isNaN(parsed.getTime())) closingDate = parsed;
        } catch (e) {}
    }

    return {
      source: this.sourceName,
      sourceUrl: raw.url || this.URL,
      referenceNumber: raw.referenceNumber,
      title: raw.title || 'Untitled CPPP Tender',
      department: 'Central Public Procurement',
      organization: raw.organization || 'Government of India',
      category: 'Public Works',
      closingDate,
    };
  }
}
