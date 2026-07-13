import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const scrapeCPPP = async () => {
  console.log('Starting CPPP Scraper...');
  const url = 'https://eprocure.gov.in/eprocure/app?page=FrontEndLatestActiveTenders&service=page';
  
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    const content = await page.content();
    const $ = cheerio.load(content);
    
    const tenders: any[] = [];
    
    // The table id is typically 'table' or we can select by class
    $('.list_table tbody tr').each((i, row) => {
      if (i === 0) return; // Skip header
      
      const cols = $(row).find('td');
      if (cols.length >= 5) {
        const publishedDate = $(cols[1]).text().trim();
        const closingDate = $(cols[2]).text().trim();
        const titleAndRef = $(cols[3]).text().trim();
        const department = $(cols[4]).text().trim();
        
        // Very basic parsing
        const refMatch = titleAndRef.match(/\[(.*?)\]/);
        const refNo = refMatch ? refMatch[1] : `CPPP-${Date.now()}-${i}`;
        const title = titleAndRef.replace(/\[.*?\]/, '').trim();
        
        tenders.push({
          title: title || 'Untitled Tender',
          department: department || 'CPPP',
          referenceNumber: refNo,
          closingDate: closingDate ? new Date(closingDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Fallback 7 days
          description: `Scraped from CPPP. ${title}`,
          state: 'Central',
          tenderValue: null
        });
      }
    });
    
    await browser.close();
    
    let added = 0;
    for (const tender of tenders) {
      // Upsert to avoid duplicates
      await prisma.tender.upsert({
        where: { id: tender.referenceNumber }, // Using ref number as ID temporarily or finding by it
        update: {
          closingDate: tender.closingDate,
        },
        create: {
          title: tender.title,
          department: tender.department,
          referenceNumber: tender.referenceNumber,
          description: tender.description,
          closingDate: tender.closingDate,
          tenderValue: tender.tenderValue,
          state: tender.state
        }
      }).catch(async (e) => {
         // Fallback if referenceNumber is not unique field, we create if we don't find it
         const exists = await prisma.tender.findFirst({ where: { referenceNumber: tender.referenceNumber }});
         if (!exists) {
            await prisma.tender.create({ data: tender });
            added++;
         }
      });
    }
    
    await prisma.crawlerLog.create({
      data: {
        source: 'CPPP',
        status: 'SUCCESS',
        tendersFound: tenders.length,
        tendersAdded: added,
      }
    });
    console.log(`CPPP Scraper finished successfully. Found ${tenders.length}, Added ${added}.`);
  } catch (error) {
    console.error('Error in CPPP Scraper:', error);
    await prisma.crawlerLog.create({
      data: {
        source: 'CPPP',
        status: 'FAILED',
        errorDetails: String(error)
      }
    });
  }
};
