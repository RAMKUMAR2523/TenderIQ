"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeCPPP = void 0;
const cheerio = __importStar(require("cheerio"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const scrapeCPPP = async () => {
    console.log('Starting CPPP Scraper...');
    const url = 'https://eprocure.gov.in/eprocure/app?page=FrontEndLatestActiveTenders&service=page';
    try {
        const browser = await puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        const content = await page.content();
        const $ = cheerio.load(content);
        const tenders = [];
        // The table id is typically 'table' or we can select by class
        $('.list_table tbody tr').each((i, row) => {
            if (i === 0)
                return; // Skip header
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
                    tenderValue: Math.floor(Math.random() * 10000000) // Dummy value since CPPP doesn't show it on front page easily
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
                const exists = await prisma.tender.findFirst({ where: { referenceNumber: tender.referenceNumber } });
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
    }
    catch (error) {
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
exports.scrapeCPPP = scrapeCPPP;
