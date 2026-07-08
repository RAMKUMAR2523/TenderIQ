import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function testCppp() {
    console.log("Fetching CPPP...");
    const res = await fetch('https://eprocure.gov.in/cppp/latestactivetenders');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const tenders: any[] = [];
    $('table.list_table tbody tr').each((i, el) => {
        if (i === 0) return; // Header
        const tds = $(el).find('td');
        if (tds.length >= 4) {
            tenders.push({
                sno: $(tds[0]).text().trim(),
                ePublishedDate: $(tds[1]).text().trim(),
                closingDate: $(tds[2]).text().trim(),
                openingDate: $(tds[3]).text().trim(),
                title: $(tds[4]).find('a').text().trim(),
                url: $(tds[4]).find('a').attr('href'),
                organization: $(tds[5]).text().trim(),
            });
        }
    });
    
    console.log(`CPPP Found: ${tenders.length}`);
    console.log(tenders.slice(0, 2));
}

async function testGem() {
    console.log("\nFetching GeM...");
    const res = await fetch('https://bidplus.gem.gov.in/all-bids');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const tenders: any[] = [];
    $('.block_header').each((i, el) => {
        const bidNo = $(el).find('p:contains("BID NO")').text().replace('BID NO: ', '').trim();
        const items = $(el).closest('.border').find('.row.p-3').first().text().trim();
        if (bidNo) {
            tenders.push({ bidNo, items });
        }
    });
    
    console.log(`GeM Found: ${tenders.length}`);
    console.log(tenders.slice(0, 2));
}

async function run() {
    await testCppp().catch(console.error);
    await testGem().catch(console.error);
}

run();
