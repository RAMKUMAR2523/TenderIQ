import { PrismaClient } from '@prisma/client';
import { BaseConnector, NormalizedTender } from '../BaseConnector';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export class GemConnector extends BaseConnector {
  private readonly GEM_BIDS_URL = 'https://bidplus.gem.gov.in/all-bids';

  constructor(prisma: PrismaClient) {
    super(prisma, 'GeM');
  }

  protected async fetchTenders(): Promise<any[]> {
    console.log(`[${this.sourceName}] Launching headless browser...`);
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    try {
      console.log(`[${this.sourceName}] Navigating to ${this.GEM_BIDS_URL}`);
      await page.goto(this.GEM_BIDS_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      const html = await page.content();
      
      const $ = cheerio.load(html);
      const tenders: any[] = [];
      
      $('.block_header').each((i, el) => {
        const bidNo = $(el).find('p:contains("BID NO")').text().replace('BID NO:', '').trim();
        const items = $(el).closest('.border').find('.row.p-3').first().text().trim();
        const department = $(el).closest('.border').find('.add-color-opt').text().trim();
        
        if (bidNo) {
            tenders.push({ bidNo, items, department });
        }
      });
      
      return tenders;
    } catch (error) {
      console.error(`[${this.sourceName}] Error in Puppeteer GeM scrape:`, error);
      return [];
    } finally {
      await browser.close();
    }
  }

  protected async normalize(raw: any): Promise<NormalizedTender> {
    return {
      source: this.sourceName,
      sourceUrl: `https://bidplus.gem.gov.in/showbidDocument/${raw.bidNo}`,
      referenceNumber: raw.bidNo,
      title: raw.items || `GeM Bid: ${raw.bidNo}`,
      department: raw.department || 'Government e-Marketplace',
      category: 'Goods & Services',
      closingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 
    };
  }
}
