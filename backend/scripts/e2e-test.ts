import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:3000';

async function runE2E() {
  console.log('=== Starting E2E Tests ===');
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // To avoid unhandled rejections hanging
  page.on('pageerror', err => {
    console.error(`[BROWSER ERROR] ${err.toString()}`);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`[BROWSER CONSOLE ERROR] ${msg.text()}`);
    }
  });

  try {
    // 1. Test Login Page loads
    console.log('[TEST] Navigating to /login');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('form');
    console.log('[PASS] Login page loaded');

    // Wait, testing actual login requires a registered user.
    // The previous API test registered admin@techsolutions.com / password123
    console.log('[TEST] Submitting login form');
    await page.type('input[type="email"]', 'admin@techsolutions.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation or error
    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('[FAIL] Login failed, still on login page. (Maybe company association issue?)');
      // We'll proceed by checking what's on the page
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.error("Page text:", bodyText.substring(0, 200));
    } else {
      console.log(`[PASS] Logged in successfully. Current URL: ${currentUrl}`);
    }

    // Since we want to verify pages, let's just visit them even if unauthenticated to see if they crash
    const pages = [
      '/dashboard',
      '/tenders',
      '/chat',
      '/proposals',
      '/vault',
      '/profile',
      '/settings'
    ];

    let passed = 0;
    let failed = 0;

    for (const route of pages) {
      console.log(`[TEST] Visiting ${route}`);
      const res = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      if (res && res.status() === 500) {
        console.error(`[FAIL] ${route} returned 500 Error`);
        failed++;
      } else {
        // Check for client side crashes (e.g. Next.js error overlay)
        const hasErrorOverlay = await page.evaluate(() => {
          return !!document.querySelector('nextjs-portal');
        });
        if (hasErrorOverlay) {
           console.error(`[FAIL] ${route} crashed on client side`);
           failed++;
        } else {
           console.log(`[PASS] ${route} loaded without crashing`);
           passed++;
        }
      }
    }

    console.log('\n=== E2E Summary ===');
    console.log(`Pages Passed: ${passed}`);
    console.log(`Pages Failed: ${failed}`);

  } catch (error: any) {
    console.error('[ERROR] E2E test threw exception:', error);
  } finally {
    await browser.close();
  }
}

runE2E();
